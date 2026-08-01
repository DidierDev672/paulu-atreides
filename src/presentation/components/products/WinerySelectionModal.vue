<script setup lang="ts">
import type { WineryResponse } from '@/application/services/wineryService'
import { useWineryStore } from '@/presentation/stores/wineryStore'
import { storeToRefs } from 'pinia'
import { computed, onMounted, shallowRef } from 'vue'

const props = defineProps<{
  /** Filters the GET /wineries list by company_id on the client. */
  companyId?: string
}>()

const emit = defineEmits<{
  close: []
  confirm: [winery: WineryResponse]
}>()

const MIN_LOADING_MS = 3000
const FRIENDLY_ERROR =
  'No pudimos cargar las bodegas en este momento. Tranquilo: suele resolverse al instante. Cuando quieras, vuelve a intentarlo — estamos aquí para ayudarte.'

const wineryStore = useWineryStore()
const { wineries, error: storeError } = storeToRefs(wineryStore)

const selectedId = shallowRef('')
const loading = shallowRef(true)
const search = shallowRef('')

/** Bodegas de la compañía seleccionada (filtro local sobre GET /wineries). */
const displayWineries = computed(() => {
  if (!props.companyId) return wineries.value
  return wineries.value.filter((w) => w.company_id === props.companyId)
})

const filteredWineries = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return displayWineries.value
  return displayWineries.value.filter(
    (w) =>
      w.area.toLowerCase().includes(q) ||
      w.units.toLowerCase().includes(q) ||
      w.registered_date.toLowerCase().includes(q),
  )
})

const hasError = computed(() => Boolean(storeError.value) && !loading.value)

function select(id: string): void {
  selectedId.value = id
}

/** Checkbox exclusivo: solo una bodega a la vez. */
function onCheckboxChange(id: string, event: Event): void {
  const checked = (event.target as HTMLInputElement).checked
  selectedId.value = checked ? id : selectedId.value === id ? '' : selectedId.value
}

function handleConfirm(): void {
  const winery = displayWineries.value.find((w) => w.id === selectedId.value)
  if (winery) {
    emit('confirm', winery)
  }
}

async function loadWineries(): Promise<void> {
  loading.value = true
  wineryStore.clearError()
  selectedId.value = ''

  // GET /wineries → array completo; el filtro por company_id es en cliente.
  await Promise.all([
    wineryStore.fetchWineries(),
    new Promise<void>((resolve) => {
      setTimeout(resolve, MIN_LOADING_MS)
    }),
  ])

  loading.value = false
}

function retry(): void {
  void loadWineries()
}

onMounted(() => {
  void loadWineries()
})
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
      @click.self="emit('close')">
      <div
        class="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <div>
            <h2 class="text-lg font-semibold text-slate-900 dark:text-white">Seleccionar bodega</h2>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              Seleccione la bodega asociada al producto
            </p>
          </div>
          <button type="button"
            class="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            @click="emit('close')">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Search -->
        <div v-if="!loading && !hasError" class="px-6 pt-4">
          <div class="relative">
            <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input v-model="search" type="text" placeholder="Buscar por área..."
              class="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-stellar-500" />
          </div>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto px-6 py-4">
          <div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-16 text-slate-400">
            <svg class="h-8 w-8 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span class="text-sm">Cargando bodegas...</span>
            <p class="max-w-xs text-center text-xs text-slate-400 dark:text-slate-500">
              Un momento, estamos preparando el listado para ti.
            </p>
          </div>

          <div v-else-if="hasError" class="flex flex-col items-center px-4 py-12 text-center">
            <div
              class="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-500/10">
              <svg class="h-8 w-8 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-100">
              Algo no salió como esperábamos
            </h3>
            <p class="mt-2 max-w-sm text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              {{ FRIENDLY_ERROR }}
            </p>
            <button type="button"
              class="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-stellar-500 to-cosmic-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-stellar-400 hover:to-cosmic-400"
              @click="retry">
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reintentar
            </button>
          </div>

          <div v-else-if="displayWineries.length === 0" class="flex flex-col items-center px-6 py-12 text-center">
            <div
              class="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-dune-primary-light to-dune-primary-dark shadow-[0_8px_24px_rgba(251,146,60,0.3)]">
              <svg class="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-100">
              No hay bodegas registradas
            </h3>
            <p class="mt-2 max-w-sm text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Registre una bodega primero para poder asociarla a un producto.
            </p>
            <div class="mt-6">
              <button type="button"
                class="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                @click="emit('close')">
                Cerrar
              </button>
            </div>
          </div>

          <table v-else class="w-full text-left text-sm">
            <thead>
              <tr
                class="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:border-slate-700">
                <th class="w-10 px-2 py-3"></th>
                <th class="px-2 py-3">Fecha de registro</th>
                <th class="px-2 py-3">Área</th>
                <th class="px-2 py-3">Unidades</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="winery in filteredWineries" :key="winery.id"
                class="cursor-pointer border-b border-slate-100 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/30"
                :class="{ 'bg-stellar-50/50 dark:bg-stellar-500/5': selectedId === winery.id }"
                @click="select(winery.id)">
                <td class="px-2 py-3" @click.stop>
                  <input
                    type="checkbox"
                    :checked="selectedId === winery.id"
                    class="h-4 w-4 rounded border-slate-300 text-stellar-500 focus:ring-stellar-400"
                    @change="onCheckboxChange(winery.id, $event)"
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
        <div v-if="!loading && !hasError" class="flex items-center justify-between border-t border-slate-200 px-6 py-4 dark:border-slate-700">
          <p class="text-sm text-slate-500 dark:text-slate-400">
            {{ selectedId ? '1 bodega seleccionada' : 'Ninguna seleccionada' }}
          </p>
          <div class="flex gap-3">
            <button type="button"
              class="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              @click="emit('close')">
              Cancelar
            </button>
            <button type="button" :disabled="!selectedId"
              class="rounded-xl bg-gradient-to-r from-stellar-500 to-cosmic-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-stellar-400 hover:to-cosmic-400 disabled:cursor-not-allowed disabled:opacity-50"
              @click="handleConfirm">
              Seleccionar
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
