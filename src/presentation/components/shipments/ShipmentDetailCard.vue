<script setup lang="ts">
import type { ShipmentResponse } from '@/application/services/shipmentService'
import FieldItem from '@/presentation/components/shipments/atoms/FieldItem.vue'
import StatusBadge from '@/presentation/components/shipments/atoms/StatusBadge.vue'
import TotalItem from '@/presentation/components/shipments/atoms/TotalItem.vue'
import TypeBadge from '@/presentation/components/shipments/atoms/TypeBadge.vue'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  shipment: ShipmentResponse
  expanded: boolean
  destinatarioNombre: string
  tipoDestinatario: string
  tipoMovimiento: string
  bodega: string
  responsable: string
  origen: string
}>()

const emit = defineEmits<{
  toggle: []
  view: []
  edit: []
  delete: []
  'status-change': [status: string]
}>()

const newStatus = ref('')

watch(
  () => props.shipment.status,
  () => {
    newStatus.value = ''
  },
)

const availableStatuses = computed(() =>
  [
    { value: 'DRAFT', label: 'Borrador' },
    { value: 'CONFIRMED', label: 'Confirmado' },
    { value: 'CANCELED', label: 'Cancelado' },
  ].filter((s) => s.value !== props.shipment.status),
)

function onStatusChange(): void {
  if (!newStatus.value) return
  emit('status-change', newStatus.value)
  newStatus.value = ''
}
</script>

