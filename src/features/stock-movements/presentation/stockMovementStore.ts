import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { deleteStockMovement } from '../application/deleteStockMovement'
import { formatOrderReferenceLabel } from '../application/formatOrderReferenceLabel'
import { getCompanyById } from '../application/getCompanyById'
import { getOrderReferenceById } from '../application/getOrderReferenceById'
import { getProductById } from '../application/getProductById'
import { getProductCatalog } from '../application/getProductCatalog'
import { getProviderById } from '../application/getProviderById'
import { getStockMovementById } from '../application/getStockMovementById'
import { getStockMovements } from '../application/getStockMovements'
import { getWineryById } from '../application/getWineryById'
import { indexProductsById } from '../application/indexProductsById'
import { resolveOrderReferences } from '../application/resolveOrderReferences'
import type { StockCompanyReference } from '../domain/StockCompanyReference'
import type { StockMovement } from '../domain/StockMovement'
import type { StockOrderReference } from '../domain/StockOrderReference'
import type { StockProduct } from '../domain/StockProduct'
import type { StockProviderReference } from '../domain/StockProviderReference'
import type { StockWineryReference } from '../domain/StockWineryReference'
import { companyLookup } from '../infrastructure/AxiosCompanyLookup'
import { orderReferenceLookup } from '../infrastructure/AxiosOrderReferenceLookup'
import { productCatalog } from '../infrastructure/AxiosProductCatalog'
import { providerLookup } from '../infrastructure/AxiosProviderLookup'
import { stockMovementRepository } from '../infrastructure/AxiosStockMovementRepository'
import { wineryLookup } from '../infrastructure/AxiosWineryLookup'

/** Friendly copy when the list cannot be loaded (psychology: no blame, next step). */
export const STOCK_MOVEMENTS_LOAD_ERROR =
  'No pudimos traer tus movimientos de stock en este momento. No es algo que hayas hecho mal: a veces la conexión o el servidor necesitan un respiro. Toca «Reintentar» cuando quieras; tu inventario sigue seguro.'

export const STOCK_MOVEMENTS_DELETE_ERROR =
  'No pudimos eliminar ese movimiento ahora. Dale un momento al sistema e inténtalo de nuevo; si persiste, revisa tu conexión.'

export const STOCK_PRODUCTS_LOAD_ERROR =
  'No pudimos cargar el catálogo de productos ahora. Puedes seguir viendo los movimientos; los nombres se mostrarán cuando la conexión vuelva.'

