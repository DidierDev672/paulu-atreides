<script setup lang="ts">
const emit = defineEmits<{ confirm: [automate: boolean]; close: [] }>()
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm" @click.self="emit('close')">
      <div v-motion :initial="{ opacity: 0, scale: 0.95, y: 16 }" :enter="{ opacity: 1, scale: 1, y: 0, transition: { duration: 350 } }" class="relative w-full max-w-md rounded-2xl border bg-white p-8 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-stellar-100 dark:bg-stellar-500/20">
          <svg class="h-8 w-8 text-stellar-600 dark:text-stellar-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h3 class="mb-2 text-center text-xl font-bold text-slate-900 dark:text-white">¿Automatizar despacho?</h3>
        <p class="mb-1 text-center text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          La orden se ha registrado correctamente. ¿Deseas crear un despacho automático con los productos de esta orden?
        </p>
        <p class="mb-6 text-center text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          El despacho agilizará la salida de inventario y mantendrá tus registros sincronizados al instante.
        </p>
        <div class="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button type="button" class="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" @click="emit('confirm', false)">
            No, solo la orden
          </button>
          <button type="button" class="rounded-xl bg-gradient-to-r from-stellar-500 to-cosmic-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-stellar-400 hover:to-cosmic-400" @click="emit('confirm', true)">
            Sí, crear despacho
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
