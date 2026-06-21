<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSaleStore } from '@/presentation/stores/saleStore'
import { useAuthStore } from '@/presentation/stores/authStore'
import { useCompanyStore } from '@/presentation/stores/companyStore'
import { useProductEntryStore } from '@/presentation/stores/productEntryStore'
import { useWineryStore } from '@/presentation/stores/wineryStore'
import { useProviderStore } from '@/presentation/stores/providerStore'
import type { ProductEntryDetail } from '@/application/services/productEntryService'
import type { ProviderResponse } from '@/application/services/providerService'
import type { WineryResponse } from '@/application/services/wineryService'

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits<{ close: []; created: [] }>()

const saleStore = useSaleStore()
const authStore = useAuthStore()
const companyStore = useCompanyStore()
const productEntryStore = useProductEntryStore()
const wineryStore = useWineryStore()
const providerStore = useProviderStore()

const VAT_RATE = 0.19

const saleNumber = ref(`VEN-${Date.now()}`)
const providerId = ref('')
const warehouseId = ref('')
const paymentMethod = ref('Cash')
const discount = ref(0)
const showProductModal = ref(false)
const showProviderModal = ref(false)
const showWarehouseModal = ref(false)
const selectedEntryId = ref<string>('')
const searchProduct = ref('')
const searchProvider = ref('')
const searchWarehouse = ref('')

interface ProductRow {
  code: string
  product: string
  unit: string
  quantity: number
  price: number
  subtotal: number
}

const products = ref<ProductRow[]>([])
const selectedProducts = ref<Set<string>>(new Set())

// Get all available products from all entries
const availableProducts = computed(() => {
  const allProducts: (ProductEntryDetail & { entryId: string })[] = []
  productEntryStore.entries.forEach((entry) => {
    entry.details.forEach((detail) => {
      allProducts.push({
        ...detail,
        entryId: entry.id,
      })
    })
  })
  return allProducts
})

const stockByCode = computed(() => {
  const map: Record<string, number> = {}
  availableProducts.value.forEach((p) => {
    map[p.code] = (map[p.code] || 0) + p.quantity
  })
  return map
})

const filteredAvailableProducts = computed(() => {
  let items = availableProducts.value
  if (searchProduct.value.trim()) {
    const q = searchProduct.value.toLowerCase().trim()
    items = items.filter(
      (p) =>
        p.product.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q)
    )
  }
  return items
})

function toggleProductSelection(code: string) {
  if (selectedProducts.value.has(code)) {
    selectedProducts.value.delete(code)
  } else {
    selectedProducts.value.add(code)
  }
}

function selectAllProducts() {
  if (selectedProducts.value.size === filteredAvailableProducts.value.length) {
    selectedProducts.value.clear()
  } else {
    selectedProducts.value = new Set(filteredAvailableProducts.value.map((p) => p.code))
  }
}

function addSelectedProducts(): void {
  const selected = availableProducts.value.filter((p) => selectedProducts.value.has(p.code))
  selected.forEach((product) => {
    // Check if product already exists in the list
    const existingIndex = products.value.findIndex((p) => p.code === product.code)
    if (existingIndex === -1) {
      products.value.push({
        code: product.code,
        product: product.product,
        unit: product.unit,
        quantity: 1,
        price: product.suggested_selling_price || product.unit_cost,
        subtotal: product.suggested_selling_price || product.unit_cost,
      })
    }
  })
  selectedProducts.value.clear()
  showProductModal.value = false
}

function removeProduct(index: number): void {
  products.value.splice(index, 1)
}

function recalcRow(index: number): void {
  const row = products.value[index]
  row.subtotal = row.quantity * row.price
}

function updatePrice(index: number, event: Event): void {
  const raw = (event.target as HTMLInputElement).value.replace(/[^0-9,]/g, '').replace(',', '.')
  const num = parseFloat(raw)
  if (!isNaN(num) && num >= 0) {
    products.value[index].price = num
    recalcRow(index)
  }
}

const subtotal = computed(() => products.value.reduce((s, p) => s + p.subtotal, 0))
const vat = computed(() => subtotal.value * VAT_RATE)
const total = computed(() => subtotal.value + vat.value - discount.value)

