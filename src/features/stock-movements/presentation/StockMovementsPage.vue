<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { filterMovementsByProductQuery } from '../application/filterMovementsByProductQuery'
import { formatOrderReferenceLabel } from '../application/formatOrderReferenceLabel'
import type { StockMovement } from '../domain/StockMovement'
import StockMovementsEmptyState from './molecules/StockMovementsEmptyState.vue'
import StockMovementsErrorBanner from './molecules/StockMovementsErrorBanner.vue'
import StockMovementsSearchField from './molecules/StockMovementsSearchField.vue'
import StockMovementDetailModal from './organisms/StockMovementDetailModal.vue'
import StockMovementsTable from './organisms/StockMovementsTable.vue'
import { useStockMovementStore } from './stockMovementStore'

const store = useStockMovementStore()
const pendingDelete = ref<StockMovement | null>(null)
const detailOpen = ref(false)
const searchQuery = ref('')

const orderLabelsById = computed(() => {
  const labels: Record<string, string> = {}
  for (const [id, order] of Object.entries(store.ordersById)) {
    labels[id] = formatOrderReferenceLabel(order)
  }
  return labels
})

/** Real-time, case-insensitive filter by product name (partial + full word). */
const filteredMovements = computed(() =>
  filterMovementsByProductQuery(store.movements, store.productsById, searchQuery.value),
)

onMounted(() => {
  void store.fetchMovements()
})

async function onView(movement: StockMovement): Promise<void> {
  store.selectLocal(movement)
  detailOpen.value = true
  await store.fetchMovementById(movement.id)
}

function onRemoveRequest(movement: StockMovement): void {
  pendingDelete.value = movement
}

async function confirmDelete(): Promise<void> {
  const target = pendingDelete.value
  if (!target) return
  const ok = await store.removeMovement(target.id)
  if (ok) pendingDelete.value = null
}

function cancelDelete(): void {
  pendingDelete.value = null
}

function closeDetail(): void {
  detailOpen.value = false
}

function onDetailClosed(): void {
  store.clearSelected()
}
</script>

<template>
  <div v-motion :initial="{ opacity: 0, y: 8 }" :enter="{ opacity: 1, y: 0, transition: { duration: 200 } }">
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
          Movimientos de stock
        </h1>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Historial de entradas y salidas que mantienen vivo tu inventario
        </p>
      </div>
      <div class="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
        <StockMovementsSearchField
          v-model="searchQuery"
          :disabled="store.isLoading || store.movements.length === 0"
        />
        <button
          type="button"
          class="inline-flex items-center justify-center gap-1.5 rounded-xl bg-stellar-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-stellar-400"
          :disabled="store.isLoading"
          @click="store.fetchMovements()"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Actualizar
        </button>
      </div>
    </div>

    <div v-if="store.isLoading" class="flex items-center justify-center py-20">
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-stellar-500 border-t-transparent" />
    </div>

    <StockMovementsErrorBanner
      v-else-if="store.error && store.movements.length === 0"
      :message="store.error"
      @retry="store.fetchMovements()"
    />

    <StockMovementsEmptyState v-else-if="store.movements.length === 0" />

    <template v-else>
      <StockMovementsErrorBanner
        v-if="store.error"
        class="mb-4"
        :message="store.error"
        @retry="store.clearError()"
      />

      <div
        v-if="filteredMovements.length === 0"
        class="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 py-16 text-center dark:border-slate-700"
      >
        <p class="text-sm font-medium text-slate-700 dark:text-slate-200">
          No hay movimientos que coincidan con tu búsqueda
        </p>
        <p class="max-w-sm text-xs text-slate-500 dark:text-slate-400">
          Prueba con otra palabra, una coincidencia parcial o el nombre completo del producto.
          Mayúsculas y minúsculas no importan.
        </p>
        <button
          type="button"
          class="mt-2 text-sm font-medium text-stellar-600 transition hover:text-stellar-500 dark:text-stellar-400"
          @click="searchQuery = ''"
        >
          Limpiar búsqueda
        </button>
      </div>

      <StockMovementsTable
        v-else
        :movements="filteredMovements"
        :products-by-id="store.productsById"
        :order-labels-by-id="orderLabelsById"
        :deleting="store.isDeleting"
        @view="onView"
        @remove="onRemoveRequest"
      />
    </template>

    <StockMovementDetailModal
      v-if="store.selected"
      :visible="detailOpen"
      :movement="store.selected"
      :product="store.productForSelected"
      :product-loading="store.isLoadingProductDetail"
      :company-name="store.companyNameForSelected"
      :company-loading="store.isLoadingCompanyDetail"
      :provider-name="store.providerNameForSelected"
      :provider-loading="store.isLoadingProviderDetail"
      :winery-name="store.wineryNameForSelected"
      :winery-loading="store.isLoadingWineryDetail"
      :order-reference-label="store.orderLabelForSelected"
      :order-loading="store.isLoadingOrderDetail"
      @close="closeDetail"
      @closed="onDetailClosed"
    />

    <Teleport v-if="pendingDelete" to="body">
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
        <div class="w-full max-w-md rounded-2xl border bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
          <h3 class="text-lg font-semibold text-slate-900 dark:text-white">¿Eliminar este movimiento?</h3>
          <p class="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Esta acción quita el rastro del movimiento
            <span class="font-mono text-slate-800 dark:text-slate-200">{{ pendingDelete.product_id }}</span>
            de tu historial. Si no estás seguro, puedes cancelar: tu inventario no se altera al cerrar este diálogo.
          </p>
          <div class="mt-6 flex justify-end gap-3">
            <button
              type="button"
              class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              :disabled="store.isDeleting"
              @click="cancelDelete"
            >
              Cancelar
            </button>
            <button
              type="button"
              class="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              :disabled="store.isDeleting"
              @click="confirmDelete"
            >
              {{ store.isDeleting ? 'Eliminando…' : 'Sí, eliminar' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
