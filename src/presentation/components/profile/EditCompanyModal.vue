<script setup lang="ts">
import { reactive, ref } from 'vue'
import { updateCompany, type CompanyResponse } from '@/application/services/companyService'

const props = defineProps<{
  company: CompanyResponse
}>()

const emit = defineEmits<{
  close: []
  saved: [company: CompanyResponse]
}>()

const saving = ref(false)
const error = ref('')
const logoPreview = ref<string | null>(null)
const logoFile = ref<File | null>(null)
const isDragOver = ref(false)

const companyForm = reactive({
  business_name: props.company.business_name ?? '',
  social_reason: props.company.social_reason ?? '',
  nit: props.company.nit ?? '',
  type_person: props.company.type_person ?? '',
  company_type: props.company.company_type ?? '',
  constitution_date: props.company.constitution_date ?? '',
  email: props.company.email ?? '',
  phone: props.company.phone ?? '',
  cellphone: props.company.cellphone ?? '',
  status: props.company.status ?? 'activo',
})

function handleLogoUpload(event: Event): void {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  logoFile.value = file
  const reader = new FileReader()
  reader.onload = () => {
    logoPreview.value = reader.result as string
  }
  reader.readAsDataURL(file)
}

function handleDrop(event: DragEvent): void {
  isDragOver.value = false
  const file = event.dataTransfer?.files?.[0]
  if (!file) return
  logoFile.value = file
  const reader = new FileReader()
  reader.onload = () => {
    logoPreview.value = reader.result as string
  }
  reader.readAsDataURL(file)
}

function removeLogo(): void {
  logoPreview.value = null
  logoFile.value = null
}

