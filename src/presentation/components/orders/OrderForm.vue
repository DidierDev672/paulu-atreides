<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useOrderStore } from '@/presentation/stores/orderStore'
import { useAuthStore } from '@/presentation/stores/authStore'
import { useCompanyStore } from '@/presentation/stores/companyStore'
import { useShipmentStore } from '@/presentation/stores/shipmentStore'
import EntrySelectionModal from '@/presentation/components/shipments/EntrySelectionModal.vue'
import ProviderSelectionModal from '@/presentation/components/providers/ProviderSelectionModal.vue'
import WinerySelectionModal from '@/presentation/components/products/WinerySelectionModal.vue'
import AutomationConfirmModal from '@/presentation/components/orders/AutomationConfirmModal.vue'
import DispatchSummaryModal from '@/presentation/components/orders/DispatchSummaryModal.vue'
import type { CreateOrderRequest, OrderDetail, OrderResponse } from '@/application/services/orderService'
import type { ProductEntryResponse } from '@/application/services/productEntryService'
import type { ProviderResponse } from '@/application/services/providerService'
import type { WineryResponse } from '@/application/services/wineryService'

const emit = defineEmits<{ saved: []; goToProviderRegistration: [] }>()

const orderStore = useOrderStore()
const authStore = useAuthStore()
const companyStore = useCompanyStore()
const shipmentStore = useShipmentStore()

const VAT_RATE = 0.19

const showEntryModal = ref(false)
const showProviderModal = ref(false)
const selectedProviderName = ref('')
const showDialog = ref(false)
const dialogResult = ref<{ success: true; order: any; shipment?: any } | { success: false; error: string } | null>(null)

const selectedEntryIds = ref<string[]>([])
const showAutomationConfirm = ref(false)
const showWineryModal = ref(false)
const showDispatchSummary = ref(false)
const createdOrder = ref<OrderResponse | null>(null)
const selectedWarehouseId = ref('')

const form = ref<CreateOrderRequest>({
  order_numeric: '',
  order_type: 'PURCHASE',
  date: new Date().toISOString().slice(0, 10),
  company_id: '',
  user_id: '',
  requested_by: '',
  details: [],
  financial_summary: { purchase_subtotal: 0, vat: 0, discount: 0, purchase_total: 0 },
  status: 'DRAFT',
  reason_for_order: '',
})

onMounted(() => {
  const user = authStore.session?.user
  if (user?.id) {
    form.value.user_id = user.id
  }
  const company = companyStore.selectedCompany
  if (company?.id) {
    form.value.company_id = company.id
  }
})

const orderTypes = [
  { value: 'PURCHASE', label: 'Compra' },
  { value: 'REPLENISHMENT', label: 'Reabastecimiento' },
  { value: 'PRODUCTION', label: 'Producción' },
  { value: 'TRANSFER', label: 'Transferencia' },
] as const
const statuses = [
  { value: 'DRAFT', label: 'Borrador' },
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'APPROVED', label: 'Aprobado' },
  { value: 'REJECTED', label: 'Rechazado' },
  { value: 'COMPLETED', label: 'Completado' },
] as const

function openEntryModal(): void {
  showEntryModal.value = true
}

function openProviderModal(): void {
  showProviderModal.value = true
}

function onProviderSelected(provider: ProviderResponse): void {
  showProviderModal.value = false
  selectedProviderName.value = provider.business_name
  form.value.requested_by = provider.business_name
}

function onEntriesSelected(entries: ProductEntryResponse[]): void {
  showEntryModal.value = false
  selectedEntryIds.value = entries.map((e) => e.id)
  for (const entry of entries) {
    for (const detail of entry.details) {
      const exists = form.value.details.some((d) => d.code === detail.code)
      if (!exists) {
        form.value.details.push({
          code: detail.code,
          product: detail.product,
          unit: detail.unit,
          quantity_requested: detail.quantity,
          estimated_cost: detail.unitCost,
          subtotal: detail.quantity * detail.unitCost,
        })
      }
    }
  }
  recalcSummary()
}

function removeDetail(index: number): void {
  form.value.details.splice(index, 1)
  recalcSummary()
}

function recalcRow(index: number): void {
  const d = form.value.details[index]
  d.subtotal = d.quantity_requested * d.estimated_cost
  recalcSummary()
}

