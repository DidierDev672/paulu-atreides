<script setup lang="ts">
const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
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
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        </div>
        <h3 class="mb-2 text-center text-xl font-bold text-slate-900 dark:text-white">
          Faltan productos en la orden
        </h3>
        <p class="mb-1 text-center text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          Para guardar la orden y registrar el inventario necesitamos al menos un producto con su
          código (Product ID). No pasa nada: solo agrega los productos desde «Agregar producto» y
          vuelve a intentarlo.
        </p>
        <p class="mb-6 text-center text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          Tu progreso en el resto del formulario se mantiene; no has perdido lo que ya completaste.
        </p>
        <div class="flex justify-center">
          <button
            type="button"
            class="rounded-xl bg-stellar-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-stellar-600"
            @click="emit('close')"
          >
            Entendido, voy a agregar productos
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
