<script setup lang="ts">
import type { StockMovement } from '../../domain/StockMovement'
import type { StockProduct } from '../../domain/StockProduct'
import StockMovementTableRow from '../molecules/StockMovementTableRow.vue'

const props = defineProps<{
  movements: StockMovement[]
  productsById?: Record<string, StockProduct>
  orderLabelsById?: Record<string, string>
  deleting?: boolean
}>()

function orderLabelFor(referenceId: string): string {
  if (!referenceId) return '—'
  return props.orderLabelsById?.[referenceId] || referenceId
}

defineEmits<{
  view: [movement: StockMovement]
  remove: [movement: StockMovement]
}>()
</script>

<template>
  <div
    v-motion
    :initial="{ opacity: 0, y: 8 }"
    :enter="{ opacity: 1, y: 0, transition: { duration: 200 } }"
    class="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
  >
    <div class="overflow-x-auto">
      <table class="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr class="border-b border-slate-200 bg-slate-50/80 text-[10px] font-medium uppercase tracking-wider text-black dark:border-slate-800 dark:bg-slate-800/50 dark:text-white">
            <th class="px-4 py-3">Productos</th>
            <th class="px-4 py-3">Tipo de movimiento</th>
            <th class="px-4 py-3">Referencia a la entrada</th>
            <th class="px-4 py-3 text-right">Unidad de costo</th>
            <th class="px-4 py-3 text-right">Cantidad</th>
            <th class="px-4 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <StockMovementTableRow
            v-for="(movement, index) in movements"
            :key="movement.id"
            :movement="movement"
            :product="productsById?.[movement.product_id] ?? null"
            :order-reference-label="orderLabelFor(movement.reference_id)"
            :deleting="deleting"
            :index="index"
            @view="$emit('view', movement)"
            @remove="$emit('remove', movement)"
          />
        </tbody>
      </table>
    </div>
  </div>
</template>
