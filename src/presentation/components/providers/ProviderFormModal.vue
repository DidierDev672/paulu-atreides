<script setup lang="ts">
import { reactive, ref, computed, watch } from 'vue'
import { useProviderStore } from '@/presentation/stores/providerStore'
import type { ProviderResponse } from '@/application/services/providerService'

const props = defineProps<{
  visible: boolean
  /** Provider ID to edit. If provided, the modal loads existing data. */
  providerId?: string | null
}>()

const emit = defineEmits<{
  close: []
  saved: [provider: ProviderResponse]
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
const loadingProvider = ref(false)
const fieldErrors = reactive({
  code: '',
  type_person: '',
  document_type: '',
  document_number: '',
  business_name: '',
})

const isEditMode = computed(() => !!props.providerId)

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

function resetForm(): void {
  form.code = ''
  form.type_person = ''
  form.document_type = ''
  form.document_number = ''
  form.verification_digit = ''
  form.business_name = ''
  form.business_activity = ''
  form.status = true
  formError.value = ''
  fieldErrors.code = ''
  fieldErrors.type_person = ''
  fieldErrors.document_type = ''
  fieldErrors.document_number = ''
  fieldErrors.business_name = ''
}

async function loadProvider(id: string): Promise<void> {
  loadingProvider.value = true
  formError.value = ''
  try {
    // First check if already in store
    const existing = providerStore.providers.find((p) => p.id === id)
    if (existing) {
      populateForm(existing)
    } else {
      // Fetch from API
      await providerStore.fetchProviderById(id)
      const provider = providerStore.currentProvider
      if (provider && provider.id === id) {
        populateForm(provider)
      } else {
        formError.value = 'No se encontró el proveedor. Puede registrar uno nuevo.'
        generateCode()
      }
    }
  } catch {
    formError.value = 'Error al cargar el proveedor. Puede registrar uno nuevo.'
    generateCode()
  } finally {
    loadingProvider.value = false
  }
}

function populateForm(provider: ProviderResponse): void {
  form.code = provider.code
  form.type_person = provider.type_person
  form.document_type = provider.document_type
  form.document_number = provider.document_number
  form.verification_digit = provider.verification_digit
  form.business_name = provider.business_name
  form.business_activity = provider.business_activity
  form.status = provider.status
}

watch(
  () => props.visible,
  (isVisible) => {
    if (isVisible) {
      resetForm()
      if (props.providerId) {
        loadProvider(props.providerId)
      } else {
        generateCode()
      }
    }
  }
)

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
    let result: ProviderResponse | null = null

    if (isEditMode.value && props.providerId) {
      // Update existing provider
      result = await providerStore.updateProvider(props.providerId, {
        code: form.code.trim(),
        type_person: form.type_person,
        document_type: form.document_type,
        document_number: form.document_number.trim(),
        verification_digit: form.verification_digit.trim(),
        business_name: form.business_name.trim(),
        business_activity: form.business_activity.trim(),
        status: form.status,
      })
    } else {
      // Check if provider with same document already exists
      const existingProvider = providerStore.providers.find(
        (p) =>
          p.document_type === form.document_type &&
          p.document_number === form.document_number.trim()
      )

      if (existingProvider) {
        // Provider exists — update it instead of creating duplicate
        result = await providerStore.updateProvider(existingProvider.id, {
          code: form.code.trim(),
          type_person: form.type_person,
          document_type: form.document_type,
          document_number: form.document_number.trim(),
          verification_digit: form.verification_digit.trim(),
          business_name: form.business_name.trim(),
          business_activity: form.business_activity.trim(),
          status: form.status,
        })
      } else {
        // Create new provider
        result = await providerStore.createProvider({
          code: form.code.trim(),
          type_person: form.type_person,
          document_type: form.document_type,
          document_number: form.document_number.trim(),
          verification_digit: form.verification_digit.trim(),
          business_name: form.business_name.trim(),
          business_activity: form.business_activity.trim(),
          status: form.status,
        })
      }
    }

    if (result) {
      emit('saved', result)
      emit('close')
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
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      leave-active-class="transition-opacity duration-150 ease-in"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        :aria-label="isEditMode ? 'Editar proveedor' : 'Registrar proveedor'"
        @click.self="emit('close')"
      >
        <div
          v-motion
          :initial="{ opacity: 0, y: 20, scale: 0.97 }"
          :enter="{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.22, easing: 'ease-out' } }"
          :leave="{ opacity: 0, y: 12, scale: 0.97, transition: { duration: 0.18 } }"
          class="relative flex flex-col max-h-[90vh] w-full max-w-lg overflow-hidden rounded-2xl bg-white dark:bg-[#111827] shadow-2xl"
        >
          <!-- Header -->
          <div class="flex items-start justify-between px-5 py-4 bg-gray-50 dark:bg-[#1F2937] border-b border-gray-200 dark:border-[#1F2937]">
            <div>
              <h2 class="text-[15px] font-semibold text-gray-900 dark:text-white">
                {{ isEditMode ? 'Editar proveedor' : 'Registrar proveedor' }}
              </h2>
              <p class="text-[11px] text-gray-400 mt-0.5">
                {{ isEditMode ? 'Actualice la información del proveedor' : 'Complete los datos para registrar un nuevo proveedor' }}
              </p>
            </div>
            <button
              type="button"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors text-lg leading-none mt-0.5"
              aria-label="Cerrar modal"
              @click="emit('close')"
            >
              ×
            </button>
          </div>

          <!-- Scrollable body -->
          <div class="overflow-y-auto flex-1 px-5 py-4">
            <!-- Loading state -->
            <div v-if="loadingProvider" class="flex items-center justify-center py-8">
              <div class="h-8 w-8 animate-spin rounded-full border-4 border-stellar-500 border-t-transparent" />
            </div>

            <!-- Form -->
            <form v-else novalidate class="space-y-4" @submit.prevent="handleSubmit">
              <!-- Global error -->
              <div
                v-if="formError"
                class="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400"
              >
                {{ formError }}
              </div>

              <!-- Provider code -->
              <div>
                <label class="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
                  Código del proveedor <span class="text-red-500">*</span>
                </label>
                <div class="flex gap-2">
                  <input
                    v-model="form.code"
                    type="text"
                    placeholder="Ej: PROV-001"
                    class="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-stellar-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    :class="{ 'border-red-400 dark:border-red-500': fieldErrors.code }"
                  />
                  <button
                    v-if="!isEditMode"
                    type="button"
                    class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    @click="generateCode"
                  >
                    Generar
                  </button>
                </div>
                <p v-if="fieldErrors.code" class="mt-1 text-xs text-red-500">{{ fieldErrors.code }}</p>
              </div>

              <!-- Type of person -->
              <div>
                <label class="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
                  Tipo de persona <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="form.type_person"
                  class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-stellar-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  :class="{ 'border-red-400 dark:border-red-500': fieldErrors.type_person }"
                >
                  <option value="" disabled>Seleccione tipo</option>
                  <option v-for="t in PERSON_TYPES" :key="t" :value="t">{{ t }}</option>
                </select>
                <p v-if="fieldErrors.type_person" class="mt-1 text-xs text-red-500">{{ fieldErrors.type_person }}</p>
              </div>

              <!-- Document type + Verification digit -->
              <div class="grid grid-cols-3 gap-3">
                <div class="col-span-2">
                  <label class="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
                    Tipo de documento <span class="text-red-500">*</span>
                  </label>
                  <select
                    v-model="form.document_type"
                    class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-stellar-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    :class="{ 'border-red-400 dark:border-red-500': fieldErrors.document_type }"
                  >
                    <option value="" disabled>Seleccione</option>
                    <option v-for="d in DOCUMENT_TYPES" :key="d" :value="d">{{ d }}</option>
                  </select>
                  <p v-if="fieldErrors.document_type" class="mt-1 text-xs text-red-500">{{ fieldErrors.document_type }}</p>
                </div>
                <div>
                  <label class="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">DV</label>
                  <input
                    v-model="form.verification_digit"
                    type="text"
                    maxlength="2"
                    placeholder="—"
                    class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-stellar-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <!-- Document number -->
              <div>
                <label class="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
                  Número de documento <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.document_number"
                  type="text"
                  placeholder="Ej: 123456789"
                  class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-stellar-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  :class="{ 'border-red-400 dark:border-red-500': fieldErrors.document_number }"
                />
                <p v-if="fieldErrors.document_number" class="mt-1 text-xs text-red-500">{{ fieldErrors.document_number }}</p>
              </div>

              <!-- Business name -->
              <div>
                <label class="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
                  Razón social / Nombre <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.business_name"
                  type="text"
                  placeholder="Ej: Distribuidora ABC S.A.S."
                  class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-stellar-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  :class="{ 'border-red-400 dark:border-red-500': fieldErrors.business_name }"
                />
                <p v-if="fieldErrors.business_name" class="mt-1 text-xs text-red-500">{{ fieldErrors.business_name }}</p>
              </div>

              <!-- Business activity -->
              <div>
                <label class="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
                  Actividad económica
                </label>
                <input
                  v-model="form.business_activity"
                  type="text"
                  placeholder="Ej: Comercio al por mayor de productos agrícolas"
                  class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-stellar-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <!-- Status toggle -->
              <div class="flex items-center gap-3">
                <label class="relative inline-flex cursor-pointer items-center">
                  <input v-model="form.status" type="checkbox" class="peer sr-only" />
                  <div class="h-6 w-11 rounded-full border border-slate-200 bg-slate-100 transition after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-all peer-checked:bg-stellar-500 peer-checked:after:translate-x-full dark:border-slate-600 dark:bg-slate-700 dark:after:bg-slate-300" />
                </label>
                <span class="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Proveedor activo
                </span>
              </div>
            </form>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-end gap-2 px-5 py-3 bg-gray-50 dark:bg-[#1F2937] border-t border-gray-200 dark:border-[#1F2937]">
            <button
              type="button"
              class="px-4 py-2 text-[12px] font-medium text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-lg transition hover:bg-gray-100 dark:hover:bg-gray-800"
              @click="emit('close')"
            >
              Cancelar
            </button>
            <button
              type="button"
              class="px-4 py-2 text-[12px] font-medium text-white bg-stellar-500 rounded-lg transition hover:bg-stellar-600 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="saving || !isFormValid || loadingProvider"
              @click="handleSubmit"
            >
              {{ saving ? 'Guardando...' : isEditMode ? 'Actualizar proveedor' : 'Registrar proveedor' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
