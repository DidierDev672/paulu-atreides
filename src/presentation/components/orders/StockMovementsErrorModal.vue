<script setup lang="ts">
const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
      @click.self="emit('close')"
    >
      <div
        v-motion
        :initial="{ opacity: 0, scale: 0.95, y: 16 }"
        :enter="{ opacity: 1, scale: 1, y: 0, transition: { duration: 350 } }"
        class="relative w-full max-w-md rounded-2xl border bg-white p-8 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
      >
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-dune-surface dark:bg-dune-status-warning/20">
          <svg
            class="h-8 w-8 text-dune-status-warning dark:text-dune-status-warning"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 class="mb-2 text-center text-xl font-bold text-slate-900 dark:text-white">
          Un detalle con el inventario
        </h3>
        <p class="mb-1 text-center text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          La orden se guardó bien. Solo hubo un tropiezo al registrar los movimientos de stock en
          segundo plano: a veces la conexión o el servidor necesitan un respiro. No es algo que
          hayas hecho mal.
        </p>
        <p class="mb-6 text-center text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          Puedes seguir con el flujo normal. Si quieres, más adelante puedes revisar o reintentar
          los movimientos de stock desde el módulo de inventario.
        </p>
        <div class="flex justify-center">
          <button
            type="button"
            class="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            @click="emit('close')"
          >
            Continuar sin problema
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
