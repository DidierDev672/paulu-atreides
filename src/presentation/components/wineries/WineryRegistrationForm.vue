<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useWineryStore } from '@/presentation/stores/wineryStore'
import { useAuthStore } from '@/presentation/stores/authStore'
import { useCompanyStore } from '@/presentation/stores/companyStore'

const emit = defineEmits<{
  saved: []
}>()

const wineryStore = useWineryStore()
const authStore = useAuthStore()
const companyStore = useCompanyStore()

const AREAS = ['Tienda', 'Almacén', 'Cafetería', 'Otro']
const UNIT_TYPES = ['Unidades', 'Cajas', 'Litros', 'Kilogramos']

const form = reactive({
  registered_date: new Date().toISOString().slice(0, 10),
  area: '',
  units: '',
})

const saving = ref(false)
const formError = ref('')
const showResultDialog = ref(false)
const resultMessage = ref('')
const resultType = ref<'success' | 'error'>('success')
const fieldErrors = reactive({
  registered_date: '',
  area: '',
  units: '',
})

const companyLoaded = ref(false)

onMounted(async () => {
  const user = authStore.session?.user
  if (!user) return
  if (!companyStore.company) {
    await companyStore.fetchByUser(user.id)
  }
  companyLoaded.value = true
})

function validate(): boolean {
  let valid = true
  fieldErrors.registered_date = ''
  fieldErrors.area = ''
  fieldErrors.units = ''

  if (!form.registered_date) {
    fieldErrors.registered_date = 'La fecha de registro es obligatoria.'
    valid = false
  }
  if (!form.area) {
    fieldErrors.area = 'Seleccione un área.'
    valid = false
  }
  if (!form.units) {
    fieldErrors.units = 'Seleccione un tipo de unidad.'
    valid = false
  }
  return valid
}

async function handleSubmit(): Promise<void> {
  formError.value = ''
  if (!validate()) return

  const user = authStore.session?.user
  if (!user) {
    formError.value = 'Debe iniciar sesión.'
    return
  }
  if (!companyStore.company) {
    formError.value = 'No se encontró una empresa vinculada a su cuenta.'
    return
  }

  saving.value = true
  try {
    const result = await wineryStore.createWinery({
      registered_date: form.registered_date,
      user_id: user.id,
      company_id: companyStore.company.id,
      area: form.area,
      units: form.units,
    })

    if (result) {
      form.registered_date = new Date().toISOString().slice(0, 10)
      form.area = ''
      form.units = ''
      resultType.value = 'success'
      resultMessage.value = 'Bodega registrada exitosamente.'
      showResultDialog.value = true
      emit('saved')
    } else {
      resultType.value = 'error'
      resultMessage.value = wineryStore.error ?? 'Error al guardar la bodega.'
      showResultDialog.value = true
    }
  } catch {
    resultType.value = 'error'
    resultMessage.value = 'Error inesperado al guardar la bodega.'
    showResultDialog.value = true
  } finally {
    saving.value = false
  }
}

function closeResultDialog(): void {
  showResultDialog.value = false
}
</script>

<template>
  <div class="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
        Registrar bodega
      </h1>
      <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Complete los campos para registrar una nueva bodega.
      </p>
    </div>

    <!-- Loading -->
    <div
      v-if="!companyLoaded"
      class="flex items-center justify-center py-20"
    >
      <svg class="h-8 w-8 animate-spin text-stellar-500" viewBox="0 0 24 24" fill="none">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>

    <!-- No company -->
    <div
      v-else-if="!companyStore.company"
      class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <p class="text-sm text-slate-500 dark:text-slate-400">
        No tienes empresas vinculadas a tu cuenta. Primero debes registrar una empresa.
      </p>
    </div>

    <!-- Global error -->
    <div
      v-if="formError"
      class="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400"
    >
      {{ formError }}
    </div>

    <!-- Company badge -->
    <div
      v-if="companyStore.company"
      class="mb-6 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-stellar-500 to-cosmic-600 text-sm font-bold text-white shadow-sm">
          {{ companyStore.company.business_name.charAt(0).toUpperCase() }}
        </div>
        <div class="flex-1">
          <p class="text-sm font-medium text-slate-800 dark:text-slate-100">{{ companyStore.company.business_name }}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400">Empresa seleccionada</p>
        </div>
      </div>
    </div>

    <form
      v-if="companyStore.company"
      novalidate
      class="space-y-8"
      @submit.prevent="handleSubmit"
    >
      <!-- Registration date -->
      <div class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 class="mb-5 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Información de la bodega
        </h2>

        <div class="grid gap-5 sm:grid-cols-2">
          <!-- Registered date -->
          <div>
            <label class="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
              Fecha de registro <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.registered_date"
              type="date"
              class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-stellar-500"
              :class="{ 'border-red-400 dark:border-red-500': fieldErrors.registered_date }"
            />
            <p v-if="fieldErrors.registered_date" class="mt-1 text-xs text-red-500">
              {{ fieldErrors.registered_date }}
            </p>
          </div>

          <!-- Area -->
          <div>
            <label class="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
              Área <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.area"
              class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-stellar-500"
              :class="{ 'border-red-400 dark:border-red-500': fieldErrors.area }"
            >
              <option value="" disabled>Seleccione un área</option>
              <option v-for="a in AREAS" :key="a" :value="a">{{ a }}</option>
            </select>
            <p v-if="fieldErrors.area" class="mt-1 text-xs text-red-500">
              {{ fieldErrors.area }}
            </p>
          </div>

          <!-- Units -->
          <div>
            <label class="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
              Unidades <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.units"
              class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-stellar-500"
              :class="{ 'border-red-400 dark:border-red-500': fieldErrors.units }"
            >
              <option value="" disabled>Seleccione tipo de unidad</option>
              <option v-for="u in UNIT_TYPES" :key="u" :value="u">{{ u }}</option>
            </select>
            <p v-if="fieldErrors.units" class="mt-1 text-xs text-red-500">
              {{ fieldErrors.units }}
            </p>
          </div>
        </div>
      </div>

      <!-- Submit -->
      <div class="flex justify-end">
        <button
          type="submit"
          :disabled="saving"
          class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-stellar-500 to-cosmic-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-stellar-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
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
          {{ saving ? 'Guardando...' : 'Guardar bodega' }}
        </button>
      </div>
    </form>

    <!-- Result dialog -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showResultDialog"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        >
          <div class="mx-4 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <div class="mb-4 flex justify-center">
              <div
                v-if="resultType === 'success'"
                class="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20"
              >
                <svg class="h-7 w-7 text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div
                v-else
                class="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20"
              >
                <svg class="h-7 w-7 text-red-600 dark:text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            <p class="mb-6 text-center text-sm text-slate-600 dark:text-slate-300">
              {{ resultMessage }}
            </p>

            <div class="flex justify-center">
              <button
                type="button"
                class="rounded-xl bg-gradient-to-r from-stellar-500 to-cosmic-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:brightness-110"
                @click="closeResultDialog"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
