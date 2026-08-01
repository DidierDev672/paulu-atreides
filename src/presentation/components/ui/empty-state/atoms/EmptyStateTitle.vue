<script setup lang="ts">
import type { EmptyStateSize } from '../emptyState.types'

// SRP: renders only the primary heading of the empty state.
defineProps<{
  text: string
  size: EmptyStateSize
  colorClass: string
}>()

const textSizeMap: Record<EmptyStateSize, string> = {
  sm: 'text-sm font-semibold',
  md: 'text-base font-semibold',
  lg: 'text-xl font-bold',
}
</script>

<template>
  <h3
    v-motion
    :initial="{ opacity: 0, y: 8 }"
    :enter="{ opacity: 1, y: 0, transition: { delay: 120 } }"
    class="leading-snug tracking-tight"
    :class="[textSizeMap[size], colorClass]"
  >
    {{ text }}
  </h3>
</template>
