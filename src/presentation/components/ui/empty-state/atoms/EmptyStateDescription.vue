<script setup lang="ts">
import type { EmptyStateSize } from '../emptyState.types'

// SRP: renders only the supporting description paragraph.
defineProps<{
  text: string
  size: EmptyStateSize
}>()

const textSizeMap: Record<EmptyStateSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
}
</script>

<template>
  <p
    v-motion
    :initial="{ opacity: 0, y: 8 }"
    :enter="{ opacity: 1, y: 0, transition: { delay: 220 } }"
    class="max-w-xs leading-relaxed text-dune-text-secondary sm:max-w-sm"
    :class="textSizeMap[size]"
  >
    {{ text }}
  </p>
</template>
