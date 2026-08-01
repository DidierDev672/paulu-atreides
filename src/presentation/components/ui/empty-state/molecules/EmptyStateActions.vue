<script setup lang="ts">
import type { EmptyStateSize } from '../emptyState.types'

// Molecule: composes a primary CTA button, an optional secondary action,
// and an optional destructive action with danger styling.
// Emits replace direct handler coupling — parent decides what happens on click (DIP).
const props = withDefaults(
  defineProps<{
    actionLabel?: string
    secondaryActionLabel?: string
    destructiveActionLabel?: string
    size?: EmptyStateSize
  }>(),
  { size: 'md' },
)

const emit = defineEmits<{
  action: []
  'secondary-action': []
  'destructive-action': []
}>()

const btnSizeMap: Record<EmptyStateSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-sm',
}
</script>

<template>
  <div
    v-if="actionLabel || secondaryActionLabel || destructiveActionLabel"
    v-motion
    :initial="{ opacity: 0, y: 8 }"
    :enter="{ opacity: 1, y: 0, transition: { delay: 620 } }"
    class="flex flex-wrap items-center justify-center gap-3"
  >
    <!-- Primary action: recommended next step -->
    <button
      v-if="actionLabel"
      type="button"
      class="rounded-lg bg-dune-primary font-semibold text-dune-text-on-primary transition hover:bg-dune-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dune-primary"
      :class="btnSizeMap[size]"
      @click="emit('action')"
    >
      {{ actionLabel }}
    </button>

    <!-- Secondary action: neutral alternative -->
    <button
      v-if="secondaryActionLabel"
      type="button"
      class="rounded-lg border border-dune-surface-dark/40 font-medium text-dune-text-secondary transition hover:border-dune-primary/40 hover:text-dune-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dune-primary"
      :class="btnSizeMap[size]"
      @click="emit('secondary-action')"
    >
      {{ secondaryActionLabel }}
    </button>

    <!-- Destructive action: danger styling, visually separated -->
    <button
      v-if="destructiveActionLabel"
      type="button"
      class="rounded-lg border border-dune-status-danger/40 font-medium text-dune-status-danger transition hover:border-dune-status-danger hover:bg-dune-status-danger/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dune-status-danger"
      :class="btnSizeMap[size]"
      @click="emit('destructive-action')"
    >
      {{ destructiveActionLabel }}
    </button>
  </div>
</template>
