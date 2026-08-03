<script setup lang="ts">
defineProps<{
  disabled?: boolean
}>()

defineEmits<{
  click: []
}>()
</script>

<template>
  <button
    type="button"
    class="inline-flex items-center justify-center gap-1.5 rounded-xl border border-stellar-500/30 bg-stellar-500/10 px-4 py-2 text-sm font-medium text-stellar-700 transition-colors hover:bg-stellar-500/20 disabled:opacity-50 dark:text-stellar-300"
    :disabled="disabled"
    @click="$emit('click')"
  >
    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
      />
    </svg>
    Asistente movimientos
  </button>
</template>