function recalcSummary(): void {
  const subtotal = form.value.details.reduce((s, d) => s + d.subtotal, 0)
  const vat = subtotal * VAT_RATE
  const discount = form.value.financial_summary.discount
  const total = subtotal + vat - discount
  form.value.financial_summary = {
    purchase_subtotal: subtotal,
    vat,
    discount,
    purchase_total: total,
  }
}

async function handleSubmit(): Promise<void> {
  const result = await orderStore.createOrder(form.value)
  if (result) {
    createdOrder.value = result
    showAutomationConfirm.value = true
  } else {
    dialogResult.value = { success: false, error: orderStore.error || 'Error desconocido al registrar la orden.' }
    showDialog.value = true
  }
}

function onAutomationConfirm(automate: boolean): void {
  showAutomationConfirm.value = false
  if (automate) {
    showWineryModal.value = true
  } else {
    dialogResult.value = { success: true, order: createdOrder.value! }
    showDialog.value = true
  }
}

function onWinerySelected(winery: WineryResponse): void {
  showWineryModal.value = false
  selectedWarehouseId.value = winery.id
  showDispatchSummary.value = true
}

async function onDispatchConfirm(payload: { discount: number; remarks: string; recipient_type: string; recipient_id: string }): Promise<void> {
  showDispatchSummary.value = false
  const order = createdOrder.value!
  const shipmentData = {
    shipment_number: `DES-${order.order_numeric}`,
    record_date: new Date().toISOString().slice(0, 10),
    movement_type: 'SALE',
    status: 'DRAFT',
    company_id: order.company_id,
    warehouse_id: selectedWarehouseId.value,
    responsible_id: order.user_id,
    source_document: { entry_ids: selectedEntryIds.value },
    recipient: { recipient_type: payload.recipient_type, recipient_id: payload.recipient_id },
    details: order.details.map((d) => ({
      code: d.code,
      product: d.product,
      unit: d.unit,
      quantity: d.quantity_requested,
      unit_cost: d.estimated_cost,
      subtotal: d.subtotal,
    })),
    financial_summary: {
      subtotal: order.financial_summary.purchase_subtotal,
      vat: order.financial_summary.vat,
      discount: payload.discount,
      total: order.financial_summary.purchase_subtotal + order.financial_summary.vat - payload.discount,
    },
    remarks: payload.remarks,
  }
  const shipment = await shipmentStore.createShipment(shipmentData)
  if (shipment) {
    dialogResult.value = { success: true, order, shipment }
  } else {
    dialogResult.value = { success: false, error: shipmentStore.error || 'La orden se creó pero no se pudo generar el despacho automático.' }
  }
  showDialog.value = true
}

function resetForm(): void {
  dialogResult.value = null
  showDialog.value = false
  selectedProviderName.value = ''
  selectedEntryIds.value = []
  selectedWarehouseId.value = ''
  createdOrder.value = null
  orderStore.clearError()
  shipmentStore.clearError()
  form.value = {
    order_numeric: '',
    order_type: 'PURCHASE',
    date: new Date().toISOString().slice(0, 10),
    company_id: form.value.company_id,
    user_id: form.value.user_id,
    requested_by: '',
    details: [],
    financial_summary: { purchase_subtotal: 0, vat: 0, discount: 0, purchase_total: 0 },
    status: 'DRAFT',
    reason_for_order: '',
  }
}

function goToList(): void {
  showDialog.value = false
  dialogResult.value = null
  emit('saved')
}

function generateCode(): void {
  const now = new Date()
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '')
  const timePart = now.toTimeString().slice(0, 2) + now.toTimeString().slice(3, 5)
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
  form.value.order_numeric = `ORD-${datePart}-${timePart}-${rand}`
}

