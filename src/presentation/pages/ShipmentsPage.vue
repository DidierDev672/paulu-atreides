<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useShipmentStore } from '@/presentation/stores/shipmentStore'
import ShipmentForm from '@/presentation/components/shipments/ShipmentForm.vue'
import type { ShipmentResponse } from '@/application/services/shipmentService'

function formatCOP(value: number): string {
  return value.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const store = useShipmentStore()
const view = ref<'list' | 'create'>('list')
const search = ref('')
const statusFilter = ref('')
const expandedId = ref<string | null>(null)

const statuses = ['DRAFT', 'CONFIRMED', 'CANCELED']

const filteredShipments = computed(() => {
  let items = store.shipments
  const q = search.value.toLowerCase().trim()
  if (q) {
    items = items.filter(
      (s) =>
        s.shipment_number.toLowerCase().includes(q) ||
        s.movement_type.toLowerCase().includes(q) ||
        s.recipient.recipient_id.toLowerCase().includes(q),
    )
  }
  if (statusFilter.value) {
    items = items.filter((s) => s.status === statusFilter.value)
  }
  return items
})

const summaryStats = computed(() => {
  const all = store.shipments
  return {
    total: all.length,
    draft: all.filter((s) => s.status === 'DRAFT').length,
    confirmed: all.filter((s) => s.status === 'CONFIRMED').length,
    canceled: all.filter((s) => s.status === 'CANCELED').length,
    totalValue: all.reduce((sum, s) => sum + s.financial_summary.total, 0),
  }
})

const statusBadgeClass = (status: string): string => {
  switch (status) {
    case 'DRAFT':
      return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
    case 'CONFIRMED':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
    case 'CANCELED':
      return 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'
    default:
      return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
  }
}

onMounted(() => {
  store.fetchShipments()
})

async function handleDelete(id: string): Promise<void> {
  if (confirm('\u00bfEst\u00e1 seguro de eliminar este despacho?')) {
    await store.removeShipment(id)
  }
}

function toggleExpand(id: string): void {
  expandedId.value = expandedId.value === id ? null : id
}
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-8 sm:px-6">
    <!-- Header -->
    <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Despachos</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400">Gesti\u00f3n de movimientos de salida de inventario</p>
      </div>
      <button v-if="view === 'list'"
        class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-stellar-500 to-cosmic-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-stellar-400 hover:to-cosmic-400"
        @click="view = 'create'">
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Nuevo despacho
      </button>
      <button v-else
        class="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        @click="view = 'list'">
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Volver a la lista
      </button>
    </div>

    <!-- Create view -->
    <div v-if="view === 'create'">
      <ShipmentForm @saved="view = 'list'" @go-to-product-registration="$router?.push('/products')" />
    </div>

    <!-- List view -->
    <div v-else>
      <!-- Summary cards -->
      <div class="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
        <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p class="text-xs font-medium text-slate-500 dark:text-slate-400">Total</p>
          <p class="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{{ summaryStats.total }}</p>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p class="text-xs font-medium text-slate-500 dark:text-slate-400">Borrador</p>
          <p class="mt-1 text-2xl font-bold text-slate-600 dark:text-slate-300">{{ summaryStats.draft }}</p>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p class="text-xs font-medium text-slate-500 dark:text-slate-400">Confirmado</p>
          <p class="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{{ summaryStats.confirmed }}</p>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p class="text-xs font-medium text-slate-500 dark:text-slate-400">Cancelado</p>
          <p class="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">{{ summaryStats.canceled }}</p>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:col-span-1 col-span-2">
          <p class="text-xs font-medium text-slate-500 dark:text-slate-400">Valor total</p>
          <p class="mt-1 text-xl font-bold text-stellar-600 dark:text-stellar-400">${{ formatCOP(summaryStats.totalValue) }}</p>
        </div>
      </div>

      <!-- Search and filter -->
      <div class="mb-6 flex flex-col gap-3 sm:flex-row">
        <div class="relative flex-1">
          <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input v-model="search" type="text" placeholder="Buscar por n\u00famero, tipo o destinatario..."
            class="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
        </div>
        <select v-model="statusFilter"
          class="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
          <option value="">Todos los estados</option>
          <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>

      <!-- Loading -->
      <div v-if="store.isLoading" class="flex items-center justify-center py-16 text-slate-400">
        <svg class="h-6 w-6 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span class="ml-3 text-sm">Cargando despachos...</span>
      </div>

      <!-- Empty -->
      <div v-else-if="filteredShipments.length === 0"
        class="flex flex-col items-center rounded-2xl border-2 border-dashed border-slate-200 py-16 dark:border-slate-700">
        <svg class="mb-4 h-10 w-10 text-slate-300 dark:text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <p class="text-sm text-slate-400 dark:text-slate-500">No se encontraron despachos.</p>
      </div>

      <!-- List -->
      <div v-else class="space-y-3">
        <div v-for="shipment in filteredShipments" :key="shipment.id"
          class="rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
          <!-- Header row -->
          <div class="flex cursor-pointer items-center justify-between px-5 py-4" @click="toggleExpand(shipment.id)">
            <div class="flex items-center gap-4">
              <svg class="h-5 w-5 text-slate-400 transition" :class="{ 'rotate-90': expandedId === shipment.id }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              <div>
                <p class="font-medium text-slate-900 dark:text-white">{{ shipment.shipment_number }}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400">{{ shipment.movement_type }} &middot; {{ shipment.record_date }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <span class="rounded-full px-3 py-1 text-xs font-semibold" :class="statusBadgeClass(shipment.status)">
                {{ shipment.status }}
              </span>
              <span class="text-sm font-semibold text-stellar-600 dark:text-stellar-400">${{ formatCOP(shipment.financial_summary.total) }}</span>
            </div>
          </div>

          <!-- Expanded detail -->
          <div v-if="expandedId === shipment.id" class="border-t border-slate-100 px-5 py-4 dark:border-slate-800">
            <div class="mb-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              <div>
                <p class="text-xs text-slate-400">Destinatario</p>
                <p class="font-medium text-slate-700 dark:text-slate-200">{{ shipment.recipient.recipient_type }}: {{ shipment.recipient.recipient_id }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-400">Documento origen</p>
                <p class="font-mono text-xs text-slate-600 dark:text-slate-300">{{ shipment.source_document.entry_id || 'N/A' }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-400">Bodega</p>
                <p class="font-medium text-slate-700 dark:text-slate-200">{{ shipment.warehouse_id }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-400">Observaciones</p>
                <p class="text-slate-600 dark:text-slate-300">{{ shipment.remarks || 'N/A' }}</p>
              </div>
            </div>

            <table class="mb-4 w-full text-left text-sm">
              <thead>
                <tr class="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:border-slate-700">
                  <th class="px-2 py-2">C&oacute;digo</th>
                  <th class="px-2 py-2">Producto</th>
                  <th class="px-2 py-2">Unidad</th>
                  <th class="px-2 py-2">Cantidad</th>
                  <th class="px-2 py-2">Costo unit.</th>
                  <th class="px-2 py-2">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="d in shipment.details" :key="d.code" class="border-b border-slate-100 dark:border-slate-800">
                  <td class="px-2 py-2 font-mono text-xs text-slate-500">{{ d.code }}</td>
                  <td class="px-2 py-2 font-medium text-slate-800 dark:text-slate-100">{{ d.product }}</td>
                  <td class="px-2 py-2 text-slate-600 dark:text-slate-300">{{ d.unit }}</td>
                  <td class="px-2 py-2 text-slate-600 dark:text-slate-300">{{ d.quantity }}</td>
                  <td class="px-2 py-2 text-slate-600 dark:text-slate-300">${{ formatCOP(d.unit_cost) }}</td>
                  <td class="px-2 py-2 font-medium text-slate-700 dark:text-slate-200">${{ formatCOP(d.subtotal) }}</td>
                </tr>
              </tbody>
            </table>

            <div class="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
              <div class="space-x-2 text-xs text-slate-400">
                <span>Creado: {{ new Date(shipment.createdAt).toLocaleString('es-CO') }}</span>
                <span>&middot;</span>
                <span>Actualizado: {{ new Date(shipment.updatedAt).toLocaleString('es-CO') }}</span>
              </div>
              <div class="flex gap-2">
                <button
                  class="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-500/10"
                  @click.stop="handleDelete(shipment.id)">
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