async function handleSave() {
  error.value = ''
  saving.value = true
  try {
    const updated = await updateCompany(props.company.id, {
      business_name: companyForm.business_name,
      social_reason: companyForm.social_reason,
      nit: companyForm.nit,
      type_person: companyForm.type_person,
      company_type: companyForm.company_type,
      constitution_date: companyForm.constitution_date,
      email: companyForm.email,
      phone: companyForm.phone,
      cellphone: companyForm.cellphone,
      status: companyForm.status,
      logo: logoPreview.value || props.company.logo || '',
    })
    emit('saved', updated)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al guardar los cambios.'
    const axiosErr = err as { response?: { data?: { error?: string } } }
    error.value = axiosErr?.response?.data?.error ?? msg
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-motion
      :initial="{ opacity: 0 }"
      :enter="{ opacity: 1, transition: { duration: 200 } }"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
      @click.self="emit('close')"
    >
      <div
        v-motion
        :initial="{ opacity: 0, scale: 0.95, y: 20 }"
        :enter="{ opacity: 1, scale: 1, y: 0, transition: { duration: 250 } }"
        class="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-slate-900 p-8 shadow-2xl shadow-black/40"
      >
        <div class="mb-2 flex items-start justify-between">
          <div>
            <h2 class="text-xl font-bold text-white">Editar empresa</h2>
            <p class="mt-1 text-sm text-slate-400">
              Actualiza la información de tu empresa.
            </p>
          </div>
          <button
            type="button"
            class="rounded-xl p-1.5 text-slate-500 transition hover:bg-white/5 hover:text-slate-300"
            @click="emit('close')"
          >
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div v-if="error" class="mb-6 rounded-2xl bg-red-500/10 px-5 py-3.5 text-sm text-red-400 ring-1 ring-red-500/20">
          {{ error }}
        </div>

        <div class="space-y-8">
          <!-- Logo -->
          <section>
            <h3 class="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-300">
              <svg class="h-4 w-4 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              Logo
            </h3>
            <div
              class="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-700 bg-slate-800/50 px-6 py-8 transition"
              :class="isDragOver ? 'border-violet-500 bg-violet-500/5' : ''"
              @dragover.prevent="isDragOver = true"
              @dragleave="isDragOver = false"
              @drop.prevent="handleDrop"
            >
              <div
                v-if="logoPreview || props.company.logo"
                class="relative mb-4"
              >
                <img
                  :src="logoPreview ?? props.company.logo"
                  alt="Logo preview"
                  class="h-24 w-24 rounded-2xl border border-white/10 object-cover"
                />
                <button
                  type="button"
                  class="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-slate-700 text-xs text-slate-300 ring-2 ring-slate-900 transition hover:bg-red-500 hover:text-white"
                  @click="removeLogo"
                >
                  <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <path stroke-linecap="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div v-else class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800">
                <svg class="h-7 w-7 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p class="mb-2 text-sm text-slate-400">
                Arrastra una imagen o
                <label class="cursor-pointer font-medium text-violet-400 transition hover:text-violet-300">
                  selecciona un archivo
                  <input type="file" accept="image/*" class="hidden" @change="handleLogoUpload" />
                </label>
              </p>
              <p class="text-xs text-slate-600">PNG, JPG o WebP — hasta 2 MB</p>
            </div>
          </section>

          <!-- Información de la empresa -->
          <section>
            <h3 class="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-300">
              <svg class="h-4 w-4 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Información de la empresa
            </h3>
            <div class="grid gap-5 sm:grid-cols-2">
              <div>
                <label class="mb-1.5 block text-sm font-semibold text-white">
                  Nombre comercial <span class="text-violet-400">*</span>
                </label>
                <input
                  v-model="companyForm.business_name"
                  type="text"
                  class="w-full rounded-2xl border border-white/10 bg-slate-800/80 px-4 py-3.5 text-sm text-white outline-none ring-violet-500/20 transition placeholder:text-slate-600 focus:border-violet-500 focus:ring-4"
                />
              </div>
              <div>
                <label class="mb-1.5 block text-sm font-semibold text-white">
                  Razón social <span class="text-violet-400">*</span>
                </label>
                <input
                  v-model="companyForm.social_reason"
                  type="text"
                  class="w-full rounded-2xl border border-white/10 bg-slate-800/80 px-4 py-3.5 text-sm text-white outline-none ring-violet-500/20 transition placeholder:text-slate-600 focus:border-violet-500 focus:ring-4"
                />
              </div>
              <div>
                <label class="mb-1.5 block text-sm font-semibold text-white">
                  NIT <span class="text-violet-400">*</span>
                </label>
                <input
                  v-model="companyForm.nit"
                  type="text"
                  class="w-full rounded-2xl border border-white/10 bg-slate-800/80 px-4 py-3.5 text-sm text-white outline-none ring-violet-500/20 transition placeholder:text-slate-600 focus:border-violet-500 focus:ring-4"
                />
                <p class="mt-1 text-xs text-slate-500">Número de identificación tributaria</p>
              </div>
              <div>
                <label class="mb-1.5 block text-sm font-semibold text-white">
                  Tipo de persona <span class="text-violet-400">*</span>
                </label>
                <select
                  v-model="companyForm.type_person"
                  class="w-full appearance-none rounded-2xl border border-white/10 bg-slate-800/80 px-4 py-3.5 text-sm text-white outline-none ring-violet-500/20 transition focus:border-violet-500 focus:ring-4"
                >
                  <option value="" disabled>Seleccionar</option>
                  <option value="natural">Persona natural</option>
                  <option value="juridica">Persona jurídica</option>
                </select>
              </div>
              <div>
                <label class="mb-1.5 block text-sm font-semibold text-white">
                  Tipo de empresa <span class="text-violet-400">*</span>
                </label>
                <select
                  v-model="companyForm.company_type"
                  class="w-full appearance-none rounded-2xl border border-white/10 bg-slate-800/80 px-4 py-3.5 text-sm text-white outline-none ring-violet-500/20 transition focus:border-violet-500 focus:ring-4"
                >
                  <option value="" disabled>Seleccionar</option>
                  <option value="micro">Microempresa</option>
                  <option value="pequena">Pequeña empresa</option>
                  <option value="mediana">Mediana empresa</option>
                  <option value="grande">Gran empresa</option>
                </select>
              </div>
              <div>
                <label class="mb-1.5 block text-sm font-semibold text-white">
                  Fecha de constitución <span class="text-violet-400">*</span>
                </label>
                <input
                  v-model="companyForm.constitution_date"
                  type="date"
                  class="w-full rounded-2xl border border-white/10 bg-slate-800/80 px-4 py-3.5 text-sm text-white outline-none ring-violet-500/20 transition placeholder:text-slate-600 focus:border-violet-500 focus:ring-4"
                />
              </div>
            </div>
          </section>

          <div class="border-t border-white/5" />

          <!-- Información de contacto -->
          <section>
            <h3 class="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-300">
              <svg class="h-4 w-4 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Información de contacto
            </h3>
            <div class="grid gap-5 sm:grid-cols-2">
              <div>
                <label class="mb-1.5 block text-sm font-semibold text-white">
                  Correo electrónico <span class="text-violet-400">*</span>
                </label>
                <input
                  v-model="companyForm.email"
                  type="email"
                  class="w-full rounded-2xl border border-white/10 bg-slate-800/80 px-4 py-3.5 text-sm text-white outline-none ring-violet-500/20 transition placeholder:text-slate-600 focus:border-violet-500 focus:ring-4"
                />
              </div>
              <div>
                <label class="mb-1.5 block text-sm font-semibold text-white">Teléfono</label>
                <input
                  v-model="companyForm.phone"
                  type="text"
                  class="w-full rounded-2xl border border-white/10 bg-slate-800/80 px-4 py-3.5 text-sm text-white outline-none ring-violet-500/20 transition placeholder:text-slate-600 focus:border-violet-500 focus:ring-4"
                />
              </div>
              <div>
                <label class="mb-1.5 block text-sm font-semibold text-white">Celular</label>
                <input
                  v-model="companyForm.cellphone"
                  type="text"
                  class="w-full rounded-2xl border border-white/10 bg-slate-800/80 px-4 py-3.5 text-sm text-white outline-none ring-violet-500/20 transition placeholder:text-slate-600 focus:border-violet-500 focus:ring-4"
                />
              </div>
              <div>
                <label class="mb-1.5 block text-sm font-semibold text-white">Estado</label>
                <select
                  v-model="companyForm.status"
                  class="w-full appearance-none rounded-2xl border border-white/10 bg-slate-800/80 px-4 py-3.5 text-sm text-white outline-none ring-violet-500/20 transition focus:border-violet-500 focus:ring-4"
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                  <option value="suspendido">Suspendido</option>
                </select>
              </div>
            </div>
          </section>
        </div>

        <div class="mt-8 flex flex-col-reverse gap-3 border-t border-white/5 pt-6 sm:flex-row sm:justify-end">
          <button
            type="button"
            class="rounded-2xl border border-white/10 px-6 py-3 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-slate-200"
            @click="emit('close')"
          >
            Cancelar
          </button>
          <button
            type="button"
            :disabled="saving"
            class="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-violet-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:from-violet-500 hover:to-violet-400 disabled:opacity-50"
            @click="handleSave"
          >
            <svg v-if="saving" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {{ saving ? 'Guardando...' : 'Guardar empresa' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>