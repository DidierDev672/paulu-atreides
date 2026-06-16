<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/presentation/stores/authStore'
import { getCompanyByUser } from '@/application/services/companyService'
import type { CompanyResponse } from '@/application/services/companyService'
import type { User } from '@/domain/entities/User'
import EditProfileModal from './EditProfileModal.vue'

const authStore = useAuthStore()
const company = ref<CompanyResponse | null>(null)
const loadingCompany = ref(true)
const showEditModal = ref(false)

const user = computed(() => authStore.session?.user ?? null)

const avatarInitials = computed(() => {
  if (!user.value) return '--'
  return user.value.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
})

const coverImage = 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&h=400&fit=crop'

function handleEdit(): void {
  showEditModal.value = true
}

function handleEditSaved(updatedUser: User, updatedCompany: CompanyResponse | null): void {
  if (authStore.session) {
    authStore.session.user = updatedUser
  }
  if (updatedCompany) {
    company.value = updatedCompany
  }
  showEditModal.value = false
}

onMounted(async () => {
  if (!user.value) {
    loadingCompany.value = false
    return
  }
  try {
    const companies = await getCompanyByUser(user.value.id)
    company.value = companies.length > 0 ? companies[0] : null
  } catch {
    // company not found or error
  } finally {
    loadingCompany.value = false
  }
})
</script>

<template>
  <div v-if="user" class="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
    <!-- Cover + avatar -->
    <div class="relative">
      <div
        v-motion
        :initial="{ opacity: 0, y: -12 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }"
        class="h-40 overflow-hidden rounded-2xl bg-slate-200 sm:h-56 dark:bg-slate-800"
      >
        <img
          :src="coverImage"
          alt="Cover"
          class="h-full w-full object-cover"
        />
      </div>

      <div class="px-4 sm:px-6">
        <div
          v-motion
          :initial="{ opacity: 0, scale: 0.85 }"
          :enter="{ opacity: 1, scale: 1, transition: { duration: 400, delay: 150 } }"
          class="-mt-14 flex items-end gap-4 sm:-mt-16"
        >
          <div
            class="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-stellar-500 to-cosmic-600 text-2xl font-bold tracking-wide text-white shadow-xl sm:h-28 sm:w-28 dark:border-slate-900"
          >
            {{ avatarInitials }}
          </div>

          <div class="flex flex-1 items-center justify-between pb-1">
            <div>
              <h1 class="text-xl font-bold text-slate-900 sm:text-2xl dark:text-white">
                {{ user.fullName }}
              </h1>
              <p class="text-sm text-slate-500 dark:text-slate-400">
                {{ user.email }}
              </p>
            </div>

            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-stellar-500 to-cosmic-500 px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:from-stellar-400 hover:to-cosmic-400 sm:text-sm"
              @click="handleEdit"
            >
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar perfil
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Info cards -->
    <div class="mt-8 grid gap-6 md:grid-cols-2">
      <!-- Datos personales -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 16 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 400, delay: 200 } }"
        class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <h2 class="mb-5 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Datos personales
        </h2>

        <dl class="space-y-4">
          <div class="sm:flex sm:gap-4">
            <dt class="w-28 text-xs font-semibold uppercase tracking-wider text-slate-400 sm:text-right dark:text-slate-500">Nombre</dt>
            <dd class="text-sm font-medium text-slate-800 dark:text-slate-200">{{ user.fullName }}</dd>
          </div>
          <div class="sm:flex sm:gap-4">
            <dt class="w-28 text-xs font-semibold uppercase tracking-wider text-slate-400 sm:text-right dark:text-slate-500">Email</dt>
            <dd class="text-sm text-slate-700 dark:text-slate-300">{{ user.email }}</dd>
          </div>
          <div class="sm:flex sm:gap-4">
            <dt class="w-28 text-xs font-semibold uppercase tracking-wider text-slate-400 sm:text-right dark:text-slate-500">Teléfono</dt>
            <dd class="text-sm text-slate-700 dark:text-slate-300">{{ user.phoneNumber }}</dd>
          </div>
          <div class="sm:flex sm:gap-4">
            <dt class="w-28 text-xs font-semibold uppercase tracking-wider text-slate-400 sm:text-right dark:text-slate-500">Identificación</dt>
            <dd class="text-sm text-slate-700 dark:text-slate-300">{{ user.idNumber }}</dd>
          </div>
          <div class="sm:flex sm:gap-4">
            <dt class="w-28 text-xs font-semibold uppercase tracking-wider text-slate-400 sm:text-right dark:text-slate-500">Fecha nac.</dt>
            <dd class="text-sm text-slate-700 dark:text-slate-300">{{ user.dateOfBirth }}</dd>
          </div>
        </dl>
      </div>

      <!-- Datos de la empresa -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 16 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 400, delay: 300 } }"
        class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <h2 class="mb-5 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Empresa vinculada
        </h2>

        <div v-if="loadingCompany" class="py-8 text-center text-sm text-slate-400">
          Cargando...
        </div>

        <div v-else-if="!company" class="py-8 text-center text-sm text-slate-400">
          No hay empresa vinculada
        </div>

        <dl v-else class="space-y-4">
          <div class="sm:flex sm:gap-4">
            <dt class="w-28 text-xs font-semibold uppercase tracking-wider text-slate-400 sm:text-right dark:text-slate-500">Nombre</dt>
            <dd class="text-sm font-medium text-slate-800 dark:text-slate-200">{{ company.business_name }}</dd>
          </div>
          <div class="sm:flex sm:gap-4">
            <dt class="w-28 text-xs font-semibold uppercase tracking-wider text-slate-400 sm:text-right dark:text-slate-500">NIT</dt>
            <dd class="text-sm text-slate-700 dark:text-slate-300">{{ company.nit }}</dd>
          </div>
          <div class="sm:flex sm:gap-4">
            <dt class="w-28 text-xs font-semibold uppercase tracking-wider text-slate-400 sm:text-right dark:text-slate-500">Email</dt>
            <dd class="text-sm text-slate-700 dark:text-slate-300">{{ company.email }}</dd>
          </div>
          <div class="sm:flex sm:gap-4">
            <dt class="w-28 text-xs font-semibold uppercase tracking-wider text-slate-400 sm:text-right dark:text-slate-500">Teléfono</dt>
            <dd class="text-sm text-slate-700 dark:text-slate-300">{{ company.phone }}</dd>
          </div>
          <div class="sm:flex sm:gap-4">
            <dt class="w-28 text-xs font-semibold uppercase tracking-wider text-slate-400 sm:text-right dark:text-slate-500">Estado</dt>
            <dd>
              <span class="inline-flex rounded-lg bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                {{ company.status }}
              </span>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  </div>

  <EditProfileModal
    v-if="showEditModal && user"
    :user="user"
    :company="company"
    @close="showEditModal = false"
    @saved="handleEditSaved"
  />
</template>
