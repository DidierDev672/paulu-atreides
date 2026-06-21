<script setup lang="ts">
import { reactive, ref } from 'vue'
import { updateUser, type UpdateUserRequest } from '@/application/services/userService'
import { updateCompany, type CompanyResponse } from '@/application/services/companyService'
import type { User } from '@/domain/entities/User'

const props = defineProps<{
  user: User
  company: CompanyResponse | null
}>()

const emit = defineEmits<{
  close: []
  saved: [user: User, company: CompanyResponse | null]
}>()

const saving = ref(false)
const error = ref('')

const userForm = reactive<UpdateUserRequest>({
  name_full: props.user.fullName,
  phone: props.user.phoneNumber,
  id_number: props.user.idNumber,
  date_of_birth: props.user.dateOfBirth,
  email: props.user.email,
})

const companyForm = reactive({
  business_name: props.company?.business_name ?? '',
  nit: props.company?.nit ?? '',
  email: props.company?.email ?? '',
  phone: props.company?.phone ?? '',
  status: props.company?.status ?? 'Activa',
})

async function handleSave() {
  error.value = ''
  saving.value = true
  try {
    const updatedUserRes = await updateUser(props.user.id, userForm)
    const mappedUser: User = {
      id: updatedUserRes.id,
      fullName: updatedUserRes.name_full,
      phoneNumber: updatedUserRes.phone,
      idNumber: updatedUserRes.id_number,
      dateOfBirth: updatedUserRes.date_of_birth,
      email: updatedUserRes.email,
    }
    let updatedCompany: CompanyResponse | null = null
    if (props.company) {
      updatedCompany = await updateCompany(props.company.id, companyForm)
    }
    emit('saved', mappedUser, updatedCompany)
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
            <h2 class="text-xl font-bold text-white">Editar perfil</h2>
            <p class="mt-1 text-sm text-slate-400">
              Actualiza tus datos personales y de empresa.
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
          <section>
            <h3 class="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-300">
              <svg class="h-4 w-4 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Datos personales
            </h3>
            <div class="grid gap-5 sm:grid-cols-2">
              <div>
                <label class="mb-1.5 block text-sm font-semibold text-white">
                  Nombre completo <span class="text-violet-400">*</span>
                </label>
                <input
                  v-model="userForm.name_full"
                  type="text"
                  class="w-full rounded-2xl border border-white/10 bg-slate-800/80 px-4 py-3.5 text-sm text-white outline-none ring-violet-500/20 transition placeholder:text-slate-600 focus:border-violet-500 focus:ring-4"
                />
              </div>
              <div>
                <label class="mb-1.5 block text-sm font-semibold text-white">
                  Correo electrónico <span class="text-violet-400">*</span>
                </label>
                <input
                  v-model="userForm.email"
                  type="email"
                  class="w-full rounded-2xl border border-white/10 bg-slate-800/80 px-4 py-3.5 text-sm text-white outline-none ring-violet-500/20 transition placeholder:text-slate-600 focus:border-violet-500 focus:ring-4"
                />
              </div>
              <div>
                <label class="mb-1.5 block text-sm font-semibold text-white">
                  Teléfono <span class="text-violet-400">*</span>
                </label>
                <input
                  v-model="userForm.phone"
                  type="text"
                  class="w-full rounded-2xl border border-white/10 bg-slate-800/80 px-4 py-3.5 text-sm text-white outline-none ring-violet-500/20 transition placeholder:text-slate-600 focus:border-violet-500 focus:ring-4"
                />
              </div>
              <div>
                <label class="mb-1.5 block text-sm font-semibold text-white">
                  Identificación <span class="text-violet-400">*</span>
                </label>
                <input
                  v-model="userForm.id_number"
                  type="text"
                  class="w-full rounded-2xl border border-white/10 bg-slate-800/80 px-4 py-3.5 text-sm text-white outline-none ring-violet-500/20 transition placeholder:text-slate-600 focus:border-violet-500 focus:ring-4"
                />
              </div>
              <div>
                <label class="mb-1.5 block text-sm font-semibold text-white">
                  Fecha de nacimiento <span class="text-violet-400">*</span>
                </label>
                <input
                  v-model="userForm.date_of_birth"
                  type="date"
                  class="w-full rounded-2xl border border-white/10 bg-slate-800/80 px-4 py-3.5 text-sm text-white outline-none ring-violet-500/20 transition placeholder:text-slate-600 focus:border-violet-500 focus:ring-4"
                />
              </div>
            </div>
          </section>

          <div v-if="props.company" class="border-t border-white/5" />

          <section v-if="props.company">
            <h3 class="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-300">
              <svg class="h-4 w-4 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Datos de la empresa
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
                  NIT <span class="text-violet-400">*</span>
                </label>
                <input
                  v-model="companyForm.nit"
                  type="text"
                  class="w-full rounded-2xl border border-white/10 bg-slate-800/80 px-4 py-3.5 text-sm text-white outline-none ring-violet-500/20 transition placeholder:text-slate-600 focus:border-violet-500 focus:ring-4"
                />
              </div>
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
                <label class="mb-1.5 block text-sm font-semibold text-white">Estado</label>
                <select
                  v-model="companyForm.status"
                  class="w-full appearance-none rounded-2xl border border-white/10 bg-slate-800/80 px-4 py-3.5 text-sm text-white outline-none ring-violet-500/20 transition focus:border-violet-500 focus:ring-4"
                >
                  <option value="Activa">Activa</option>
                  <option value="Inactiva">Inactiva</option>
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
            {{ saving ? 'Guardando...' : 'Guardar cambios' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>