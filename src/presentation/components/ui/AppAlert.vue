<script setup lang="ts">
import { computed } from 'vue'
import type { AppAlertVariant } from './appAlert.types'

const props = withDefaults(
  defineProps<{
    variant?: AppAlertVariant
    headline: string
    body: string
    actionLabel?: string
    secondaryActionLabel?: string
    dismissible?: boolean
  }>(),
  {
    variant: 'error',
    dismissible: true,
  },
)

const emit = defineEmits<{
  action: []
  'secondary-action': []
  dismiss: []
}>()

const variantStyles = computed(() => {
  const styles: Record<
    AppAlertVariant,
    { container: string; icon: string; headline: string; body: string; action: string }
  > = {
    error: {
      container: 'border-red-400/25 bg-red-500/10',
      icon: 'text-red-300',
      headline: 'text-red-100',
      body: 'text-red-200/85',
      action: 'text-red-100 hover:text-white',
    },
    warning: {
      container: 'border-gold/25 bg-gold/10',
      icon: 'text-gold',
      headline: 'text-amber-100',
      body: 'text-amber-100/80',
      action: 'text-gold hover:text-amber-100',
    },
    info: {
      container: 'border-nebula-blue/25 bg-nebula-blue/10',
      icon: 'text-nebula-blue',
      headline: 'text-sky-100',
      body: 'text-sky-100/80',
      action: 'text-nebula-blue hover:text-sky-100',
    },
    success: {
      container: 'border-emerald-400/25 bg-emerald-500/10',
      icon: 'text-emerald-300',
      headline: 'text-emerald-100',
      body: 'text-emerald-100/80',
      action: 'text-emerald-200 hover:text-white',
    },
  }

  return styles[props.variant]
})
</script>

<template>
  <div
    v-motion
    role="alert"
    aria-live="polite"
    :initial="{ opacity: 0, y: -8 }"
    :enter="{ opacity: 1, y: 0 }"
    class="flex gap-3 rounded-xl border px-4 py-3"
    :class="variantStyles.container"
  >
    <div class="mt-0.5 shrink-0" :class="variantStyles.icon" aria-hidden="true">
      <svg
        v-if="variant === 'error'"
        class="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
      >
        <circle cx="12" cy="12" r="9" />
        <path stroke-linecap="round" d="M12 8v5" />
        <circle cx="12" cy="16.5" r="0.75" fill="currentColor" stroke="none" />
      </svg>

      <svg
        v-else-if="variant === 'warning'"
        class="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M12 4.5 3.5 19h17L12 4.5z"
        />
        <path stroke-linecap="round" d="M12 10v4" />
        <circle cx="12" cy="17" r="0.75" fill="currentColor" stroke="none" />
      </svg>

      <svg
        v-else-if="variant === 'info'"
        class="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
      >
        <circle cx="12" cy="12" r="9" />
        <path stroke-linecap="round" d="M12 11v5" />
        <circle cx="12" cy="8" r="0.75" fill="currentColor" stroke="none" />
      </svg>

      <svg
        v-else
        class="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
      >
        <circle cx="12" cy="12" r="9" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M8.5 12.5 11 15l5.5-6" />
      </svg>
    </div>

    <div class="min-w-0 flex-1">
      <p class="text-sm font-semibold leading-snug" :class="variantStyles.headline">
        {{ headline }}
      </p>
      <p
        class="mt-1 line-clamp-2 text-sm leading-snug"
        :class="variantStyles.body"
      >
        {{ body }}
      </p>

      <div
        v-if="actionLabel || secondaryActionLabel"
        class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1"
      >
        <button
          v-if="actionLabel"
          type="button"
          class="text-sm font-semibold underline-offset-4 transition hover:underline"
          :class="variantStyles.action"
          @click="emit('action')"
        >
          {{ actionLabel }}
        </button>
        <button
          v-if="secondaryActionLabel"
          type="button"
          class="text-sm font-medium text-white/55 underline-offset-4 transition hover:text-white/80 hover:underline"
          @click="emit('secondary-action')"
        >
          {{ secondaryActionLabel }}
        </button>
      </div>
    </div>

    <button
      v-if="dismissible"
      type="button"
      class="shrink-0 rounded-lg p-1 text-white/35 transition hover:bg-white/10 hover:text-white/70"
      aria-label="Cerrar mensaje"
      @click="emit('dismiss')"
    >
      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" d="M6 6l12 12M18 6L6 18" />
      </svg>
    </button>
  </div>
</template>
