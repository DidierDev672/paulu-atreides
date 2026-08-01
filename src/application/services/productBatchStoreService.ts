/**
 * Persists products one-by-one, then creates a single product-entry that
 * includes all successfully saved products as details.
 */

import axios from 'axios'
import {
  createProduct,
  type CreateProductRequest,
  type ProductResponse,
} from '@/application/services/productService'
import {
  createProductEntry,
  type CreateProductEntryRequest,
  type ProductEntryDetail,
  type ProductEntryResponse,
} from '@/application/services/productEntryService'
import type {
  ProductBatchSaveProgress,
  ProductFormDraft,
} from '@/domain/product-document/productDocument.types'

/** Extrae la causa legible de un fallo de persistencia (Axios / Error genérico). */
export function resolvePersistError(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status
    const data = err.response?.data
    let detail = ''

    if (typeof data === 'string' && data.trim()) {
      detail = data.trim()
    } else if (data && typeof data === 'object') {
      const record = data as Record<string, unknown>
      for (const key of ['error', 'message', 'detail', 'title']) {
        const value = record[key]
        if (typeof value === 'string' && value.trim()) {
          detail = value.trim()
          break
        }
      }
      if (!detail && Array.isArray(record.errors)) {
        detail = record.errors.map(String).filter(Boolean).join('; ')
      }
    }

    if (detail && status) return `${detail} (HTTP ${status})`
    if (detail) return detail
    if (status) return `El servidor respondió con error HTTP ${status}.`
    if (err.code === 'ERR_NETWORK') {
      return 'No hay conexión con el servidor. Revisa tu red e inténtalo de nuevo.'
    }
    if (err.message) return err.message
  }

  if (err instanceof Error && err.message.trim()) return err.message
  return fallback
}

export interface ProductBatchStoreContext {
  companyId: string
  userId: string
  /** Prefer form-selected supplier, then first from catalog. */
  defaultSupplierId: string
  /** Prefer form-selected winery, then first from catalog. */
  defaultWineryId: string
  suppliers: { id: string; business_name: string }[]
  wineries: { id: string; area: string }[]
  /**
   * When true, associations come from the form. Supplier/winery defaults are
   * also stamped onto every draft before POST /products.
   */
  forceFormAssociations?: boolean
}

export type ProductBatchMissingAssociation = 'supplier' | 'winery' | 'both' | null

export function getMissingProductAssociation(
  ctx: ProductBatchStoreContext,
): ProductBatchMissingAssociation {
  const missingSupplier = !ctx.defaultSupplierId
  const missingWinery = !ctx.defaultWineryId
  if (missingSupplier && missingWinery) return 'both'
  if (missingSupplier) return 'supplier'
  if (missingWinery) return 'winery'
  return null
}

export interface StoreProductsWithEntryResult {
  savedProducts: ProductResponse[]
  failed: { draft: ProductFormDraft; error: string; index: number }[]
  entry: ProductEntryResponse | null
  entryError: string | null
}

function formatFailureCauses(
  failed: StoreProductsWithEntryResult['failed'],
): string {
  if (failed.length === 0) {
    return 'No se identificó una causa concreta. Revisa la conexión o los datos e inténtalo de nuevo.'
  }

  const lines = failed.slice(0, 5).map((item) => {
    const name =
      item.draft.name.trim() ||
      item.draft.product_code.trim() ||
      `Producto ${item.index}`
    return `• ${name}: ${item.error}`
  })
  const extra =
    failed.length > 5 ? `\n• …y ${failed.length - 5} producto(s) más con error.` : ''
  return `${lines.join('\n')}${extra}`
}

function resolveSupplierId(draft: ProductFormDraft, ctx: ProductBatchStoreContext): string {
  // El proveedor seleccionado en el formulario aplica a toda la lista.
  if (ctx.defaultSupplierId) {
    return ctx.defaultSupplierId
  }
  if (draft.supplier_id) return draft.supplier_id
  const name = draft.supplier_name.trim().toLowerCase()
  if (name) {
    const match = ctx.suppliers.find((s) => s.business_name.toLowerCase().includes(name)
      || name.includes(s.business_name.toLowerCase()))
    if (match) return match.id
  }
  return ''
}

