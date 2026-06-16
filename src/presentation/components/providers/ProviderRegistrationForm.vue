<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useProviderStore } from '@/presentation/stores/providerStore'

const emit = defineEmits<{
  saved: []
}>()

const providerStore = useProviderStore()

const DOCUMENT_TYPES = ['NIT', 'CC', 'CE', 'Passport']
const PERSON_TYPES = ['Natural person', 'Legal person']

const form = reactive({
  code: '',
  type_person: '',
  document_type: '',
  document_number: '',
  verification_digit: '',
  business_name: '',
  business_activity: '',
  status: true,
})

const saving = ref(false)
const formError = ref('')
const fieldErrors = reactive({
  code: '',
  type_person: '',
  document_type: '',
  document_number: '',
  business_name: '',
})

const isFormValid = computed(() => {
  return (
    form.code.trim() !== '' &&
    form.type_person !== '' &&
    form.document_type !== '' &&
    form.document_number.trim() !== '' &&
    form.business_name.trim() !== ''
  )
})

function generateCode(): void {
  const prefix = 'PROV'
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  form.code = `${prefix}-${timestamp}-${random}`
  fieldErrors.code = ''
}

function validate(): boolean {
  let valid = true
  fieldErrors.code = ''
  fieldErrors.type_person = ''
  fieldErrors.document_type = ''
  fieldErrors.document_number = ''
  fieldErrors.business_name = ''

  if (!form.code.trim()) {
    fieldErrors.code = 'El código del proveedor es obligatorio.'
    valid = false
  }
  if (!form.type_person) {
    fieldErrors.type_person = 'Seleccione el tipo de persona.'
    valid = false
  }
  if (!form.document_type) {
    fieldErrors.document_type = 'Seleccione el tipo de documento.'
    valid = false
  }
  if (!form.document_number.trim()) {
    fieldErrors.document_number = 'El número de documento es obligatorio.'
    valid = false
  }
  if (!form.business_name.trim()) {
    fieldErrors.business_name = 'La razón social / nombre es obligatorio.'
    valid = false
  }
  return valid
}

