<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useShipmentStore } from '@/presentation/stores/shipmentStore'
import WinerySelectionModal from '@/presentation/components/products/WinerySelectionModal.vue'
import type { ShipmentResponse } from '@/application/services/shipmentService'

const props = defineProps<{ shipment: ShipmentResponse }>()
const emit = defineEmits<{ saved: []; close: [] }>()

const shipmentStore = useShipmentStore()

const form = reactive({
  record_date: props.shipment.record_date,
  movement_type: props.shipment.movement_type,
  status: props.shipment.status,
  warehouse_id: props.shipment.warehouse_id,
  recipient: { ...props.shipment.recipient },
  details: props.shipment.details.map((d) => ({ ...d })),
  financial_summary: { ...props.shipment.financial_summary },
  remarks: props.shipment.remarks,
})

const showWineryModal = ref(false)
const isSubmitting = ref(false)

const movementTypes = [
  { value: 'SALE', label: 'Venta' },
  { value: 'SUPPLIER_RETURN', label: 'Devolución a proveedor' },
  { value: 'DONATION', label: 'Donación' },
  { value: 'SHRINKAGE', label: 'Merma' },
  { value: 'ADJUSTMENT', label: 'Ajuste' },
  { value: 'TRANSFER', label: 'Transferencia' },
]

const recipientTypes = [
  { value: 'CUSTOMER', label: 'Cliente' },
  { value: 'SUPPLIER', label: 'Proveedor' },
  { value: 'WAREHOUSE', label: 'Bodega' },
  { value: 'INTERNAL', label: 'Interno' },
]

