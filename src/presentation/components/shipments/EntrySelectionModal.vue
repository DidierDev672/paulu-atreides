<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getProductEntries } from '@/application/services/productEntryService'
import type { ProductEntryResponse } from '@/application/services/productEntryService'

const props = defineProps<{
  companyId: string
}>()

const emit = defineEmits<{
  close: []
  confirm: [entries: ProductEntryResponse[]]
}>()

const movementLabels: Record<string, string> = {
  Purchase: 'Compra',
  Return: 'Devoluci\u00f3n',
  Donation: 'Donaci\u00f3n',
  'Inventory Adjustment': 'Ajuste de inventario',
  'Internal Production': 'Producci\u00f3n interna',
}

const entries = ref<ProductEntryResponse[]>([])
const selectedIds = ref<Set<string>>(new Set())
const expandedId = ref<string | null>(null)
const loading = ref(true)
const error = ref('')
const search = ref('')

function toggleExpand(id: string): void {
  expandedId.value = expandedId.value === id ? null : id
}

function formatCOP(value: number): string {
  return value.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const filteredEntries = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return entries.value
  return entries.value.filter(
    (e) =>
      e.entry_number.toLowerCase().includes(q) ||
      e.movement_type.toLowerCase().includes(q) ||
      e.details.some((d) => d.code.toLowerCase().includes(q) || d.product.toLowerCase().includes(q)),
  )
})

function toggle(id: string): void {
  const s = new Set(selectedIds.value)
  if (s.has(id)) {
    s.delete(id)
  } else {
    s.add(id)
  }
  selectedIds.value = s
}

function handleConfirm(): void {
  const selected = entries.value.filter((e) => selectedIds.value.has(e.id))
  emit('confirm', selected)
}

onMounted(async () => {
  try {
    entries.value = await getProductEntries()
  } catch {
    error.value = 'Error al cargar las entradas.'
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
        class="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
      >
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <div>
            <h2 class="text-lg font-semibold text-slate-900 dark:text-white">Seleccionar entrada(s)</h2>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              Seleccione las entradas cuyos productos ser\u00e1n despachados
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
              placeholder="Buscar por n\u00famero, tipo o producto..."
              class="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
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
            <span class="ml-3 text-sm">Cargando entradas...</span>
          </div>

          <div v-else-if="error" class="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
            {{ error }}
          </div>

          <div v-else-if="entries.length === 0" class="flex flex-col items-center px-6 py-12 text-center">
            <div class="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-[0_8px_24px_rgba(251,146,60,0.3)]">
              <svg class="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-100">
              No hay entradas registradas
            </h3>
            <p class="mt-2 max-w-sm text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Sin entradas registradas, el sistema no puede reflejar la existencia real de tus productos. Esto significa que <strong class="font-semibold text-slate-700 dark:text-slate-300">no podr\u00e1s crear \u00f3rdenes ni realizar despachos</strong> con productos que no tengan un ingreso documentado.
            </p>
            <p class="mt-3 max-w-sm text-xs leading-relaxed text-amber-600 dark:text-amber-400">
              Cada producto sin entrada es un hueco en tu inventario — <strong class="font-semibold">registrar las entradas es el \u00fanico camino para tener control real sobre tu stock</strong> y evitar p\u00e9rdidas, sobrecostos y decisiones basadas en datos incorrectos.
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
                <th class="px-2 py-3">N\u00famero de entrada</th>
                <th class="px-2 py-3">Fecha</th>
                <th class="px-2 py-3">Tipo</th>
                <th class="px-2 py-3">Productos</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="entry in filteredEntries" :key="entry.id">
                <tr
                  class="cursor-pointer border-b border-slate-100 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/30"
                  :class="{ 'bg-stellar-50/50 dark:bg-stellar-500/5': selectedIds.has(entry.id) }"
                  @click="toggleExpand(entry.id)"
                >
                  <td class="px-2 py-3">
                    <input
                      type="checkbox"
                      :checked="selectedIds.has(entry.id)"
                      class="h-4 w-4 rounded border-slate-300 text-stellar-500 focus:ring-stellar-400"
                      @click.stop
                      @change="toggle(entry.id)"
                    />
                  </td>
                  <td class="px-2 py-3 font-mono text-xs font-medium text-slate-800 dark:text-slate-100">{{ entry.entry_number }}</td>
                  <td class="px-2 py-3 text-slate-600 dark:text-slate-300">{{ entry.registered_date }}</td>
                  <td class="px-2 py-3 text-slate-600 dark:text-slate-300">{{ movementLabels[entry.movement_type] || entry.movement_type }}</td>
                  <td class="px-2 py-3">
                    <div class="flex items-center gap-2">
                      <span class="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {{ entry.details.length }}
                      </span>
                      <svg
                        class="h-4 w-4 text-slate-400 transition"
                        :class="expandedId === entry.id ? 'rotate-180' : ''"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </td>
                </tr>
                <tr v-if="expandedId === entry.id" class="accordion-row">
                  <td colspan="5" class="bg-slate-50 px-6 py-4 dark:bg-slate-800/50">
                    <div class="overflow-x-auto rounded-xl border border-slate-200 animate-fade-in dark:border-slate-700">
                      <table class="w-full text-left text-xs">
                        <thead>
                          <tr class="border-b border-slate-200 bg-white text-xs font-semibold uppercase tracking-wider text-slate-400 dark:border-slate-700 dark:bg-slate-900">
                            <th class="px-4 py-2">Producto</th>
                            <th class="px-4 py-2">Cantidad</th>
                            <th class="px-4 py-2">Precio a la venta</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(detail, index) in entry.details" :key="detail.code" class="border-b border-slate-100 bg-white last:border-0 dark:border-slate-800 dark:bg-slate-900 product-row" :style="{ animationDelay: index * 0.08 + 's' }">
                            <td class="px-4 py-2">
                              <p class="font-medium text-slate-800 dark:text-slate-100">{{ detail.product }}</p>
                              <p class="text-slate-400">{{ detail.code }}</p>
                            </td>
                            <td class="px-4 py-2 text-slate-600 dark:text-slate-300">{{ detail.quantity }} {{ detail.unit }}</td>
                            <td class="px-4 py-2 font-medium text-stellar-600 dark:text-stellar-400">{{ formatCOP(detail.suggested_selling_price) }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between border-t border-slate-200 px-6 py-4 dark:border-slate-700">
          <p class="text-sm text-slate-500 dark:text-slate-400">
            {{ selectedIds.size }} entrada{{ selectedIds.size !== 1 ? 's' : '' }} seleccionada{{ selectedIds.size !== 1 ? 's' : '' }}
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
              :disabled="selectedIds.size === 0"
              class="rounded-xl bg-gradient-to-r from-stellar-500 to-cosmic-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-stellar-400 hover:to-cosmic-400 disabled:cursor-not-allowed disabled:opacity-50"
              @click="handleConfirm"
            >
              Seleccionar ({{ selectedIds.size }})
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.accordion-row {
  animation: accordionFadeIn 0.3s ease-out;
}

@keyframes accordionFadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.product-row {
  animation: productFadeIn 0.4s ease-out both;
}

@keyframes productFadeIn {
  from {
    opacity: 0;
    transform: translateX(-6px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