async function handleSubmit(): Promise<void> {
  formError.value = ''
  if (!validate()) return

  saving.value = true
  try {
    const result = await providerStore.createProvider({
      code: form.code.trim(),
      type_person: form.type_person,
      document_type: form.document_type,
      document_number: form.document_number.trim(),
      verification_digit: form.verification_digit.trim(),
      business_name: form.business_name.trim(),
      business_activity: form.business_activity.trim(),
      status: form.status,
    })

    if (result) {
      form.code = ''
      form.type_person = ''
      form.document_type = ''
      form.document_number = ''
      form.verification_digit = ''
      form.business_name = ''
      form.business_activity = ''
      form.status = true
      emit('saved')
    } else {
      formError.value = providerStore.error ?? 'Error al guardar el proveedor.'
    }
  } catch {
    formError.value = 'Error inesperado al guardar el proveedor.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
        Registrar proveedor
      </h1>
      <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Complete los datos b&aacute;sicos para registrar un nuevo proveedor.
      </p>
    </div>

    <!-- Global error -->
    <div
      v-if="formError"
      class="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400"
    >
      {{ formError }}
    </div>

    <form novalidate class="space-y-8" @submit.prevent="handleSubmit">
      <!-- Supplier info section -->
      <div class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 class="mb-5 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Informaci&oacute;n del proveedor
        </h2>

        <div class="grid gap-5 sm:grid-cols-2">
          <!-- Supplier code -->
          <div class="sm:col-span-2">
            <label class="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
              C&oacute;digo del proveedor <span class="text-red-500">*</span>
            </label>
            <div class="flex gap-2">
              <input
                v-model="form.code"
                type="text"
                placeholder="Ej: PROV-001"
                class="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-stellar-500"
                :class="{ 'border-red-400 dark:border-red-500': fieldErrors.code }"
              />
              <button
                type="button"
                class="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                title="Generar código automáticamente"
                @click="generateCode"
              >
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Generar
              </button>
            </div>
            <p v-if="fieldErrors.code" class="mt-1 text-xs text-red-500">
              {{ fieldErrors.code }}
            </p>
          </div>

          <!-- Type of person -->
          <div>
            <label class="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
              Tipo de persona <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.type_person"
              class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-stellar-500"
              :class="{ 'border-red-400 dark:border-red-500': fieldErrors.type_person }"
            >
              <option value="" disabled>Seleccione tipo</option>
              <option v-for="t in PERSON_TYPES" :key="t" :value="t">{{ t }}</option>
            </select>
            <p v-if="fieldErrors.type_person" class="mt-1 text-xs text-red-500">
              {{ fieldErrors.type_person }}
            </p>
          </div>

          <!-- Status -->
          <div class="flex items-end pb-2.5">
            <label class="flex cursor-pointer items-center gap-3">
              <div class="relative">
                <input
                  v-model="form.status"
                  type="checkbox"
                  class="peer sr-only"
                />
                <div class="h-6 w-11 rounded-full border border-slate-200 bg-slate-100 transition after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-all peer-checked:bg-stellar-500 peer-checked:after:translate-x-full dark:border-slate-600 dark:bg-slate-700 dark:after:bg-slate-300" />
              </div>
              <span class="text-sm font-medium text-slate-700 dark:text-slate-200">
                Proveedor activo
              </span>
            </label>
          </div>

          <!-- Document type -->
          <div>
            <label class="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
              Tipo de documento <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.document_type"
              class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-stellar-500"
              :class="{ 'border-red-400 dark:border-red-500': fieldErrors.document_type }"
            >
              <option value="" disabled>Seleccione documento</option>
              <option v-for="d in DOCUMENT_TYPES" :key="d" :value="d">{{ d }}</option>
            </select>
            <p v-if="fieldErrors.document_type" class="mt-1 text-xs text-red-500">
              {{ fieldErrors.document_type }}
            </p>
          </div>

          <!-- Verification Digit -->
          <div>
            <label class="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
              DV (Digito de verificaci&oacute;n)
            </label>
            <input
              v-model="form.verification_digit"
              type="text"
              maxlength="2"
              placeholder="Ej: 5"
              class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-stellar-500"
            />
          </div>

          <!-- Document number -->
          <div class="sm:col-span-2">
            <label class="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
              N&uacute;mero de documento <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.document_number"
              type="text"
              placeholder="Ej: 123456789"
              class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-stellar-500"
              :class="{ 'border-red-400 dark:border-red-500': fieldErrors.document_number }"
            />
            <p v-if="fieldErrors.document_number" class="mt-1 text-xs text-red-500">
              {{ fieldErrors.document_number }}
            </p>
          </div>

          <!-- Company name / Full name -->
          <div class="sm:col-span-2">
            <label class="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
              Raz&oacute;n social / Nombre completo <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.business_name"
              type="text"
              placeholder="Ej: Distribuidora ABC S.A.S."
              class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-stellar-500"
              :class="{ 'border-red-400 dark:border-red-500': fieldErrors.business_name }"
            />
            <p v-if="fieldErrors.business_name" class="mt-1 text-xs text-red-500">
              {{ fieldErrors.business_name }}
            </p>
          </div>

          <!-- Business activity -->
          <div class="sm:col-span-2">
            <label class="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
              Actividad econ&oacute;mica
            </label>
            <input
              v-model="form.business_activity"
              type="text"
              placeholder="Ej: Comercio al por mayor de productos agrícolas"
              class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-stellar-500"
            />
          </div>
        </div>
      </div>

      <!-- Submit -->
      <div class="flex justify-end gap-3">
        <button
          type="submit"
          :disabled="saving || !isFormValid"
          class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-stellar-500 to-cosmic-500 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:from-stellar-400 hover:to-cosmic-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg
            v-if="saving"
            class="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <svg
            v-else
            class="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          {{ saving ? 'Guardando...' : 'Registrar proveedor' }}
        </button>
      </div>
    </form>
  </div>
</template>