function resolveWineryId(draft: ProductFormDraft, ctx: ProductBatchStoreContext): string {
  // Bodega seleccionada en el formulario → obligatoria para cada producto de la lista.
  if (ctx.defaultWineryId) {
    return ctx.defaultWineryId
  }
  if (ctx.forceFormAssociations) {
    return ''
  }
  if (draft.winery_id) return draft.winery_id
  const name = draft.winery_name.trim().toLowerCase()
  if (name) {
    const match = ctx.wineries.find((w) => w.area.toLowerCase().includes(name)
      || name.includes(w.area.toLowerCase()))
    if (match) return match.id
  }
  return ''
}

function draftToProductRequest(
  draft: ProductFormDraft,
  ctx: ProductBatchStoreContext,
): CreateProductRequest {
  return {
    company_id: ctx.companyId,
    supplier_id: resolveSupplierId(draft, ctx),
    name: draft.name.trim(),
    product_code: draft.product_code.trim(),
    categories: draft.categories.length ? draft.categories : ['General'],
    unit: draft.unit || 'Unidad',
    quantity: draft.quantity || 0,
    minimum_stock: draft.minimum_stock || 0,
    winery_id: resolveWineryId(draft, ctx),
  }
}

function isDraftReady(draft: ProductFormDraft, ctx: ProductBatchStoreContext): boolean {
  const supplier = resolveSupplierId(draft, ctx)
  const winery = resolveWineryId(draft, ctx)
  return (
    draft.name.trim() !== '' &&
    draft.product_code.trim() !== '' &&
    draft.unit !== '' &&
    draft.quantity > 0 &&
    Boolean(ctx.companyId) &&
    Boolean(supplier) &&
    Boolean(winery)
  )
}

function buildEntryDetail(draft: ProductFormDraft, product: ProductResponse): ProductEntryDetail {
  const unitCost = draft.unit_cost > 0 ? draft.unit_cost : 0
  const qty = product.quantity || draft.quantity || 0
  const margin = draft.profit_margin >= 0 ? draft.profit_margin : 0
  const fixedMarkup = unitCost * (margin / 100)
  return {
    code: product.product_code,
    product: product.name,
    unit: product.unit || draft.unit || 'Unidad',
    quantity: qty,
    unit_cost: unitCost,
    subtotal: unitCost * qty,
    commercial_policy: draft.commercial_policy || 'Normal',
    profit_margin: margin,
    fixed_markup: fixedMarkup,
    suggested_selling_price: unitCost + fixedMarkup,
  }
}

/**
 * 1) Creates each product individually via POST /products
 * 2) Creates one inventory entry via POST /product-entries with all saved products
 */