function formatCOP(value: number): string {
  return value.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

async function handleCreate(): Promise<void> {
  if (products.value.length === 0) return
  const user = authStore.session?.user
  const company = companyStore.selectedCompany
  const saleData = {
    sale_number: saleNumber.value,
    order_id: saleNumber.value,
    order_type: 'SALE',
    provider_id: providerId.value || undefined,
    warehouse_id: warehouseId.value || company?.id || '',
    products: products.value.map((p) => ({
      code: p.code,
      product: p.product,
      unit: p.unit,
      quantity: p.quantity,
      price: p.price,
      subtotal: p.subtotal,
    })),
    subtotal: subtotal.value,
    vat: vat.value,
    discount: discount.value,
    total: total.value,
    payment_method: paymentMethod.value,
    created_by: user?.id || '',
    company_id: company?.id || '',
  }
  const created = await saleStore.create(saleData)
  if (created) {
    emit('created')
  }
}

function openProductModal(): void {
  selectedProducts.value.clear()
  searchProduct.value = ''
  showProductModal.value = true
}

function closeProductModal(): void {
  showProductModal.value = false
  selectedProducts.value.clear()
  searchProduct.value = ''
}

// Provider selection modal functions
function openProviderModal(): void {
  searchProvider.value = ''
  providerStore.fetchProviders()
  showProviderModal.value = true
}

function closeProviderModal(): void {
  showProviderModal.value = false
  searchProvider.value = ''
}

function selectProvider(provider: ProviderResponse): void {
  providerId.value = provider.id
  closeProviderModal()
}

const filteredProviders = computed(() => {
  let items = providerStore.providers
  if (searchProvider.value.trim()) {
    const q = searchProvider.value.toLowerCase().trim()
    items = items.filter(
      (p) =>
        p.business_name.toLowerCase().includes(q) ||
        p.document_number.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q)
    )
  }
  return items
})

// Warehouse selection modal functions
function openWarehouseModal(): void {
  searchWarehouse.value = ''
  const company = companyStore.selectedCompany
  if (company?.id) {
    wineryStore.fetchWineriesByCompany(company.id)
  } else {
    wineryStore.fetchWineries()
  }
  showWarehouseModal.value = true
}

function closeWarehouseModal(): void {
  showWarehouseModal.value = false
  searchWarehouse.value = ''
}

function selectWarehouse(winery: WineryResponse): void {
  warehouseId.value = winery.id
  closeWarehouseModal()
}

const filteredWarehouses = computed(() => {
  let items = wineryStore.wineries
  if (searchWarehouse.value.trim()) {
    const q = searchWarehouse.value.toLowerCase().trim()
    items = items.filter(
      (w) =>
        w.area.toLowerCase().includes(q) ||
        w.units.toLowerCase().includes(q)
    )
  }
  return items
})

onMounted(() => {
  productEntryStore.fetchEntries()
})
</script>

