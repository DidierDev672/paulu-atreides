<script setup lang="ts">
withDefaults(
  defineProps<{
    loading?: boolean
    disabled?: boolean
    title?: string
    tooltip?: string
  }>(),
  {
    title: 'Importar desde Word o Excel',
    tooltip: 'Word / Excel → Llama 3',
  },
)

const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <button
    type="button"
    class="group fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-stellar-500 to-cosmic-500 text-white shadow-lg shadow-stellar-500/30 transition hover:scale-105 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stellar-400 disabled:cursor-not-allowed disabled:opacity-60 sm:bottom-8 sm:right-8"
    :disabled="disabled || loading"
    :aria-busy="loading"
    :title="title"
    :aria-label="title"
    @click="emit('click')"
  >
    <svg
      v-if="loading"
      class="h-6 w-6 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
    <svg
      v-else
      class="h-6 w-6 transition group-hover:scale-110"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      aria-hidden="true"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 16V4m0 0l-4 4m4-4l4 4" />
      <path stroke-linecap="round" stroke-linejoin="round" d="M4 20h16" />
    </svg>

    <span
      class="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-md transition group-hover:opacity-100 sm:block"
    >
      {{ tooltip }}
    </span>
  </button>
</template>
