<script setup lang="ts">
defineProps<{
  message: string
}>()

defineEmits<{
  retry: []
}>()
</script>

<template>
  <div
    v-motion
    :initial="{ opacity: 0, y: 8 }"
    :enter="{ opacity: 1, y: 0, transition: { duration: 200 } }"
    class="rounded-2xl border border-amber-200 bg-amber-50/80 p-5 dark:border-amber-900/50 dark:bg-amber-950/30"
  >
    <div class="flex gap-3">
      <div
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
        aria-hidden="true"
      >
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <div class="min-w-0 flex-1">
        <h3 class="text-sm font-semibold text-amber-900 dark:text-amber-200">
          Un momento… no pudimos cargar el listado
        </h3>
        <p class="mt-1.5 text-sm leading-relaxed text-amber-800/90 dark:text-amber-200/80">
          {{ message }}
        </p>
        <button
          type="button"
          class="mt-4 rounded-xl border border-amber-300 bg-white px-4 py-2 text-sm font-medium text-amber-900 transition-colors hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100 dark:hover:bg-amber-900"
          @click="$emit('retry')"
        >
          Reintentar
        </button>
      </div>
    </div>
  </div>
</template>
