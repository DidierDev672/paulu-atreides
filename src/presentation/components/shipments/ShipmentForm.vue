<script setup lang="ts">
import type { ProviderResponse } from '@/application/services/providerService'
import CompanyRequiredModal from '@/presentation/components/company/CompanyRequiredModal.vue'
import { useAuthStore } from '@/presentation/stores/authStore'
import { useCompanyStore } from '@/presentation/stores/companyStore'
import { useShipmentStore } from '@/presentation/stores/shipmentStore'
import { useProductEntryStore } from '@/presentation/stores/productEntryStore'
import { useQuantityValidation } from '@/presentation/composables/useQuantityValidation'
import { useHistoryLogger } from '@/presentation/composables/useHistoryLogger'
import { computed, onMounted, reactive, ref } from 'vue'
import EntrySelectionModal from '@/presentation/components/shipments/EntrySelectionModal.vue'
import ProviderSelectionModal from '@/presentation/components/providers/ProviderSelectionModal.vue'
import WinerySelectionModal from '@/presentation/components/products/WinerySelectionModal.vue'
import type { ShipmentDetail } from '@/application/services/shipmentService'
import type { ProductEntryResponse } from '@/application/services/productEntryService'

function formatCOP(value: number): string {
  return value.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function parseCOP(raw: string): number {
  const cleaned = raw.replace(/\./g, '').replace(/,/g, '.')
  const n = parseFloat(cleaned)
  return isNaN(n) ? 0 : n
}

const emit = defineEmits<{
  saved: []
  goToProviderRegistration: []
}>()

const shipmentStore = useShipmentStore()
const authStore = useAuthStore()
const companyStore = useCompanyStore()
const productEntryStore = useProductEntryStore()
const { logCreate, logDeduct } = useHistoryLogger()

let codeCounter = 0

function generateShipmentNumber(): string {
  codeCounter++
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const seq = String(codeCounter).padStart(4, '0')
  return `SAL-${y}${m}${d}-${seq}`
}

const form = reactive({
  shipment_number: '',
  record_date: '',
  movement_type: 'SALE',
  status: 'DRAFT',
  company_id: '',
  warehouse_id: '',
  responsible_id: '',
  source_document: { entry_ids: [] },
  recipient: { recipient_type: 'CUSTOMER', recipient_id: '' },
  details: [] as ShipmentDetail[],
  financial_summary: { subtotal: 0, vat: 0, discount: 0, total: 0 },
  remarks: '',
})

const fieldErrors = reactive<Record<string, string>>({})
const showCompanyModal = ref(false)
const showEntryModal = ref(false)
const showProviderModal = ref(false)
const showWineryModal = ref(false)
const selectedEntries = ref<ProductEntryResponse[]>([])
const { quantityErrors, validateQuantity, clearQuantityErrors } = useQuantityValidation(selectedEntries)
const isSubmitting = ref(false)

const movementTypes: { value: string; label: string }[] = [
  { value: 'SALE', label: 'Venta' },
  { value: 'SUPPLIER_RETURN', label: 'Devolución a proveedor' },
  { value: 'DONATION', label: 'Donación' },
  { value: 'SHRINKAGE', label: 'Merma' },
  { value: 'ADJUSTMENT', label: 'Ajuste' },
  { value: 'TRANSFER', label: 'Transferencia' },
]
const recipientTypes: { value: string; label: string }[] = [
  { value: 'CUSTOMER', label: 'Cliente' },
  { value: 'SUPPLIER', label: 'Proveedor' },
  { value: 'WAREHOUSE', label: 'Bodega' },
  { value: 'INTERNAL', label: 'Interno' },
]

onMounted(async () => {
  const user = authStore.session?.user
  if (user) {
    form.responsible_id = user.id
  }
  if (companyStore.company) {
    form.company_id = companyStore.company.id
  } else {
    await companyStore.fetchCompany()
    if (companyStore.company) {
      form.company_id = companyStore.company.id
    }
  }

  if (!form.shipment_number) {
    form.shipment_number = generateShipmentNumber()
  }
})

const detailsSubtotal = computed(() =>
  form.details.reduce((sum, d) => sum + d.subtotal, 0),
)

const vatAmount = computed(() => detailsSubtotal.value * 0.19)
const discountAmount = computed(() => form.financial_summary.discount)
const totalAmount = computed(() => detailsSubtotal.value + vatAmount.value - discountAmount.value)

function updateFinancialSummary(): void {
  form.financial_summary.subtotal = detailsSubtotal.value
  form.financial_summary.vat = vatAmount.value
  form.financial_summary.total = totalAmount.value
}

function handleDiscountInput(raw: string): void {
  form.financial_summary.discount = parseCOP(raw)
  updateFinancialSummary()
}

function handleEntriesSelected(entries: ProductEntryResponse[]): void {
  selectedEntries.value = entries
  form.source_document.entry_ids = entries.map((e) => e.id)
  showEntryModal.value = false
  clearQuantityErrors()

  const existingCodes = new Set(form.details.map((d) => d.code))
  for (const entry of entries) {
    for (const detail of entry.details) {
      if (!existingCodes.has(detail.code)) {
        form.details.push({
          code: detail.code,
          product: detail.product,
          unit: detail.unit,
          quantity: detail.quantity,
unit_cost: detail.unit_cost,
subtotal: detail.quantity * detail.unit_cost,
        })
        existingCodes.add(detail.code)
      }
    }
  }
  updateFinancialSummary()
}

function updateDetailSubtotal(index: number): void {
  const d = form.details[index]
  d.subtotal = d.quantity * d.unit_cost
  updateFinancialSummary()
}

function removeDetail(index: number): void {
  form.details.splice(index, 1)
  updateFinancialSummary()
}

function validate(): boolean {
  Object.keys(fieldErrors).forEach((k) => delete fieldErrors[k])
  clearQuantityErrors()

  if (!form.shipment_number.trim()) fieldErrors.shipment_number = 'El n\u00famero de despacho es obligatorio.'
  if (!form.record_date) fieldErrors.record_date = 'La fecha es obligatoria.'
  if (!form.warehouse_id.trim()) fieldErrors.warehouse_id = 'El ID de bodega es obligatorio.'
  if (!form.recipient.recipient_id.trim()) fieldErrors.recipient_id = 'El ID del destinatario es obligatorio.'
  if (form.details.length === 0) fieldErrors.details = 'Debe agregar al menos un producto.'

  for (let i = 0; i < form.details.length; i++) {
    const d = form.details[i]
    if (d.quantity <= 0) fieldErrors[`qty_${i}`] = 'Cantidad debe ser mayor a 0.'
    if (d.unit_cost < 0) fieldErrors[`cost_${i}`] = 'Costo unitario no puede ser negativo.'
    if (d.quantity > 0 && !validateQuantity(d.code, d.quantity)) {
      fieldErrors[`qty_${i}`] = quantityErrors[d.code]
    }
  }

  return Object.keys(fieldErrors).length === 0
}

async function handleSubmit(): Promise<void> {
  if (!validate()) return

  if (!companyStore.company) {
    showCompanyModal.value = true
    return
  }

  isSubmitting.value = true
  try {
    const result = await shipmentStore.createShipment({
      shipment_number: form.shipment_number,
      record_date: form.record_date,
      movement_type: form.movement_type,
      status: form.status,
      company_id: form.company_id,
      warehouse_id: form.warehouse_id,
      responsible_id: form.responsible_id,
      source_document: form.source_document,
      recipient: form.recipient,
      details: form.details,
      financial_summary: form.financial_summary,
      remarks: form.remarks,
    })
    if (result) {
      const deducted = await deductEntryQuantities()
      if (!deducted) {
        resultMessage.value = 'Despacho creado, pero ocurri\u00f3 un error al descontar el inventario de las entradas.'
      } else {
        resultMessage.value = resultMessageSuccess()
      }
      showResult.value = true
      logCreate({
        entityType: 'SHIPMENT',
        entityId: result.id,
        details: `Despacho ${result.shipment_number} creado con ${form.details.length} producto(s).`,
      })
      resultSuccess.value = true
      emit('saved')
    } else {
      showResult.value = true
      resultSuccess.value = false
      resultMessage.value = shipmentStore.error || 'Error al crear el despacho.'
    }
  } finally {
    isSubmitting.value = false
  }
}

const showResult = ref(false)
const resultSuccess = ref(false)
const resultMessage = ref('')

function resultMessageSuccess(): string {
  const messages = [
    'Despacho registrado con \u00e9xito.',
    'Todo en orden. El despacho ha quedado registrado en el sistema.',
    'Movimiento de salida registrado correctamente. El inventario ha sido actualizado.',
    'Despacho creado. Los productos han sido asignados a su destino.',
  ]
  return messages[Math.floor(Math.random() * messages.length)]
}

function handleProviderSelected(provider: ProviderResponse): void {
  form.recipient.recipient_id = provider.id
  form.recipient.recipient_type = 'SUPPLIER'
  showProviderModal.value = false
}

function handleWinerySelected(winery: { id: string }): void {
  form.warehouse_id = winery.id
  showWineryModal.value = false
}

async function deductEntryQuantities(): Promise<boolean> {
  const codeToEntryMap: Record<string, string> = {}
  for (const entry of selectedEntries.value) {
    for (const detail of entry.details) {
      if (!(detail.code in codeToEntryMap)) {
        codeToEntryMap[detail.code] = entry.id
      }
    }
  }
  const deductionsByEntry: Record<string, { code: string; quantity: number }[]> = {}
  for (const detail of form.details) {
    const entryId = codeToEntryMap[detail.code]
    if (!entryId) continue
    if (!deductionsByEntry[entryId]) deductionsByEntry[entryId] = []
    deductionsByEntry[entryId].push({ code: detail.code, quantity: detail.quantity })
  }
  for (const [entryId, deductions] of Object.entries(deductionsByEntry)) {
    const result = await productEntryStore.deductEntryQuantity(entryId, deductions)
    if (!result) return false
    logDeduct({
      entityType: 'PRODUCT_ENTRY',
      entityId: entryId,
      details: `Se dedujeron ${deductions.reduce((sum, d) => sum + d.quantity, 0)} unidades del despacho ${form.shipment_number}.`,
      changes: { quantity: { old: null, new: deductions } },
    })
  }
  return true
}

function handleCreateAnother(): void {
  form.shipment_number = ''
  form.record_date = ''
  form.movement_type = 'SALE'
  form.status = 'DRAFT'
  form.warehouse_id = ''
  form.recipient = { recipient_type: 'CUSTOMER', recipient_id: '' }
  form.source_document = { entry_ids: [] }
  selectedEntries.value = []
  form.details = []
  form.financial_summary = { subtotal: 0, vat: 0, discount: 0, total: 0 }
  form.remarks = ''
  showResult.value = false
}

function handleGoToList(): void {
  emit('saved')
}
</script>

<template>
  <div class="relative mx-auto max-w-5xl">
    <CompanyRequiredModal v-if="showCompanyModal" @close="showCompanyModal = false" />

    <EntrySelectionModal
      v-if="showEntryModal"
      :company-id="form.company_id"
      @close="showEntryModal = false"
      @confirm="handleEntriesSelected"
    />

    <ProviderSelectionModal
      v-if="showProviderModal"
      @close="showProviderModal = false"
      @confirm="handleProviderSelected"
      @go-to-provider-registration="emit('goToProviderRegistration')"
    />

    <WinerySelectionModal
      v-if="showWineryModal"
      :company-id="form.company_id"
      @close="showWineryModal = false"
      @confirm="handleWinerySelected"
    />

    <form @submit.prevent="handleSubmit" class="space-y-8">
      <!-- Header -->
      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 class="text-xl font-bold text-slate-900 dark:text-white">Registrar salidad</h2>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Complete los datos del movimiento de salida</p>
      </div>

      <!-- Informaci\u00f3n general -->
      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h3 class="mb-4 text-base font-semibold text-slate-800 dark:text-slate-100">Información general</h3>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label class="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">N\u00famero de salida</label>
            <div class="flex gap-2">
              <input v-model="form.shipment_number" type="text" readonly
                class="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm text-slate-600 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                :class="{ 'border-red-400 dark:border-red-500': fieldErrors.shipment_number }" />
              <button type="button" title="Generar c\u00f3digo autom\u00e1tico"
                class="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-stellar-200 bg-stellar-50 px-3 py-2.5 text-sm font-medium text-stellar-600 transition hover:bg-stellar-100 dark:border-stellar-800 dark:bg-stellar-500/10 dark:text-stellar-300 dark:hover:bg-stellar-500/20"
                @click="form.shipment_number = generateShipmentNumber()">
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Generar
              </button>
            </div>
            <p v-if="fieldErrors.shipment_number" class="mt-1 text-xs text-red-500">{{ fieldErrors.shipment_number }}</p>
          </div>
          <div>
            <label class="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Fecha</label>
            <input v-model="form.record_date" type="date"
              class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              :class="{ 'border-red-400 dark:border-red-500': fieldErrors.record_date }" />
            <p v-if="fieldErrors.record_date" class="mt-1 text-xs text-red-500">{{ fieldErrors.record_date }}</p>
          </div>
          <div>
            <label class="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Tipo de movimiento</label>
            <select v-model="form.movement_type"
              class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
              <option v-for="mt in movementTypes" :key="mt.value" :value="mt.value">{{ mt.label }}</option>
            </select>
          </div>
        </div>
        <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">ID de bodega</label>
            <div class="flex gap-2">
              <input v-model="form.warehouse_id" type="text" readonly
                class="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm text-slate-600 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                :class="{ 'border-red-400 dark:border-red-500': fieldErrors.warehouse_id }" />
              <button type="button" title="Seleccionar bodega"
                class="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-stellar-200 bg-stellar-50 px-3 py-2.5 text-sm font-medium text-stellar-600 transition hover:bg-stellar-100 dark:border-stellar-800 dark:bg-stellar-500/10 dark:text-stellar-300 dark:hover:bg-stellar-500/20"
                @click="showWineryModal = true">
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                Seleccionar
              </button>
            </div>
            <p v-if="fieldErrors.warehouse_id" class="mt-1 text-xs text-red-500">{{ fieldErrors.warehouse_id }}</p>
          </div>
          <div>
            <label class="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Estado</label>
            <select v-model="form.status"
              class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
              <option value="DRAFT">Borrador</option>
              <option value="CONFIRMED">Confirmado</option>
              <option value="CANCELED">Cancelado</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Documento de origen -->
      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-base font-semibold text-slate-800 dark:text-slate-100">Documento de origen</h3>
          <button type="button"
            class="inline-flex items-center gap-1.5 rounded-xl border border-stellar-200 bg-stellar-50 px-4 py-2 text-sm font-medium text-stellar-600 transition hover:bg-stellar-100 dark:border-stellar-800 dark:bg-stellar-500/10 dark:text-stellar-300 dark:hover:bg-stellar-500/20"
            @click="showEntryModal = true">
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Seleccionar entrada(s)
          </button>
        </div>
        <div v-if="selectedEntries.length === 0" class="rounded-xl border-2 border-dashed border-slate-200 px-4 py-6 text-center dark:border-slate-700">
          <svg class="mx-auto mb-2 h-6 w-6 text-slate-300 dark:text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p class="text-sm text-slate-400 dark:text-slate-500">
            Seleccione una o varias entradas para cargar autom\u00e1ticamente sus productos.
          </p>
        </div>
        <div v-else class="space-y-3">
          <p class="text-xs text-slate-500 dark:text-slate-400">
            {{ selectedEntries.length }} entrada{{ selectedEntries.length !== 1 ? 's' : '' }} seleccionada{{ selectedEntries.length !== 1 ? 's' : '' }}:
          </p>
          <div v-for="entry in selectedEntries" :key="entry.id"
            class="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50">
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{{ entry.entry_number }}</p>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                {{ entry.registered_date }} &middot; {{ entry.movement_type }}
              </p>
            </div>
            <span class="ml-3 shrink-0 rounded-full bg-stellar-100 px-2.5 py-0.5 text-xs font-medium text-stellar-700 dark:bg-stellar-500/10 dark:text-stellar-300">
              {{ entry.details.length }} producto{{ entry.details.length !== 1 ? 's' : '' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Destinatario -->
      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h3 class="mb-4 text-base font-semibold text-slate-800 dark:text-slate-100">Destinatario</h3>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Tipo</label>
            <select v-model="form.recipient.recipient_type"
              class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
              <option v-for="rt in recipientTypes" :key="rt.value" :value="rt.value">{{ rt.label }}</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">ID del destinatario</label>
            <div class="flex gap-2">
              <input v-model="form.recipient.recipient_id" type="text" readonly
                class="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm text-slate-600 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                :class="{ 'border-red-400 dark:border-red-500': fieldErrors.recipient_id }" />
              <button type="button" title="Seleccionar proveedor"
                class="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-stellar-200 bg-stellar-50 px-3 py-2.5 text-sm font-medium text-stellar-600 transition hover:bg-stellar-100 dark:border-stellar-800 dark:bg-stellar-500/10 dark:text-stellar-300 dark:hover:bg-stellar-500/20"
                @click="showProviderModal = true">
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Seleccionar
              </button>
            </div>
            <p v-if="fieldErrors.recipient_id" class="mt-1 text-xs text-red-500">{{ fieldErrors.recipient_id }}</p>
          </div>
        </div>
      </div>

      <!-- Detalles -->
      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-base font-semibold text-slate-800 dark:text-slate-100">Productos a despachar</h3>
          <p class="text-xs text-slate-400 dark:text-slate-500">
            {{ form.details.length }} producto{{ form.details.length !== 1 ? 's' : '' }}
          </p>
        </div>

        <p v-if="fieldErrors.details" class="mb-3 text-xs text-red-500">{{ fieldErrors.details }}</p>

        <div v-if="form.details.length === 0"
          class="flex flex-col items-center rounded-xl border-2 border-dashed border-slate-200 py-10 dark:border-slate-700">
          <svg class="mb-3 h-8 w-8 text-slate-300 dark:text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p class="text-sm text-slate-400 dark:text-slate-500">No hay productos. Seleccione una entrada de origen para cargar sus productos.</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead>
              <tr class="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:border-slate-700">
                <th class="px-3 py-3">C&oacute;digo</th>
                <th class="px-3 py-3">Producto</th>
                <th class="px-3 py-3">Unidad</th>
                <th class="px-3 py-3">Cantidad</th>
                <th class="px-3 py-3">Costo unit.</th>
                <th class="px-3 py-3">Subtotal</th>
                <th class="px-3 py-3"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(detail, index) in form.details" :key="index"
                class="border-b border-slate-100 dark:border-slate-800">
                <td class="px-3 py-3 font-mono text-xs text-slate-500">{{ detail.code }}</td>
                <td class="px-3 py-3 font-medium text-slate-800 dark:text-slate-100">{{ detail.product }}</td>
                <td class="px-3 py-3 text-slate-600 dark:text-slate-300">{{ detail.unit }}</td>
                <td class="px-3 py-3">
                  <input type="number" step="any" min="0" :value="detail.quantity"
                    class="w-24 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    :class="{ 'border-red-400': fieldErrors['qty_' + index] || quantityErrors[detail.code] }"
                    @input="detail.quantity = parseFloat(($event.target as HTMLInputElement).value) || 0; updateDetailSubtotal(index)" />
                  <p v-if="quantityErrors[detail.code]" class="mt-1 max-w-64 text-xs text-amber-600">{{ quantityErrors[detail.code] }}</p>
                </td>
                <td class="px-3 py-3">
                  <input type="number" step="any" min="0" :value="detail.unit_cost"
                    class="w-28 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    :class="{ 'border-red-400': fieldErrors['cost_' + index] }"
                    @input="detail.unit_cost = parseFloat(($event.target as HTMLInputElement).value) || 0; updateDetailSubtotal(index)" />
                </td>
                <td class="px-3 py-3 font-medium text-slate-700 dark:text-slate-200">${{ formatCOP(detail.subtotal) }}</td>
                <td class="px-3 py-3">
                  <button type="button"
                    class="rounded-lg p-1 text-slate-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                    @click="removeDetail(index)">
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Resumen financiero -->
      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h3 class="mb-4 text-base font-semibold text-slate-800 dark:text-slate-100">Resumen financiero</h3>
        <div class="space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-slate-500 dark:text-slate-400">Subtotal</span>
            <span class="font-medium text-slate-800 dark:text-slate-100">${{ formatCOP(detailsSubtotal) }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-slate-500 dark:text-slate-400">IVA (19%)</span>
            <span class="font-medium text-slate-800 dark:text-slate-100">${{ formatCOP(vatAmount) }}</span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-slate-500 dark:text-slate-400">Descuento</span>
            <div class="relative w-40">
              <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
              <input type="text" :value="formatCOP(form.financial_summary.discount)"
                class="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-7 pr-3 text-right text-sm outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                @input="handleDiscountInput(($event.target as HTMLInputElement).value)" />
            </div>
          </div>
          <div class="flex justify-between border-t border-slate-200 pt-2 text-sm font-semibold dark:border-slate-700">
            <span class="text-slate-800 dark:text-slate-100">Total</span>
            <span class="text-stellar-600 dark:text-stellar-400">${{ formatCOP(totalAmount) }}</span>
          </div>
        </div>
      </div>

      <!-- Observaciones -->
      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h3 class="mb-4 text-base font-semibold text-slate-800 dark:text-slate-100">Observaciones</h3>
        <textarea v-model="form.remarks" rows="3" placeholder="Notas u observaciones adicionales..."
          class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"></textarea>
      </div>

      <!-- Submit -->
      <div class="flex justify-end gap-3">
        <button type="submit" :disabled="isSubmitting"
          class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-stellar-500 to-cosmic-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-stellar-400 hover:to-cosmic-400 disabled:cursor-not-allowed disabled:opacity-50">
          <svg v-if="isSubmitting" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {{ isSubmitting ? 'Guardando...' : 'Registrar despacho' }}
        </button>
      </div>
    </form>

    <!-- Result Dialog -->
    <Teleport to="body">
      <div v-if="showResult"
        class="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
        @click.self="showResult = false">
        <div class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-2xl dark:border-slate-700 dark:bg-slate-900">
          <div v-if="resultSuccess"
            class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-500 shadow-[0_8px_24px_rgba(16,185,129,0.3)]">
            <svg class="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div v-else
            class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 shadow-[0_8px_24px_rgba(251,191,36,0.3)]">
            <svg class="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h3 class="mb-2 text-lg font-bold text-slate-900 dark:text-white">
            {{ resultSuccess ? '\u00a1Despacho registrado!' : 'Error al registrar' }}
          </h3>
          <p class="mb-6 text-sm text-slate-500 dark:text-slate-400">{{ resultMessage }}</p>

          <div v-if="resultSuccess" class="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              class="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              @click="handleCreateAnother">
              Crear otro despacho
            </button>
            <button
              class="rounded-xl bg-gradient-to-r from-stellar-500 to-cosmic-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-stellar-400 hover:to-cosmic-400"
              @click="handleGoToList">
              Ir a la lista de despachos
            </button>
          </div>
          <button v-else
            class="rounded-xl bg-gradient-to-r from-stellar-500 to-cosmic-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-stellar-400 hover:to-cosmic-400"
            @click="showResult = false">
            Cerrar
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>
