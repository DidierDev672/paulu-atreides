<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useProviderStore } from '@/presentation/stores/providerStore'
import type { ProviderResponse } from '@/application/services/providerService'

const store = useProviderStore()
const searchQuery = ref('')
const providerToDelete = ref<ProviderResponse | null>(null)

const emit = defineEmits<{
  goToRegisterProvider: []
}>()

onMounted(() => {
  store.fetchProviders()
})

const filteredProviders = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return store.providers
  return store.providers.filter(
    (p) =>
      p.business_name.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
      p.document_number.toLowerCase().includes(q) ||
      p.document_type.toLowerCase().includes(q),
  )
})

const totalActive = computed(() => store.providers.filter((p) => p.status).length)
const totalInactive = computed(() => store.providers.filter((p) => !p.status).length)

function handleDelete(provider: ProviderResponse): void {
  providerToDelete.value = provider
}

async function confirmDelete(): Promise<void> {
  if (!providerToDelete.value) return
  await store.removeProvider(providerToDelete.value.id)
  providerToDelete.value = null
}

function cancelDelete(): void {
  providerToDelete.value = null
}
</script>

<template>
  <div v-motion :initial="{ opacity: 0, y: 8 }" :enter="{ opacity: 1, y: 0, transition: { duration: 350 } }">
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">Proveedores</h1>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Listado de proveedores registrados en el sistema.
        </p>
      </div>
      <div class="flex items-center gap-3">
        <div class="relative">
          <svg class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar proveedor..."
            class="w-56 rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-3 text-sm outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
          />
        </div>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-xl bg-stellar-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-stellar-400"
          @click="store.fetchProviders()"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualizar
        </button>
      </div>
    </div>

    <div v-if="store.isLoading" class="flex items-center justify-center py-20">
      <svg class="h-8 w-8 animate-spin text-stellar-500" viewBox="0 0 24 24" fill="none">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>

    <div v-else-if="store.error" class="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
      {{ store.error }}
    </div>

    <div v-else-if="filteredProviders.length === 0" class="flex flex-col items-center gap-3 py-20 text-slate-400">
      <svg class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
      <p class="text-sm">No hay proveedores registrados.</p>
      <button
        type="button"
        class="inline-flex items-center gap-1 rounded-xl bg-stellar-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-stellar-400"
        @click="emit('goToRegisterProvider')"
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Registrar proveedor
      </button>
    </div>

    <template v-else>
      <div class="mb-6 rounded-xl border border-emerald-200/70 bg-gradient-to-r from-emerald-50 to-teal-50 px-5 py-4 dark:border-emerald-800/40 dark:from-emerald-950/40 dark:to-teal-950/40">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex-1">
            <p class="text-sm font-medium text-emerald-800 dark:text-emerald-200">
              {{ store.providers.length }} proveedor{{ store.providers.length !== 1 ? 'es' : '' }} registrado{{ store.providers.length !== 1 ? 's' : '' }}
            </p>
            <p class="mt-1 text-xs text-emerald-600 dark:text-emerald-300">
              <span class="font-semibold">{{ totalActive }}</span> activo{{ totalActive !== 1 ? 's' : '' }} &middot;
              <span class="font-semibold">{{ totalInactive }}</span> inactivo{{ totalInactive !== 1 ? 's' : '' }}
            </p>
          </div>
          <button
            type="button"
            class="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-500"
            @click="emit('goToRegisterProvider')"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Registrar proveedor
          </button>
        </div>
      </div>

      <div class="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead>
              <tr class="border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:border-slate-800">
                <th class="px-5 py-3">C&oacute;digo</th>
                <th class="px-5 py-3">Raz&oacute;n social</th>
                <th class="px-5 py-3 hidden sm:table-cell">Documento</th>
                <th class="px-5 py-3 hidden md:table-cell">Tipo persona</th>
                <th class="px-5 py-3">Estado</th>
                <th class="px-5 py-3 text-right">Acci&oacute;n</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(provider, index) in filteredProviders"
                :key="provider.id"
                v-motion
                :initial="{ opacity: 0 }"
                :enter="{ opacity: 1, transition: { duration: 350, delay: 50 + index * 60 } }"
                class="border-b border-slate-50 transition hover:bg-slate-50/80 dark:border-slate-800/50 dark:hover:bg-slate-800/30"
              >
                <td class="px-5 py-4 font-mono text-xs text-slate-500">{{ provider.code }}</td>
                <td class="px-5 py-4">
                  <p class="font-medium text-slate-800 dark:text-slate-200">{{ provider.business_name }}</p>
                </td>
                <td class="hidden px-5 py-4 sm:table-cell">
                  <span class="text-xs text-slate-500">{{ provider.document_type }}</span>
                  <span class="ml-1 font-mono text-xs text-slate-700 dark:text-slate-300">{{ provider.document_number }}</span>
                  <span v-if="provider.verification_digit" class="ml-0.5 text-[11px] text-slate-400">-{{ provider.verification_digit }}</span>
                </td>
                <td class="hidden px-5 py-4 md:table-cell">
                  <span class="text-xs text-slate-600 dark:text-slate-400">{{ provider.type_person === 'Legal person' ? 'Jurídica' : 'Natural' }}</span>
                </td>
                <td class="px-5 py-4">
                  <span
                    class="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold"
                    :class="provider.status ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'"
                  >
                    {{ provider.status ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td class="px-5 py-4 text-right">
                  <div class="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      class="rounded-lg p-1.5 text-red-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                      title="Eliminar"
                      @click="handleDelete(provider)"
                    >
                      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>

  <Teleport to="body">
    <div
      v-if="providerToDelete"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      @click.self="cancelDelete"
    >
      <div class="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white">Eliminar proveedor</h3>
        <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
          &iquest;Est&aacute;s seguro de eliminar a <strong class="text-slate-700 dark:text-slate-200">{{ providerToDelete.business_name }}</strong>?
          Esta acci&oacute;n no se puede deshacer.
        </p>
        <div class="mt-6 flex justify-end gap-3">
          <button
            type="button"
            class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            @click="cancelDelete"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500"
            @click="confirmDelete"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
