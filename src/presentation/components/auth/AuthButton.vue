<script setup lang="ts">
defineProps<{
  type?: 'button' | 'submit'
  loading?: boolean
  variant?: 'primary' | 'ghost'
}>()
</script>

<template>
  <button
    :type="type ?? 'button'"
    :disabled="loading"
    class="relative w-full overflow-hidden rounded-2xl px-6 py-3.5 text-base font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
    :class="
      variant === 'ghost'
        ? 'border border-white/15 bg-white/5 text-white/90 hover:bg-white/10'
        : 'bg-gradient-to-r from-stellar-500 via-cosmic-500 to-nebula-pink text-white shadow-[0_12px_32px_rgba(124,58,237,0.45)] hover:brightness-110'
    "
  >
    <span v-if="loading" class="inline-flex items-center gap-2">
      <span
        class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
      />
      Procesando...
    </span>
    <span v-else>
      <slot />
    </span>
  </button>
</template>
