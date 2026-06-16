<script setup lang="ts">
import LoginForm from '@/presentation/components/auth/LoginForm.vue'
import RegisterForm from '@/presentation/components/auth/RegisterForm.vue'
import { useAuthStore } from '@/presentation/stores/authStore'
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
type AuthView = 'login' | 'register'

const authStore = useAuthStore()
const currentView = ref<AuthView>('login')

watch(() => authStore.session, (session) => {
  if (session) {
    router.push({ name: 'dashboard' })
  }
})

function switchView(view: AuthView): void {
  authStore.clearError()
  currentView.value = view
}
</script>

<template>
  <div class="relative flex min-h-dvh w-full items-center justify-center overflow-hidden bg-[#0b0820] px-4 py-10">
    <div v-motion :initial="{ opacity: 0, scale: 0.8 }"
      :enter="{ opacity: 0.5, scale: 1, transition: { duration: 1200 } }"
      class="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-stellar-600/40 blur-3xl" />
    <div v-motion :initial="{ opacity: 0, scale: 0.8 }"
      :enter="{ opacity: 0.45, scale: 1, transition: { duration: 1400, delay: 200 } }"
      class="pointer-events-none absolute -right-16 top-32 h-80 w-80 rounded-full bg-nebula-pink/30 blur-3xl" />
    <div v-motion :initial="{ opacity: 0, scale: 0.8 }"
      :enter="{ opacity: 0.4, scale: 1, transition: { duration: 1600, delay: 400 } }"
      class="pointer-events-none absolute bottom-10 left-1/3 h-64 w-64 rounded-full bg-nebula-blue/25 blur-3xl" />

    <div v-motion :initial="{ opacity: 0, y: 32 }" :enter="{ opacity: 1, y: 0, transition: { duration: 600 } }"
      class="relative z-10 w-full max-w-md">
      <div class="mb-8 text-center" v-motion :initial="{ opacity: 0, y: -16 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 150 } }">
        <div
          class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-stellar-500 to-cosmic-600 shadow-[0_16px_40px_rgba(99,102,241,0.45)]">
          <svg class="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
            aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
            <circle cx="5" cy="18" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="19" cy="6" r="1" fill="currentColor" stroke="none" />
            <circle cx="20" cy="19" r="1.2" fill="currentColor" stroke="none" />
          </svg>
        </div>
        <h1 class="font-display text-3xl font-bold tracking-tight text-white">
          Paulu
        </h1>
        <p class="mt-2 text-sm text-white/55">
          Gestión inteligente para tu negocio, con visión de futuro.
        </p>
      </div>

      <div
        class="rounded-3xl border border-white/10 bg-white/8 p-6 shadow-[0_24px_64px_rgba(8,5,24,0.55)] backdrop-blur-xl sm:p-8"
        v-motion :initial="{ opacity: 0, y: 24 }" :enter="{ opacity: 1, y: 0, transition: { delay: 250 } }">
        <div class="mb-6 flex rounded-2xl bg-white/5 p-1">
          <button type="button" class="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition" :class="currentView === 'login'
            ? 'bg-gradient-to-r from-stellar-500/80 to-cosmic-500/80 text-white shadow-md'
            : 'text-white/50 hover:text-white/80'
            " @click="switchView('login')">
            Iniciar sesión
          </button>
          <button type="button" class="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition" :class="currentView === 'register'
            ? 'bg-gradient-to-r from-stellar-500/80 to-cosmic-500/80 text-white shadow-md'
            : 'text-white/50 hover:text-white/80'
            " @click="switchView('register')">
            Registrarse
          </button>
        </div>

        <div v-if="currentView === 'login'">
          <LoginForm v-motion :initial="{ opacity: 0, x: -12 }" :enter="{ opacity: 1, x: 0 }" @success="() => { }"
            @go-to-register="switchView('register')" />
        </div>
        <div v-if="currentView === 'register'">
          <RegisterForm v-motion :initial="{ opacity: 0, x: 12 }" :enter="{ opacity: 1, x: 0 }" @success="() => { }"
            @go-to-login="switchView('login')" />
        </div>
      </div>
    </div>
  </div>
</template>