<template>
  <div>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      leave-active-class="transition-opacity duration-150 ease-in"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm" @click.self="emit('close')">
        <div v-motion :initial="{ opacity: 0, scale: 0.95, y: 16 }" :enter="{ opacity: 1, scale: 1, y: 0, transition: { duration: 300 } }" class="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
          <button type="button" class="absolute right-4 top-4 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300" @click="emit('close')">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          <h2 class="mb-6 font-display text-xl font-bold tracking-tight dark:text-white">Registrar venta manual</h2>

          <!-- Sale header fields -->
          <div class="mb-6 grid grid-cols-2 gap-4">
            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">N° Venta</label>
              <input v-model="saleNumber" type="text" class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-stellar-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Proveedor seleccionado</label>
              <div class="flex gap-2">
                <input :value="providerId" type="text" readonly class="flex-1 rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-600 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400" placeholder="Ningún proveedor seleccionado" />
                <button type="button" class="rounded-lg bg-stellar-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-stellar-600" @click="openProviderModal">
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </button>
              </div>
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Bodega</label>
              <div class="flex gap-2">
                <input :value="warehouseId" type="text" readonly class="flex-1 rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-600 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400" placeholder="Selecciona una bodega" />
                <button type="button" class="rounded-lg bg-stellar-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-stellar-600" @click="openWarehouseModal">
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </button>
              </div>
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Método de pago</label>
              <select v-model="paymentMethod" class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-stellar-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                <option value="Cash" class="dark:bg-slate-800">Efectivo</option>
                <option value="Transfer" class="dark:bg-slate-800">Transferencia</option>
                <option value="Card" class="dark:bg-slate-800">Tarjeta</option>
                <option value="Credit" class="dark:bg-slate-800">Crédito</option>
              </select>
            </div>
          </div>

          <!-- Products -->
          <div class="mb-4 flex items-center justify-between">
            <h3 class="font-display text-base font-semibold dark:text-white">Productos</h3>
            <button type="button" class="rounded-lg bg-stellar-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-stellar-600" @click="openProductModal">+ Agregar</button>
          </div>

          <div v-if="products.length === 0" class="mb-6 rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-400 dark:border-slate-600 dark:text-slate-300">
            No hay productos. Haz clic en "Agregar" para seleccionar productos del inventario.
          </div>

          <div v-for="(row, i) in products" :key="i" class="mb-3 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50">
            <div class="mb-2 grid grid-cols-12 gap-2">
              <div class="col-span-3">
                <label class="mb-0.5 block text-xs text-slate-500 dark:text-slate-300">Código</label>
                <input v-model="row.code" type="text" readonly class="w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" />
              </div>
              <div class="col-span-5">
                <label class="mb-0.5 block text-xs text-slate-500 dark:text-slate-300">Producto</label>
                <input v-model="row.product" type="text" readonly class="w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" />
              </div>
              <div class="col-span-2">
                <label class="mb-0.5 block text-xs text-slate-500 dark:text-slate-300">Unidad</label>
                <input v-model="row.unit" type="text" readonly class="w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" />
              </div>
              <div class="col-span-2 flex items-end justify-end">
                <button type="button" class="rounded p-1 text-red-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10" @click="removeProduct(i)">
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
            <div class="grid grid-cols-12 gap-2">
              <div class="col-span-3">
                <label class="mb-0.5 block text-xs text-slate-500 dark:text-slate-300">Cantidad</label>
                <input v-model.number="row.quantity" type="number" min="1" step="0.01" class="w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs outline-none focus:border-stellar-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" @input="recalcRow(i)" />
                <p v-if="stockByCode[row.code] != null && row.quantity > stockByCode[row.code]" class="mt-1 text-[10px] text-red-500">
                  Supera el disponible ({{ stockByCode[row.code] }})
                </p>
              </div>
              <div class="col-span-3">
                <label class="mb-0.5 block text-xs text-slate-500 dark:text-slate-300">Precio unit.</label>
                <input :value="formatCOP(row.price)" type="text" class="w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs outline-none focus:border-stellar-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" @input="updatePrice(i, $event)" />
              </div>
              <div class="col-span-3">
                <label class="mb-0.5 block text-xs text-slate-500 dark:text-slate-300">Subtotal</label>
                <p class="py-1 text-xs font-medium text-slate-700 dark:text-slate-100">${{ formatCOP(row.subtotal) }}</p>
              </div>
            </div>
          </div>

          <!-- Financial summary -->
          <div class="mb-6 space-y-1 text-right text-sm">
            <div class="flex items-center justify-end gap-2">
              <span class="text-slate-500 dark:text-slate-300">Subtotal:</span>
              <span class="w-28 text-right font-medium dark:text-slate-100">${{ formatCOP(subtotal) }}</span>
            </div>
            <div class="flex items-center justify-end gap-2">
              <span class="text-slate-500 dark:text-slate-300">IVA (19%):</span>
              <span class="w-28 text-right font-medium text-amber-600 dark:text-amber-400">${{ formatCOP(vat) }}</span>
            </div>
            <div class="flex items-center justify-end gap-2">
              <span class="text-slate-500 dark:text-slate-300">Descuento:</span>
              <input v-model.number="discount" type="number" min="0" step="0.01" class="w-28 rounded border border-slate-300 px-2 py-0.5 text-right text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" />
            </div>
            <hr class="border-slate-200 dark:border-slate-600" />
            <div class="flex items-center justify-end gap-2 text-base font-bold">
              <span class="dark:text-white">Total:</span>
              <span class="w-28 text-right text-stellar-600 dark:text-stellar-400">${{ formatCOP(total) }}</span>
            </div>
          </div>

          <!-- Error -->
          <p v-if="saleStore.error" class="mb-4 text-sm text-red-600 dark:text-red-400">{{ saleStore.error }}</p>

          <!-- Actions -->
          <div class="flex justify-end gap-2 border-t border-slate-200 pt-4 dark:border-slate-700">
            <button type="button" class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" @click="emit('close')">
              Cancelar
            </button>
            <button type="button" class="rounded-lg bg-stellar-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-stellar-600 disabled:opacity-50" :disabled="saleStore.isLoading || products.length === 0" @click="handleCreate">
              {{ saleStore.isLoading ? 'Registrando...' : 'Registrar venta' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Product Selection Modal -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      leave-active-class="transition-opacity duration-150 ease-in"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div v-if="showProductModal" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm" @click.self="closeProductModal">
        <div v-motion :initial="{ opacity: 0, scale: 0.95, y: 16 }" :enter="{ opacity: 1, scale: 1, y: 0, transition: { duration: 300 } }" class="relative max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
          <!-- Header -->
          <div class="sticky top-0 z-10 border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-700 dark:bg-slate-900">
            <div class="flex items-center justify-between">
              <h3 class="font-display text-lg font-bold tracking-tight dark:text-white">Seleccionar productos</h3>
              <button type="button" class="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300" @click="closeProductModal">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Selecciona uno o varios productos del inventario para agregarlos a la venta.</p>
          </div>

          <!-- Search and actions -->
          <div class="border-b border-slate-200 bg-slate-50 px-6 py-3 dark:border-slate-700 dark:bg-slate-800/50">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div class="relative flex-1">
                <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input v-model="searchProduct" type="text" placeholder="Buscar por código o nombre..." class="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-stellar-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
              </div>
              <div class="flex items-center gap-2">
                <button type="button" class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700" @click="selectAllProducts">
                  {{ selectedProducts.size === filteredAvailableProducts.length ? 'Deseleccionar todo' : 'Seleccionar todo' }}
                </button>
                <span class="rounded-lg bg-stellar-100 px-2.5 py-1 text-xs font-medium text-stellar-700 dark:bg-stellar-500/15 dark:text-stellar-400">
                  {{ selectedProducts.size }} seleccionados
                </span>
              </div>
            </div>
          </div>

          <!-- Product list -->
          <div class="max-h-[50vh] overflow-y-auto p-6">
            <div v-if="productEntryStore.isLoading" class="flex items-center justify-center py-12">
              <div class="h-8 w-8 animate-spin rounded-full border-4 border-stellar-500 border-t-transparent" />
            </div>

            <div v-else-if="productEntryStore.error" class="rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
              {{ productEntryStore.error }}
            </div>

            <div v-else-if="filteredAvailableProducts.length === 0" class="rounded-lg border border-dashed border-slate-300 p-8 text-center dark:border-slate-600">
              <svg class="mx-auto mb-3 h-12 w-12 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              <p class="text-sm text-slate-500 dark:text-slate-400">No hay productos disponibles en las entradas.</p>
              <p class="mt-1 text-xs text-slate-400 dark:text-slate-500">Registra productos en la entrada de inventario primero.</p>
            </div>

            <div v-else class="space-y-2">
              <div
                v-for="product in filteredAvailableProducts"
                :key="product.code"
                class="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700/50"
                @click="toggleProductSelection(product.code)"
              >
                <div class="flex-shrink-0">
                  <input
                    type="checkbox"
                    :checked="selectedProducts.has(product.code)"
                    class="h-5 w-5 cursor-pointer rounded border-slate-300 text-stellar-600 focus:ring-stellar-500 dark:border-slate-600 dark:bg-slate-700"
                    @click.stop
                    @change="toggleProductSelection(product.code)"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-400">{{ product.code }}</span>
                    <p class="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{{ product.product }}</p>
                  </div>
                  <div class="mt-1 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span>Unidad: {{ product.unit }}</span>
                    <span>Stock: {{ product.quantity }}</span>
                    <span v-if="product.suggested_selling_price">Precio sugerido: ${{ formatCOP(product.suggested_selling_price) }}</span>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-sm font-medium text-stellar-600 dark:text-stellar-400">${{ formatCOP(product.suggested_selling_price || product.unit_cost) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer actions -->
          <div class="sticky bottom-0 border-t border-slate-200 bg-white px-6 py-4 dark:border-slate-700 dark:bg-slate-900">
            <div class="flex items-center justify-between">
              <span class="text-sm text-slate-500 dark:text-slate-400">{{ selectedProducts.size }} productos seleccionados</span>
              <div class="flex gap-2">
                <button type="button" class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" @click="closeProductModal">
                  Cancelar
                </button>
                <button type="button" class="rounded-lg bg-stellar-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-stellar-600 disabled:opacity-50" :disabled="selectedProducts.size === 0" @click="addSelectedProducts">
                  Agregar seleccionados
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Provider Selection Modal -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      leave-active-class="transition-opacity duration-150 ease-in"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div v-if="showProviderModal" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm" @click.self="closeProviderModal">
        <div v-motion :initial="{ opacity: 0, scale: 0.95, y: 16 }" :enter="{ opacity: 1, scale: 1, y: 0, transition: { duration: 300 } }" class="relative max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
          <!-- Header -->
          <div class="sticky top-0 z-10 border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-700 dark:bg-slate-900">
            <div class="flex items-center justify-between">
              <h3 class="font-display text-lg font-bold tracking-tight dark:text-white">Seleccionar proveedor</h3>
              <button type="button" class="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300" @click="closeProviderModal">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Selecciona el proveedor al cual se le dirigirá la venta.</p>
          </div>

          <!-- Search -->
          <div class="border-b border-slate-200 bg-slate-50 px-6 py-3 dark:border-slate-700 dark:bg-slate-800/50">
            <div class="relative">
              <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input v-model="searchProvider" type="text" placeholder="Buscar por nombre, documento o código..." class="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-stellar-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
            </div>
          </div>

          <!-- Provider list -->
          <div class="max-h-[50vh] overflow-y-auto p-6">
            <div v-if="providerStore.isLoading" class="flex items-center justify-center py-12">
              <div class="h-8 w-8 animate-spin rounded-full border-4 border-stellar-500 border-t-transparent" />
            </div>

            <div v-else-if="providerStore.error" class="rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
              {{ providerStore.error }}
            </div>

            <div v-else-if="filteredProviders.length === 0" class="rounded-lg border border-dashed border-slate-300 p-8 text-center dark:border-slate-600">
              <svg class="mx-auto mb-3 h-12 w-12 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              <p class="text-sm text-slate-500 dark:text-slate-400">No hay proveedores disponibles.</p>
            </div>

            <div v-else class="space-y-2">
              <div
                v-for="(provider, i) in filteredProviders"
                :key="provider.id"
                v-motion
                :initial="{ opacity: 0, y: 8 }"
                :enter="{ opacity: 1, y: 0, transition: { delay: i * 30 } }"
                class="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700/50"
                @click="selectProvider(provider)"
              >
                <div class="flex-shrink-0">
                  <input
                    type="checkbox"
                    :checked="providerId === provider.id"
                    class="h-5 w-5 cursor-pointer rounded border-slate-300 text-stellar-600 focus:ring-stellar-500 dark:border-slate-600 dark:bg-slate-700"
                    @click.stop
                    @change="selectProvider(provider)"
                  />
                </div>
                <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-stellar-100 dark:bg-stellar-500/15">
                  <span class="text-sm font-bold text-stellar-700 dark:text-stellar-400">{{ provider.business_name.charAt(0).toUpperCase() }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-slate-900 dark:text-slate-100">{{ provider.business_name }}</p>
                  <div class="mt-0.5 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span class="rounded bg-slate-100 px-1.5 py-0.5 dark:bg-slate-700">{{ provider.code }}</span>
                    <span>{{ provider.document_type }}: {{ provider.document_number }}</span>
                  </div>
                </div>
                <div class="flex-shrink-0">
                  <span v-if="providerId === provider.id" class="rounded-full bg-stellar-100 px-2 py-1 text-xs font-medium text-stellar-700 dark:bg-stellar-500/15 dark:text-stellar-400">Seleccionado</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="sticky bottom-0 border-t border-slate-200 bg-white px-6 py-4 dark:border-slate-700 dark:bg-slate-900">
            <div class="flex justify-end gap-2">
              <button type="button" class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" @click="closeProviderModal">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Warehouse Selection Modal -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      leave-active-class="transition-opacity duration-150 ease-in"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div v-if="showWarehouseModal" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm" @click.self="closeWarehouseModal">
        <div v-motion :initial="{ opacity: 0, scale: 0.95, y: 16 }" :enter="{ opacity: 1, scale: 1, y: 0, transition: { duration: 300 } }" class="relative max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
          <!-- Header -->
          <div class="sticky top-0 z-10 border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-700 dark:bg-slate-900">
            <div class="flex items-center justify-between">
              <h3 class="font-display text-lg font-bold tracking-tight dark:text-white">Seleccionar bodega</h3>
              <button type="button" class="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300" @click="closeWarehouseModal">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Selecciona la bodega desde donde se realizará la venta.</p>
          </div>

          <!-- Search -->
          <div class="border-b border-slate-200 bg-slate-50 px-6 py-3 dark:border-slate-700 dark:bg-slate-800/50">
            <div class="relative">
              <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input v-model="searchWarehouse" type="text" placeholder="Buscar por área o unidad..." class="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-stellar-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
            </div>
          </div>

          <!-- Warehouse list -->
          <div class="max-h-[50vh] overflow-y-auto p-6">
            <div v-if="wineryStore.isLoading" class="flex items-center justify-center py-12">
              <div class="h-8 w-8 animate-spin rounded-full border-4 border-stellar-500 border-t-transparent" />
            </div>

            <div v-else-if="wineryStore.error" class="rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
              {{ wineryStore.error }}
            </div>

            <div v-else-if="filteredWarehouses.length === 0" class="rounded-lg border border-dashed border-slate-300 p-8 text-center dark:border-slate-600">
              <svg class="mx-auto mb-3 h-12 w-12 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              <p class="text-sm text-slate-500 dark:text-slate-400">No hay bodegas disponibles.</p>
            </div>

            <div v-else class="space-y-2">
              <div
                v-for="(winery, i) in filteredWarehouses"
                :key="winery.id"
                v-motion
                :initial="{ opacity: 0, y: 8 }"
                :enter="{ opacity: 1, y: 0, transition: { delay: i * 30 } }"
                class="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700/50"
                @click="selectWarehouse(winery)"
              >
                <div class="flex-shrink-0">
                  <input
                    type="checkbox"
                    :checked="warehouseId === winery.id"
                    class="h-5 w-5 cursor-pointer rounded border-slate-300 text-stellar-600 focus:ring-stellar-500 dark:border-slate-600 dark:bg-slate-700"
                    @click.stop
                    @change="selectWarehouse(winery)"
                  />
                </div>
                <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/15">
                  <svg class="h-5 w-5 text-amber-700 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-slate-900 dark:text-slate-100">{{ winery.area }}</p>
                  <div class="mt-0.5 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>Unidades: {{ winery.units }}</span>
                  </div>
                </div>
                <div class="flex-shrink-0">
                  <span v-if="warehouseId === winery.id" class="rounded-full bg-stellar-100 px-2 py-1 text-xs font-medium text-stellar-700 dark:bg-stellar-500/15 dark:text-stellar-400">Seleccionada</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="sticky bottom-0 border-t border-slate-200 bg-white px-6 py-4 dark:border-slate-700 dark:bg-slate-900">
            <div class="flex justify-end gap-2">
              <button type="button" class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" @click="closeWarehouseModal">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
  </div>
</template>