function formatCOP(value: number): string {
  return value.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const detailsSubtotal = computed(() => form.details.reduce((sum, d) => sum + d.subtotal, 0))
const vatAmount = computed(() => detailsSubtotal.value * 0.19)
const totalAmount = computed(() => detailsSubtotal.value + vatAmount.value - form.financial_summary.discount)

function updateDetailSubtotal(index: number): void {
  const d = form.details[index]
  d.subtotal = d.quantity * d.unit_cost
}

function removeDetail(index: number): void {
  form.details.splice(index, 1)
}

function handleWinerySelected(winery: { id: string }): void {
  form.warehouse_id = winery.id
  showWineryModal.value = false
}

async function handleSubmit(): Promise<void> {
  isSubmitting.value = true
  try {
    form.financial_summary.subtotal = detailsSubtotal.value
    form.financial_summary.vat = vatAmount.value
    form.financial_summary.total = totalAmount.value
    const result = await shipmentStore.updateShipment(props.shipment.id, {
      shipment_number: props.shipment.shipment_number,
      record_date: form.record_date,
      movement_type: form.movement_type,
      status: form.status,
      company_id: props.shipment.company_id,
      warehouse_id: form.warehouse_id,
      responsible_id: props.shipment.responsible_id,
      source_document: props.shipment.source_document,
      recipient: form.recipient,
      details: form.details,
      financial_summary: form.financial_summary,
      remarks: form.remarks,
    })
    if (result) {
      emit('saved')
      emit('close')
    } else {
      alert(shipmentStore.error || 'Error al actualizar el despacho.')
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm" @click.self="emit('close')">
      <div v-motion :initial="{ opacity: 0, scale: 0.95, y: 16 }" :enter="{ opacity: 1, scale: 1, y: 0, transition: { duration: 350 } }" class="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-500/20">
              <svg class="h-5 w-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h2 class="text-lg font-semibold text-slate-900 dark:text-white">Editar despacho</h2>
              <p class="text-sm text-slate-500 dark:text-slate-400">{{ shipment.shipment_number }}</p>
            </div>
          </div>
          <button type="button" class="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300" @click="emit('close')">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Body -->
        <form @submit.prevent="handleSubmit" class="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label class="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Fecha</label>
              <input v-model="form.record_date" type="date" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Tipo de movimiento</label>
              <select v-model="form.movement_type" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                <option v-for="mt in movementTypes" :key="mt.value" :value="mt.value">{{ mt.label }}</option>
              </select>
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Estado</label>
              <select v-model="form.status" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                <option value="DRAFT">Borrador</option>
                <option value="CONFIRMED">Confirmado</option>
                <option value="CANCELED">Cancelado</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label class="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Bodega</label>
              <div class="flex gap-2">
                <input v-model="form.warehouse_id" type="text" readonly class="flex-1 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-600 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300" />
                <button type="button" class="rounded-xl bg-stellar-500/10 px-3 py-2 text-sm font-medium text-stellar-600 transition hover:bg-stellar-500/20 dark:text-stellar-300" @click="showWineryModal = true">Seleccionar</button>
              </div>
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Tipo de destinatario</label>
              <select v-model="form.recipient.recipient_type" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                <option v-for="rt in recipientTypes" :key="rt.value" :value="rt.value">{{ rt.label }}</option>
              </select>
            </div>
          </div>

          <div>
            <label class="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">ID del destinatario</label>
            <input v-model="form.recipient.recipient_id" type="text" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
          </div>

          <!-- Product details -->
          <div>
            <div class="mb-3 flex items-center justify-between">
              <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-300">Productos</h3>
              <span class="text-xs text-slate-400 dark:text-slate-500">{{ form.details.length }} producto{{ form.details.length !== 1 ? 's' : '' }}</span>
            </div>
            <div class="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
              <table class="w-full text-left text-sm">
                <thead>
                  <tr class="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:border-slate-700 dark:bg-slate-800/50">
                    <th class="px-3 py-2 dark:text-slate-400">Código</th>
                    <th class="px-3 py-2 dark:text-slate-400">Producto</th>
                    <th class="px-3 py-2 dark:text-slate-400">Unidad</th>
                    <th class="px-3 py-2 dark:text-slate-400">Cantidad</th>
                    <th class="px-3 py-2 dark:text-slate-400">Costo unit.</th>
                    <th class="px-3 py-2 dark:text-slate-400">Subtotal</th>
                    <th class="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(detail, index) in form.details" :key="index" class="border-b border-slate-100 dark:border-slate-800">
                    <td class="px-3 py-2 font-mono text-xs text-slate-500">{{ detail.code }}</td>
                    <td class="px-3 py-2 font-medium text-slate-800 dark:text-slate-100">{{ detail.product }}</td>
                    <td class="px-3 py-2 text-slate-600 dark:text-slate-300">{{ detail.unit }}</td>
                    <td class="px-3 py-2">
                      <input v-model.number="detail.quantity" type="number" min="0" step="0.01" class="w-20 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs outline-none focus:border-stellar-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" @input="updateDetailSubtotal(index)" />
                    </td>
                    <td class="px-3 py-2">
                      <input v-model.number="detail.unit_cost" type="number" min="0" step="0.01" class="w-24 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs outline-none focus:border-stellar-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" @input="updateDetailSubtotal(index)" />
                    </td>
                    <td class="px-3 py-2 text-xs dark:text-white">${{ formatCOP(detail.subtotal) }}</td>
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
            <h3 class="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Resumen financiero</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-slate-500 dark:text-slate-400">Subtotal</span>
                <span class="font-medium text-slate-800 dark:text-slate-200">${{ formatCOP(detailsSubtotal) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500 dark:text-slate-400">IVA (19%)</span>
                <span class="font-medium text-amber-600">${{ formatCOP(vatAmount) }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-500 dark:text-slate-400">Descuento</span>
                <input v-model.number="form.financial_summary.discount" type="number" min="0" step="0.01" class="w-28 rounded-lg border border-slate-200 bg-white px-2 py-1 text-right text-xs outline-none focus:border-stellar-400 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100" />
              </div>
              <hr class="border-slate-200 dark:border-slate-600" />
              <div class="flex justify-between text-base font-bold">
                <span class="text-slate-800 dark:text-slate-100">Total</span>
                <span class="text-stellar-600">${{ formatCOP(totalAmount) }}</span>
              </div>
            </div>
          </div>

          <!-- Remarks -->
          <div>
            <label class="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Observaciones</label>
            <textarea v-model="form.remarks" rows="2" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
          </div>

          <!-- Footer buttons -->
          <div class="flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-700">
            <button type="button" class="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" @click="emit('close')">Cancelar</button>
            <button type="submit" :disabled="isSubmitting" class="rounded-xl bg-gradient-to-r from-stellar-500 to-cosmic-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-stellar-400 hover:to-cosmic-400 disabled:opacity-50">
              {{ isSubmitting ? 'Guardando...' : 'Guardar cambios' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>

  <WinerySelectionModal v-if="showWineryModal" :company-id="shipment.company_id" @confirm="handleWinerySelected" @close="showWineryModal = false" />
</template>