function formatCOP(value: number): string {
  return value.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
</script>

<template>
  <div v-motion :initial="{ opacity: 0, y: 8 }" :enter="{ opacity: 1, y: 0, transition: { duration: 350 } }">
    <div class="mb-6">
      <h1 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">Registrar orden</h1>
      <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Complete los campos para registrar una nueva orden</p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Order info -->
      <div class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 class="mb-4 text-lg font-semibold">Información de la orden</h2>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Código de orden</label>
            <div class="flex gap-2">
              <input v-model="form.order_numeric" required class="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800" />
              <button type="button" class="rounded-xl bg-stellar-500/10 px-3 py-2 text-sm font-medium text-stellar-600 transition hover:bg-stellar-500/20 dark:text-stellar-300" @click="generateCode">Generar</button>
            </div>
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Fecha de solicitud</label>
            <input v-model="form.date" type="date" required class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Estado</label>
            <select v-model="form.status" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800">
              <option v-for="s in statuses" :key="s.value" :value="s.value">{{ s.label }}</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Tipo de orden</label>
            <select v-model="form.order_type" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800">
              <option v-for="t in orderTypes" :key="t.value" :value="t.value">{{ t.label }}</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Compañía ID</label>
            <input v-model="form.company_id" readonly required class="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Usuario ID</label>
            <input v-model="form.user_id" readonly required class="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Solicitado por</label>
            <div class="flex gap-2">
              <input :value="selectedProviderName || form.requested_by" readonly class="flex-1 cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400" />
              <button type="button" class="rounded-xl bg-stellar-500/10 px-3 py-2 text-sm font-medium text-stellar-600 transition hover:bg-stellar-500/20 dark:text-stellar-300" @click="openProviderModal">Agregar</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Product details -->
      <div class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-lg font-semibold">Detalles del producto</h2>
          <button type="button" class="rounded-xl bg-stellar-500/10 px-4 py-2 text-sm font-medium text-stellar-600 transition hover:bg-stellar-500/20 dark:text-stellar-300" @click="openEntryModal">+ Agregar producto</button>
        </div>

        <div v-if="form.details.length === 0" class="py-8 text-center text-sm text-slate-400">
          No hay productos agregados. Presione "Agregar producto" para seleccionar una entrada y cargar sus productos.
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead>
              <tr class="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:border-slate-700">
                <th class="px-3 py-2">Código</th>
                <th class="px-3 py-2">Producto</th>
                <th class="px-3 py-2">Unidad</th>
                <th class="px-3 py-2">Cant. solicitada</th>
                <th class="px-3 py-2">Costo estimado</th>
                <th class="px-3 py-2">Subtotal</th>
                <th class="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(detail, index) in form.details" :key="index" class="border-b border-slate-100 dark:border-slate-800">
                <td class="px-3 py-2 text-xs font-mono text-slate-500">{{ detail.code }}</td>
                <td class="px-3 py-2 text-sm font-medium">{{ detail.product }}</td>
                <td class="px-3 py-2 text-xs">{{ detail.unit }}</td>
                <td class="px-3 py-2"><input v-model.number="detail.quantity_requested" type="number" min="0" step="0.01" class="w-20 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs outline-none focus:border-stellar-400 dark:border-slate-700 dark:bg-slate-800" @input="recalcRow(index)" /></td>
                <td class="px-3 py-2"><input v-model.number="detail.estimated_cost" type="number" min="0" step="0.01" class="w-24 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs outline-none focus:border-stellar-400 dark:border-slate-700 dark:bg-slate-800" @input="recalcRow(index)" /></td>
                <td class="px-3 py-2 text-xs">{{ formatCOP(detail.subtotal) }}</td>
                <td class="px-3 py-2">
                  <button type="button" class="text-red-500 hover:text-red-700" @click="removeDetail(index)">✕</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-2">
          <button type="button" class="text-sm text-stellar-600 hover:text-stellar-700 dark:text-stellar-400" @click="openEntryModal">+ Agregar más productos</button>
        </div>
      </div>

      <!-- Financial summary -->
      <div class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 class="mb-4 text-lg font-semibold">Resumen financiero</h2>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Subtotal</label>
            <p class="text-lg font-bold">{{ formatCOP(form.financial_summary.purchase_subtotal) }}</p>
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">IVA (19%)</label>
            <p class="text-lg font-bold text-amber-600">{{ formatCOP(form.financial_summary.vat) }}</p>
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Descuento</label>
            <input v-model.number="form.financial_summary.discount" type="number" min="0" step="0.01" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800" @input="recalcSummary" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Total estimado</label>
            <p class="text-lg font-bold text-stellar-600">{{ formatCOP(form.financial_summary.purchase_total) }}</p>
          </div>
        </div>
      </div>

      <!-- Justification -->
      <div class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 class="mb-4 text-lg font-semibold">Justificación</h2>
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Razón de la orden</label>
          <textarea v-model="form.reason_for_order" rows="3" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800" />
        </div>
      </div>

      <div class="flex gap-3">
        <button type="submit" class="rounded-xl bg-stellar-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-stellar-600 disabled:opacity-50" :disabled="orderStore.isLoading">
          {{ orderStore.isLoading ? 'Guardando...' : 'Guardar orden' }}
        </button>
      </div>

    </form>

    <!-- Result dialog -->
    <Teleport to="body">
      <div v-if="showDialog && dialogResult" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
        <div v-motion :initial="{ opacity: 0, scale: 0.95, y: 16 }" :enter="{ opacity: 1, scale: 1, y: 0, transition: { duration: 350 } }" class="relative w-full max-w-md rounded-2xl border bg-white p-8 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
          <!-- Success -->
          <template v-if="dialogResult.success">
            <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20">
              <svg class="h-8 w-8 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="mb-2 text-center text-xl font-bold text-slate-900 dark:text-white">¡Orden registrada!</h3>
            <p class="mb-1 text-center text-sm text-slate-600 dark:text-slate-300">
              <span class="font-semibold">{{ dialogResult.order.order_numeric }}</span> — {{ formatCOP(dialogResult.order.financial_summary.purchase_total) }}
            </p>
            <p v-if="dialogResult.shipment" class="mb-2 mt-2 inline-flex items-center gap-1.5 rounded-full bg-cosmic-100 px-3 py-1 text-xs font-medium text-cosmic-700 dark:bg-cosmic-500/20 dark:text-cosmic-300">
              <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              Despacho automático creado: <span class="font-semibold">{{ dialogResult.shipment.shipment_number }}</span>
            </p>
            <p class="mb-6 text-center text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Cada orden que registras es un paso firme hacia el control total de tu inventario.<br />
              <span class="font-medium text-stellar-600 dark:text-stellar-400">La organización de hoy construye la eficiencia del mañana.</span>
            </p>
          </template>

          <!-- Error -->
          <template v-else>
            <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/20">
              <svg class="h-8 w-8 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="mb-2 text-center text-xl font-bold text-slate-900 dark:text-white">No se pudo registrar la orden</h3>
            <p class="mb-1 text-center text-sm text-slate-600 dark:text-slate-300">{{ dialogResult.error }}</p>
            <p class="mb-6 text-center text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Hasta los equipos más experimentados enfrentan desafíos técnicos.<br />
              <span class="font-medium text-stellar-600 dark:text-stellar-400">Revisa los datos y vuelve a intentarlo — el control de tu negocio está cerca.</span>
            </p>
          </template>

          <!-- Buttons -->
          <div class="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button type="button" class="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" @click="resetForm">
              Crear una orden nueva
            </button>
            <button type="button" class="rounded-xl bg-stellar-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-stellar-600" @click="goToList">
              Ir a la lista de órdenes
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <EntrySelectionModal
      v-if="showEntryModal"
      :company-id="form.company_id"
      @confirm="onEntriesSelected"
      @close="showEntryModal = false"
    />

    <ProviderSelectionModal
      v-if="showProviderModal"
      @confirm="onProviderSelected"
      @close="showProviderModal = false"
      @go-to-provider-registration="emit('goToProviderRegistration')"
    />

    <AutomationConfirmModal
      v-if="showAutomationConfirm"
      @confirm="onAutomationConfirm"
      @close="showAutomationConfirm = false; dialogResult = { success: true, order: createdOrder! }; showDialog = true"
    />

    <WinerySelectionModal
      v-if="showWineryModal"
      :company-id="form.company_id"
      @confirm="onWinerySelected"
      @close="showWineryModal = false; dialogResult = { success: true, order: createdOrder! }; showDialog = true"
    />

    <DispatchSummaryModal
      v-if="showDispatchSummary && createdOrder"
      :order="createdOrder"
      :warehouse-id="selectedWarehouseId"
      :selected-entry-ids="selectedEntryIds"
      @confirm="onDispatchConfirm"
      @close="showDispatchSummary = false; dialogResult = { success: true, order: createdOrder! }; showDialog = true"
    />
  </div>
</template>
