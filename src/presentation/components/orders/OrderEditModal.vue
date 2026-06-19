<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useOrderStore } from '@/presentation/stores/orderStore'
import { useShipmentStore } from '@/presentation/stores/shipmentStore'
import type { OrderResponse, OrderDetail } from '@/application/services/orderService'
import { useHistoryLogger } from '@/presentation/composables/useHistoryLogger'

const props = defineProps<{
  order: OrderResponse
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const orderStore = useOrderStore()
const shipmentStore = useShipmentStore()
const { logUpdate } = useHistoryLogger()

const VAT_RATE = 0.19
const saving = ref(false)

const form = reactive({
  order_numeric: props.order.order_numeric,
  order_type: props.order.order_type,
  date: props.order.date,
  company_id: props.order.company_id,
  user_id: props.order.user_id,
  requested_by: props.order.requested_by,
  status: props.order.status,
  reason_for_order: props.order.reason_for_order,
  details: props.order.details.map((d) => ({ ...d })),
  financial_summary: { ...props.order.financial_summary },
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

function formatCOP(value: number): string {
  return value.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function recalcRow(index: number): void {
  const d = form.details[index]
  d.subtotal = d.quantity_requested * d.estimated_cost
  recalcSummary()
}

function recalcSummary(): void {
  const subtotal = form.details.reduce((s, d) => s + d.subtotal, 0)
  const vat = subtotal * VAT_RATE
  const discount = form.financial_summary.discount
  form.financial_summary = {
    purchase_subtotal: subtotal,
    vat,
    discount,
    purchase_total: subtotal + vat - discount,
  }
}

function removeDetail(index: number): void {
  form.details.splice(index, 1)
  recalcSummary()
}

async function handleSave(): Promise<void> {
  saving.value = true
  try {
    const updated = await orderStore.updateOrder(props.order.id, {
      order_numeric: form.order_numeric,
      order_type: form.order_type,
      date: form.date,
      company_id: form.company_id,
      user_id: form.user_id,
      requested_by: form.requested_by,
      details: form.details,
      financial_summary: form.financial_summary,
      status: form.status,
      reason_for_order: form.reason_for_order,
    })

    if (updated) {
      await updateRelatedShipment()
      logUpdate({
        entityType: 'ORDER',
        entityId: props.order.id,
        details: `Orden ${props.order.order_numeric} actualizada.`,
      })
      emit('saved')
    }
  } finally {
    saving.value = false
  }
}

async function updateRelatedShipment(): Promise<void> {
  const shipmentNumber = `DES-${form.order_numeric}`
  if (shipmentStore.shipments.length === 0) {
    await shipmentStore.fetchShipments()
  }
  const shipment = shipmentStore.shipments.find((s) => s.shipment_number === shipmentNumber)
  if (!shipment) return

  await shipmentStore.updateShipment(shipment.id, {
    shipment_number: shipment.shipment_number,
    record_date: shipment.record_date,
    movement_type: shipment.movement_type,
    status: shipment.status,
    company_id: shipment.company_id,
    warehouse_id: shipment.warehouse_id,
    responsible_id: shipment.responsible_id,
    source_document: shipment.source_document,
    recipient: shipment.recipient,
    details: form.details.map((d) => ({
      code: d.code,
      product: d.product,
      unit: d.unit,
      quantity: d.quantity_requested,
      unit_cost: d.estimated_cost,
      subtotal: d.subtotal,
    })),
    financial_summary: {
      subtotal: form.financial_summary.purchase_subtotal,
      vat: form.financial_summary.vat,
      discount: form.financial_summary.discount,
      total: form.financial_summary.purchase_total,
    },
    remarks: shipment.remarks,
  })
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm" @click.self="emit('close')">
      <div v-motion :initial="{ opacity: 0, scale: 0.95, y: 16 }" :enter="{ opacity: 1, scale: 1, y: 0, transition: { duration: 350 } }" class="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border bg-white shadow-2xl dark:border-slate-700 dark:text-white dark:bg-slate-900">
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <div>
            <h2 class="text-lg font-semibold text-slate-900 dark:text-white">Editar orden</h2>
            <p class="text-sm text-slate-500 dark:text-slate-400">{{ form.order_numeric }}</p>
          </div>
          <button type="button" class="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300" @click="emit('close')">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          <!-- Order info -->
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Código de orden</label>
              <input v-model="form.order_numeric" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:text-white dark:bg-slate-800" />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Fecha</label>
              <input v-model="form.date" type="date" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:text-white dark:bg-slate-800" />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Estado</label>
              <select v-model="form.status" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:text-white dark:bg-slate-800">
                <option v-for="s in statuses" :key="s.value" :value="s.value">{{ s.label }}</option>
              </select>
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Tipo</label>
              <select v-model="form.order_type" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:text-white dark:bg-slate-800">
                <option v-for="t in orderTypes" :key="t.value" :value="t.value">{{ t.label }}</option>
              </select>
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Solicitado por</label>
              <input v-model="form.requested_by" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:text-white dark:bg-slate-800" />
            </div>
            <div class="sm:col-span-2 lg:col-span-3">
              <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Razón</label>
              <textarea v-model="form.reason_for_order" rows="2" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:text-white dark:bg-slate-800" />
            </div>
          </div>

          <!-- Product details -->
          <div>
            <h3 class="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Productos</h3>
            <div class="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
              <table class="w-full text-left text-xs">
                <thead>
                  <tr class="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:border-slate-700 dark:text-white dark:bg-slate-800">
                    <th class="px-3 py-2">Producto</th>
                    <th class="px-3 py-2">Unidad</th>
                    <th class="px-3 py-2">Cantidad</th>
                    <th class="px-3 py-2">Costo est.</th>
                    <th class="px-3 py-2">Subtotal</th>
                    <th class="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(detail, index) in form.details" :key="detail.code" class="border-b border-slate-100 dark:border-slate-800">
                    <td class="px-3 py-2">
                      <p class="font-medium text-slate-800 dark:text-slate-100">{{ detail.product }}</p>
                      <p class="text-slate-400">{{ detail.code }}</p>
                    </td>
                    <td class="px-3 py-2 text-slate-600 dark:text-slate-300">{{ detail.unit }}</td>
                    <td class="px-3 py-2">
                      <input v-model.number="detail.quantity_requested" type="number" min="0" step="0.01" class="w-20 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs outline-none focus:border-stellar-400 dark:border-slate-700 dark:bg-slate-800" @input="recalcRow(index)" />
                    </td>
                    <td class="px-3 py-2">
                      <input v-model.number="detail.estimated_cost" type="number" min="0" step="0.01" class="w-24 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs outline-none focus:border-stellar-400 dark:border-slate-700 dark:bg-slate-800" @input="recalcRow(index)" />
                    </td>
                    <td class="px-3 py-2 font-medium text-slate-700 dark:text-slate-200">{{ formatCOP(detail.subtotal) }}</td>
                    <td class="px-3 py-2">
                      <button type="button" class="text-red-500 hover:text-red-700" @click="removeDetail(index)">✕</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Financial summary -->
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
            <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <label class="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Subtotal</label>
                <p class="text-base font-bold text-slate-900 dark:text-white">{{ formatCOP(form.financial_summary.purchase_subtotal) }}</p>
              </div>
              <div>
                <label class="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">IVA (19%)</label>
                <p class="text-base font-bold text-amber-600">{{ formatCOP(form.financial_summary.vat) }}</p>
              </div>
              <div>
                <label class="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Descuento</label>
                <input v-model.number="form.financial_summary.discount" type="number" min="0" step="0.01" class="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm outline-none focus:border-stellar-400 dark:border-slate-700 dark:text-white dark:bg-slate-900" @input="recalcSummary" />
              </div>
              <div>
                <label class="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Total</label>
                <p class="text-base font-bold text-stellar-600">{{ formatCOP(form.financial_summary.purchase_total) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4 dark:border-slate-700">
          <button type="button" class="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" @click="emit('close')">
            Cancelar
          </button>
          <button type="button" :disabled="saving" class="rounded-xl bg-stellar-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-stellar-600 disabled:opacity-50" @click="handleSave">
            {{ saving ? 'Guardando...' : 'Guardar cambios' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
