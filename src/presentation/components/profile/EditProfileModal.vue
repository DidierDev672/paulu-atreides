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
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
      @click.self="emit('close')"
    >
      <div
        class="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900"
      >
        <div class="mb-6 flex items-center justify-between">
          <h2 class="text-xl font-bold text-slate-900 dark:text-white">Editar perfil</h2>
          <button
            type="button"
            class="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            @click="emit('close')"
          >
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div v-if="error" class="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
          {{ error }}
        </div>

        <div class="space-y-8">
          <section>
            <h3 class="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Datos personales
            </h3>
            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <label class="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">Nombre completo</label>
                <input
                  v-model="userForm.name_full"
                  type="text"
                  class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800 dark:focus:border-stellar-500"
                />
              </div>
              <div>
                <label class="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">Email</label>
                <input
                  v-model="userForm.email"
                  type="email"
                  class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800 dark:focus:border-stellar-500"
                />
              </div>
              <div>
                <label class="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">Teléfono</label>
                <input
                  v-model="userForm.phone"
                  type="text"
                  class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800 dark:focus:border-stellar-500"
                />
              </div>
              <div>
                <label class="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">Identificación</label>
                <input
                  v-model="userForm.id_number"
                  type="text"
                  class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800 dark:focus:border-stellar-500"
                />
              </div>
              <div>
                <label class="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">Fecha de nacimiento</label>
                <input
                  v-model="userForm.date_of_birth"
                  type="date"
                  class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800 dark:focus:border-stellar-500"
                />
              </div>
            </div>
          </section>

          <section v-if="props.company">
            <h3 class="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Datos de la empresa
            </h3>
            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <label class="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">Nombre comercial</label>
                <input
                  v-model="companyForm.business_name"
                  type="text"
                  class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800 dark:focus:border-stellar-500"
                />
              </div>
              <div>
                <label class="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">NIT</label>
                <input
                  v-model="companyForm.nit"
                  type="text"
                  class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800 dark:focus:border-stellar-500"
                />
              </div>
              <div>
                <label class="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">Email</label>
                <input
                  v-model="companyForm.email"
                  type="email"
                  class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800 dark:focus:border-stellar-500"
                />
              </div>
              <div>
                <label class="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">Teléfono</label>
                <input
                  v-model="companyForm.phone"
                  type="text"
                  class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800 dark:focus:border-stellar-500"
                />
              </div>
              <div>
                <label class="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">Estado</label>
                <select
                  v-model="companyForm.status"
                  class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800 dark:focus:border-stellar-500"
                >
                  <option value="Activa">Activa</option>
                  <option value="Inactiva">Inactiva</option>
                </select>
              </div>
            </div>
          </section>
        </div>

        <div class="mt-8 flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-700">
          <button
            type="button"
            class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            @click="emit('close')"
          >
            Cancelar
          </button>
          <button
            type="button"
            :disabled="saving"
            class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-stellar-500 to-cosmic-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:from-stellar-400 hover:to-cosmic-400 disabled:opacity-50"
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
