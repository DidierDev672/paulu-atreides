<script setup lang="ts">
import { useStaggerMotion } from '@/presentation/composables/useStaggerMotion'
import type { StockMovement } from '../../domain/StockMovement'
import type { StockProduct } from '../../domain/StockProduct'
import MovementTypePill from '../atoms/MovementTypePill.vue'
import StockActionIconButton from '../atoms/StockActionIconButton.vue'
import StockCurrencyText from '../atoms/StockCurrencyText.vue'

const props = defineProps<{
  movement: StockMovement
  product?: StockProduct | null
  orderReferenceLabel?: string
  deleting?: boolean
  /** Row index for staggered cascade enter. */
  index?: number
}>()

defineEmits<{
  view: []
  remove: []
}>()

const { initial, enter } = useStaggerMotion(
  () => props.index ?? 0,
  {
    baseDelayMs: 40,
    stepMs: 55,
    durationMs: 320,
    y: 8,
  },
)
</script>

<template>
  <tr
    v-motion
    :initial="initial"
    :enter="enter"
    class="border-b border-slate-100 transition-colors hover:bg-slate-50/80 dark:border-slate-800 dark:hover:bg-slate-800/40"
  >
    <td class="px-4 py-3">
      <template v-if="product">
        <p class="text-sm font-medium text-slate-800 dark:text-slate-100">{{ product.name }}</p>
        <p class="mt-0.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">
          {{ product.product_code || movement.product_id }}
        </p>
      </template>
      <span v-else class="font-mono text-[12px] text-slate-600 dark:text-slate-300">
        {{ movement.product_id }}
      </span>
    </td>
    <td class="px-4 py-3">
      <MovementTypePill :type="movement.movement_type" />
    </td>
    <td class="px-4 py-3 text-[12px] text-slate-500 dark:text-slate-400">
      {{ orderReferenceLabel || movement.reference_id || '—' }}
    </td>
    <td class="px-4 py-3 text-right">
      <StockCurrencyText :value="movement.unit_cost" />
    </td>
    <td class="px-4 py-3 text-right font-mono text-[12px] text-slate-700 dark:text-slate-200">
      {{ movement.quantity }}
    </td>
    <td class="px-4 py-3">
      <div class="flex items-center justify-end gap-1.5">
        <StockActionIconButton label="Ver detalle" @click="$emit('view')">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        </StockActionIconButton>
        <StockActionIconButton label="Eliminar" variant="danger" :disabled="deleting" @click="$emit('remove')">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </StockActionIconButton>
      </div>
    </td>
  </tr>
</template>
