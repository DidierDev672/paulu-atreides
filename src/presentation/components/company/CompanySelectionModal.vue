<script setup lang="ts">
import type { CompanyResponse } from '@/application/services/companyService'

defineProps<{
  companies: CompanyResponse[]
  userName: string
}>()

const emit = defineEmits<{
  select: [company: CompanyResponse]
  register: []
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
        <div class="pointer-events-none absolute -left-20 -top-20 h-40 w-40 rounded-full bg-stellar-600/20 blur-3xl" />
        <div class="pointer-events-none absolute -bottom-16 -right-16 h-36 w-36 rounded-full bg-cosmic-500/15 blur-3xl" />

        <div class="relative px-8 pb-2 pt-10 text-center">
          <div class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-stellar-500 to-cosmic-600 shadow-[0_12px_32px_rgba(99,102,241,0.35)]">
            <svg class="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>

          <h2 class="font-display text-2xl font-bold text-white">
            {{ userName }}, selecciona una empresa
          </h2>
          <p class="mt-3 text-sm leading-relaxed text-white/50">
            Tienes varias empresas vinculadas a tu cuenta.
            Elige con cuál deseas trabajar.
          </p>
        </div>

        <div class="relative max-h-64 space-y-2 overflow-y-auto px-8 py-5">
          <button
            v-for="c in companies"
            :key="c.id"
            type="button"
            v-motion
            :initial="{ opacity: 0, x: -12 }"
            :enter="{ opacity: 1, x: 0 }"
            class="group flex w-full items-center gap-4 rounded-xl border border-white/10 bg-white/[0.04] p-4 text-left transition hover:border-stellar-500/50 hover:bg-stellar-500/10"
            @click="emit('select', c)"
          >
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-stellar-500 to-cosmic-600 text-sm font-bold text-white shadow-sm">
              {{ c.business_name.charAt(0).toUpperCase() }}
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-semibold text-white group-hover:text-stellar-200">{{ c.business_name }}</p>
              <p class="truncate text-xs text-white/40 group-hover:text-white/60">{{ c.nit }} · {{ c.social_reason }}</p>
            </div>
            <svg class="h-5 w-5 shrink-0 text-white/20 transition group-hover:text-stellar-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div class="relative flex gap-3 border-t border-white/10 px-8 py-5">
          <button
            type="button"
            class="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-white/50 transition hover:border-white/20 hover:text-white/70"
            @click="emit('register')"
          >
            Registrar otra empresa
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
