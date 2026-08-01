<script setup lang="ts">
import { ref } from 'vue'
import type { EmptyStateSize } from '../emptyState.types'

// SRP: renders the psychology-informed "possible causes" list.
// Supports collapsible mode to reduce cognitive load — user expands only if needed.
// Uses dune-* tokens for AA-compliant contrast (4.5:1 minimum).
defineProps<{
  causes: string[]
  size: EmptyStateSize
  bulletClass: string
  /** When true, causes are collapsed behind a disclosure toggle. */
  collapsible?: boolean
}>()

const isExpanded = ref(false)

const textSizeMap: Record<EmptyStateSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-sm',
}

// Stagger offset (ms) applied on top of the base 350 ms entry delay.
const STAGGER_MS = 100
const BASE_DELAY_MS = 380
</script>

<template>
  <div
    v-if="causes.length"
    v-motion
    :initial="{ opacity: 0 }"
    :enter="{ opacity: 1, transition: { delay: 320 } }"
    class="w-full rounded-xl border border-dune-surface-dark/30 bg-dune-surface/80 px-4 py-3 text-left"
  >
    <!-- Collapsible: show toggle instead of always-expanded list -->
    <template v-if="collapsible">
      <button
        type="button"
        class="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wider text-dune-text-secondary transition hover:text-dune-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dune-primary"
        @click="isExpanded = !isExpanded"
        :aria-expanded="isExpanded"
      >
        <span>Posibles causas</span>
        <svg
          class="h-4 w-4 shrink-0 transition-transform duration-200"
          :class="{ 'rotate-180': isExpanded }"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <Transition
        enter-active-class="transition-all duration-200 ease-out"
        leave-active-class="transition-all duration-150 ease-in"
        enter-from-class="opacity-0 max-h-0"
        leave-to-class="opacity-0 max-h-0"
        enter-to-class="opacity-100 max-h-40"
        leave-from-class="opacity-100 max-h-40"
      >
        <ul v-if="isExpanded" class="mt-2 space-y-1.5 overflow-hidden">
          <li
            v-for="(cause, index) in causes"
            :key="index"
            v-motion
            :initial="{ opacity: 0, x: -8 }"
            :enter="{ opacity: 1, x: 0, transition: { delay: BASE_DELAY_MS + index * STAGGER_MS } }"
            class="flex items-start gap-2 text-dune-text-secondary"
            :class="textSizeMap[size]"
          >
            <!-- Dot bullet in the variant accent color -->
            <span
              class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
              :class="bulletClass"
              aria-hidden="true"
            />
            <span>{{ cause }}</span>
          </li>
        </ul>
      </Transition>
    </template>

    <!-- Non-collapsible: always show the list -->
    <template v-else>
      <p class="mb-2 text-xs font-semibold uppercase tracking-wider text-dune-text-secondary">
        Posibles causas
      </p>

      <ul class="space-y-1.5">
        <li
          v-for="(cause, index) in causes"
          :key="index"
          v-motion
          :initial="{ opacity: 0, x: -8 }"
          :enter="{ opacity: 1, x: 0, transition: { delay: BASE_DELAY_MS + index * STAGGER_MS } }"
          class="flex items-start gap-2 text-dune-text-secondary"
          :class="textSizeMap[size]"
        >
          <!-- Dot bullet in the variant accent color -->
          <span
            class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
            :class="bulletClass"
            aria-hidden="true"
          />
          <span>{{ cause }}</span>
        </li>
      </ul>
    </template>
  </div>
</template>
