<script setup lang="ts">
import type { ProductResponse } from '@/application/services/productService'

defineProps<{
  product: ProductResponse
}>()

const emit = defineEmits<{
  cancel: []
  confirm: []
}>()
</script>

<template>
  <Teleport to="body">
    <div
      v-motion
      :initial="{ opacity: 0 }"
      :enter="{ opacity: 1, transition: { duration: 300 } }"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
    >
      <div
        v-motion
        :initial="{ opacity: 0, scale: 0.92, y: 24 }"
        :enter="{ opacity: 1, scale: 1, y: 0, transition: { duration: 400, ease: 'easeOut' } }"
        class="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0d0a28] shadow-2xl"
      >
        <div class="pointer-events-none absolute -left-20 -top-20 h-40 w-40 rounded-full bg-red-600/20 blur-3xl" />
        <div class="pointer-events-none absolute -bottom-16 -right-16 h-36 w-36 rounded-full bg-rose-500/15 blur-3xl" />

        <div class="relative px-8 pb-2 pt-10 text-center">
          <div class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 shadow-[0_12px_32px_rgba(239,68,68,0.35)]">
            <svg class="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>

          <h2 class="font-display text-2xl font-bold text-white">
            ¿Eliminar producto?
          </h2>

          <div class="mt-4 rounded-xl bg-white/[0.04] px-4 py-3">
            <p class="text-sm font-semibold text-white">{{ product.name }}</p>
            <p class="mt-0.5 text-xs text-white/40">Código: {{ product.product_code }}</p>
          </div>
        </div>

        <div class="relative space-y-4 px-8 py-5">
          <div class="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
            <div class="flex gap-2">
              <svg class="mt-0.5 h-4 w-4 shrink-0 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div class="text-xs text-amber-200/80 leading-relaxed">
                <p class="font-medium text-amber-200">Consecuencias de eliminar:</p>
                <p class="mt-1">
                  Este producto podría estar vinculado a entradas de inventario, movimientos de stock
                  y registros de compra. Eliminarlo de forma permanente podría generar
                  inconsistencias en informes financieros y el historial del inventario.
                </p>
                <p class="mt-2">
                  Si el producto ya no se comercializa, considera desactivarlo en lugar de
                  eliminarlo para mantener la integridad de los datos históricos.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="relative flex gap-3 border-t border-white/10 px-8 py-5">
          <button
            type="button"
            class="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-white/50 transition hover:border-white/20 hover:text-white/70"
            @click="emit('cancel')"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="flex-1 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:from-red-400 hover:to-rose-500"
            @click="emit('confirm')"
          >
            Eliminar de todas formas
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
