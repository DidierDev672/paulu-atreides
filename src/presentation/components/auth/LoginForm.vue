<script setup lang="ts">
import { computed, reactive } from 'vue'
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

    <AuthInput
      id="login-password"
      v-model="form.password"
      label="Contraseña"
      type="password"
      autocomplete="current-password"
      placeholder="••••••••"
      :error="fieldErrors.password"
      required
    />

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
