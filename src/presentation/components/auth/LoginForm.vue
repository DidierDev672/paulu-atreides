<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import AppAlert from '@/presentation/components/ui/AppAlert.vue'
import { useAuthStore } from '@/presentation/stores/authStore'
import { loginValidator } from '@/presentation/validators/LoginValidator'
import { resolveLoginAlertMessage } from './authAlertMessages'
import AuthButton from './AuthButton.vue'
import AuthInput from './AuthInput.vue'

const emit = defineEmits<{
  success: []
  'go-to-register': []
}>()

const authStore = useAuthStore()

const showPassword = ref(false)

const form = reactive({
  email: '',
  password: '',
})

const fieldErrors = reactive({
  email: null as string | null,
  password: null as string | null,
})

function clearFieldErrors(): void {
  fieldErrors.email = null
  fieldErrors.password = null
}

const alertMessage = computed(() => resolveLoginAlertMessage(authStore.error))

function handleAlertAction(action?: 'dismiss' | 'go-to-register' | 'go-to-login'): void {
  authStore.clearError()

  if (action === 'go-to-register') {
    emit('go-to-register')
  }
}

async function handleSubmit(): Promise<void> {
  authStore.clearError()
  clearFieldErrors()

  const validation = loginValidator.validate({
    email: form.email,
    password: form.password,
  })

  if (!validation.isValid) {
    fieldErrors.email = validation.errors.email
    fieldErrors.password = validation.errors.password
    return
  }

  try {
    await authStore.login({
      email: form.email.trim().toLowerCase(),
      password: form.password,
    })
    emit('success')
  } catch {
    // Error surfaced via store
  }
}
</script>

<template>
  <form class="flex flex-col gap-5" @submit.prevent="handleSubmit">
    <AuthInput
      id="login-email"
      v-model="form.email"
      label="Correo electrónico"
      type="email"
      inputmode="email"
      autocomplete="email"
      placeholder="tu@correo.com"
      :error="fieldErrors.email"
      required
    />

    <div class="flex flex-col gap-2">
      <label for="login-password" class="text-sm font-medium text-white/80">
        Contraseña
      </label>
      <div class="relative">
        <input
          id="login-password"
          v-model="form.password"
          :type="showPassword ? 'text' : 'password'"
          autocomplete="current-password"
          placeholder="••••••••"
          required
          :aria-invalid="!!fieldErrors.password"
          :class="[
            'w-full rounded-2xl border bg-white/10 px-4 py-3.5 pr-12 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_24px_rgba(15,10,40,0.25)] backdrop-blur-sm transition placeholder:text-white/35 focus:bg-white/15 focus:outline-none focus:ring-2',
            fieldErrors.password
              ? 'border-red-400/50 focus:border-red-400/60 focus:ring-red-400/30'
              : 'border-white/10 focus:border-stellar-400/60 focus:ring-stellar-400/30',
          ]"
          @input="form.password = ($event.target as HTMLInputElement).value"
        />
        <button
          type="button"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 transition-colors hover:text-white/90"
          @click="showPassword = !showPassword"
          :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
        >
          <span
            v-motion
            :key="showPassword ? 'hide' : 'show'"
            :initial="{ opacity: 0, scale: 0.8 }"
            :enter="{ opacity: 1, scale: 1, transition: { duration: 200 } }"
            class="block"
          >
            <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </span>
        </button>
      </div>
      <p v-if="fieldErrors.password" class="text-sm text-red-300">
        {{ fieldErrors.password }}
      </p>
    </div>

    <AppAlert
      v-if="alertMessage"
      :variant="alertMessage.variant"
      :headline="alertMessage.headline"
      :body="alertMessage.body"
      :action-label="alertMessage.actionLabel"
      :secondary-action-label="alertMessage.secondaryActionLabel"
      @action="handleAlertAction(alertMessage.action)"
      @secondary-action="handleAlertAction(alertMessage.secondaryAction)"
      @dismiss="authStore.clearError()"
    />

    <AuthButton type="submit" :loading="authStore.isLoading">
      Iniciar sesión
    </AuthButton>

    <p class="text-center text-sm text-white/60">
      ¿No tienes cuenta?
      <button
        type="button"
        class="font-semibold text-gold transition hover:text-gold/80"
        @click="emit('go-to-register')"
      >
        Regístrate aquí
      </button>
    </p>
  </form>
</template>
