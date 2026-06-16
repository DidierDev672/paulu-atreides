<script setup lang="ts">
defineProps<{
  userName: string
}>()

const emit = defineEmits<{
  proceed: []
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
    >
      <div
        v-motion
        :initial="{ opacity: 0, scale: 0.92, y: 24 }"
        :enter="{ opacity: 1, scale: 1, y: 0, transition: { duration: 400, ease: 'easeOut' } }"
        class="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#0d0a28] shadow-2xl"
      >
        <!-- Decorative glow -->
        <div class="pointer-events-none absolute -left-20 -top-20 h-40 w-40 rounded-full bg-stellar-600/20 blur-3xl" />
        <div class="pointer-events-none absolute -bottom-16 -right-16 h-36 w-36 rounded-full bg-cosmic-500/15 blur-3xl" />

        <!-- Header -->
        <div class="relative px-8 pb-2 pt-10 text-center">
          <div class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-stellar-500 to-cosmic-600 shadow-[0_12px_32px_rgba(99,102,241,0.35)]">
            <svg class="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>

          <h2 class="font-display text-2xl font-bold text-white">
            {{ userName }}, completa el perfil de tu empresa
          </h2>
          <p class="mt-3 text-sm leading-relaxed text-white/50">
            Registra los datos de tu negocio y desbloquea todas las herramientas
            que <span class="font-semibold text-white/70">Paulu</span> tiene para ti.
          </p>
        </div>

        <!-- Benefits cards -->
        <div class="relative grid grid-cols-2 gap-3 px-8 py-5">
          <div class="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 text-center">
            <div class="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-stellar-500/15">
              <svg class="h-5 w-5 text-stellar-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p class="text-xs font-semibold text-white/80">Confianza</p>
            <p class="mt-0.5 text-[11px] text-white/35">Perfil verificado ante tus clientes</p>
          </div>

          <div class="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 text-center">
            <div class="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15">
              <svg class="h-5 w-5 text-emerald-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p class="text-xs font-semibold text-white/80">Organización</p>
            <p class="mt-0.5 text-[11px] text-white/35">Todo tu negocio en un solo lugar</p>
          </div>

          <div class="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 text-center">
            <div class="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-cosmic-500/15">
              <svg class="h-5 w-5 text-cosmic-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-5m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <p class="text-xs font-semibold text-white/80">Credibilidad</p>
            <p class="mt-0.5 text-[11px] text-white/35">Respaldado con datos fiscales reales</p>
          </div>

          <div class="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 text-center">
            <div class="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-gold/15">
              <svg class="h-5 w-5 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p class="text-xs font-semibold text-white/80">Control</p>
            <p class="mt-0.5 text-[11px] text-white/35">Gestión financiera y tributaria</p>
          </div>
        </div>

        <!-- Persuasive message -->
        <div class="relative px-8 pb-6">
          <p class="text-center text-xs italic leading-relaxed text-white/30">
            "Más de <span class="font-semibold text-white/50">500 empresas</span> ya confían en Paulu
            para gestionar su facturación electrónica e inventario.
            <span class="text-white/40">No te quedes atrás.</span>"
          </p>
        </div>

        <!-- Actions -->
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
            @click="emit('proceed')"
          >
            Registrar empresa
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
