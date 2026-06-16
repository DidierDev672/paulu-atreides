<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { useProductStore } from '@/presentation/stores/productStore'
import { useProductEntryStore } from '@/presentation/stores/productEntryStore'
import { useAuthStore } from '@/presentation/stores/authStore'
import { getCompanyByUser } from '@/application/services/companyService'
import type { CompanyResponse } from '@/application/services/companyService'
import { getWineriesByCompany } from '@/application/services/wineryService'
import SupplierSelectionModal from '@/presentation/components/products/SupplierSelectionModal.vue'
import WinerySelectionModal from '@/presentation/components/products/WinerySelectionModal.vue'

const emit = defineEmits<{
  saved: []
  goToProductList: []
  goToRegisterWinery: []
}>()

const productStore = useProductStore()
const productEntryStore = useProductEntryStore()
const authStore = useAuthStore()

const companyId = ref('')
const loadingCompany = ref(true)
const companies = ref<CompanyResponse[]>([])
const showCompanySelector = ref(false)
const selectedCompanyName = ref('')
const showWineryPrompt = ref(false)
const showAutoWineryPrompt = ref(false)
const showWineryField = ref(false)
const checkingWineries = ref(false)
const showAutoEntryDialog = ref(false)
const autoEntrySaving = ref(false)
const autoEntryError = ref('')
const autoEntry = reactive({
  unit_cost: 0,
  commercial_policy: '',
  profit_margin: 0,
  notes: '',
})
const COMMERCIAL_POLICIES = ['Normal', 'Premium', 'Descuento', 'Mayorista']

onMounted(async () => {
  const user = authStore.session?.user
  if (!user) {
    loadingCompany.value = false
    return
  }
  try {
    companies.value = await getCompanyByUser(user.id)
    if (companies.value.length === 0) {
      loadingCompany.value = false
    } else if (companies.value.length === 1) {
      companyId.value = companies.value[0].id
      selectedCompanyName.value = companies.value[0].business_name
      loadingCompany.value = false
      checkWineries(companies.value[0].id)
    } else {
      showCompanySelector.value = true
      loadingCompany.value = false
    }
  } catch {
    loadingCompany.value = false
  }
})

function selectCompany(c: CompanyResponse): void {
  companyId.value = c.id
  selectedCompanyName.value = c.business_name
  showCompanySelector.value = false
  checkWineries(c.id)
}

function clearCompany(): void {
  companyId.value = ''
  selectedCompanyName.value = ''
  showCompanySelector.value = true
}

async function checkWineries(companyId: string): Promise<void> {
  checkingWineries.value = true
  try {
    const result = await getWineriesByCompany(companyId)
    if (result.length === 0) {
      showWineryPrompt.value = true
    } else {
      showAutoWineryPrompt.value = true
    }
  } catch {
    // if the request fails, just let the user proceed
  } finally {
    checkingWineries.value = false
  }
}

