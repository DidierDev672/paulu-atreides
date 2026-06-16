<script setup lang="ts">
import type { ShipmentResponse } from '@/application/services/shipmentService'

defineProps<{ shipment: ShipmentResponse }>()
const emit = defineEmits<{ close: [] }>()

const movementLabels: Record<string, string> = {
  SALE: 'Venta',
  SUPPLIER_RETURN: 'Devolución proveedor',
  DONATION: 'Donación',
  SHRINKAGE: 'Merma',
  ADJUSTMENT: 'Ajuste',
  TRANSFER: 'Transferencia',
}

const recipientLabels: Record<string, string> = {
  CUSTOMER: 'Cliente',
  SUPPLIER: 'Proveedor',
  WAREHOUSE: 'Bodega',
  INTERNAL: 'Interno',
}

const statusLabels: Record<string, string> = {
  DRAFT: 'Borrador',
  CONFIRMED: 'Confirmado',
  CANCELED: 'Cancelado',
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })
}

function formatCOP(value: number): string {
  return value.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm" @click.self="emit('close')">
      <div v-motion :initial="{ opacity: 0, scale: 0.95, y: 16 }" :enter="{ opacity: 1, scale: 1, y: 0, transition: { duration: 350 } }" class="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-cosmic-100 dark:bg-cosmic-500/20">
              <svg class="h-5 w-5 text-cosmic-600 dark:text-cosmic-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div>
              <h2 class="text-lg font-semibold text-slate-900 dark:text-white">Detalle del despacho</h2>
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
        <div class="flex-1 overflow-y-auto px-6 py-5">
          <!-- Status & type badges -->
          <div class="mb-5 flex flex-wrap gap-2">
            <span class="rounded-full px-3 py-1 text-xs font-semibold" :class="{
              'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300': shipment.status === 'DRAFT',
              'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400': shipment.status === 'CONFIRMED',
              'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400': shipment.status === 'CANCELED',
            }">
              {{ statusLabels[shipment.status] || shipment.status }}
            </span>
            <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              {{ movementLabels[shipment.movement_type] || shipment.movement_type }}
            </span>
          </div>

          <!-- Info grid -->
          <div class="mb-5 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
            <div>
              <p class="text-xs text-slate-400">Fecha de registro</p>
              <p class="font-medium text-slate-700 dark:text-slate-200">{{ formatDate(shipment.record_date) }}</p>
            </div>
            <div>
              <p class="text-xs text-slate-400">Bodega</p>
              <p class="font-medium text-slate-700 dark:text-slate-200">{{ shipment.warehouse_id }}</p>
            </div>
            <div>
              <p class="text-xs text-slate-400">Responsable</p>
              <p class="font-medium text-slate-700 dark:text-slate-200">{{ shipment.responsible_id }}</p>
            </div>
            <div>
              <p class="text-xs text-slate-400">Destinatario</p>
              <p class="font-medium text-slate-700 dark:text-slate-200">
                {{ recipientLabels[shipment.recipient.recipient_type] || shipment.recipient.recipient_type }}
                ({{ shipment.recipient.recipient_id }})
              </p>
            </div>
            <div>
              <p class="text-xs text-slate-400">Entrada(s) origen</p>
              <p class="font-mono text-xs text-slate-600 dark:text-slate-300">
                {{ shipment.source_document.entry_ids.length > 0 ? shipment.source_document.entry_ids.join(', ') : '—' }}
              </p>
            </div>
            <div>
              <p class="text-xs text-slate-400">Observaciones</p>
              <p class="text-slate-600 dark:text-slate-300">{{ shipment.remarks || '—' }}</p>
            </div>
          </div>

          <!-- Financial summary -->
          <div class="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
            <h3 class="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Resumen financiero</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-slate-500">Subtotal</span>
                <span class="font-medium text-slate-800 dark:text-slate-200">${{ formatCOP(shipment.financial_summary.subtotal) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">IVA (19%)</span>
                <span class="font-medium text-amber-600">${{ formatCOP(shipment.financial_summary.vat) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">Descuento</span>
                <span class="font-medium text-slate-800 dark:text-slate-200">${{ formatCOP(shipment.financial_summary.discount) }}</span>
              </div>
              <hr class="border-slate-200 dark:border-slate-600" />
              <div class="flex justify-between text-base font-bold">
                <span class="text-slate-800 dark:text-slate-100">Total</span>
                <span class="text-stellar-600">${{ formatCOP(shipment.financial_summary.total) }}</span>
              </div>
            </div>
          </div>

          <!-- Product details -->
          <div>
            <h3 class="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Productos</h3>
            <div class="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
              <table class="w-full text-left text-sm">
                <thead>
                  <tr class="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:border-slate-700 dark:bg-slate-800/50">
                    <th class="px-3 py-2">Código</th>
                    <th class="px-3 py-2">Producto</th>
                    <th class="px-3 py-2">Unidad</th>
                    <th class="px-3 py-2">Cantidad</th>
                    <th class="px-3 py-2">Costo unit.</th>
                    <th class="px-3 py-2">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="d in shipment.details" :key="d.code" class="border-b border-slate-100 dark:border-slate-800">
                    <td class="px-3 py-2 font-mono text-xs text-slate-500">{{ d.code }}</td>
                    <td class="px-3 py-2 font-medium text-slate-800 dark:text-slate-100">{{ d.product }}</td>
                    <td class="px-3 py-2 text-slate-600 dark:text-slate-300">{{ d.unit }}</td>
                    <td class="px-3 py-2 text-slate-600 dark:text-slate-300">{{ d.quantity }}</td>
                    <td class="px-3 py-2 text-slate-600 dark:text-slate-300">${{ formatCOP(d.unit_cost) }}</td>
                    <td class="px-3 py-2 font-medium text-slate-700 dark:text-slate-200">${{ formatCOP(d.subtotal) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Timestamps -->
          <div class="mt-5 flex gap-4 text-xs text-slate-400">
            <span>Creado: {{ new Date(shipment.createdAt).toLocaleString('es-CO') }}</span>
            <span>·</span>
            <span>Actualizado: {{ new Date(shipment.updatedAt).toLocaleString('es-CO') }}</span>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex justify-end border-t border-slate-200 px-6 py-4 dark:border-slate-700">
          <button type="button" class="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" @click="emit('close')">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
