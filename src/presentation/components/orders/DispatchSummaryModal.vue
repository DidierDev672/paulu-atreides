<script setup lang="ts">
import { ref, computed } from 'vue'
import type { OrderResponse } from '@/application/services/orderService'

const props = defineProps<{
  order: OrderResponse
  warehouseId: string
  selectedEntryIds: string[]
}>()

const emit = defineEmits<{
  confirm: [payload: {
    discount: number
    remarks: string
    recipient_type: string
    recipient_id: string
  }]
  close: []
}>()

const VAT_RATE = 0.19

const discount = ref(props.order.financial_summary.discount)
const remarks = ref('')
const recipient_type = ref('INTERNAL')
const recipient_id = ref(props.order.company_id)

const recipientTypes = [
  { value: 'CUSTOMER', label: 'Cliente' },
  { value: 'SUPPLIER', label: 'Proveedor' },
  { value: 'WAREHOUSE', label: 'Bodega' },
  { value: 'INTERNAL', label: 'Interno' },
]

const subtotal = computed(() => props.order.financial_summary.purchase_subtotal)
const vat = computed(() => subtotal.value * VAT_RATE)
const total = computed(() => subtotal.value + vat.value - discount.value)

function formatCOP(value: number): string {
  return value.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function handleConfirm(): void {
  emit('confirm', {
    discount: discount.value,
    remarks: remarks.value,
    recipient_type: recipient_type.value,
    recipient_id: recipient_id.value,
  })
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm" @click.self="emit('close')">
      <div v-motion :initial="{ opacity: 0, scale: 0.95, y: 16 }" :enter="{ opacity: 1, scale: 1, y: 0, transition: { duration: 350 } }" class="relative w-full max-w-lg rounded-2xl border bg-white p-8 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cosmic-100 dark:bg-cosmic-500/20">
          <svg class="h-8 w-8 text-cosmic-600 dark:text-cosmic-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <h3 class="mb-2 text-center text-xl font-bold text-slate-900 dark:text-white">Resumen del despacho</h3>
        <p class="mb-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Orden: <span class="font-semibold text-slate-700 dark:text-slate-300">{{ order.order_numeric }}</span>
        </p>

        <!-- Financial summary -->
        <div class="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
          <h4 class="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Resumen financiero</h4>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-slate-500">Subtotal</span>
              <span class="font-medium text-slate-800 dark:text-slate-200">{{ formatCOP(subtotal) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">IVA (19%)</span>
              <span class="font-medium text-amber-600">{{ formatCOP(vat) }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500">Descuento</span>
              <input v-model.number="discount" type="number" min="0" step="0.01" class="w-28 rounded-lg border border-slate-200 bg-white px-2 py-1 text-right text-xs outline-none focus:border-stellar-400 dark:border-slate-600 dark:bg-slate-700" />
            </div>
            <hr class="border-slate-200 dark:border-slate-600" />
            <div class="flex justify-between text-base font-bold">
              <span class="text-slate-800 dark:text-slate-100">Total</span>
              <span class="text-stellar-600">{{ formatCOP(total) }}</span>
            </div>
          </div>
        </div>

        <!-- Remarks -->
        <div class="mb-4">
          <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Observaciones</label>
          <textarea v-model="remarks" rows="2" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800" placeholder="Notas adicionales para el despacho..." />
        </div>

        <!-- Recipient -->
        <div class="mb-6">
          <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Tipo de destinatario</label>
          <select v-model="recipient_type" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800">
            <option v-for="r in recipientTypes" :key="r.value" :value="r.value">{{ r.label }}</option>
          </select>
          <p class="mt-1 text-xs text-slate-400">El ID del destinatario se asociará a la compañía actual.</p>
        </div>

        <!-- Buttons -->
        <div class="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button type="button" class="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" @click="emit('close')">
            Cancelar
          </button>
          <button type="button" class="rounded-xl bg-gradient-to-r from-cosmic-500 to-stellar-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-cosmic-400 hover:to-stellar-400" @click="handleConfirm">
            Confirmar despacho
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
