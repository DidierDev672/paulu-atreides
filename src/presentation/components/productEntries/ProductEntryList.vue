<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useProductEntryStore } from '@/presentation/stores/productEntryStore'

const entryStore = useProductEntryStore()
const expandedId = ref<string | null>(null)
const searchQuery = ref('')

onMounted(() => {
  entryStore.fetchEntries()
})

function toggleExpand(id: string): void {
  expandedId.value = expandedId.value === id ? null : id
}

async function handleDelete(id: string): Promise<void> {
  if (!confirm('¿Eliminar esta entrada de productos?')) return
  await entryStore.removeEntry(id)
}

const filteredEntries = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return entryStore.entries
  return entryStore.entries.filter(
    (e) =>
      e.entry_number.toLowerCase().includes(q) ||
      e.movement_type.toLowerCase().includes(q) ||
      movementTypeLabel(e.movement_type).toLowerCase().includes(q) ||
      e.warehouse.toLowerCase().includes(q),
  )
})

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatCOP(value: number): string {
  return value.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const MOVEMENT_TYPE_LABELS: Record<string, string> = {
  Purchase: 'Compra',
  Return: 'Devolución',
  Donation: 'Donación',
  'Inventory Adjustment': 'Ajuste de inventario',
  'Internal Production': 'Producción interna',
}

function movementTypeLabel(type: string): string {
  return MOVEMENT_TYPE_LABELS[type] ?? type
}
</script>

<template>
  <div v-motion :initial="{ opacity: 0, y: 8 }" :enter="{ opacity: 1, y: 0, transition: { duration: 350 } }">
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">Entradas de productos</h1>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Listado de entradas registradas en el inventario.</p>
      </div>
      <div class="flex items-center gap-3">
        <div class="relative">
          <svg class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar entrada..."
            class="w-56 rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-3 text-sm outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
          />
        </div>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-xl bg-stellar-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-stellar-400"
          @click="entryStore.fetchEntries()"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualizar
        </button>
      </div>
    </div>

    <div v-if="entryStore.isLoading" class="flex items-center justify-center py-20">
      <svg class="h-8 w-8 animate-spin text-stellar-500" viewBox="0 0 24 24" fill="none">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>

    <div v-else-if="entryStore.error" class="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
      {{ entryStore.error }}
    </div>

    <div v-else-if="filteredEntries.length === 0" class="flex flex-col items-center gap-3 py-20 text-slate-400">
      <svg class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
      <p class="text-sm">No hay entradas registradas.</p>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="(entry, index) in filteredEntries"
        :key="entry.id"
        v-motion
        :initial="{ opacity: 0, y: 12 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: index * 50, duration: 300, ease: 'easeOut' } }"
        class="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition dark:border-slate-800 dark:bg-slate-900"
      >
        <div
          class="flex cursor-pointer items-center gap-4 px-5 py-4 transition hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
          @click="toggleExpand(entry.id)"
        >
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="text-sm font-semibold text-slate-900 dark:text-white">{{ entry.entry_number }}</span>
              <span
                class="rounded-full px-2 py-0.5 text-[11px] font-medium"
                :class="{
                  'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400': entry.movement_type === 'Purchase',
                  'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400': entry.movement_type === 'Return',
                  'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400': entry.movement_type === 'Donation',
                  'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-400': entry.movement_type === 'Inventory Adjustment',
                  'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400': entry.movement_type === 'Internal Production',
                }"
              >
                {{ movementTypeLabel(entry.movement_type) }}
              </span>
            </div>
            <div class="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
              <span>{{ formatDate(entry.registered_date) }}</span>
              <span v-if="entry.warehouse">{{ entry.warehouse }}</span>
              <span>{{ entry.details.length }} producto{{ entry.details.length !== 1 ? 's' : '' }}</span>
              <span class="font-medium text-slate-700 dark:text-slate-300">{{ formatCOP(entry.financial_summary.purchase_total) }}</span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="rounded-lg p-1.5 text-red-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
              title="Eliminar"
              @click.stop="handleDelete(entry.id)"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            <svg
              class="h-5 w-5 text-slate-400 transition-transform duration-200"
              :class="expandedId === entry.id ? 'rotate-180' : ''"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <Transition name="expand">
          <div v-if="expandedId === entry.id" class="border-t border-slate-100 dark:border-slate-800">
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead>
                  <tr class="border-b border-slate-100 bg-slate-50/50 font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-800/30 dark:text-slate-400">
                    <th class="px-5 py-2.5">C&oacute;digo</th>
                    <th class="px-5 py-2.5">Producto</th>
                    <th class="px-5 py-2.5">Unidad</th>
                    <th class="px-5 py-2.5">Cantidad</th>
                    <th class="px-5 py-2.5">Costo unit.</th>
                    <th class="px-5 py-2.5">Subtotal</th>
                    <th class="px-5 py-2.5">Margen</th>
                    <th class="px-5 py-2.5">Precio venta</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(detail, di) in entry.details"
                    :key="di"
                    class="border-b border-slate-100 transition hover:bg-slate-50/50 dark:border-slate-800 dark:hover:bg-slate-800/30"
                  >
                    <td class="px-5 py-2.5 font-medium text-slate-800 dark:text-slate-200">{{ detail.code }}</td>
                    <td class="px-5 py-2.5 text-slate-600 dark:text-slate-300">{{ detail.product }}</td>
                    <td class="px-5 py-2.5 text-slate-500">{{ detail.unit }}</td>
                    <td class="px-5 py-2.5 text-slate-700 dark:text-slate-200">{{ detail.quantity }}</td>
                    <td class="px-5 py-2.5 text-slate-700 dark:text-slate-200">{{ formatCOP(detail.unit_cost) }}</td>
                    <td class="px-5 py-2.5 text-slate-700 dark:text-slate-200">{{ formatCOP(detail.subtotal) }}</td>
                    <td class="px-5 py-2.5 text-slate-700 dark:text-slate-200">{{ detail.profit_margin }}%</td>
                    <td class="px-5 py-2.5 font-medium text-emerald-600 dark:text-emerald-400">{{ formatCOP(detail.suggested_selling_price) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-if="entry.observations" class="border-t border-slate-100 px-5 py-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <span class="font-medium">Observaciones:</span> {{ entry.observations }}
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition: all 0.2s ease;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}
</style>
