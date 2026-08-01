<script setup lang="ts">
import type { OrderResponse } from '@/application/services/orderService'
import FieldItem from '@/presentation/components/shipments/atoms/FieldItem.vue'
import StatusBadge from '@/presentation/components/shipments/atoms/StatusBadge.vue'
import TotalItem from '@/presentation/components/shipments/atoms/TotalItem.vue'
import TypeBadge from '@/presentation/components/shipments/atoms/TypeBadge.vue'
import { formatCurrency, formatDate } from '@/utils/formatters'

defineProps<{
  order: OrderResponse
  expanded: boolean
  usuarioNombre: string
  tipoLabel: string
  canApprove: boolean
}>()

const emit = defineEmits<{
  toggle: []
  edit: []
  delete: []
  approve: []
}>()
</script>

<template>
  <div
    v-motion
    :initial="{ opacity: 0, y: 8 }"
    :enter="{ opacity: 1, y: 0, transition: { duration: 200, ease: 'easeOut' } }"
    class="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-[#1E2D3D] dark:bg-[#0F1623]"
  >
    <!-- LAYER 1 — Header -->
    <div
      class="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-start sm:justify-between dark:border-[#1E2D3D] dark:bg-[#161E2E]"
    >
      <div class="min-w-0 flex-1 cursor-pointer" @click="emit('toggle')">
        <div class="flex flex-col gap-1.5">
          <div class="flex min-w-0 flex-wrap items-center gap-2">
            <StatusBadge :status="order.status" />
            <h2
              class="truncate text-[15px] font-semibold text-slate-900 dark:text-slate-100"
              :title="order.requested_by || '—'"
            >
              {{ order.requested_by || '—' }}
            </h2>
            <TypeBadge :type="tipoLabel" />
          </div>
          <div class="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
            <span class="font-mono tracking-wide">{{ order.order_numeric }}</span>
            <span class="h-[3px] w-[3px] rounded-full bg-slate-400 dark:bg-slate-600" />
            <span>{{ formatDate(order.date || order.createdAt) }}</span>
            <span class="h-[3px] w-[3px] rounded-full bg-slate-400 dark:bg-slate-600" />
            <span class="font-mono text-[12px] text-slate-600 dark:text-slate-300">
              {{ formatCurrency(order.financial_summary.purchase_total) }}
            </span>
          </div>
        </div>
      </div>

      <div class="flex shrink-0 flex-wrap items-center gap-2">
        <button
          v-if="canApprove"
          type="button"
          class="rounded-md border border-green-700 px-3 py-1.5 text-[12px] font-medium text-green-600 transition-colors hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-950"
          @click.stop="emit('approve')"
        >
          Aprobar
        </button>
        <button
          type="button"
          class="rounded-md border border-slate-300 px-3 py-1.5 text-[12px] font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
          @click.stop="emit('edit')"
        >
          Editar
        </button>
        <button
          type="button"
          class="rounded-md border border-red-300 px-3 py-1.5 text-[12px] font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
          @click.stop="emit('delete')"
        >
          Eliminar
        </button>
        <button
          type="button"
          class="p-1 text-slate-400 transition-colors hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300"
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
        <div
          v-motion
          :initial="{ opacity: 0 }"
          :enter="{ opacity: 1, transition: { duration: 150, delay: 50 } }"
          class="bg-white px-5 py-5 dark:bg-[#0F1623]"
        >
          <div class="mb-4 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-3">
            <FieldItem label="Compañía" :value="order.company_id" mono />
            <FieldItem label="Usuario responsable" :value="usuarioNombre" />
            <FieldItem label="Solicitado por" :value="order.requested_by" />
          </div>

          <div
            class="mb-5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-[#1E2D3D] dark:bg-[#161E2E]"
          >
            <p class="mb-1.5 text-[10px] text-slate-500">Razón de la solicitud</p>
            <p class="text-[12px] leading-relaxed text-slate-600 dark:text-slate-300">
              {{ order.reason_for_order || 'Sin razón registrada.' }}
            </p>
          </div>

          <div v-if="order.details.length" class="overflow-x-auto">
            <table class="w-full text-[12px]">
              <thead>
                <tr class="border-b border-slate-200 dark:border-[#1E2D3D]">
                  <th
                    class="w-36 pb-2 text-left text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-600"
                  >
                    Código
                  </th>
                  <th
                    class="pb-2 text-left text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-600"
                  >
                    Producto
                  </th>
                  <th
                    class="w-20 pb-2 text-right text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-600"
                  >
                    Unidad
                  </th>
                  <th
                    class="w-20 pb-2 text-right text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-600"
                  >
                    Cant.
                  </th>
                  <th
                    class="w-24 pb-2 text-right text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-600"
                  >
                    Costo est.
                  </th>
                  <th
                    class="w-24 pb-2 text-right text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-600"
                  >
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-[#0F1623]">
                <tr
                  v-for="item in order.details"
                  :key="item.code"
                  class="transition-colors hover:bg-slate-50 dark:hover:bg-[#161E2E]"
                >
                  <td class="py-2.5 font-mono text-[11px] text-slate-500 dark:text-slate-600">
                    {{ item.code }}
                  </td>
                  <td class="py-2.5 font-medium text-slate-800 dark:text-slate-100">
                    {{ item.product }}
                  </td>
                  <td class="py-2.5 text-right text-slate-500 dark:text-slate-600">
                    {{ item.unit }}
                  </td>
                  <td class="py-2.5 text-right font-mono text-slate-700 dark:text-slate-300">
                    {{ item.quantity_requested }}
                  </td>
                  <td class="py-2.5 text-right font-mono text-slate-700 dark:text-slate-300">
                    {{ formatCurrency(item.estimated_cost) }}
                  </td>
                  <td class="py-2.5 text-right font-mono font-medium text-slate-800 dark:text-slate-100">
                    {{ formatCurrency(item.subtotal) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- LAYER 3 — Totals -->
        <div
          class="grid grid-cols-2 gap-x-6 gap-y-3 border-t border-slate-200 bg-slate-100 px-5 py-4 sm:grid-cols-4 dark:border-[#1E2D3D] dark:bg-[#070D18]"
        >
          <TotalItem label="Subtotal" :value="order.financial_summary.purchase_subtotal" />
          <TotalItem label="IVA (19%)" :value="order.financial_summary.vat" />
          <TotalItem
            label="Descuento"
            :value="order.financial_summary.discount"
            color="green"
            prefix="−"
          />
          <TotalItem
            label="Total"
            :value="order.financial_summary.purchase_total"
            :highlight="true"
          />
        </div>
      </div>
    </Transition>
  </div>
</template>
