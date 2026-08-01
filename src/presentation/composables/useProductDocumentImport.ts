import { ref, readonly, nextTick } from 'vue'
import { ensureOllamaRunning } from '@/application/services/ollamaService'
import { extractTextFromDocument } from '@/application/services/documentTextExtractor'
import { validateProductDocumentWithLlama3 } from '@/application/services/productDocumentValidator'
import {
  prepareProductsForPersistWithLlama3,
  buildFriendlyPersistErrorMessage,
  buildFriendlyPersistSuccessMessage,
} from '@/application/services/productPersistOrganizer'
import {
  storeProductsWithEntryIndividually,
  resolvePersistError,
  type ProductBatchStoreContext,
  type StoreProductsWithEntryResult,
} from '@/application/services/productBatchStoreService'
import type {
  ProductBatchSaveProgress,
  ProductDocumentValidationResult,
  ProductFormDraft,
} from '@/domain/product-document/productDocument.types'

export type ProductImportPhase =
  | 'idle'
  | 'ensuring-ollama'
  | 'reading-file'
  | 'analyzing'
  | 'done'
  | 'error'

export function useProductDocumentImport() {
  const phase = ref<ProductImportPhase>('idle')
  const statusMessage = ref('')
  const errorMessage = ref('')
  const result = ref<ProductDocumentValidationResult | null>(null)
  const fileName = ref('')
  const isSaving = ref(false)
  const saveModalOpen = ref(false)
  const saveProgress = ref<ProductBatchSaveProgress | null>(null)
  const lastSaveResult = ref<StoreProductsWithEntryResult | null>(null)

  function reset(): void {
    phase.value = 'idle'
    statusMessage.value = ''
    errorMessage.value = ''
    result.value = null
    fileName.value = ''
    isSaving.value = false
    saveModalOpen.value = false
    saveProgress.value = null
    lastSaveResult.value = null
  }

  function closeSaveModal(): void {
    saveModalOpen.value = false
    if (
      saveProgress.value?.phase === 'done' &&
      (lastSaveResult.value?.savedProducts.length ?? 0) > 0
    ) {
      reset()
    }
  }

  function resolveAssociationNames(ctx: ProductBatchStoreContext): {
    supplierName: string
    wineryName: string
  } {
    const supplierName =
      ctx.suppliers.find((s) => s.id === ctx.defaultSupplierId)?.business_name ?? ''
    const wineryName =
      ctx.wineries.find((w) => w.id === ctx.defaultWineryId)?.area ?? ''
    return { supplierName, wineryName }
  }

  async function importDocument(file: File): Promise<ProductDocumentValidationResult | null> {
    errorMessage.value = ''
    result.value = null
    fileName.value = file.name
    lastSaveResult.value = null

    try {
      phase.value = 'ensuring-ollama'
      statusMessage.value = 'Comprobando Ollama y el modelo Llama 3…'
      const ensure = await ensureOllamaRunning()
      if (!ensure.ready) throw new Error(ensure.message)

      phase.value = 'reading-file'
      statusMessage.value = `Leyendo ${file.name}…`
      const extracted = await extractTextFromDocument(file)

      phase.value = 'analyzing'
      statusMessage.value = 'Llama 3 está organizando los productos al formato de registro…'
      const validation = await validateProductDocumentWithLlama3(
        extracted.text,
        extracted.fileName,
      )

      result.value = validation
      phase.value = 'done'
      statusMessage.value = validation.summary
      return validation
    } catch (error) {
      phase.value = 'error'
      errorMessage.value =
        error instanceof Error ? error.message : 'No se pudo procesar el documento.'
      statusMessage.value = ''
      return null
    }
  }

  async function saveOrganizedProducts(
    ctx: ProductBatchStoreContext,
  ): Promise<StoreProductsWithEntryResult | null> {
    if (!result.value || result.value.products.length === 0) {
      errorMessage.value = 'No hay productos organizados para guardar.'
      return null
    }

    const seedDrafts: ProductFormDraft[] = result.value.products.map((item) => ({
      ...item.mapped,
      supplier_id: ctx.defaultSupplierId || item.mapped.supplier_id,
      winery_id: ctx.defaultWineryId || item.mapped.winery_id,
    }))
    const isList = seedDrafts.length > 1 || result.value.isList
    const { supplierName, wineryName } = resolveAssociationNames(ctx)

    isSaving.value = true
    saveModalOpen.value = true
    saveProgress.value = {
      current: 0,
      total: seedDrafts.length,
      isList,
      currentName: '',
      phase: 'organizing',
      message:
        'La inteligencia artificial está organizando la información con el proveedor y la bodega seleccionados, para dejarla lista antes de guardar.',
      savedCount: 0,
      failedCount: 0,
      entryCreated: false,
    }

    await nextTick()

    try {
      // 1) Ollama reconfigura la lista según el contrato del endpoint + asociaciones.
      const organizedDrafts = await prepareProductsForPersistWithLlama3(seedDrafts, {
        companyId: ctx.companyId,
        supplierId: ctx.defaultSupplierId,
        supplierName,
        wineryId: ctx.defaultWineryId,
        wineryName,
      })

      saveProgress.value = {
        current: 0,
        total: organizedDrafts.length,
        isList,
        currentName: '',
        phase: 'saving-products',
        message: isList
          ? `Lista lista. Enviando ${organizedDrafts.length} productos uno por uno y luego la entrada de inventario.`
          : 'Información lista. Enviando el producto y luego su entrada de inventario.',
        savedCount: 0,
        failedCount: 0,
        entryCreated: false,
      }

      await nextTick()

      // 2) Persistencia vía Action / axios (POST /products + POST /product-entries).
      const batchResult = await storeProductsWithEntryIndividually(organizedDrafts, ctx, {
        onProgress: (progress) => {
          if (progress.phase === 'error') {
            saveProgress.value = {
              ...progress,
              isList: progress.isList || isList,
              message: buildFriendlyPersistErrorMessage(progress.message),
            }
            return
          }
          if (progress.phase === 'done') {
            saveProgress.value = {
              ...progress,
              isList: progress.isList || isList,
              message: buildFriendlyPersistSuccessMessage(
                progress.savedCount,
                progress.entryCreated,
              ),
            }
            return
          }
          saveProgress.value = { ...progress, isList: progress.isList || isList }
        },
      })

      lastSaveResult.value = batchResult

      if (batchResult.savedProducts.length === 0 && saveProgress.value?.phase !== 'error') {
        const cause = batchResult.failed.length
          ? batchResult.failed
              .slice(0, 5)
              .map((f) => {
                const name =
                  f.draft.name.trim() || f.draft.product_code.trim() || `Producto ${f.index}`
                return `• ${name}: ${f.error}`
              })
              .join('\n')
          : 'Ningún producto pudo registrarse en el servidor.'
        saveProgress.value = {
          current: seedDrafts.length,
          total: seedDrafts.length,
          isList,
          currentName: '',
          phase: 'error',
          message: buildFriendlyPersistErrorMessage(cause),
          savedCount: 0,
          failedCount: batchResult.failed.length || seedDrafts.length,
          entryCreated: false,
        }
      }

      return batchResult
    } catch (error) {
      const cause = resolvePersistError(
        error,
        'Error inesperado al organizar o almacenar los productos.',
      )
      saveProgress.value = {
        current: 0,
        total: seedDrafts.length,
        isList,
        currentName: '',
        phase: 'error',
        message: buildFriendlyPersistErrorMessage(cause),
        savedCount: 0,
        failedCount: seedDrafts.length,
        entryCreated: false,
      }
      return null
    } finally {
      isSaving.value = false
    }
  }

  return {
    phase: readonly(phase),
    statusMessage: readonly(statusMessage),
    errorMessage: readonly(errorMessage),
    result: readonly(result),
    fileName: readonly(fileName),
    isSaving: readonly(isSaving),
    saveModalOpen: readonly(saveModalOpen),
    saveProgress: readonly(saveProgress),
    lastSaveResult: readonly(lastSaveResult),
    importDocument,
    saveOrganizedProducts,
    closeSaveModal,
    reset,
  }
}
