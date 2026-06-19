<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useShipmentStore } from '@/presentation/stores/shipmentStore'
import ShipmentDetailModal from '@/presentation/components/shipments/ShipmentDetailModal.vue'
import ShipmentEditModal from '@/presentation/components/shipments/ShipmentEditModal.vue'
import type { ShipmentResponse } from '@/application/services/shipmentService'

const shipmentStore = useShipmentStore()
const searchQuery = ref('')
const statusFilter = ref('')
const expandedId = ref<string | null>(null)
const detailShipment = ref<ShipmentResponse | null>(null)
const editShipment = ref<ShipmentResponse | null>(null)
const deletingShipmentId = ref<string | null>(null)
const deleting = ref(false)

onMounted(() => {
  shipmentStore.fetchShipments()
})

const filteredShipments = computed(() => {
  let list = shipmentStore.shipments
  const q = searchQuery.value.toLowerCase().trim()
  if (q) {
    list = list.filter(
      (s) =>
        s.shipment_number.toLowerCase().includes(q) ||
        s.movement_type.toLowerCase().includes(q) ||
        s.warehouse_id.toLowerCase().includes(q) ||
        s.recipient.recipient_id.toLowerCase().includes(q),
    )
  }
  if (statusFilter.value) {
    list = list.filter((s) => s.status === statusFilter.value)
  }
  return list
})

function toggleExpand(id: string): void {
  expandedId.value = expandedId.value === id ? null : id
}

function confirmDelete(id: string): void {
  deletingShipmentId.value = id
}

function cancelDelete(): void {
  deletingShipmentId.value = null
}

async function executeDelete(): Promise<void> {
  const id = deletingShipmentId.value
  if (!id) return
  deleting.value = true
  try {
    await shipmentStore.removeShipment(id)
    deletingShipmentId.value = null
  } finally {
    deleting.value = false
  }
}

function openDetail(shipment: ShipmentResponse): void {
  detailShipment.value = shipment
}

function handleEdit(shipment: ShipmentResponse): void {
  editShipment.value = shipment
}

async function handleChangeStatus(shipment: ShipmentResponse, newStatus: string): Promise<void> {
  await shipmentStore.updateShipment(shipment.id, {
    shipment_number: shipment.shipment_number,
    record_date: shipment.record_date,
    movement_type: shipment.movement_type,
    status: newStatus,
    company_id: shipment.company_id,
    warehouse_id: shipment.warehouse_id,
    responsible_id: shipment.responsible_id,
    source_document: shipment.source_document,
    recipient: shipment.recipient,
    details: shipment.details,
    financial_summary: shipment.financial_summary,
    remarks: shipment.remarks,
  })
}

const statusBadges: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  CONFIRMED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  CANCELED: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400',
}

const movementLabels: Record<string, string> = {
  SALE: 'Venta',
  SUPPLIER_RETURN: 'Devoluci\u00f3n proveedor',
  DONATION: 'Donaci\u00f3n',
  SHRINKAGE: 'Merma',
  ADJUSTMENT: 'Ajuste',
  TRANSFER: 'Transferencia',
}

