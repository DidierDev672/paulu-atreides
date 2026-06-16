<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getProviders } from '@/application/services/providerService'
import type { ProviderResponse } from '@/application/services/providerService'

const emit = defineEmits<{
  close: []
  confirm: [provider: ProviderResponse]
}>()

const providers = ref<ProviderResponse[]>([])
const selectedId = ref('')
const loading = ref(true)
const error = ref('')
const search = ref('')

const filteredProviders = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return providers.value
  return providers.value.filter(
    (p) =>
      p.business_name.toLowerCase().includes(q) ||
      p.document_number.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q),
  )
})

function select(id: string): void {
  selectedId.value = id
}

function handleConfirm(): void {
  const provider = providers.value.find((p) => p.id === selectedId.value)
  if (provider) {
    emit('confirm', provider)
  }
}

onMounted(async () => {
  try {
    providers.value = await getProviders()
  } catch {
    error.value = 'Error al cargar los proveedores.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
      @click.self="emit('close')"
    >
      <div
        class="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
      >
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <div>
            <h2 class="text-lg font-semibold text-slate-900 dark:text-white">Seleccionar proveedor</h2>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              Seleccione el proveedor asociado al producto
            </p>
          </div>
          <button
            type="button"
            class="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            @click="emit('close')"
          >
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Search -->
        <div class="px-6 pt-4">
          <div class="relative">
            <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              v-model="search"
              type="text"
              placeholder="Buscar por nombre, documento o c\u00f3digo..."
              class="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-stellar-500"
            />
          </div>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto px-6 py-4">
          <div v-if="loading" class="flex items-center justify-center py-12 text-slate-400">
            <svg class="h-6 w-6 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span class="ml-3 text-sm">Cargando proveedores...</span>
          </div>

          <div v-else-if="error" class="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
            {{ error }}
          </div>

          <div v-else-if="providers.length === 0" class="flex flex-col items-center px-6 py-12 text-center">
            <div class="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-[0_8px_24px_rgba(251,146,60,0.3)]">
              <svg class="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-100">
              No hay proveedores registrados
            </h3>
            <p class="mt-2 max-w-sm text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Registre un proveedor primero para poder asociarlo a un producto.
            </p>
            <p class="mt-4 text-xs italic text-slate-400 dark:text-slate-500">
              "Un producto sin proveedor es un inventario sin origen."
            </p>
            <div class="mt-6">
              <button
                type="button"
                class="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                @click="emit('close')"
              >
                Cerrar
              </button>
            </div>
          </div>

          <table v-else class="w-full text-left text-sm">
            <thead>
              <tr class="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:border-slate-700">
                <th class="w-10 px-2 py-3"></th>
                <th class="px-2 py-3">C&oacute;digo</th>
                <th class="px-2 py-3">Raz&oacute;n social</th>
                <th class="px-2 py-3">Documento</th>
                <th class="px-2 py-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="provider in filteredProviders"
                :key="provider.id"
                class="cursor-pointer border-b border-slate-100 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/30"
                :class="{ 'bg-stellar-50/50 dark:bg-stellar-500/5': selectedId === provider.id }"
                @click="select(provider.id)"
              >
                <td class="px-2 py-3">
                  <input
                    type="radio"
                    :checked="selectedId === provider.id"
                    class="h-4 w-4 border-slate-300 text-stellar-500 focus:ring-stellar-400"
                    @change="select(provider.id)"
                  />
                </td>
                <td class="px-2 py-3 font-mono text-xs text-slate-500">{{ provider.code }}</td>
                <td class="px-2 py-3 font-medium text-slate-800 dark:text-slate-100">{{ provider.business_name }}</td>
                <td class="px-2 py-3 text-slate-600 dark:text-slate-300">{{ provider.document_number }}</td>
                <td class="px-2 py-3">
                  <span
                    class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium"
                    :class="provider.status ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'"
                  >
                    {{ provider.status ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between border-t border-slate-200 px-6 py-4 dark:border-slate-700">
          <p class="text-sm text-slate-500 dark:text-slate-400">
            {{ selectedId ? '1 proveedor seleccionado' : 'Ninguno seleccionado' }}
          </p>
          <div class="flex gap-3">
            <button
              type="button"
              class="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              @click="emit('close')"
            >
              Cancelar
            </button>
            <button
              type="button"
              :disabled="!selectedId"
              class="rounded-xl bg-gradient-to-r from-stellar-500 to-cosmic-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-stellar-400 hover:to-cosmic-400 disabled:cursor-not-allowed disabled:opacity-50"
              @click="handleConfirm"
            >
              Seleccionar
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