<template>
  <div
    v-motion
    :initial="{ opacity: 0, y: 8 }"
    :enter="{ opacity: 1, y: 0, transition: { duration: 200, ease: 'easeOut' } }"
    class="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-[#1F2937] dark:bg-[#111827]"
  >
    <!-- LAYER 1 — Header -->
    <div
      class="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-[#374151] dark:bg-[#1F2937]"
    >
      <div class="min-w-0 flex-1 cursor-pointer" @click="emit('toggle')">
        <div class="flex flex-col gap-1.5">
          <div class="flex min-w-0 flex-wrap items-center gap-2">
            <StatusBadge :status="shipment.status" />
            <span
              class="truncate text-[15px] font-semibold text-slate-900 dark:text-gray-100"
              :title="destinatarioNombre"
            >
              {{ destinatarioNombre }}
            </span>
            <TypeBadge :type="tipoMovimiento" />
          </div>
          <div class="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 dark:text-gray-500">
            <span>{{ formatDate(shipment.record_date) }}</span>
            <span class="h-1 w-1 rounded-full bg-slate-300 dark:bg-gray-600" />
            <span>{{ tipoDestinatario }}</span>
            <span class="h-1 w-1 rounded-full bg-slate-300 dark:bg-gray-600" />
            <span class="font-mono text-[12px] text-slate-700 dark:text-gray-300">
              {{ formatCurrency(shipment.financial_summary.total) }}
            </span>
          </div>
        </div>
      </div>

      <div class="flex shrink-0 flex-wrap items-center gap-2">
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-1.5 text-[12px] font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-[#374151] dark:text-gray-300 dark:hover:bg-[#374151]"
          @click.stop="emit('view')"
        >
          Ver detalle
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-1.5 text-[12px] font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-[#374151] dark:text-gray-300 dark:hover:bg-[#374151]"
          @click.stop="emit('edit')"
        >
          Editar
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-md border border-red-300 px-3 py-1.5 text-[12px] font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
          @click.stop="emit('delete')"
        >
          Eliminar
        </button>
        <button
          type="button"
          class="p-1.5 text-slate-400 transition-colors hover:text-slate-700 dark:text-gray-500 dark:hover:text-gray-300"
          :aria-label="expanded ? 'Colapsar' : 'Expandir'"
          @click.stop="emit('toggle')"
        >
          <svg
            class="h-4 w-4 transition-transform duration-200 ease-out"
            :class="expanded ? 'rotate-180' : ''"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Expanded layers -->
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      leave-active-class="transition-opacity duration-150 ease-in"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="expanded">
        <!-- LAYER 2 — Body -->
        <div class="bg-white px-5 py-5 dark:bg-[#111827]">
          <div class="mb-5 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
            <FieldItem label="Bodega" :value="bodega" />
            <FieldItem label="Responsable" :value="responsable" />
            <FieldItem label="Destinatario" :value="destinatarioNombre" />
            <FieldItem label="Origen" :value="origen" />
          </div>

          <div class="mb-4 h-px bg-slate-200 dark:bg-[#1F2937]" />

          <div class="mb-5 flex flex-wrap items-center gap-3">
            <span class="text-[11px] text-slate-500 dark:text-gray-500">Estado actual</span>
            <StatusBadge :status="shipment.status" />
            <span class="ml-0 text-[11px] text-slate-500 sm:ml-2 dark:text-gray-500">Cambiar a</span>
            <select
              v-model="newStatus"
              class="rounded-md border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-[12px] text-slate-700 focus:outline-none focus:ring-1 focus:ring-stellar-500 dark:border-[#374151] dark:bg-[#1F2937] dark:text-gray-300"
              @change="onStatusChange"
            >
              <option value="" disabled>Seleccionar estado...</option>
              <option v-for="s in availableStatuses" :key="s.value" :value="s.value">
                {{ s.label }}
              </option>
            </select>
          </div>

          <div v-if="shipment.remarks" class="mb-4 text-[12px] text-slate-600 dark:text-gray-400">
            <span class="text-[10px] text-slate-500 dark:text-[#6B7280]">Observaciones</span>
            <p class="mt-0.5 font-medium text-slate-800 dark:text-gray-100">{{ shipment.remarks }}</p>
          </div>

          <div v-if="shipment.details.length" class="overflow-x-auto">
            <table class="w-full text-[12px]">
              <thead>
                <tr class="border-b border-slate-200 dark:border-[#1F2937]">
                  <th
                    class="w-36 pb-2 text-left text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-[#4B5563]"
                  >
                    Código
                  </th>
                  <th
                    class="pb-2 text-left text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-[#4B5563]"
                  >
                    Producto
                  </th>
                  <th
                    class="w-20 pb-2 text-right text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-[#4B5563]"
                  >
                    Unidad
                  </th>
                  <th
                    class="w-16 pb-2 text-right text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-[#4B5563]"
                  >
                    Cant.
                  </th>
                  <th
                    class="w-24 pb-2 text-right text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-[#4B5563]"
                  >
                    Costo unit.
                  </th>
                  <th
                    class="w-24 pb-2 text-right text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-[#4B5563]"
                  >
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-[#111827]">
                <tr
                  v-for="item in shipment.details"
                  :key="item.code"
                  class="transition-colors hover:bg-slate-50 dark:hover:bg-[#1F2937]"
                >
                  <td class="py-2.5 font-mono text-[11px] text-slate-500 dark:text-[#6B7280]">
                    {{ item.code }}
                  </td>
                  <td class="py-2.5 font-medium text-slate-800 dark:text-gray-100">
                    {{ item.product }}
                  </td>
                  <td class="py-2.5 text-right text-slate-500 dark:text-[#6B7280]">
                    {{ item.unit }}
                  </td>
                  <td class="py-2.5 text-right font-mono text-slate-700 dark:text-gray-300">
                    {{ item.quantity }}
                  </td>
                  <td class="py-2.5 text-right font-mono text-slate-700 dark:text-gray-300">
                    {{ formatCurrency(item.unit_cost) }}
                  </td>
                  <td class="py-2.5 text-right font-mono font-medium text-slate-800 dark:text-gray-100">
                    {{ formatCurrency(item.subtotal) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- LAYER 3 — Totals -->
        <div
          class="grid grid-cols-2 gap-x-6 gap-y-3 border-t border-slate-200 bg-slate-100 px-5 py-4 sm:grid-cols-4 dark:border-[#1F2937] dark:bg-[#0F172A]"
        >
          <TotalItem label="Subtotal" :value="shipment.financial_summary.subtotal" />
          <TotalItem label="IVA (19%)" :value="shipment.financial_summary.vat" />
          <TotalItem
            label="Descuento"
            :value="shipment.financial_summary.discount"
            color="green"
            prefix="−"
          />
          <TotalItem label="Total" :value="shipment.financial_summary.total" :highlight="true" />
        </div>

        <!-- LAYER 4 — Footer -->
        <div
          class="flex flex-wrap items-center gap-2 border-t border-slate-200 bg-slate-50 px-5 py-2.5 dark:border-[#1F2937] dark:bg-[#1F2937]"
        >
          <span class="text-[10px] text-slate-400 dark:text-[#4B5563]">
            Creado {{ formatDate(shipment.createdAt) }}
          </span>
          <span class="h-1 w-1 rounded-full bg-slate-300 dark:bg-[#374151]" />
          <span class="text-[10px] text-slate-400 dark:text-[#4B5563]">
            Actualizado {{ formatDate(shipment.updatedAt) }}
          </span>
        </div>
      </div>
    </Transition>
  </div>
</template>