export async function storeProductsWithEntryIndividually(
  drafts: ProductFormDraft[],
  ctx: ProductBatchStoreContext,
  options?: {
    onProgress?: (progress: ProductBatchSaveProgress) => void
  },
): Promise<StoreProductsWithEntryResult> {
  const total = drafts.length
  const isList = total > 1
  const savedProducts: ProductResponse[] = []
  const failed: StoreProductsWithEntryResult['failed'] = []
  const savedDrafts: ProductFormDraft[] = []

  // Asigna el proveedor (y bodega) seleccionado a cada producto de la lista
  // antes de persistir, para no usar IDs inventados por el documento/LLM.
  if (ctx.defaultSupplierId || ctx.defaultWineryId) {
    for (const draft of drafts) {
      if (ctx.defaultSupplierId) {
        draft.supplier_id = ctx.defaultSupplierId
      }
      if (ctx.defaultWineryId) {
        draft.winery_id = ctx.defaultWineryId
      }
    }
  }

  if (!ctx.companyId) {
    options?.onProgress?.({
      current: 0,
      total,
      isList,
      currentName: '',
      phase: 'error',
      message: 'Selecciona una empresa antes de importar productos.',
      savedCount: 0,
      failedCount: 0,
      entryCreated: false,
    })
    return { savedProducts, failed, entry: null, entryError: 'Empresa no seleccionada.' }
  }

  if (!ctx.defaultSupplierId || !ctx.defaultWineryId) {
    const missing = getMissingProductAssociation(ctx)
    const message =
      missing === 'supplier'
        ? 'Selecciona un proveedor en el formulario para asociarlo a los productos importados.'
        : missing === 'winery'
          ? 'Selecciona una bodega en el formulario para asociarla a los productos importados.'
          : 'Necesitas al menos un proveedor y una bodega registrados para asociar los productos importados.'

    options?.onProgress?.({
      current: 0,
      total,
      isList,
      currentName: '',
      phase: 'error',
      message,
      savedCount: 0,
      failedCount: 0,
      entryCreated: false,
    })
    return {
      savedProducts,
      failed,
      entry: null,
      entryError: message,
    }
  }

  for (let i = 0; i < drafts.length; i++) {
    const draft = drafts[i]
    const current = i + 1
    const currentName = draft.name.trim() || draft.product_code.trim() || `Producto ${current}`

    options?.onProgress?.({
      current,
      total,
      isList,
      currentName,
      phase: 'saving-products',
      message: isList
        ? `Registrando productos uno por uno (${current} de ${total}): ${currentName}. Luego se creará la entrada de inventario.`
        : `Registrando el producto: ${currentName}. Luego se creará su entrada de inventario.`,
      savedCount: savedProducts.length,
      failedCount: failed.length,
      entryCreated: false,
    })

    if (!isDraftReady(draft, ctx)) {
      failed.push({
        draft,
        index: current,
        error: 'Faltan campos obligatorios o no hay proveedor/bodega para asociar.',
      })
      continue
    }

    try {
      const created = await createProduct(draftToProductRequest(draft, ctx))
      savedProducts.push(created)
      savedDrafts.push(draft)
    } catch (error) {
      failed.push({
        draft,
        index: current,
        error: resolvePersistError(error, 'Error al registrar el producto en el servidor.'),
      })
    }
  }

  let entry: ProductEntryResponse | null = null
  let entryError: string | null = null

  if (savedProducts.length > 0) {
    options?.onProgress?.({
      current: total,
      total,
      isList,
      currentName: '',
      phase: 'saving-entry',
      message: isList
        ? `Productos guardados. Creando la entrada de inventario con los ${savedProducts.length} productos…`
        : 'Producto guardado. Creando la entrada de inventario asociada…',
      savedCount: savedProducts.length,
      failedCount: failed.length,
      entryCreated: false,
    })

    try {
      const details = savedProducts.map((product, index) =>
        buildEntryDetail(savedDrafts[index] ?? EMPTY_FALLBACK_DRAFT, product),
      )
      const purchaseSubtotal = details.reduce((sum, d) => sum + d.subtotal, 0)
      const today = new Date().toISOString().split('T')[0]
      const timestamp = Date.now().toString(36).toUpperCase()
      const random = Math.random().toString(36).substring(2, 6).toUpperCase()
      const warehouse =
        resolveWineryId(savedDrafts[0] ?? EMPTY_FALLBACK_DRAFT, ctx) || ctx.defaultWineryId

      const payload: CreateProductEntryRequest = {
        entry_number: `IMP-${timestamp}-${random}`,
        registered_date: today,
        movement_type: 'Purchase',
        warehouse,
        responsible_party: ctx.userId,
        company_id: ctx.companyId,
        details,
        financial_summary: {
          purchase_subtotal: purchaseSubtotal,
          vat: 0,
          discount: 0,
          purchase_total: purchaseSubtotal,
        },
        observations: `Entrada generada automáticamente desde importación Word/Excel (${savedProducts.length} producto${savedProducts.length === 1 ? '' : 's'}).`,
      }

      entry = await createProductEntry(payload)
    } catch (error) {
      entryError = resolvePersistError(
        error,
        'Error al crear la entrada de inventario en el servidor.',
      )
    }
  }

  const phase: ProductBatchSaveProgress['phase'] =
    savedProducts.length === 0 ? 'error' : 'done'

  const message =
    savedProducts.length === 0
      ? `No se pudo registrar ningún producto.\n\nCausa(s) de la persistencia:\n${formatFailureCauses(failed)}`
      : entry
        ? isList
          ? `Listo. Se registraron ${savedProducts.length} productos y se creó la entrada de inventario.`
          : 'Listo. Se registró el producto y se creó su entrada de inventario.'
        : `Se registraron ${savedProducts.length} producto(s), pero no se pudo crear la entrada de inventario.\n\nCausa: ${entryError ?? 'error desconocido'}.`

  options?.onProgress?.({
    current: total,
    total,
    isList,
    currentName: '',
    phase,
    message,
    savedCount: savedProducts.length,
    failedCount: failed.length,
    entryCreated: Boolean(entry),
  })

  return { savedProducts, failed, entry, entryError }
}

const EMPTY_FALLBACK_DRAFT: ProductFormDraft = {
  name: '',
  product_code: '',
  categories: [],
  unit: 'Unidad',
  quantity: 0,
  minimum_stock: 0,
  supplier_name: '',
  supplier_id: '',
  winery_name: '',
  winery_id: '',
  unit_cost: 0,
  commercial_policy: 'Normal',
  profit_margin: 0,
}