const recipientLabels: Record<string, string> = {
  CUSTOMER: 'Cliente',
  SUPPLIER: 'Proveedor',
  WAREHOUSE: 'Bodega',
  INTERNAL: 'Interno',
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatCOP(value: number): string {
  return value.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const summaryStats = computed(() => {
  const total = filteredShipments.value.length
  const draft = filteredShipments.value.filter((s) => s.status === 'DRAFT').length
  const confirmed = filteredShipments.value.filter((s) => s.status === 'CONFIRMED').length
  const canceled = filteredShipments.value.filter((s) => s.status === 'CANCELED').length
  const totalValue = filteredShipments.value.reduce((sum, s) => sum + s.financial_summary.total, 0)
  return { total, draft, confirmed, canceled, totalValue }
})
</script>

<template>
  <div v-motion :initial="{ opacity: 0, y: 8 }" :enter="{ opacity: 1, y: 0, transition: { duration: 350 } }">
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">Salidas</h1>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Listado de despachos y movimientos de salida</p>
      </div>
      <div class="flex w-full gap-3 sm:w-auto">
        <div class="relative flex-1 sm:w-56">
          <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input v-model="searchQuery" type="search" placeholder="Buscar salidas..." class="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800" />
        </div>
        <select v-model="statusFilter" class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
          <option value="">Todos</option>
          <option value="DRAFT">Borrador</option>
          <option value="CONFIRMED">Confirmado</option>
          <option value="CANCELED">Cancelado</option>
        </select>
      </div>
    </div>

    <!-- Summary cards -->
    <div class="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
      <div class="rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
        <p class="text-xs text-slate-500 dark:text-slate-400">Total</p>
        <p class="text-lg font-bold text-slate-900 dark:text-white">{{ summaryStats.total }}</p>
      </div>
      <div class="rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
        <p class="text-xs text-slate-500 dark:text-slate-400">Borrador</p>
        <p class="text-lg font-bold text-amber-600 dark:text-amber-400">{{ summaryStats.draft }}</p>
      </div>
      <div class="rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
        <p class="text-xs text-slate-500 dark:text-slate-400">Confirmado</p>
        <p class="text-lg font-bold text-emerald-600 dark:text-emerald-400">{{ summaryStats.confirmed }}</p>
      </div>
      <div class="rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
        <p class="text-xs text-slate-500 dark:text-slate-400">Cancelado</p>
        <p class="text-lg font-bold text-red-600 dark:text-red-400">{{ summaryStats.canceled }}</p>
      </div>
      <div class="rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900 sm:col-span-1">
        <p class="text-xs text-slate-500 dark:text-slate-400">Valor total</p>
        <p class="text-lg font-bold text-stellar-600 dark:text-stellar-400">${{ formatCOP(summaryStats.totalValue) }}</p>
      </div>
    </div>

    <div v-if="shipmentStore.isLoading" class="flex items-center justify-center py-20">
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-stellar-500 border-t-transparent" />
    </div>

    <div v-else-if="shipmentStore.error" class="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
      {{ shipmentStore.error }}
    </div>

    <div v-else-if="filteredShipments.length === 0" class="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
      <svg class="mx-auto mb-3 h-10 w-10 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
      <p class="text-slate-500 dark:text-slate-400">No se encontraron salidas.</p>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="(shipment, index) in filteredShipments"
        :key="shipment.id"
        v-motion
        :initial="{ opacity: 0, y: 12 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 300, delay: index * 50 } }"
        class="rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
      >
        <div class="flex cursor-pointer items-center gap-4 px-5 py-4" @click="toggleExpand(shipment.id)">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="font-semibold text-slate-900 dark:text-white">{{ shipment.shipment_number }}</span>
              <span class="rounded-lg px-2 py-0.5 text-xs font-semibold" :class="statusBadges[shipment.status] || 'bg-slate-100 text-slate-600'">{{ shipment.status === 'DRAFT' ? 'Borrador' : shipment.status === 'CONFIRMED' ? 'Confirmado' : 'Cancelado' }}</span>
              <span class="rounded-lg bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">{{ movementLabels[shipment.movement_type] || shipment.movement_type }}</span>
            </div>
            <p class="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
              {{ formatDate(shipment.record_date) }} &middot; {{ recipientLabels[shipment.recipient.recipient_type] || shipment.recipient.recipient_type }}: {{ shipment.recipient.recipient_id }} &middot; ${{ formatCOP(shipment.financial_summary.total) }}
            </p>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <button
              type="button"
              class="rounded-xl px-3 py-1.5 text-xs font-medium text-blue-500 transition hover:bg-blue-50 dark:hover:bg-blue-500/10"
              @click.stop="openDetail(shipment)"
            >
              Ver detalle
            </button>
            <button
              type="button"
              class="rounded-xl px-3 py-1.5 text-xs font-medium text-amber-600 transition hover:bg-amber-50 dark:hover:bg-amber-500/10"
              @click.stop="handleEdit(shipment)"
            >
              Editar
            </button>
            <button
              type="button"
              class="rounded-xl px-3 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-50 dark:hover:bg-red-500/10"
              @click.stop="confirmDelete(shipment.id)"
            >
              Eliminar
            </button>
            <svg class="h-4 w-4 text-slate-400 transition" :class="expandedId === shipment.id ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          leave-active-class="transition-all duration-150 ease-in"
          enter-from-class="opacity-0 max-h-0"
          enter-to-class="opacity-100 max-h-[2000px]"
          leave-from-class="opacity-100 max-h-[2000px]"
          leave-to-class="opacity-0 max-h-0"
        >
          <div v-if="expandedId === shipment.id" class="border-t border-slate-100 px-5 py-4 dark:border-slate-800">
            <div class="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3 lg:grid-cols-4">
              <div><span class="text-slate-500">Bodega:</span> {{ shipment.warehouse_id }}</div>
              <div><span class="text-slate-500">Responsable:</span> {{ shipment.responsible_id }}</div>
              <div><span class="text-slate-500">Destinatario:</span> {{ recipientLabels[shipment.recipient.recipient_type] || shipment.recipient.recipient_type }} ({{ shipment.recipient.recipient_id }})</div>
              <div><span class="text-slate-500">Entrada(s) origen:</span> {{ shipment.source_document.entry_ids.length > 0 ? shipment.source_document.entry_ids.join(', ') : '—' }}</div>
              <div><span class="text-slate-500">Subtotal:</span> ${{ formatCOP(shipment.financial_summary.subtotal) }}</div>
              <div><span class="text-slate-500">IVA (19%):</span> ${{ formatCOP(shipment.financial_summary.vat) }}</div>
              <div><span class="text-slate-500">Descuento:</span> ${{ formatCOP(shipment.financial_summary.discount) }}</div>
              <div><span class="text-slate-500">Total:</span> <strong>${{ formatCOP(shipment.financial_summary.total) }}</strong></div>
            </div>

            <div class="mt-3 flex items-center gap-3 text-sm">
              <span class="text-slate-500 dark:text-slate-400">Estado:</span>
              <span class="rounded-lg px-2 py-0.5 text-xs font-semibold" :class="statusBadges[shipment.status] || 'bg-slate-100 text-slate-600'">{{ shipment.status === 'DRAFT' ? 'Borrador' : shipment.status === 'CONFIRMED' ? 'Confirmado' : 'Cancelado' }}</span>
              <select
                class="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs outline-none focus:border-stellar-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                @change="handleChangeStatus(shipment, ($event.target as HTMLSelectElement).value)"
              >
                <option value="" disabled selected>Cambiar estado...</option>
                <option value="DRAFT" :disabled="shipment.status === 'DRAFT'">Borrador</option>
                <option value="CONFIRMED" :disabled="shipment.status === 'CONFIRMED'">Confirmado</option>
                <option value="CANCELED" :disabled="shipment.status === 'CANCELED'">Cancelado</option>
              </select>
            </div>

            <div v-if="shipment.remarks" class="mt-3 text-sm text-slate-600 dark:text-slate-400">
              <span class="text-slate-500">Observaciones:</span> {{ shipment.remarks }}
            </div>

            <div v-if="shipment.details.length" class="mt-4 overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead>
                  <tr class="border-b border-slate-200 text-slate-400 dark:border-slate-700">
                    <th class="px-2 py-1">C\u00f3digo</th>
                    <th class="px-2 py-1">Producto</th>
                    <th class="px-2 py-1">Unidad</th>
                    <th class="px-2 py-1">Cantidad</th>
                    <th class="px-2 py-1">Costo unit.</th>
                    <th class="px-2 py-1">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="d in shipment.details" :key="d.code" class="border-b border-slate-100 dark:border-slate-800">
                    <td class="px-2 py-1 font-mono">{{ d.code }}</td>
                    <td class="px-2 py-1">{{ d.product }}</td>
                    <td class="px-2 py-1">{{ d.unit }}</td>
                    <td class="px-2 py-1">{{ d.quantity }}</td>
                    <td class="px-2 py-1">${{ formatCOP(d.unit_cost) }}</td>
                    <td class="px-2 py-1 dark:text-white">${{ formatCOP(d.subtotal) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="mt-3 flex gap-4 text-xs text-slate-400 dark:text-slate-500">
              <span>Creado: {{ formatDate(shipment.createdAt) }}</span>
              <span>Actualizado: {{ formatDate(shipment.updatedAt) }}</span>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>

  <Teleport v-if="deletingShipmentId" to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div class="w-full max-w-md rounded-2xl border bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div class="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20">
          <svg class="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Eliminar salida</h3>
        <p class="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Esta acci&oacute;n no se puede deshacer. Al eliminar este registro de salida, perder&aacute;s
          la trazabilidad del movimiento de inventario, los costos asociados y el historial
          financiero de esta transacci&oacute;n. Los reportes contables y de existencias pueden
          quedar desincronizados, afectando la precisi&oacute;n de tu control de stock.
        </p>
        <p class="mt-3 text-sm font-medium text-amber-600 dark:text-amber-400">
          Revisa que esta salida no haya sido utilizada como referencia en otros procesos antes de eliminarla.
        </p>
        <div class="mt-6 flex justify-end gap-3">
          <button
            type="button"
            class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            :disabled="deleting"
            @click="cancelDelete"
          >
            Cancelar
          </button>
          <button
            type="button"
            :disabled="deleting"
            class="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-50"
            @click="executeDelete"
          >
            {{ deleting ? 'Eliminando...' : 'Sí, eliminar' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>

  <ShipmentDetailModal
    v-if="detailShipment"
    :shipment="detailShipment"
    @close="detailShipment = null"
  />

  <ShipmentEditModal
    v-if="editShipment"
    :shipment="editShipment"
    @close="editShipment = null"
    @saved="editShipment = null"
  />
</template>
