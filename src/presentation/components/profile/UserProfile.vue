<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/presentation/stores/authStore'
import { getCompanyByUser } from '@/application/services/companyService'
import type { CompanyResponse } from '@/application/services/companyService'
import type { User } from '@/domain/entities/User'
import EditProfileModal from './EditProfileModal.vue'
import EditCompanyModal from './EditCompanyModal.vue'
import CreateCompanyModal from './CreateCompanyModal.vue'

const authStore = useAuthStore()
const companies = ref<CompanyResponse[]>([])
const selectedCompany = ref<CompanyResponse | null>(null)
const loadingCompany = ref(true)
const showEditModal = ref(false)
const showEditCompanyModal = ref(false)
const showCreateCompanyModal = ref(false)

const user = computed(() => authStore.session?.user ?? null)

const activeCompanies = computed(() => companies.value.filter((c) => c.status === 'Activa'))

const avatarInitials = computed(() => {
  if (!user.value) return '--'
  return user.value.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
})

function handleEdit(): void {
  showEditModal.value = true
}

function handleEditSaved(updatedUser: User, updatedCompany: CompanyResponse | null): void {
  if (authStore.session) {
    authStore.session.user = updatedUser
  }
  if (updatedCompany) {
    const idx = companies.value.findIndex((c) => c.id === updatedCompany.id)
    if (idx !== -1) companies.value[idx] = updatedCompany
  }
  showEditModal.value = false
}

function handleEditCompany(company: CompanyResponse): void {
  selectedCompany.value = company
  showEditCompanyModal.value = true
}

function handleEditCompanySaved(updatedCompany: CompanyResponse): void {
  const idx = companies.value.findIndex((c) => c.id === updatedCompany.id)
  if (idx !== -1) companies.value[idx] = updatedCompany
  showEditCompanyModal.value = false
}

function handleAddCompany(): void {
  showCreateCompanyModal.value = true
}

function handleCreateCompanySaved(newCompany: CompanyResponse): void {
  companies.value.push(newCompany)
  showCreateCompanyModal.value = false
}

onMounted(async () => {
  if (!user.value) {
    loadingCompany.value = false
    return
  }
  try {
    companies.value = await getCompanyByUser(user.value.id)
  } catch {
  } finally {
    loadingCompany.value = false
  }
})
</script>

