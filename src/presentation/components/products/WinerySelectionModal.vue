<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getWineriesByCompany } from '@/application/services/wineryService'
import type { WineryResponse } from '@/application/services/wineryService'

const props = defineProps<{
  companyId: string
}>()

const emit = defineEmits<{
  close: []
  confirm: [winery: WineryResponse]
}>()

const wineries = ref<WineryResponse[]>([])
const selectedId = ref('')
const loading = ref(true)
const error = ref('')
const search = ref('')

const filteredWineries = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return wineries.value
  return wineries.value.filter((w) => w.area.toLowerCase().includes(q))
})

function select(id: string): void {
  selectedId.value = id
}

function handleConfirm(): void {
  const winery = wineries.value.find((w) => w.id === selectedId.value)
  if (winery) {
    emit('confirm', winery)
  }
}

onMounted(async () => {
  try {
    wineries.value = await getWineriesByCompany(props.companyId)
  } catch {
    error.value = 'Error al cargar las bodegas.'
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
            <h2 class="text-lg font-semibold text-slate-900 dark:text-white">Seleccionar bodega</h2>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              Seleccione la bodega asociada al producto
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
              placeholder="Buscar por área..."
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
            <span class="ml-3 text-sm">Cargando bodegas...</span>
          </div>

          <div v-else-if="error" class="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
            {{ error }}
          </div>

          <div v-else-if="wineries.length === 0" class="flex flex-col items-center px-6 py-12 text-center">
            <div class="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-[0_8px_24px_rgba(251,146,60,0.3)]">
              <svg class="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-100">
              No hay bodegas registradas
            </h3>
            <p class="mt-2 max-w-sm text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Registre una bodega primero para poder asociarla a un producto.
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
                <th class="px-2 py-3">Fecha de registro</th>
                <th class="px-2 py-3">Área</th>
                <th class="px-2 py-3">Unidades</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="winery in filteredWineries"
                :key="winery.id"
                class="cursor-pointer border-b border-slate-100 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/30"
                :class="{ 'bg-stellar-50/50 dark:bg-stellar-500/5': selectedId === winery.id }"
                @click="select(winery.id)"
              >
                <td class="px-2 py-3">
                  <input
                    type="radio"
                    :checked="selectedId === winery.id"
                    class="h-4 w-4 border-slate-300 text-stellar-500 focus:ring-stellar-400"
                    @change="select(winery.id)"
                  />
                </td>
                <td class="px-2 py-3 font-mono text-xs text-slate-500">{{ winery.registered_date }}</td>
                <td class="px-2 py-3 font-medium text-slate-800 dark:text-slate-100">{{ winery.area }}</td>
                <td class="px-2 py-3 text-slate-600 dark:text-slate-300">{{ winery.units }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between border-t border-slate-200 px-6 py-4 dark:border-slate-700">
          <p class="text-sm text-slate-500 dark:text-slate-400">
            {{ selectedId ? '1 bodega seleccionada' : 'Ninguna seleccionada' }}
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
