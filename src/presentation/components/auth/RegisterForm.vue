<script setup lang="ts">
import { computed, reactive } from 'vue'
import AppAlert from '@/presentation/components/ui/AppAlert.vue'
import { useAuthStore } from '@/presentation/stores/authStore'
import { resolveRegisterAlertMessage } from './authAlertMessages'
import AuthButton from './AuthButton.vue'
import AuthInput from './AuthInput.vue'

const emit = defineEmits<{
  success: []
  'go-to-login': []
}>()

const authStore = useAuthStore()

const form = reactive({
  fullName: '',
  phoneNumber: '',
  idNumber: '',
  dateOfBirth: '',
  email: '',
  password: '',
})

const fieldErrors = reactive({
  fullName: null as string | null,
  phoneNumber: null as string | null,
  idNumber: null as string | null,
  dateOfBirth: null as string | null,
  email: null as string | null,
  password: null as string | null,
})

function clearFieldErrors(): void {
  fieldErrors.fullName = null
  fieldErrors.phoneNumber = null
  fieldErrors.idNumber = null
  fieldErrors.dateOfBirth = null
  fieldErrors.email = null
  fieldErrors.password = null
}

const alertMessage = computed(() => resolveRegisterAlertMessage(authStore.error))

function handleAlertAction(action?: 'dismiss' | 'go-to-register' | 'go-to-login'): void {
  authStore.clearError()

  if (action === 'go-to-login') {
    emit('go-to-login')
  }
}

function validate(): boolean {
  let valid = true
  clearFieldErrors()

  if (!form.fullName.trim()) {
    fieldErrors.fullName = 'El nombre completo es obligatorio.'
    valid = false
  }
  if (!form.phoneNumber.trim()) {
    fieldErrors.phoneNumber = 'El n\u00famero de tel\u00e9fono es obligatorio.'
    valid = false
  }
  if (!form.idNumber.trim()) {
    fieldErrors.idNumber = 'El n\u00famero de identificaci\u00f3n es obligatorio.'
    valid = false
  } else if (!/^\d+$/.test(form.idNumber.trim())) {
    fieldErrors.idNumber = 'El n\u00famero de identificaci\u00f3n debe ser num\u00e9rico.'
    valid = false
  }
  if (!form.dateOfBirth) {
    fieldErrors.dateOfBirth = 'La fecha de nacimiento es obligatoria.'
    valid = false
  }
  if (!form.email.trim()) {
    fieldErrors.email = 'El correo electr\u00f3nico es obligatorio.'
    valid = false
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    fieldErrors.email = 'Ingresa un correo electr\u00f3nico v\u00e1lido.'
    valid = false
  }
  if (!form.password) {
    fieldErrors.password = 'La contrase\u00f1a es obligatoria.'
    valid = false
  }
  if (form.password.length < 8) {
    fieldErrors.password = 'La contrase\u00f1a debe tener al menos 8 caracteres.'
    valid = false
  }
  return valid
}

async function handleSubmit(): Promise<void> {
  authStore.clearError()
  if (!validate()) return

  try {
    await authStore.register({ ...form })
    emit('success')
  } catch {
    // Error surfaced via store
  }
}
</script>

<template>
  <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
    <AuthInput
      id="register-full-name"
      v-model="form.fullName"
      label="Nombre completo"
      autocomplete="name"
      placeholder="Juan Pérez García"
      :error="fieldErrors.fullName"
      required
    />

    <AuthInput
      id="register-phone"
      v-model="form.phoneNumber"
      label="Número de teléfono"
      type="tel"
      inputmode="tel"
      autocomplete="tel"
      placeholder="+57 300 123 4567"
      :error="fieldErrors.phoneNumber"
      required
    />

    <AuthInput
      id="register-id"
      v-model="form.idNumber"
      label="Número de identificación"
      inputmode="numeric"
      placeholder="1234567890"
      :error="fieldErrors.idNumber"
      required
    />

    <AuthInput
      id="register-birth"
      v-model="form.dateOfBirth"
      label="Fecha de nacimiento"
      type="date"
      autocomplete="bday"
      :error="fieldErrors.dateOfBirth"
      required
    />

    <AuthInput
      id="register-email"
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
      id="register-password"
      v-model="form.password"
      label="Contraseña"
      type="password"
      autocomplete="new-password"
      placeholder="Mínimo 8 caracteres"
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
      Crear cuenta
    </AuthButton>

    <p class="text-center text-sm text-white/60">
      ¿Ya tienes cuenta?
      <button
        type="button"
        class="font-semibold text-gold transition hover:text-gold/80"
        @click="emit('go-to-login')"
      >
        Inicia sesión
      </button>
    </p>
  </form>
</template>
