<script setup lang="ts">
const emit = defineEmits<{
  register: []
  dismiss: []
}>()
</script>

<template>
  <Teleport to="body">
    <div
      v-motion
      :initial="{ opacity: 0 }"
      :enter="{ opacity: 1, transition: { duration: 300 } }"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
      @click.self="emit('dismiss')"
    >
      <div
        v-motion
        :initial="{ opacity: 0, scale: 0.92, y: 24 }"
        :enter="{ opacity: 1, scale: 1, y: 0, transition: { duration: 400, ease: 'easeOut' } }"
        class="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#0d0a28] shadow-2xl"
      >
        <div class="pointer-events-none absolute -left-20 -top-20 h-40 w-40 rounded-full bg-stellar-600/20 blur-3xl" />
        <div class="pointer-events-none absolute -bottom-16 -right-16 h-36 w-36 rounded-full bg-cosmic-500/15 blur-3xl" />

        <div class="relative px-8 pb-2 pt-10 text-center">
          <div class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-[0_12px_32px_rgba(245,158,11,0.35)]">
            <svg class="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>

          <h2 class="font-display text-2xl font-bold text-white">
            Empresa requerida
          </h2>
          <p class="mt-3 text-sm leading-relaxed text-white/50">
            Para registrar entradas de productos necesitamos que primero nos
            cuentes sobre tu negocio.
          </p>
        </div>

        <div class="relative space-y-3 px-8 py-5">
          <div class="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
            <div class="flex items-start gap-3">
              <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-stellar-500/15">
                <svg class="h-4 w-4 text-stellar-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="text-sm font-semibold text-white/80">Sin empresa no puedes continuar</p>
                <p class="mt-0.5 text-xs text-white/35">
                  Todas las entradas de producto se asocian a una empresa. Es el
                  primer paso para empezar a operar.
                </p>
              </div>
            </div>
          </div>

          <div class="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
            <div class="flex items-start gap-3">
              <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/15">
                <svg class="h-4 w-4 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <p class="text-sm font-semibold text-white/80">Control total de tu inventario</p>
                <p class="mt-0.5 text-xs text-white/35">
                  Empieza a registrar tus productos, proveedores y movimientos
                  en un solo lugar.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="relative px-8 pb-6">
          <p class="text-center text-xs italic leading-relaxed text-white/30">
            "M&aacute;s de <span class="font-semibold text-white/50">500 empresas</span> ya gestionan su
            inventario con Paulu.
            <span class="text-white/40">&iquest;Y t&uacute;?</span>"
          </p>
        </div>

        <div class="relative flex gap-3 border-t border-white/10 px-8 py-5">
          <button
            type="button"
            class="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-white/50 transition hover:border-white/20 hover:text-white/70"
            @click="emit('dismiss')"
          >
            Ahora no
          </button>
          <button
            type="button"
            class="flex-1 rounded-xl bg-gradient-to-r from-stellar-500 to-cosmic-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:from-stellar-400 hover:to-cosmic-400"
            @click="emit('register')"
          >
            Registrar empresa
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
