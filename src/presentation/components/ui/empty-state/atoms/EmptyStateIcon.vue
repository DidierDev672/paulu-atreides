<script setup lang="ts">
import type { EmptyStateIconType, EmptyStateSize } from '../emptyState.types'

// SRP: this atom is only responsible for rendering the correct icon
// within a sized, colored circle container.
const props = defineProps<{
  iconType: EmptyStateIconType
  size: EmptyStateSize
  colorClass: string
  bgClass: string
}>()

const containerSizeMap: Record<EmptyStateSize, string> = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
}

const iconSizeMap: Record<EmptyStateSize, string> = {
  sm: 'w-7 h-7',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
}
</script>

<template>
  <div
    v-motion
    :initial="{ opacity: 0, scale: 0.6 }"
    :enter="{ opacity: 1, scale: 1, transition: { duration: 400 } }"
    class="flex shrink-0 items-center justify-center rounded-full"
    :class="[containerSizeMap[size], bgClass]"
    aria-hidden="true"
  >
    <!-- Empty / no data yet -->
    <svg
      v-if="iconType === 'inbox'"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      :class="[iconSizeMap[size], colorClass]"
    >
      <path d="M22 12h-6l-2 3H10l-2-3H2" />
      <path
        d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"
      />
    </svg>

    <!-- Search returned zero results -->
    <svg
      v-else-if="iconType === 'search'"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      :class="[iconSizeMap[size], colorClass]"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
      <path d="M8.5 11h5" />
      <path d="M11 8.5v5" stroke-dasharray="1.5 1.5" />
    </svg>

    <!-- Generic error / server failure -->
    <svg
      v-else-if="iconType === 'alert-circle'"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      :class="[iconSizeMap[size], colorClass]"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4" />
      <circle cx="12" cy="16.5" r="0.75" fill="currentColor" stroke="none" />
    </svg>

    <!-- Network / connectivity error -->
    <svg
      v-else-if="iconType === 'wifi-off'"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      :class="[iconSizeMap[size], colorClass]"
    >
      <line x1="2" y1="2" x2="22" y2="22" />
      <path d="M16.72 11.06A10.94 10.94 0 0119 12.55" />
      <path d="M5 12.55a10.94 10.94 0 015.17-2.39" />
      <path d="M10.71 5.05A16 16 0 0122.56 9" />
      <path d="M1.42 9a15.91 15.91 0 014.7-2.88" />
      <path d="M8.53 16.11a6 6 0 016.95 0" />
      <circle cx="12" cy="20" r="1" fill="currentColor" stroke="none" />
    </svg>

    <!-- Forbidden / access denied -->
    <svg
      v-else
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      :class="[iconSizeMap[size], colorClass]"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  </div>
</template>
