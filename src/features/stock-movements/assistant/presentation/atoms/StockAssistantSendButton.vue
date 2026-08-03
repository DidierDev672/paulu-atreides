<script setup lang="ts">
defineProps<{
  disabled?: boolean
}>()
</script>

<template>
  <button
    type="submit"
    class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-stellar-500 text-white transition hover:bg-stellar-400 disabled:cursor-not-allowed disabled:opacity-50"
    :disabled="disabled"
    aria-label="Enviar mensaje"
  >
    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  </button>
</template>
