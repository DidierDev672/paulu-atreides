<script setup lang="ts">
import type { ProductResponse } from '@/application/services/productService'
import CompanyRequiredModal from '@/presentation/components/company/CompanyRequiredModal.vue'
import { useAuthStore } from '@/presentation/stores/authStore'
import { useCompanyStore } from '@/presentation/stores/companyStore'
import { useProductEntryStore } from '@/presentation/stores/productEntryStore'
import { computed, onMounted, reactive, ref } from 'vue'
import ProductSelectionModal from './ProductSelectionModal.vue'

function formatCOP(value: number): string {
  return value.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function parseCOP(raw: string): number {
  const cleaned = raw.replace(/\./g, '').replace(/,/g, '.')
  const n = parseFloat(cleaned)
  return isNaN(n) ? 0 : n
}

const entryStore = useProductEntryStore()
const authStore = useAuthStore()
const companyStore = useCompanyStore()

onMounted(async () => {
  const user = authStore.session?.user
  if (user) {
    form.responsible_party = user.id
  }
  if (companyStore.company) {
    form.company_id = companyStore.company.id
  } else if (user) {
    const company = await companyStore.fetchByUser(user.id)
    if (company) {
      form.company_id = company.id
    }
  }
})

const MOVEMENT_TYPES = [
  { value: 'Purchase', label: 'Compra' },
  { value: 'Return', label: 'Devolución' },
  { value: 'Donation', label: 'Donación' },
  { value: 'Inventory Adjustment', label: 'Ajuste de inventario' },
  { value: 'Internal Production', label: 'Producción interna' },
]

const UNITS = ['Kg', 'Litro', 'Libra', 'Gramos', 'Unidad', 'Caja', 'Paquete', 'Metro']

const form = reactive({
  entry_number: '',
  registered_date: '',
  movement_type: '',
  warehouse: '',
  responsible_party: '',
  company_id: '',
  details: [] as {
    code: string
    product: string
    unit: string
    quantity: number | null
    unit_cost: number | null
    subtotal: number
    commercial_policy: string
    profit_margin: number | null
    fixed_markup: number | null
    suggested_selling_price: number
    _markupTouched: boolean
  }[],
  financial_summary: {
    purchase_subtotal: 0,
    vat: 0,
    discount: 0,
    purchase_total: 0,
  },
  observations: '',
})

const showCompanyModal = ref(false)
const showProductModal = ref(false)
const saving = ref(false)
const formError = ref('')
const detailsError = ref('')

const fieldErrors = reactive({
  entry_number: '',
  registered_date: '',
  movement_type: '',
  responsible_party: '',
})

const isFormValid = computed(() => {
  return (
    form.entry_number.trim() !== '' &&
    form.registered_date !== '' &&
    form.movement_type !== '' &&
    form.responsible_party.trim() !== '' &&
    form.details.length > 0 &&
    form.details.every((d) => d.code.trim() && d.product.trim() && d.unit && d.quantity && d.unit_cost)
  )
})

const emitPage = defineEmits<{
  saved: []
  goToCompany: []
  goToProductRegistration: []
}>()

function openProductModal(): void {
  if (!form.company_id) {
    showCompanyModal.value = true
    return
  }
  showProductModal.value = true
}

function goToCompanyRegistration(): void {
  showCompanyModal.value = false
  emitPage('goToCompany')
}

function goToProductRegistration(): void {
  showProductModal.value = false
  emitPage('goToProductRegistration')
}

function handleProductSelection(selected: ProductResponse[]): void {
  for (const p of selected) {
    form.details.push({
      code: p.product_code,
      product: p.name,
      unit: p.unit,
      quantity: null,
      unit_cost: null,
      subtotal: 0,
      commercial_policy: '',
      profit_margin: null,
      fixed_markup: null,
      suggested_selling_price: 0,
      _markupTouched: false,
    })
  }
  detailsError.value = ''
  showProductModal.value = false
}

function removeDetail(index: number): void {
  form.details.splice(index, 1)
  recalcFinancials()
}

function onUnitCostInput(event: Event, index: number): void {
  const raw = (event.target as HTMLInputElement).value
  form.details[index].unit_cost = parseCOP(raw)
  calcDetailSubtotal(index)
  calcSellingPrice(index)
}

function onFixedMarkupInput(event: Event, index: number): void {
  const raw = (event.target as HTMLInputElement).value
  form.details[index].fixed_markup = parseCOP(raw)
  form.details[index]._markupTouched = true
  calcSellingPrice(index)
}

function onFinancialInput(event: Event, field: 'vat' | 'discount'): void {
  const raw = (event.target as HTMLInputElement).value
  form.financial_summary[field] = parseCOP(raw)
  recalcAll()
}

function calcDetailSubtotal(index: number): void {
  const d = form.details[index]
  d.subtotal = (d.quantity ?? 0) * (d.unit_cost ?? 0)
  recalcFinancials()
}

function calcFixedMarkup(index: number): void {
  const d = form.details[index]
  if (!d._markupTouched) {
    d.fixed_markup = (d.unit_cost ?? 0) * ((d.profit_margin ?? 0) / 100)
  }
}

function calcSellingPrice(index: number): void {
  const d = form.details[index]
  calcFixedMarkup(index)
  const cost = d.unit_cost ?? 0
  const margin = (d.profit_margin ?? 0) / 100
  const markup = d.fixed_markup ?? 0
  d.suggested_selling_price = cost + (cost * margin) + markup
}

function recalcFinancials(): void {
  const subtotal = form.details.reduce((sum, d) => sum + d.subtotal, 0)
  form.financial_summary.purchase_subtotal = subtotal
  form.financial_summary.purchase_total = subtotal + form.financial_summary.vat - form.financial_summary.discount
}

function recalcAll(): void {
  form.financial_summary.purchase_total =
    form.financial_summary.purchase_subtotal + form.financial_summary.vat - form.financial_summary.discount
}

function generateEntryNumber(): void {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  form.entry_number = `PE-${timestamp}-${random}`
  fieldErrors.entry_number = ''
}

function validate(): boolean {
  let valid = true
  fieldErrors.entry_number = ''
  fieldErrors.registered_date = ''
  fieldErrors.movement_type = ''
  fieldErrors.responsible_party = ''
  detailsError.value = ''

  if (!form.entry_number.trim()) {
    fieldErrors.entry_number = 'El n\u00famero de entrada es obligatorio.'
    valid = false
  }
  if (!form.registered_date) {
    fieldErrors.registered_date = 'La fecha de registro es obligatoria.'
    valid = false
  }
  if (!form.movement_type) {
    fieldErrors.movement_type = 'Seleccione el tipo de movimiento.'
    valid = false
  }
  if (!form.responsible_party.trim()) {
    fieldErrors.responsible_party = 'El responsable es obligatorio.'
    valid = false
  }
  if (form.details.length === 0) {
    detailsError.value = 'Debe agregar al menos un producto.'
    valid = false
  }
  for (let i = 0; i < form.details.length; i++) {
    const d = form.details[i]
    if (!d.code.trim() || !d.product.trim() || !d.unit || !d.quantity || !d.unit_cost) {
      detailsError.value = `Complete todos los campos del producto #${i + 1}.`
      valid = false
      break
    }
  }
  return valid
}

async function handleSubmit(): Promise<void> {
  formError.value = ''
  if (!validate()) return

  saving.value = true
  try {
    const details = form.details.map((d) => ({
      code: d.code.trim(),
      product: d.product.trim(),
      unit: d.unit,
      quantity: d.quantity ?? 0,
      unit_cost: d.unit_cost ?? 0,
      subtotal: d.subtotal,
      commercial_policy: d.commercial_policy,
      profit_margin: d.profit_margin ?? 0,
      fixed_markup: d.fixed_markup ?? 0,
      suggested_selling_price: d.suggested_selling_price,
    }))

    const result = await entryStore.createEntry({
      entry_number: form.entry_number.trim(),
      registered_date: form.registered_date,
      movement_type: form.movement_type,
      warehouse: form.warehouse.trim(),
      responsible_party: form.responsible_party.trim(),
      company_id: form.company_id.trim(),
      details,
      financial_summary: {
        purchase_subtotal: form.financial_summary.purchase_subtotal,
        vat: form.financial_summary.vat,
        discount: form.financial_summary.discount,
        purchase_total: form.financial_summary.purchase_total,
      },
      observations: form.observations.trim(),
    })

    if (result) {
      form.entry_number = ''
      form.registered_date = ''
      form.movement_type = ''
      form.warehouse = ''
      form.details = []
      form.financial_summary = { purchase_subtotal: 0, vat: 0, discount: 0, purchase_total: 0 }
      form.observations = ''
      const user = authStore.session?.user
      if (user) form.responsible_party = user.id
      if (companyStore.company) form.company_id = companyStore.company.id
      emitPage('saved')
    } else {
      formError.value = entryStore.error ?? 'Error al guardar la entrada.'
    }
  } catch {
    formError.value = 'Error inesperado al guardar la entrada.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
        Registrar entrada de productos
      </h1>
      <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Complete los datos para registrar una nueva entrada al inventario.
      </p>
    </div>

    <!-- Global error -->
    <div
      v-if="formError"
      class="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400"
    >
      {{ formError }}
    </div>

    <form novalidate class="space-y-8" @submit.prevent="handleSubmit">
      <!-- Header section -->
      <div class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 class="mb-5 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Informaci&oacute;n de la entrada
        </h2>

        <div class="grid gap-5 sm:grid-cols-2">
          <!-- Entry Number -->
          <div>
            <label class="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
              N&uacute;mero de entrada <span class="text-red-500">*</span>
            </label>
            <div class="flex gap-2">
              <input
                v-model="form.entry_number"
                type="text"
                placeholder="Ej: PE-001"
                class="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-stellar-500"
                :class="{ 'border-red-400 dark:border-red-500': fieldErrors.entry_number }"
              />
              <button
                type="button"
                class="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                title="Generar automáticamente"
                @click="generateEntryNumber"
              >
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Generar
              </button>
            </div>
            <p v-if="fieldErrors.entry_number" class="mt-1 text-xs text-red-500">{{ fieldErrors.entry_number }}</p>
          </div>

          <!-- Registered Date -->
          <div>
            <label class="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
              Fecha de registro <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.registered_date"
              type="date"
              class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-stellar-500"
              :class="{ 'border-red-400 dark:border-red-500': fieldErrors.registered_date }"
            />
            <p v-if="fieldErrors.registered_date" class="mt-1 text-xs text-red-500">{{ fieldErrors.registered_date }}</p>
          </div>

          <!-- Movement Type -->
          <div>
            <label class="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
              Tipo de movimiento <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.movement_type"
              class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-stellar-500"
              :class="{ 'border-red-400 dark:border-red-500': fieldErrors.movement_type }"
            >
              <option value="" disabled>Seleccione tipo</option>
              <option v-for="mt in MOVEMENT_TYPES" :key="mt.value" :value="mt.value">{{ mt.label }}</option>
            </select>
            <p v-if="fieldErrors.movement_type" class="mt-1 text-xs text-red-500">{{ fieldErrors.movement_type }}</p>
          </div>

          <!-- Warehouse -->
          <div>
            <label class="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
              Bodega
            </label>
            <input
              v-model="form.warehouse"
              type="text"
              placeholder="Ej: Bodega principal"
              class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-stellar-500"
            />
          </div>

          <!-- Responsible Party (auto-filled) -->
          <div>
            <label class="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
              Responsable
            </label>
            <div class="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
              <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span class="truncate">{{ form.responsible_party || 'Cargando...' }}</span>
            </div>
          </div>

          <!-- Company ID (auto-filled) -->
          <div>
            <label class="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
              Compa&ntilde;&iacute;a
            </label>
            <div class="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
              <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span class="truncate">{{ companyStore.company?.business_name || companyStore.company?.id || 'Cargando...' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Product Details section -->
      <div class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div class="mb-5 flex items-center justify-between">
          <h2 class="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Detalle de productos <span class="text-red-500">*</span>
          </h2>
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-xl bg-stellar-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-stellar-400"
            @click="openProductModal"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Agregar producto
          </button>
        </div>

        <p v-if="detailsError" class="mb-4 text-xs text-red-500">{{ detailsError }}</p>

        <!-- Details table (desktop) -->
        <div v-if="form.details.length > 0" class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="border-b border-slate-200 font-semibold text-slate-500 dark:border-slate-700 dark:text-slate-400">
                <th class="px-2 py-2">#</th>
                <th class="px-2 py-2">C&oacute;digo</th>
                <th class="px-2 py-2">Producto</th>
                <th class="px-2 py-2">Unidad</th>
                <th class="px-2 py-2">Cantidad</th>
                <th class="px-2 py-2">Costo unit.</th>
                <th class="px-2 py-2">Subtotal</th>
                <th class="px-2 py-2">Pol&iacute;tica comercial</th>
                <th class="px-2 py-2">Margen (%)</th>
                <th class="px-2 py-2">Incr. fijo</th>
                <th class="px-2 py-2">Precio venta</th>
                <th class="px-2 py-2"></th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(detail, index) in form.details"
                :key="index"
                class="border-b border-slate-100 transition hover:bg-slate-50/50 dark:border-slate-800 dark:hover:bg-slate-800/30"
              >
                <td class="px-2 py-2 text-slate-400">{{ index + 1 }}</td>
                <td class="px-2 py-2">
                  <input
                    v-model="detail.code"
                    type="text"
                    placeholder="PROD-001"
                    class="w-20 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </td>
                <td class="px-2 py-2">
                  <input
                    v-model="detail.product"
                    type="text"
                    placeholder="Nombre del producto"
                    class="w-32 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </td>
                <td class="px-2 py-2">
                  <select
                    v-model="detail.unit"
                    class="w-20 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <option value="" disabled>Ud</option>
                    <option v-for="u in UNITS" :key="u" :value="u">{{ u }}</option>
                  </select>
                </td>
                <td class="px-2 py-2">
                  <input
                    v-model.number="detail.quantity"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    class="w-20 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    @input="calcDetailSubtotal(index)"
                  />
                </td>
                <td class="px-2 py-2">
                  <input
                    :value="detail.unit_cost !== null ? formatCOP(detail.unit_cost) : ''"
                    type="text"
                    inputmode="decimal"
                    placeholder="0,00"
                    class="w-24 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-right outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    @input="onUnitCostInput($event, index)"
                  />
                </td>
                <td class="px-2 py-2 font-medium text-slate-700 dark:text-slate-200">
                  {{ formatCOP(detail.subtotal) }}
                </td>
                <td class="px-2 py-2">
                  <input
                    v-model="detail.commercial_policy"
                    type="text"
                    placeholder="Estándar"
                    class="w-24 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </td>
                <td class="px-2 py-2">
                  <input
                    v-model.number="detail.profit_margin"
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="30"
                    class="w-16 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    @input="form.details[index]._markupTouched = false; calcSellingPrice(index)"
                  />
                </td>
                <td class="px-2 py-2">
                  <input
                    :value="detail.fixed_markup !== null ? formatCOP(detail.fixed_markup) : ''"
                    type="text"
                    inputmode="decimal"
                    placeholder="0,00"
                    class="w-24 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-right outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    @input="onFixedMarkupInput($event, index)"
                  />
                </td>
                <td class="px-2 py-2 font-medium text-emerald-600 dark:text-emerald-400">
                  {{ formatCOP(detail.suggested_selling_price) }}
                </td>
                <td class="px-2 py-2">
                  <button
                    type="button"
                    class="rounded-lg p-1 text-red-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                    @click="removeDetail(index)"
                  >
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="flex flex-col items-center gap-3 py-8 text-slate-400">
          <svg class="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p class="text-sm">No hay productos agregados. Haga clic en "Agregar producto".</p>
        </div>
      </div>

      <!-- Financial Summary section -->
      <div class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 class="mb-5 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Resumen financiero
        </h2>

        <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label class="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">Subtotal compra</label>
            <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
              {{ formatCOP(form.financial_summary.purchase_subtotal) }}
            </div>
          </div>
          <div>
            <label class="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">IVA</label>
            <input
              :value="formatCOP(form.financial_summary.vat)"
              type="text"
              inputmode="decimal"
              placeholder="0,00"
              class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-stellar-500"
              @input="onFinancialInput($event, 'vat')"
            />
          </div>
          <div>
            <label class="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">Descuento</label>
            <input
              :value="formatCOP(form.financial_summary.discount)"
              type="text"
              inputmode="decimal"
              placeholder="0,00"
              class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-stellar-500"
              @input="onFinancialInput($event, 'discount')"
            />
          </div>
          <div>
            <label class="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">Total compra</label>
            <div class="rounded-xl border border-stellar-200 bg-stellar-50 px-3 py-2.5 text-sm font-bold text-stellar-700 dark:border-stellar-800 dark:bg-stellar-500/10 dark:text-stellar-300">
              {{ formatCOP(form.financial_summary.purchase_total) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Observations -->
      <div class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 class="mb-5 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          Observaciones
        </h2>
        <textarea
          v-model="form.observations"
          rows="3"
          placeholder="Notas adicionales sobre la entrada..."
          class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-stellar-500"
        />
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
          {{ saving ? 'Guardando...' : 'Registrar entrada' }}
        </button>
      </div>
    </form>

    <CompanyRequiredModal
      v-if="showCompanyModal"
      @register="goToCompanyRegistration"
      @dismiss="showCompanyModal = false"
    />
    <ProductSelectionModal
      v-if="showProductModal"
      :company-id="form.company_id"
      @confirm="handleProductSelection"
      @close="showProductModal = false"
      @go-to-product-registration="goToProductRegistration"
    />
  </div>
</template>