export const useStockMovementStore = defineStore('stockMovement', () => {
  const movements = ref<StockMovement[]>([])
  const selected = ref<StockMovement | null>(null)
  const productsById = ref<Record<string, StockProduct>>({})
  const ordersById = ref<Record<string, StockOrderReference>>({})
  const companiesById = ref<Record<string, StockCompanyReference>>({})
  const providersById = ref<Record<string, StockProviderReference>>({})
  const wineriesById = ref<Record<string, StockWineryReference>>({})
  const selectedProduct = ref<StockProduct | null>(null)
  const selectedOrder = ref<StockOrderReference | null>(null)
  const selectedCompany = ref<StockCompanyReference | null>(null)
  const selectedProvider = ref<StockProviderReference | null>(null)
  const selectedWinery = ref<StockWineryReference | null>(null)
  const isLoading = ref(false)
  const isLoadingProducts = ref(false)
  const isLoadingProductDetail = ref(false)
  const isLoadingOrderDetail = ref(false)
  const isLoadingCompanyDetail = ref(false)
  const isLoadingProviderDetail = ref(false)
  const isLoadingWineryDetail = ref(false)
  const isDeleting = ref(false)
  const error = ref<string | null>(null)
  const productsError = ref<string | null>(null)

  const productForSelected = computed(() => {
    if (selectedProduct.value) return selectedProduct.value
    const id = selected.value?.product_id
    if (!id) return null
    return productsById.value[id] ?? null
  })

  const orderForSelected = computed(() => {
    if (selectedOrder.value) return selectedOrder.value
    const id = selected.value?.reference_id
    if (!id) return null
    return ordersById.value[id] ?? null
  })

  const orderLabelForSelected = computed(() => {
    const order = orderForSelected.value
    if (order) return formatOrderReferenceLabel(order)
    return selected.value?.reference_id || '—'
  })

  const companyNameForSelected = computed(() => {
    if (selectedCompany.value?.business_name) return selectedCompany.value.business_name
    const companyId = productForSelected.value?.company_id
    if (!companyId) return null
    return companiesById.value[companyId]?.business_name ?? null
  })

  const providerNameForSelected = computed(() => {
    if (selectedProvider.value?.business_name) return selectedProvider.value.business_name
    const providerId = productForSelected.value?.supplier_id
    if (!providerId) return null
    return providersById.value[providerId]?.business_name ?? null
  })

  const wineryNameForSelected = computed(() => {
    if (selectedWinery.value?.area) return selectedWinery.value.area
    const wineryId = productForSelected.value?.winery_id
    if (!wineryId) return null
    return wineriesById.value[wineryId]?.area ?? null
  })

  function getProduct(productId: string): StockProduct | null {
    if (!productId) return null
    return productsById.value[productId] ?? null
  }

  function getOrderReferenceLabel(referenceId: string): string {
    if (!referenceId) return '—'
    const order = ordersById.value[referenceId]
    if (order) return formatOrderReferenceLabel(order)
    return referenceId
  }

  async function fetchProductCatalog(): Promise<void> {
    isLoadingProducts.value = true
    productsError.value = null
    try {
      const products = await getProductCatalog(productCatalog)
      productsById.value = indexProductsById(products)
    } catch {
      productsById.value = {}
      productsError.value = STOCK_PRODUCTS_LOAD_ERROR
    } finally {
      isLoadingProducts.value = false
    }
  }

  async function fetchOrderReferencesForMovements(list: StockMovement[]): Promise<void> {
    const ids = list.map((m) => m.reference_id).filter(Boolean)
    if (ids.length === 0) {
      ordersById.value = {}
      return
    }
    try {
      ordersById.value = await resolveOrderReferences(orderReferenceLookup, ids)
    } catch {
      ordersById.value = {}
    }
  }

  async function fetchMovements(): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      const [movementList] = await Promise.all([
        getStockMovements(stockMovementRepository),
        fetchProductCatalog(),
      ])
      movements.value = movementList
      await fetchOrderReferencesForMovements(movementList)
    } catch {
      movements.value = []
      ordersById.value = {}
      error.value = STOCK_MOVEMENTS_LOAD_ERROR
    } finally {
      isLoading.value = false
    }
  }

  async function fetchMovementById(id: string): Promise<StockMovement | null> {
    try {
      selected.value = await getStockMovementById(stockMovementRepository, id)
    } catch {
      const fallback = movements.value.find((m) => m.id === id) ?? null
      selected.value = fallback
    }

    const productId = selected.value?.product_id
    const orderId = selected.value?.reference_id

    await Promise.all([
      productId
        ? resolveSelectedProduct(productId)
        : Promise.resolve().then(() => {
            selectedProduct.value = null
            selectedCompany.value = null
            selectedProvider.value = null
            selectedWinery.value = null
          }),
      orderId
        ? resolveSelectedOrder(orderId)
        : Promise.resolve().then(() => {
            selectedOrder.value = null
          }),
    ])

    const companyId = selectedProduct.value?.company_id
    const providerId = selectedProduct.value?.supplier_id
    const wineryId = selectedProduct.value?.winery_id

    await Promise.all([
      companyId
        ? resolveSelectedCompany(companyId)
        : Promise.resolve().then(() => {
            selectedCompany.value = null
          }),
      providerId
        ? resolveSelectedProvider(providerId)
        : Promise.resolve().then(() => {
            selectedProvider.value = null
          }),
      wineryId
        ? resolveSelectedWinery(wineryId)
        : Promise.resolve().then(() => {
            selectedWinery.value = null
          }),
    ])

    return selected.value
  }

  async function resolveSelectedProduct(productId: string): Promise<void> {
    const cached = productsById.value[productId]
    if (cached) {
      selectedProduct.value = cached
      return
    }

    isLoadingProductDetail.value = true
    try {
      const product = await getProductById(productCatalog, productId)
      productsById.value = { ...productsById.value, [product.id]: product }
      selectedProduct.value = product
    } catch {
      selectedProduct.value = null
    } finally {
      isLoadingProductDetail.value = false
    }
  }

  async function resolveSelectedCompany(companyId: string): Promise<void> {
    const cached = companiesById.value[companyId]
    if (cached) {
      selectedCompany.value = cached
      return
    }

    isLoadingCompanyDetail.value = true
    try {
      const company = await getCompanyById(companyLookup, companyId)
      companiesById.value = { ...companiesById.value, [company.id]: company }
      selectedCompany.value = company
    } catch {
      selectedCompany.value = null
    } finally {
      isLoadingCompanyDetail.value = false
    }
  }

  async function resolveSelectedProvider(providerId: string): Promise<void> {
    const cached = providersById.value[providerId]
    if (cached) {
      selectedProvider.value = cached
      return
    }

    isLoadingProviderDetail.value = true
    try {
      const provider = await getProviderById(providerLookup, providerId)
      providersById.value = { ...providersById.value, [provider.id]: provider }
      selectedProvider.value = provider
    } catch {
      selectedProvider.value = null
    } finally {
      isLoadingProviderDetail.value = false
    }
  }

  async function resolveSelectedWinery(wineryId: string): Promise<void> {
    const cached = wineriesById.value[wineryId]
    if (cached) {
      selectedWinery.value = cached
      return
    }

    isLoadingWineryDetail.value = true
    try {
      const winery = await getWineryById(wineryLookup, wineryId)
      wineriesById.value = { ...wineriesById.value, [winery.id]: winery }
      selectedWinery.value = winery
    } catch {
      selectedWinery.value = null
    } finally {
      isLoadingWineryDetail.value = false
    }
  }

  async function resolveSelectedOrder(orderId: string): Promise<void> {
    const cached = ordersById.value[orderId]
    if (cached) {
      selectedOrder.value = cached
      return
    }

    isLoadingOrderDetail.value = true
    try {
      const order = await getOrderReferenceById(orderReferenceLookup, orderId)
      ordersById.value = { ...ordersById.value, [order.id]: order }
      selectedOrder.value = order
    } catch {
      selectedOrder.value = null
    } finally {
      isLoadingOrderDetail.value = false
    }
  }

  function selectLocal(movement: StockMovement): void {
    selected.value = movement
    selectedProduct.value = getProduct(movement.product_id)
    selectedOrder.value = movement.reference_id
      ? (ordersById.value[movement.reference_id] ?? null)
      : null
    const companyId = selectedProduct.value?.company_id
    selectedCompany.value = companyId ? (companiesById.value[companyId] ?? null) : null
    const providerId = selectedProduct.value?.supplier_id
    selectedProvider.value = providerId ? (providersById.value[providerId] ?? null) : null
    const wineryId = selectedProduct.value?.winery_id
    selectedWinery.value = wineryId ? (wineriesById.value[wineryId] ?? null) : null
  }

  function clearSelected(): void {
    selected.value = null
    selectedProduct.value = null
    selectedOrder.value = null
    selectedCompany.value = null
    selectedProvider.value = null
    selectedWinery.value = null
  }

  async function removeMovement(id: string): Promise<boolean> {
    isDeleting.value = true
    error.value = null
    try {
      await deleteStockMovement(stockMovementRepository, id)
      movements.value = movements.value.filter((m) => m.id !== id)
      if (selected.value?.id === id) {
        selected.value = null
        selectedProduct.value = null
        selectedOrder.value = null
        selectedCompany.value = null
        selectedProvider.value = null
        selectedWinery.value = null
      }
      return true
    } catch {
      error.value = STOCK_MOVEMENTS_DELETE_ERROR
      return false
    } finally {
      isDeleting.value = false
    }
  }

  function clearError(): void {
    error.value = null
  }

  return {
    movements,
    selected,
    productsById,
    ordersById,
    companiesById,
    providersById,
    wineriesById,
    selectedProduct,
    selectedOrder,
    selectedCompany,
    selectedProvider,
    selectedWinery,
    productForSelected,
    orderForSelected,
    orderLabelForSelected,
    companyNameForSelected,
    providerNameForSelected,
    wineryNameForSelected,
    isLoading,
    isLoadingProducts,
    isLoadingProductDetail,
    isLoadingOrderDetail,
    isLoadingCompanyDetail,
    isLoadingProviderDetail,
    isLoadingWineryDetail,
    isDeleting,
    error,
    productsError,
    getProduct,
    getOrderReferenceLabel,
    fetchProductCatalog,
    fetchMovements,
    fetchMovementById,
    selectLocal,
    clearSelected,
    removeMovement,
    clearError,
  }
})
