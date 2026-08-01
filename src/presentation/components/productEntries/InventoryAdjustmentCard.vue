<script setup lang="ts">
import type { ProductEntryResponse } from '@/application/services/productEntryService'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    entry: ProductEntryResponse
    tipoLabel: string
    expanded?: boolean
  }>(),
  {
    expanded: false,
  },
)

const emit = defineEmits<{
  toggle: []
  delete: []
}>()

const uniqueUnits = computed(() => {
  const units = [...new Set(props.entry.details.map((i) => i.unit).filter(Boolean))]
  return units.length ? units.join(' · ') : '—'
})

const averageMargin = computed(() => {
  const items = props.entry.details
  if (!items.length) return '0.0'
  const avg = items.reduce((sum, i) => sum + (i.profit_margin || 0), 0) / items.length
  return avg.toFixed(1)
})

const typeBadgeClasses = computed(() => {
  const map: Record<string, string> = {
    Purchase: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-[#172554] dark:text-blue-300 dark:border-[#1E40AF]',
    Return: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-[#78350F] dark:text-amber-300 dark:border-[#92400E]',
    Donation: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-[#2E1065] dark:text-violet-300 dark:border-[#5B21B6]',
    'Inventory Adjustment':
      'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-[#172554] dark:text-blue-300 dark:border-[#1E40AF]',
    'Internal Production':
      'bg-green-50 text-green-700 border-green-200 dark:bg-[#14532D] dark:text-green-300 dark:border-[#166534]',
  }
  return (
    map[props.entry.movement_type] ??
    'bg-slate-100 text-slate-600 border-slate-200 dark:bg-[#172554] dark:text-blue-300 dark:border-[#1E40AF]'
  )
})

function marginBarWidth(margen: number): string {
  return `${Math.min((margen || 0) * 5, 100)}%`
}
</script>

<template>
  <div
    v-motion
    :initial="{ opacity: 0, y: 6 }"
    :enter="{ opacity: 1, y: 0, transition: { duration: 180, ease: 'easeOut' } }"
    class="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-[#1E2D3D] dark:bg-[#0F1623]"
  >
    <!-- LAYER 1 — Header -->
    <div
      class="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3 dark:border-[#1E2D3D] dark:bg-[#161E2E]"
    >
      <div class="min-w-0 flex-1 cursor-pointer" @click="emit('toggle')">
        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-2">
            <span
              :class="[
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium',
                typeBadgeClasses,
              ]"
            >
              <span class="text-[10px]" aria-hidden="true">⟳</span>
              {{ tipoLabel }}
            </span>
          </div>
          <div class="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
            <span>{{ formatDate(entry.registered_date) }}</span>
            <span class="h-[3px] w-[3px] rounded-full bg-slate-400 dark:bg-slate-600" />
            <span>{{ entry.details.length }} producto{{ entry.details.length !== 1 ? 's' : '' }}</span>
            <span class="h-[3px] w-[3px] rounded-full bg-slate-400 dark:bg-slate-600" />
            <span class="font-mono text-[12px] font-medium text-slate-600 dark:text-slate-300">
              {{ formatCurrency(entry.financial_summary.purchase_total) }}
            </span>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-1.5">
        <button
          type="button"
          class="flex h-[30px] w-[30px] items-center justify-center rounded-md border border-red-300 text-red-500 transition-colors hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
          aria-label="Eliminar ajuste"
          @click.stop="emit('delete')"
        >
          <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
        <button
          type="button"
          class="flex h-[30px] w-[30px] items-center justify-center rounded-md border border-slate-300 text-slate-500 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"
          :aria-label="expanded ? 'Colapsar' : 'Expandir'"
          @click.stop="emit('toggle')"
        >
          <svg
            class="h-3.5 w-3.5 transition-transform duration-200 ease-out"
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

    <!-- LAYER 2 — Summary pills (visible even when collapsed) -->
    <div
      class="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-100 px-5 py-2 dark:border-[#1E2D3D] dark:bg-[#111827]"
    >
      <span
        class="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-medium text-sky-700 dark:border-[#1E40AF] dark:bg-[#172554] dark:text-blue-300"
      >
        {{ entry.details.length }} producto{{ entry.details.length !== 1 ? 's' : '' }}
      </span>
      <span
        class="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-500 dark:border-[#334155] dark:bg-[#1E293B] dark:text-slate-400"
      >
        {{ uniqueUnits }}
      </span>
      <span
        class="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-[11px] font-medium text-green-700 dark:border-[#166534] dark:bg-[#14532D] dark:text-green-300"
      >
        Margen prom. {{ averageMargin }}%
      </span>
    </div>

    <!-- LAYER 3 — Table -->
    <Transition
      enter-active-class="transition-opacity duration-150 ease-out"
      leave-active-class="transition-opacity duration-150 ease-in"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="expanded" class="bg-white px-5 pb-4 pt-3 dark:bg-[#0F1623]">
        <div class="overflow-x-auto">
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
                  class="w-16 pb-2 text-right text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-600"
                >
                  Unidad
                </th>
                <th
                  class="w-14 pb-2 text-right text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-600"
                >
                  Cant.
                </th>
                <th
                  class="w-24 pb-2 text-right text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-600"
                >
                  Costo unit.
                </th>
                <th
                  class="w-24 pb-2 text-right text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-600"
                >
                  Subtotal
                </th>
                <th
                  class="w-20 pb-2 text-right text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-600"
                >
                  Margen
                </th>
                <th
                  class="w-24 pb-2 text-right text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-600"
                >
                  Precio venta
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-[#111827]">
              <tr
                v-for="item in entry.details"
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
                  {{ item.quantity }}
                </td>
                <td class="py-2.5 text-right font-mono text-slate-700 dark:text-slate-300">
                  {{ formatCurrency(item.unit_cost) }}
                </td>
                <td class="py-2.5 text-right font-mono text-slate-700 dark:text-slate-300">
                  {{ formatCurrency(item.subtotal) }}
                </td>
                <td class="py-2.5">
                  <div class="flex items-center justify-end gap-1.5">
                    <div class="h-1 w-8 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                      <div
                        class="h-full rounded-full"
                        :style="{
                          width: marginBarWidth(item.profit_margin),
                          background: 'linear-gradient(90deg, #16A34A, #4ADE80)',
                        }"
                      />
                    </div>
                    <span class="font-mono text-[11px] text-green-600 dark:text-green-400">
                      {{ Number(item.profit_margin || 0).toFixed(1) }}%
                    </span>
                  </div>
                </td>
                <td class="py-2.5 text-right">
                  <span
                    class="inline-flex items-center justify-center rounded-md border border-green-200 bg-green-50 px-2 py-0.5 font-mono text-[11px] font-semibold text-green-700 dark:border-[#166534] dark:bg-[#14532D] dark:text-green-300"
                  >
                    {{ formatCurrency(item.suggested_selling_price) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          v-if="entry.observations"
          class="mt-3 border-t border-slate-200 pt-3 text-[11px] text-slate-500 dark:border-[#1E2D3D]"
        >
          <span class="font-medium">Observaciones:</span> {{ entry.observations }}
        </div>
      </div>
    </Transition>
  </div>
</template>
