<script setup lang="ts">
import InventoryAdjustmentCard from '@/presentation/components/productEntries/InventoryAdjustmentCard.vue'
import { useProductEntryStore } from '@/presentation/stores/productEntryStore'
import { computed, onMounted, ref } from 'vue'

const entryStore = useProductEntryStore()
const expandedId = ref<string | null>(null)
const searchQuery = ref('')

const MOVEMENT_TYPE_LABELS: Record<string, string> = {
  Purchase: 'Compra',
  Return: 'Devolución',
  Donation: 'Donación',
  'Inventory Adjustment': 'Ajuste de inventario',
  'Internal Production': 'Producción interna',
}

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

function movementTypeLabel(type: string): string {
  return MOVEMENT_TYPE_LABELS[type] ?? type
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
</script>

<template>
  <div v-motion :initial="{ opacity: 0, y: 8 }" :enter="{ opacity: 1, y: 0, transition: { duration: 180 } }">
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">Entradas de productos
        </h1>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Listado de entradas registradas en el inventario.</p>
      </div>
      <div class="flex items-center gap-3">
        <div class="relative">
          <svg class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input v-model="searchQuery" type="text" placeholder="Buscar entrada..."
            class="w-56 rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-3 text-sm outline-none transition-colors focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500" />
        </div>
        <button type="button"
          class="inline-flex items-center gap-1.5 rounded-xl bg-stellar-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-stellar-400"
          @click="entryStore.fetchEntries()">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
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

    <div v-else-if="entryStore.error"
      class="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
      {{ entryStore.error }}
    </div>

    <div v-else-if="filteredEntries.length === 0" class="flex flex-col items-center gap-3 py-20 text-slate-400">
      <svg class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
      <p class="text-sm">No hay entradas registradas.</p>
    </div>

    <div v-else class="space-y-3">
      <InventoryAdjustmentCard
        v-for="entry in filteredEntries"
        :key="entry.id"
        :entry="entry"
        :tipo-label="movementTypeLabel(entry.movement_type)"
        :expanded="expandedId === entry.id"
        @toggle="toggleExpand(entry.id)"
        @delete="handleDelete(entry.id)"
      />
    </div>
  </div>
</template>