function formatCOP(value: number): string {
  return value.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function parseCOP(raw: string): number {
  const cleaned = raw.replace(/\./g, '').replace(/,/g, '.')
  const n = parseFloat(cleaned)
  return isNaN(n) ? 0 : n
}

const autoFixedMarkup = computed(() => {
  return autoEntry.unit_cost * (autoEntry.profit_margin / 100)
})
const autoSuggestedPrice = computed(() => {
  return autoEntry.unit_cost + autoFixedMarkup.value
})

function acceptAutoWinery(): void {
  showWineryField.value = true
  showAutoWineryPrompt.value = false
}

function declineAutoWinery(): void {
  showWineryField.value = false
  showAutoWineryPrompt.value = false
}

function goToRegisterWinery(): void {
  showWineryPrompt.value = false
  emit('goToRegisterWinery')
}

function dismissWineryPrompt(): void {
  showWineryPrompt.value = false
}

const VALID_UNITS = ['Kg', 'Litro', 'Libra', 'Gramos', 'Unidad']

const form = reactive({
  name: '',
  product_code: '',
  categories_input: '',
  categories: [] as string[],
  unit: '',
  minimum_stock: 0,
  quantity: 0,
  supplier_id: '',
  winery_id: '',
})

const selectedSupplierName = ref('')
const showSupplierModal = ref(false)

function onSupplierSelected(provider: { id: string; business_name: string }): void {
  form.supplier_id = provider.id
  selectedSupplierName.value = provider.business_name
  showSupplierModal.value = false
}

function clearSupplier(): void {
  form.supplier_id = ''
  selectedSupplierName.value = ''
}

const selectedWineryName = ref('')
const showWineryModal = ref(false)

function onWinerySelected(winery: { id: string; area: string }): void {
  form.winery_id = winery.id
  selectedWineryName.value = winery.area
  showWineryModal.value = false
}

function clearWinery(): void {
  form.winery_id = ''
  selectedWineryName.value = ''
}

const imageFile = ref<File | null>(null)
const imagePreview = ref<string | null>(null)

const saving = ref(false)
const formError = ref('')
const showResultDialog = ref(false)
const resultMessage = ref('')
const resultType = ref<'success' | 'error'>('success')
const fieldErrors = reactive({
  name: '',
  product_code: '',
  categories: '',
  unit: '',
  quantity: '',
  minimum_stock: '',
})

const FREQ_KEY = 'category_frequencies'
const categoryFrequencies = ref<Record<string, number>>({})
const showSuggestions = ref(false)

onMounted(() => {
  try {
    categoryFrequencies.value = JSON.parse(localStorage.getItem(FREQ_KEY) || '{}')
  } catch {
    categoryFrequencies.value = {}
  }
})

function persistFrequencies(): void {
  localStorage.setItem(FREQ_KEY, JSON.stringify(categoryFrequencies.value))
}

function incrementCategory(cat: string): void {
  categoryFrequencies.value[cat] = (categoryFrequencies.value[cat] || 0) + 1
  persistFrequencies()
}

const filteredSuggestions = computed(() => {
  const input = form.categories_input.trim().toLowerCase()
  if (!input) return []
  return Object.entries(categoryFrequencies.value)
    .filter(([cat, count]) => count >= 3 && cat.toLowerCase().includes(input) && !form.categories.includes(cat))
    .map(([cat]) => cat)
    .slice(0, 6)
})

function selectSuggestion(cat: string): void {
  form.categories_input = cat
  showSuggestions.value = false
  addCategory()
}

const isFormValid = computed(() => {
  return (
    form.name.trim() !== '' &&
    form.product_code.trim() !== '' &&
    form.categories.length > 0 &&
    form.unit !== '' &&
    form.quantity >= 0 &&
    form.minimum_stock >= 0
  )
})

function addCategory(): void {
  const val = form.categories_input.trim()
  if (val && !form.categories.includes(val)) {
    form.categories.push(val)
    form.categories_input = ''
    fieldErrors.categories = ''
    showSuggestions.value = false
    incrementCategory(val)
  }
}

function removeCategory(index: number): void {
  form.categories.splice(index, 1)
}

function debounceHideSuggestions(): void {
  setTimeout(() => showSuggestions.value = false, 200)
}
function handleCategoryKeydown(e: KeyboardEvent): void {
  if (e.key === 'Enter') {
    e.preventDefault()
    addCategory()
  }
}

function generateProductCode(): void {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  form.product_code = `PROD-${timestamp}-${random}`
  fieldErrors.product_code = ''
}

function handleImageSelect(e: Event): void {
  const input = e.target as HTMLInputElement
  if (!input.files || input.files.length === 0) {
    imageFile.value = null
    imagePreview.value = null
    return
  }
  const file = input.files[0]
  imageFile.value = file
  const reader = new FileReader()
  reader.onload = () => {
    imagePreview.value = reader.result as string
  }
  reader.readAsDataURL(file)
}

function clearImage(): void {
  imageFile.value = null
  imagePreview.value = null
}

function validate(): boolean {
  let valid = true
  fieldErrors.name = ''
  fieldErrors.product_code = ''
  fieldErrors.categories = ''
  fieldErrors.unit = ''
  fieldErrors.quantity = ''
  fieldErrors.minimum_stock = ''

  if (!form.name.trim()) {
    fieldErrors.name = 'El nombre del producto es obligatorio.'
    valid = false
  }
  if (!form.product_code.trim()) {
    fieldErrors.product_code = 'El código del producto es obligatorio.'
    valid = false
  }
  if (form.categories.length === 0) {
    fieldErrors.categories = 'Debe agregar al menos una categoría.'
    valid = false
  }
  if (!form.unit) {
    fieldErrors.unit = 'Seleccione una unidad de medida.'
    valid = false
  }
  if (form.quantity < 0) {
    fieldErrors.quantity = 'La cantidad no puede ser negativa.'
    valid = false
  }
  if (form.minimum_stock < 0) {
    fieldErrors.minimum_stock = 'El stock mínimo no puede ser negativo.'
    valid = false
  }

  return valid
}

async function handleSubmit(): Promise<void> {
  formError.value = ''

  if (!validate()) return

  if (!companyId.value) {
    formError.value = 'No se encontró una empresa vinculada a su cuenta.'
    return
  }

  saving.value = true
  try {
    const result = await productStore.createProduct({
      company_id: companyId.value,
      supplier_id: form.supplier_id,
      name: form.name.trim(),
      product_code: form.product_code.trim(),
      categories: [...form.categories],
      unit: form.unit,
      quantity: form.quantity,
      minimum_stock: form.minimum_stock,
      winery_id: form.winery_id,
    })

    if (result) {
      autoEntry.unit_cost = 0
      autoEntry.commercial_policy = ''
      autoEntry.profit_margin = 0
      autoEntry.notes = ''
      showAutoEntryDialog.value = true
    } else {
      resultType.value = 'error'
      resultMessage.value = productStore.error ?? 'Error al guardar el producto.'
      showResultDialog.value = true
    }
  } catch {
    resultType.value = 'error'
    resultMessage.value = 'Error inesperado al guardar el producto.'
    showResultDialog.value = true
  } finally {
    saving.value = false
  }
}

function closeResultDialog(): void {
  showResultDialog.value = false
}

function goToProductList(): void {
  showResultDialog.value = false
  emit('goToProductList')
}

function closeAutoEntryDialog(): void {
  showAutoEntryDialog.value = false
}

async function generateAutoEntry(): Promise<void> {
  autoEntryError.value = ''
  if (autoEntry.unit_cost <= 0) {
    autoEntryError.value = 'Ingrese un costo unitario válido.'
    return
  }
  if (!autoEntry.commercial_policy) {
    autoEntryError.value = 'Seleccione una política comercial.'
    return
  }
  if (autoEntry.profit_margin < 0) {
    autoEntryError.value = 'Ingrese un margen válido.'
    return
  }

  autoEntrySaving.value = true
  try {
    const user = authStore.session?.user
    if (!user) {
      autoEntryError.value = 'Sesión no encontrada.'
      return
    }

    const today = new Date().toISOString().split('T')[0]
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()

    const result = await productEntryStore.createEntry({
      entry_number: `AUTO-${timestamp}-${random}`,
      registered_date: today,
      movement_type: 'Inventory Adjustment',
      warehouse: form.winery_id,
      responsible_party: user.id,
      company_id: companyId.value,
      details: [{
        code: form.product_code,
        product: form.name,
        unit: form.unit || 'Unidad',
        quantity: form.quantity || 0,
        unit_cost: autoEntry.unit_cost,
        subtotal: autoEntry.unit_cost * (form.quantity || 0),
        commercial_policy: autoEntry.commercial_policy,
        profit_margin: autoEntry.profit_margin,
        fixed_markup: autoFixedMarkup.value,
        suggested_selling_price: autoSuggestedPrice.value,
      }],
      financial_summary: {
        purchase_subtotal: autoEntry.unit_cost * (form.quantity || 0),
        vat: 0,
        discount: 0,
        purchase_total: autoEntry.unit_cost * (form.quantity || 0),
      },
      observations: autoEntry.notes,
    })

    if (result) {
      showAutoEntryDialog.value = false
      form.name = ''
      form.product_code = ''
      form.categories_input = ''
      form.categories = []
      form.unit = ''
      form.quantity = 0
      form.minimum_stock = 0
      form.supplier_id = ''
      selectedSupplierName.value = ''
      form.winery_id = ''
      selectedWineryName.value = ''
      imageFile.value = null
      imagePreview.value = null
      resultType.value = 'success'
      resultMessage.value = 'Producto registrado y entrada de inventario generada automáticamente.'
      showResultDialog.value = true
      emit('saved')
    } else {
      autoEntryError.value = productEntryStore.error ?? 'Error al generar la entrada.'
    }
  } catch {
    autoEntryError.value = 'Error inesperado al generar la entrada.'
  } finally {
    autoEntrySaving.value = false
  }
}
</script>

<template>
  <div class="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
        Registrar producto
      </h1>
      <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Complete los campos para agregar un nuevo producto al inventario.
      </p>
    </div>

    <!-- Global error -->
    <div
      v-if="formError"
      class="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400"
    >
      {{ formError }}
    </div>

    <!-- Loading company -->
    <div
      v-if="loadingCompany"
      class="flex items-center justify-center py-20"
    >
      <svg class="h-8 w-8 animate-spin text-stellar-500" viewBox="0 0 24 24" fill="none">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>

    <!-- Company selector (multiple companies) -->
    <div
      v-else-if="showCompanySelector"
      class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <h2 class="mb-5 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        Seleccionar empresa
      </h2>
      <p class="mb-4 text-sm text-slate-500 dark:text-slate-400">
        Tienes varias empresas vinculadas a tu cuenta. Selecciona a cuál deseas agregar el producto.
      </p>
      <div class="space-y-2">
        <button
          v-for="c in companies"
          :key="c.id"
          type="button"
          class="group flex w-full items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-stellar-400 hover:bg-stellar-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-stellar-500 dark:hover:bg-stellar-500/10"
          @click="selectCompany(c)"
        >
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-stellar-500 to-cosmic-600 text-sm font-bold text-white shadow-sm">
            {{ c.business_name.charAt(0).toUpperCase() }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-semibold text-slate-800 group-hover:text-stellar-700 dark:text-slate-100 dark:group-hover:text-stellar-200">{{ c.business_name }}</p>
            <p class="truncate text-xs text-slate-500">{{ c.nit }} · {{ c.social_reason }}</p>
          </div>
          <svg class="h-5 w-5 shrink-0 text-slate-300 transition group-hover:text-stellar-500 dark:text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>

    <!-- No companies -->
    <div
      v-else-if="!companyId"
      class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <p class="text-sm text-slate-500 dark:text-slate-400">
        No tienes empresas vinculadas a tu cuenta. Primero debes registrar una empresa para poder agregar productos.
      </p>
    </div>

    <form
      v-if="companyId && !showCompanySelector && !checkingWineries && !showWineryPrompt && !showAutoWineryPrompt"
      novalidate
      class="space-y-8"
      @submit.prevent="handleSubmit"
    >
      <!-- Company badge -->
      <div class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 class="mb-5 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Empresa
        </h2>
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-stellar-500 to-cosmic-600 text-sm font-bold text-white shadow-sm">
            {{ selectedCompanyName.charAt(0).toUpperCase() }}
          </div>
          <div class="flex-1">
            <p class="text-sm font-medium text-slate-800 dark:text-slate-100">{{ selectedCompanyName }}</p>
            <p class="text-xs text-slate-500 dark:text-slate-400">Empresa seleccionada para el registro</p>
          </div>
          <button
            v-if="companies.length > 1"
            type="button"
            class="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
            @click="clearCompany"
          >
            Cambiar
          </button>
        </div>
      </div>

      <!-- Basic info section -->
      <div class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 class="mb-5 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          Información del producto
        </h2>

        <div class="grid gap-5 sm:grid-cols-2">
          <!-- Product code -->
          <div class="sm:col-span-2">
            <label class="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
              Código del producto <span class="text-red-500">*</span>
            </label>
            <div class="flex gap-2">
              <input
                v-model="form.product_code"
                type="text"
                placeholder="Ej: PROD-001"
                class="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-stellar-500"
                :class="{ 'border-red-400 dark:border-red-500': fieldErrors.product_code }"
              />
              <button
                type="button"
                class="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                title="Generar código automáticamente"
                @click="generateProductCode"
              >
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Generar
              </button>
            </div>
            <p v-if="fieldErrors.product_code" class="mt-1 text-xs text-red-500">
              {{ fieldErrors.product_code }}
            </p>
          </div>

          <!-- Product name -->
          <div class="sm:col-span-2">
            <label class="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
              Nombre del producto <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.name"
              type="text"
              placeholder="Ej: Café Molido Premium 500g"
              class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-stellar-500"
              :class="{ 'border-red-400 dark:border-red-500': fieldErrors.name }"
            />
            <p v-if="fieldErrors.name" class="mt-1 text-xs text-red-500">
              {{ fieldErrors.name }}
            </p>
          </div>

          <!-- Unit -->
          <div>
            <label class="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
              Unidad de medida <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.unit"
              class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-stellar-500"
              :class="{ 'border-red-400 dark:border-red-500': fieldErrors.unit }"
            >
              <option value="" disabled>Seleccione una unidad</option>
              <option v-for="u in VALID_UNITS" :key="u" :value="u">{{ u }}</option>
            </select>
            <p v-if="fieldErrors.unit" class="mt-1 text-xs text-red-500">
              {{ fieldErrors.unit }}
            </p>
          </div>

          <!-- Quantity -->
          <div>
            <label class="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
              Cantidad de productos
            </label>
            <input
              v-model.number="form.quantity"
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-stellar-500"
              :class="{ 'border-red-400 dark:border-red-500': fieldErrors.quantity }"
            />
            <p v-if="fieldErrors.quantity" class="mt-1 text-xs text-red-500">
              {{ fieldErrors.quantity }}
            </p>
          </div>

          <!-- Minimum stock -->
          <div>
            <label class="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
              Stock mínimo
            </label>
            <input
              v-model.number="form.minimum_stock"
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-stellar-500"
              :class="{ 'border-red-400 dark:border-red-500': fieldErrors.minimum_stock }"
            />
            <p v-if="fieldErrors.minimum_stock" class="mt-1 text-xs text-red-500">
              {{ fieldErrors.minimum_stock }}
            </p>
          </div>
        </div>
      </div>

      <!-- Categories section -->
      <div class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 class="mb-5 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          Categorías <span class="text-red-500">*</span>
        </h2>

        <div class="flex gap-2">
          <div class="relative flex-1">
            <input
              v-model="form.categories_input"
              type="text"
              placeholder="Escriba una categoría y presione Enter"
              class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-stellar-500"
              @keydown="handleCategoryKeydown"
              @input="showSuggestions = filteredSuggestions.length > 0"
              @focus="showSuggestions = filteredSuggestions.length > 0"
              @blur="debounceHideSuggestions"
            />
            <Transition name="fade">
              <div
                v-if="showSuggestions && filteredSuggestions.length > 0"
                class="absolute left-0 right-0 top-full z-10 mt-1 max-h-40 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800"
              >
                <button
                  v-for="suggestion in filteredSuggestions"
                  :key="suggestion"
                  type="button"
                  class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-stellar-50 dark:text-slate-200 dark:hover:bg-stellar-500/10"
                  @mousedown.prevent="selectSuggestion(suggestion)"
                >
                  <svg class="h-3.5 w-3.5 shrink-0 text-stellar-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {{ suggestion }}
                </button>
              </div>
            </Transition>
          </div>
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-xl bg-stellar-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-stellar-400"
            @click="addCategory"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Agregar
          </button>
        </div>
        <p v-if="fieldErrors.categories" class="mt-1 text-xs text-red-500">
          {{ fieldErrors.categories }}
        </p>

        <!-- Category tags -->
        <div v-if="form.categories.length > 0" class="mt-4 flex flex-wrap gap-2">
          <span
            v-for="(cat, index) in form.categories"
            :key="index"
            class="inline-flex items-center gap-1.5 rounded-lg bg-stellar-50 px-3 py-1.5 text-xs font-medium text-stellar-700 dark:bg-stellar-500/10 dark:text-stellar-300"
          >
            {{ cat }}
            <button
              type="button"
              class="inline-flex rounded-full p-0.5 transition hover:bg-stellar-200 hover:text-stellar-900 dark:hover:bg-stellar-500/20 dark:hover:text-stellar-100"
              @click="removeCategory(index)"
            >
              <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        </div>
      </div>

      <!-- Supplier section -->
      <div class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 class="mb-5 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Proveedor
        </h2>

        <div v-if="!form.supplier_id">
          <p class="mb-3 text-sm text-slate-500 dark:text-slate-400">
            Asocie un proveedor a este producto para mantener un control de origen.
          </p>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            @click="showSupplierModal = true"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Buscar proveedor
          </button>
        </div>

        <div v-else class="flex items-center gap-3 rounded-xl bg-stellar-50 px-4 py-3 dark:bg-stellar-500/10">
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-stellar-100 text-stellar-600 dark:bg-stellar-500/20 dark:text-stellar-300">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div class="flex-1">
            <p class="text-sm font-medium text-slate-800 dark:text-slate-100">{{ selectedSupplierName }}</p>
            <p class="text-xs text-slate-500 dark:text-slate-400">Proveedor seleccionado</p>
          </div>
          <button
            type="button"
            class="rounded-xl p-2 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
            title="Quitar proveedor"
            @click="clearSupplier"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Winery section -->
      <div v-if="showWineryField" class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 class="mb-5 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 21V7l9-4 9 4v14M9 17h6v4H9zm0-6h6" />
          </svg>
          Bodega
        </h2>

        <div v-if="!form.winery_id">
          <p class="mb-3 text-sm text-slate-500 dark:text-slate-400">
            Asocie una bodega a este producto para registrar su procedencia.
          </p>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            @click="showWineryModal = true"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Buscar bodega
          </button>
        </div>

        <div v-else class="flex items-center gap-3 rounded-xl bg-stellar-50 px-4 py-3 dark:bg-stellar-500/10">
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-stellar-100 text-stellar-600 dark:bg-stellar-500/20 dark:text-stellar-300">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 21V7l9-4 9 4v14M9 17h6v4H9zm0-6h6" />
            </svg>
          </div>
          <div class="flex-1">
            <p class="text-sm font-medium text-slate-800 dark:text-slate-100">{{ selectedWineryName }}</p>
            <p class="text-xs text-slate-500 dark:text-slate-400">Bodega seleccionada</p>
          </div>
          <button
            type="button"
            class="rounded-xl p-2 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
            title="Quitar bodega"
            @click="clearWinery"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Product image section -->
      <div class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 class="mb-5 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Imagen del producto
        </h2>

        <div class="flex flex-col items-center gap-4 sm:flex-row">
          <!-- Preview -->
          <div
            class="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800"
          >
            <img
              v-if="imagePreview"
              :src="imagePreview"
              alt="Vista previa"
              class="h-full w-full object-cover"
            />
            <svg
              v-else
              class="h-10 w-10 text-slate-300 dark:text-slate-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>

          <div class="flex flex-col gap-2">
            <label
              class="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Seleccionar imagen
              <input
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleImageSelect"
              />
            </label>

            <button
              v-if="imagePreview"
              type="button"
              class="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
              @click="clearImage"
            >
              <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Eliminar imagen
            </button>

            <p class="text-xs text-slate-400 dark:text-slate-500">
              Formatos: JPG, PNG, WebP. Máx 5MB.
            </p>
          </div>
        </div>
      </div>

      <!-- Submit -->
      <div class="flex justify-end gap-3">
        <button
          type="submit"
          :disabled="saving || !isFormValid"
          class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-stellar-500 to-cosmic-500 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:from-stellar-400 hover:to-cosmic-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg
            v-if="saving"
            class="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <svg
            v-else
            class="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          {{ saving ? 'Guardando...' : 'Guardar producto' }}
        </button>
      </div>
    </form>
    </div>

    <!-- Result dialog -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showResultDialog"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        >
          <div class="mx-4 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <!-- Icon -->
            <div class="mb-4 flex justify-center">
              <div
                v-if="resultType === 'success'"
                class="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20"
              >
                <svg class="h-7 w-7 text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div
                v-else
                class="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20"
              >
                <svg class="h-7 w-7 text-red-600 dark:text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            <!-- Message -->
            <p class="mb-6 text-center text-sm text-slate-600 dark:text-slate-300">
              {{ resultMessage }}
            </p>

            <!-- Buttons -->
            <div class="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <button
                type="button"
                class="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                @click="closeResultDialog"
              >
                Ingresar uno nuevo
              </button>
              <button
                type="button"
                class="rounded-xl bg-gradient-to-r from-stellar-500 to-cosmic-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:brightness-110"
                @click="goToProductList"
              >
                Enviar a lista de productos
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Winery prompt -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showWineryPrompt"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
        >
          <div
            v-motion
            :initial="{ opacity: 0, scale: 0.92, y: 24 }"
            :enter="{ opacity: 1, scale: 1, y: 0, transition: { duration: 400, ease: 'easeOut' } }"
            class="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0d0a28] shadow-2xl"
          >
            <div class="pointer-events-none absolute -left-20 -top-20 h-40 w-40 rounded-full bg-amber-500/20 blur-3xl" />
            <div class="pointer-events-none absolute -bottom-16 -right-16 h-36 w-36 rounded-full bg-stellar-500/15 blur-3xl" />

            <div class="relative px-8 pb-2 pt-10 text-center">
              <div class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-[0_12px_32px_rgba(251,191,36,0.35)]">
                <svg class="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 21V7l9-4 9 4v14M9 17h6v4H9zm0-6h6" />
                </svg>
              </div>

              <h2 class="font-display text-2xl font-bold text-white">
                ¿Registrar una bodega?
              </h2>

              <p class="mt-3 text-sm leading-relaxed text-white/60">
                No encontramos bodegas vinculadas a esta empresa. Registrar una bodega
                permite optimizar las entradas de producto y llevar un control más preciso
                del inventario.
              </p>
            </div>

            <div class="relative space-y-4 px-8 py-5">
              <div class="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
                <div class="flex gap-2">
                  <svg class="mt-0.5 h-4 w-4 shrink-0 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div class="text-xs leading-relaxed text-amber-200/80">
                    <p class="font-medium text-amber-200">¿Sabías que…?</p>
                    <p class="mt-1">
                      Al registrar una bodega primero, las entradas de producto se asocian
                      automáticamente a ella, lo que facilita el seguimiento y la organización
                      del inventario sin pasos adicionales.
                    </p>
                  </div>
                </div>
              </div>

              <div class="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  class="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/10"
                  @click="dismissWineryPrompt"
                >
                  Registrar después
                </button>
                <button
                  type="button"
                  class="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-amber-500/25 transition hover:brightness-110"
                  @click="goToRegisterWinery"
                >
                  Registrar bodega
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Auto-winery prompt (wineries exist) -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showAutoWineryPrompt"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
        >
          <div
            v-motion
            :initial="{ opacity: 0, scale: 0.92, y: 24 }"
            :enter="{ opacity: 1, scale: 1, y: 0, transition: { duration: 400, ease: 'easeOut' } }"
            class="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0d0a28] shadow-2xl"
          >
            <div class="pointer-events-none absolute -left-20 -top-20 h-40 w-40 rounded-full bg-stellar-500/20 blur-3xl" />
            <div class="pointer-events-none absolute -bottom-16 -right-16 h-36 w-36 rounded-full bg-cosmic-500/15 blur-3xl" />

            <div class="relative px-8 pb-2 pt-10 text-center">
              <div class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-stellar-400 to-cosmic-500 shadow-[0_12px_32px_rgba(139,92,246,0.35)]">
                <svg class="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 21V7l9-4 9 4v14M9 17h6v4H9zm0-6h6" />
                </svg>
              </div>

              <h2 class="font-display text-2xl font-bold text-white">
                ¿Automatizar bodega?
              </h2>

              <p class="mt-3 text-sm leading-relaxed text-white/60">
                Tienes bodegas registradas para esta empresa. ¿Deseas vincular este producto
                a una bodega ahora? Si prefieres hacerlo manualmente más adelante, puedes
                omitir este paso.
              </p>
            </div>

            <div class="relative space-y-4 px-8 py-5">
              <div class="rounded-xl border border-stellar-500/20 bg-stellar-500/5 px-4 py-3">
                <div class="flex gap-2">
                  <svg class="mt-0.5 h-4 w-4 shrink-0 text-stellar-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div class="text-xs leading-relaxed text-stellar-200/80">
                    <p class="font-medium text-stellar-200">Ventaja</p>
                    <p class="mt-1">
                      Vincular el producto a una bodega ahora permite que el inventario quede
                      organizado desde el primer momento, ahorrando tiempo en registros futuros.
                    </p>
                  </div>
                </div>
              </div>

              <div class="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  class="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/10"
                  @click="declineAutoWinery"
                >
                  No, lo haré después
                </button>
                <button
                  type="button"
                  class="flex-1 rounded-xl bg-gradient-to-r from-stellar-500 to-cosmic-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-stellar-500/25 transition hover:brightness-110"
                  @click="acceptAutoWinery"
                >
                  Sí, vincular ahora
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Auto-entry dialog -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showAutoEntryDialog"
          class="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
        >
          <div
            v-motion
            :initial="{ opacity: 0, scale: 0.92, y: 24 }"
            :enter="{ opacity: 1, scale: 1, y: 0, transition: { duration: 400, ease: 'easeOut' } }"
            class="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#0d0a28] shadow-2xl"
          >
            <div class="pointer-events-none absolute -left-20 -top-20 h-40 w-40 rounded-full bg-emerald-500/20 blur-3xl" />
            <div class="pointer-events-none absolute -bottom-16 -right-16 h-36 w-36 rounded-full bg-stellar-500/15 blur-3xl" />

            <div class="relative space-y-5 px-8 pb-6 pt-10">
              <div class="text-center">
                <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-[0_12px_32px_rgba(52,211,153,0.35)]">
                  <svg class="h-7 w-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 class="font-display text-xl font-bold text-white">
                  Generar entrada automática
                </h2>
                <p class="mt-2 text-sm text-white/50">
                  Complete los datos para generar la entrada de inventario del producto <span class="font-semibold text-white/80">{{ form.name || 'sin nombre' }}</span>
                </p>
              </div>

              <div class="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div class="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span class="text-white/40">Bodega</span>
                    <p class="font-medium text-white">{{ selectedWineryName || '—' }}</p>
                  </div>
                  <div>
                    <span class="text-white/40">Tipo movimiento</span>
                    <p class="font-medium text-white">Ajuste de inventario</p>
                  </div>
                  <div>
                    <span class="text-white/40">Producto</span>
                    <p class="font-medium text-white truncate">{{ form.name || '—' }}</p>
                  </div>
                  <div>
                    <span class="text-white/40">Código</span>
                    <p class="font-medium text-white">{{ form.product_code || '—' }}</p>
                  </div>
                </div>
              </div>

              <div v-if="autoEntryError" class="rounded-xl bg-red-500/10 px-4 py-2.5 text-xs text-red-400">
                {{ autoEntryError }}
              </div>

              <div class="space-y-4">
                <div>
                  <label class="mb-1.5 block text-xs font-medium text-white/60">Costo unitario *</label>
                  <input
                    :value="autoEntry.unit_cost > 0 ? formatCOP(autoEntry.unit_cost) : ''"
                    type="text"
                    inputmode="decimal"
                    class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 placeholder-white/25"
                    placeholder="$ 0,00"
                    @input="autoEntry.unit_cost = parseCOP(($event.target as HTMLInputElement).value)"
                  />
                </div>

                <div>
                  <label class="mb-1.5 block text-xs font-medium text-white/60">Política comercial *</label>
                  <select
                    v-model="autoEntry.commercial_policy"
                    class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                  >
                    <option value="" disabled class="bg-[#0d0a28]">Seleccione política</option>
                    <option v-for="p in COMMERCIAL_POLICIES" :key="p" :value="p" class="bg-[#0d0a28]">{{ p }}</option>
                  </select>
                </div>

                <div>
                  <label class="mb-1.5 block text-xs font-medium text-white/60">Margen (%) *</label>
                  <input
                    v-model.number="autoEntry.profit_margin"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 placeholder-white/25"
                    placeholder="0"
                  />
                </div>

                <div v-if="autoEntry.unit_cost > 0 && autoEntry.profit_margin > 0" class="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-white/50">Margen fijo:</span>
                    <span class="font-semibold text-emerald-300">{{ formatCOP(autoFixedMarkup) }}</span>
                  </div>
                  <div class="mt-1 flex items-center justify-between text-sm">
                    <span class="text-white/50">Precio venta sugerido:</span>
                    <span class="font-semibold text-emerald-300">{{ formatCOP(autoSuggestedPrice) }}</span>
                  </div>
                </div>

                <div>
                  <label class="mb-1.5 block text-xs font-medium text-white/60">Nota (opcional)</label>
                  <textarea
                    v-model="autoEntry.notes"
                    rows="2"
                    class="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 placeholder-white/25"
                    placeholder="Agregue una nota a la entrada..."
                  ></textarea>
                </div>
              </div>

              <div class="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  class="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/10 disabled:opacity-40"
                  :disabled="autoEntrySaving"
                  @click="closeAutoEntryDialog"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  class="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-emerald-500/25 transition hover:brightness-110 disabled:opacity-50"
                  :disabled="autoEntrySaving"
                  @click="generateAutoEntry"
                >
                  <span v-if="autoEntrySaving" class="flex items-center justify-center gap-2">
                    <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Generando...
                  </span>
                  <span v-else>Generar entrada</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <SupplierSelectionModal
      v-if="showSupplierModal"
      @close="showSupplierModal = false"
      @confirm="onSupplierSelected"
    />
    <WinerySelectionModal
      v-if="showWineryModal"
      :company-id="companyId"
      @close="showWineryModal = false"
      @confirm="onWinerySelected"
    />
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