<template>
  <div
    v-if="user"
    class="min-h-screen"
    :style="{
      background: 'radial-gradient(circle at top, #1e3a8a, #0f172a 40%, #020617)',
    }"
  >
    <div class="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- Profile card -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 24 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }"
        class="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center shadow-2xl shadow-black/20 backdrop-blur-md"
      >
        <div
          v-motion
          :initial="{ opacity: 0, scale: 0.8 }"
          :enter="{ opacity: 1, scale: 1, transition: { duration: 400, delay: 150 } }"
          class="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-stellar-500 to-cosmic-600 text-3xl font-bold tracking-wide text-white shadow-xl shadow-black/30 ring-4 ring-white/10"
        >
          {{ avatarInitials }}
        </div>

        <div class="mt-5 space-y-1">
          <h1 class="text-2xl font-bold text-white">
            {{ user.fullName }}
          </h1>
          <p class="text-sm font-medium text-stellar-300">
            Administrador de empresas
          </p>
          <p class="text-sm text-white/50">
            {{ user.email }}
          </p>
          <p class="text-sm text-white/50">
            {{ user.phoneNumber }}
          </p>
        </div>

        <div class="mt-6 flex justify-center gap-3">
          <button
            type="button"
            v-motion
            :whileHover="{ scale: 1.03, y: -2 }"
            :whileTap="{ scale: 0.97 }"
            class="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-stellar-500 to-cosmic-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-stellar-500/25 transition hover:from-stellar-400 hover:to-cosmic-400"
            @click="handleEdit"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar Perfil
          </button>
        </div>
      </div>

      <!-- Info card -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 400, delay: 250 } }"
        class="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 backdrop-blur-md sm:p-8"
      >
        <h2 class="mb-6 flex items-center gap-2 text-base font-semibold text-white/80">
          <svg class="h-5 w-5 text-stellar-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Información Personal
        </h2>

        <div class="space-y-5">
          <div class="flex items-center gap-4">
            <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5">
              <svg class="h-5 w-5 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div class="flex-1">
              <p class="text-xs font-medium uppercase tracking-wider text-white/40">Nombre</p>
              <p class="text-sm font-medium text-white">{{ user.fullName }}</p>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5">
              <svg class="h-5 w-5 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="flex-1">
              <p class="text-xs font-medium uppercase tracking-wider text-white/40">Correo</p>
              <p class="text-sm text-white/70">{{ user.email }}</p>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5">
              <svg class="h-5 w-5 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div class="flex-1">
              <p class="text-xs font-medium uppercase tracking-wider text-white/40">Teléfono</p>
              <p class="text-sm text-white/70">{{ user.phoneNumber }}</p>
            </div>
          </div>

          <div class="border-t border-white/5 pt-5">
            <div class="flex items-center gap-4">
              <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.03]">
                <svg class="h-5 w-5 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" />
                </svg>
              </div>
              <div class="flex-1">
                <p class="text-xs font-medium uppercase tracking-wider text-white/30">Documento</p>
                <p class="text-sm text-white/50">{{ user.idNumber }}</p>
              </div>
            </div>

            <div class="mt-4 flex items-center gap-4">
              <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.03]">
                <svg class="h-5 w-5 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div class="flex-1">
                <p class="text-xs font-medium uppercase tracking-wider text-white/30">Fecha nac.</p>
                <p class="text-sm text-white/50">{{ user.dateOfBirth }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Companies card -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 400, delay: 350 } }"
        class="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 backdrop-blur-md sm:p-8"
      >
        <div class="mb-6 flex items-center justify-between">
          <h2 class="flex items-center gap-2 text-base font-semibold text-white/80">
            <svg class="h-5 w-5 text-stellar-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Empresas
          </h2>
          <span
            v-if="!loadingCompany"
            class="inline-flex h-7 min-w-[28px] items-center justify-center rounded-full bg-stellar-500/20 px-2.5 text-xs font-semibold text-stellar-300 ring-1 ring-stellar-500/30"
          >
            {{ activeCompanies.length }}/{{ companies.length }}
          </span>
        </div>

        <div v-if="loadingCompany" class="flex items-center justify-center py-12">
          <svg class="h-6 w-6 animate-spin text-white/30" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>

        <div v-else-if="companies.length === 0" class="py-12 text-center">
          <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/5">
            <svg class="h-6 w-6 text-white/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <p class="text-sm text-white/40">Aún no tienes empresas vinculadas</p>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="(c, i) in companies"
            :key="c.id"
            v-motion
            :initial="{ opacity: 0, y: 16 }"
            :enter="{ opacity: 1, y: 0, transition: { duration: 350, delay: 400 + i * 80 } }"
            :whileHover="{ scale: 1.01, y: -2 }"
            class="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 transition hover:border-white/[0.12] hover:bg-white/[0.04]"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-3">
                  <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-stellar-500/20 to-cosmic-600/20">
                    <svg class="h-5 w-5 text-stellar-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div class="min-w-0">
                    <h3 class="truncate text-base font-semibold text-white">
                      {{ c.business_name }}
                    </h3>
                    <div class="flex items-center gap-2">
                      <span
                        class="inline-flex h-2 w-2 rounded-full"
                        :class="c.status === 'Activa' ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-white/30'"
                      />
                      <span
                        class="text-xs font-medium"
                        :class="c.status === 'Activa' ? 'text-emerald-400' : 'text-white/40'"
                      >
                        {{ c.status }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="mt-4 grid gap-3 sm:grid-cols-3">
                  <div>
                    <p class="text-xs font-medium uppercase tracking-wider text-white/30">NIT</p>
                    <p class="text-sm text-white/60">{{ c.nit }}</p>
                  </div>
                  <div>
                    <p class="text-xs font-medium uppercase tracking-wider text-white/30">Correo</p>
                    <p class="truncate text-sm text-white/60">{{ c.email }}</p>
                  </div>
                  <div>
                    <p class="text-xs font-medium uppercase tracking-wider text-white/30">Teléfono</p>
                    <p class="text-sm text-white/60">{{ c.phone }}</p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                v-motion
                :whileHover="{ scale: 1.05 }"
                :whileTap="{ scale: 0.95 }"
                class="shrink-0 rounded-2xl border border-white/10 px-4 py-2 text-xs font-medium text-white/60 transition hover:border-white/20 hover:bg-white/5 hover:text-white/80"
                @click="handleEditCompany(c)"
              >
                Administrar
              </button>
            </div>
          </div>
        </div>

        <button
          type="button"
          v-motion
          :whileHover="{ scale: 1.01 }"
          :whileTap="{ scale: 0.97 }"
          class="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/10 px-4 py-3 text-sm font-medium text-stellar-400 transition hover:border-stellar-500/40 hover:bg-stellar-500/5"
          @click="handleAddCompany"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Agregar Empresa
        </button>
      </div>
    </div>
  </div>

  <EditProfileModal
    v-if="showEditModal && user"
    :user="user"
    :company="companies[0] ?? null"
    @close="showEditModal = false"
    @saved="handleEditSaved"
  />

  <EditCompanyModal
    v-if="showEditCompanyModal && selectedCompany"
    :company="selectedCompany"
    @close="showEditCompanyModal = false"
    @saved="handleEditCompanySaved"
  />

  <CreateCompanyModal
    v-if="showCreateCompanyModal && user"
    :user-id="user.id"
    @close="showCreateCompanyModal = false"
    @saved="handleCreateCompanySaved"
  />
</template>