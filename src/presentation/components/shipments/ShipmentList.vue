<script setup lang="ts">
import { getProductEntryById } from '@/application/services/productEntryService'
import { getProviderById } from '@/application/services/providerService'
import type { ShipmentResponse } from '@/application/services/shipmentService'
import { getUserById } from '@/application/services/userService'
import { getWineryById } from '@/application/services/wineryService'
import ShipmentDetailCard from '@/presentation/components/shipments/ShipmentDetailCard.vue'
import ShipmentDetailModal from '@/presentation/components/shipments/ShipmentDetailModal.vue'
import ShipmentEditModal from '@/presentation/components/shipments/ShipmentEditModal.vue'
import { useShipmentStore } from '@/presentation/stores/shipmentStore'
import { formatCurrency } from '@/utils/formatters'
import { computed, onMounted, ref, watch } from 'vue'

const shipmentStore = useShipmentStore()
const searchQuery = ref('')
const statusFilter = ref('')
const expandedId = ref<string | null>(null)
const detailShipment = ref<ShipmentResponse | null>(null)
const editShipment = ref<ShipmentResponse | null>(null)
const deletingShipmentId = ref<string | null>(null)
const deleting = ref(false)
const providerNames = ref<Record<string, string>>({})
const wineryNames = ref<Record<string, string>>({})
const responsibleNames = ref<Record<string, string>>({})
const entryMovementTypes = ref<Record<string, string>>({})

const entryMovementLabels: Record<string, string> = {
  Purchase: 'Compra',
  Return: 'Devoluci\u00f3n',
  Donation: 'Donaci\u00f3n',
  'Inventory Adjustment': 'Ajuste de inventario',
  'Internal Production': 'Producci\u00f3n interna',
  ENTRADA: 'Entrada',
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

async function resolveProviderNames(shipments: ShipmentResponse[]): Promise<void> {
  const ids = [
    ...new Set(
      shipments
        .map((s) => s.recipient.recipient_id)
        .filter((id): id is string => Boolean(id?.trim())),
    ),
  ]
  const missing = ids.filter((id) => !(id in providerNames.value))
  await Promise.all(
    missing.map(async (id) => {
      try {
        const provider = await getProviderById(id)
        providerNames.value = { ...providerNames.value, [id]: provider.business_name }
      } catch {
        providerNames.value = { ...providerNames.value, [id]: id }
      }
    }),
  )
}

async function resolveWineryNames(shipments: ShipmentResponse[]): Promise<void> {
  const ids = [
    ...new Set(
      shipments
        .map((s) => s.warehouse_id)
        .filter((id): id is string => Boolean(id?.trim())),
    ),
  ]
  const missing = ids.filter((id) => !(id in wineryNames.value))
  await Promise.all(
    missing.map(async (id) => {
      try {
        const winery = await getWineryById(id)
        wineryNames.value = { ...wineryNames.value, [id]: winery.area }
      } catch {
        wineryNames.value = { ...wineryNames.value, [id]: id }
      }
    }),
  )
}

async function resolveResponsibleNames(shipments: ShipmentResponse[]): Promise<void> {
  const ids = [
    ...new Set(
      shipments
        .map((s) => s.responsible_id)
        .filter((id): id is string => Boolean(id?.trim())),
    ),
  ]
  const missing = ids.filter((id) => !(id in responsibleNames.value))
  await Promise.all(
    missing.map(async (id) => {
      try {
        const user = await getUserById(id)
        responsibleNames.value = { ...responsibleNames.value, [id]: user.name_full }
      } catch {
        responsibleNames.value = { ...responsibleNames.value, [id]: id }
      }
    }),
  )
}

async function resolveEntryMovementTypes(shipments: ShipmentResponse[]): Promise<void> {
  const ids = [
    ...new Set(
      shipments.flatMap((s) => s.source_document.entry_ids).filter((id): id is string => Boolean(id?.trim())),
    ),
  ]
  const missing = ids.filter((id) => !(id in entryMovementTypes.value))
  await Promise.all(
    missing.map(async (id) => {
      try {
        const entry = await getProductEntryById(id)
        entryMovementTypes.value = { ...entryMovementTypes.value, [id]: entry.movement_type }
      } catch {
        entryMovementTypes.value = { ...entryMovementTypes.value, [id]: id }
      }
    }),
  )
}

function providerName(recipientId: string): string {
  return providerNames.value[recipientId] || recipientId
}

function wineryName(warehouseId: string): string {
  return wineryNames.value[warehouseId] || warehouseId
}

function responsibleName(responsibleId: string): string {
  return responsibleNames.value[responsibleId] || responsibleId
}

function entryOriginsLabel(entryIds: string[]): string {
  if (!entryIds.length) return '—'
  return entryIds
    .map((id) => {
      const type = entryMovementTypes.value[id]
      return type ? entryMovementLabels[type] || type : id
    })
    .join(', ')
}

async function resolveLookupNames(shipments: ShipmentResponse[]): Promise<void> {
  await Promise.all([
    resolveProviderNames(shipments),
    resolveWineryNames(shipments),
    resolveResponsibleNames(shipments),
    resolveEntryMovementTypes(shipments),
  ])
}

onMounted(async () => {
  await shipmentStore.fetchShipments()
  await resolveLookupNames(shipmentStore.shipments)
})

watch(
  () => shipmentStore.shipments,
  (list) => {
    void resolveLookupNames(list)
  },
)

const filteredShipments = computed(() => {
  let list = shipmentStore.shipments
  const q = searchQuery.value.toLowerCase().trim()
  if (q) {
    list = list.filter(
      (s) =>
        s.shipment_number.toLowerCase().includes(q) ||
        s.movement_type.toLowerCase().includes(q) ||
        s.warehouse_id.toLowerCase().includes(q) ||
        wineryName(s.warehouse_id).toLowerCase().includes(q) ||
        s.responsible_id.toLowerCase().includes(q) ||
        responsibleName(s.responsible_id).toLowerCase().includes(q) ||
        s.recipient.recipient_id.toLowerCase().includes(q) ||
        providerName(s.recipient.recipient_id).toLowerCase().includes(q) ||
        entryOriginsLabel(s.source_document.entry_ids).toLowerCase().includes(q),
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
  <div v-motion :initial="{ opacity: 0, y: 8 }" :enter="{ opacity: 1, y: 0, transition: { duration: 200 } }">
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">Salidas</h1>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Listado de despachos y movimientos de salida</p>
      </div>
      <div class="flex w-full gap-3 sm:w-auto">
        <div class="relative flex-1 sm:w-56">
          <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none"
            viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input v-model="searchQuery" type="search" placeholder="Buscar salidas..."
            class="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm outline-none transition-colors focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800" />
        </div>
        <select v-model="statusFilter"
          class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition-colors focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
          <option value="">Todos</option>
          <option value="DRAFT">Borrador</option>
          <option value="CONFIRMED">Confirmado</option>
          <option value="CANCELED">Cancelado</option>
        </select>
      </div>
    </div>

    <div class="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
      <div class="rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
        <p class="text-xs text-slate-500 dark:text-slate-400">Total</p>
        <p class="text-lg font-bold text-slate-900 dark:text-white">{{ summaryStats.total }}</p>
      </div>
      <div class="rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
        <p class="text-xs text-slate-500 dark:text-slate-400">Borrador</p>
        <p class="text-lg font-bold text-dune-status-warning dark:text-dune-status-warning">{{ summaryStats.draft }}</p>
      </div>
      <div class="rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
        <p class="text-xs text-slate-500 dark:text-slate-400">Confirmado</p>
        <p class="text-lg font-bold text-dune-status-success dark:text-dune-status-success">{{ summaryStats.confirmed }}
        </p>
      </div>
      <div class="rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
        <p class="text-xs text-slate-500 dark:text-slate-400">Cancelado</p>
        <p class="text-lg font-bold text-dune-status-danger dark:text-dune-status-danger">{{ summaryStats.canceled }}
        </p>
      </div>
      <div
        class="rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900 sm:col-span-1">
        <p class="text-xs text-slate-500 dark:text-slate-400">Valor total</p>
        <p class="text-lg font-bold text-stellar-600 dark:text-stellar-400">{{ formatCurrency(summaryStats.totalValue) }}
        </p>
      </div>
    </div>

    <div v-if="shipmentStore.isLoading" class="flex items-center justify-center py-20">
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-stellar-500 border-t-transparent" />
    </div>

    <div v-else-if="shipmentStore.error"
      class="rounded-2xl border border-dune-status-danger/30 bg-dune-status-danger/10 p-4 text-sm text-dune-status-danger dark:border-dune-status-danger/30 dark:bg-dune-status-danger/10 dark:text-dune-status-danger">
      {{ shipmentStore.error }}
    </div>

    <div v-else-if="filteredShipments.length === 0"
      class="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
      <svg class="mx-auto mb-3 h-10 w-10 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24"
        stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
      <p class="text-slate-500 dark:text-slate-400">No se encontraron salidas.</p>
    </div>

    <div v-else class="space-y-3">
      <ShipmentDetailCard
        v-for="shipment in filteredShipments"
        :key="shipment.id"
        :shipment="shipment"
        :expanded="expandedId === shipment.id"
        :destinatario-nombre="providerName(shipment.recipient.recipient_id)"
        :tipo-destinatario="recipientLabels[shipment.recipient.recipient_type] || shipment.recipient.recipient_type"
        :tipo-movimiento="movementLabels[shipment.movement_type] || shipment.movement_type"
        :bodega="wineryName(shipment.warehouse_id)"
        :responsable="responsibleName(shipment.responsible_id)"
        :origen="entryOriginsLabel(shipment.source_document.entry_ids)"
        @toggle="toggleExpand(shipment.id)"
        @view="openDetail(shipment)"
        @edit="handleEdit(shipment)"
        @delete="confirmDelete(shipment.id)"
        @status-change="handleChangeStatus(shipment, $event)"
      />
    </div>
  </div>

  <Teleport v-if="deletingShipmentId" to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div class="w-full max-w-md rounded-2xl border bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div
          class="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-dune-status-danger/20 dark:bg-dune-status-danger/15">
          <svg class="h-6 w-6 text-dune-status-danger dark:text-dune-status-danger" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Eliminar salida</h3>
        <p class="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Esta acci&oacute;n no se puede deshacer. Al eliminar este registro de salida, perder&aacute;s
          la trazabilidad del movimiento de inventario, los costos asociados y el historial
          financiero de esta transacci&oacute;n. Los reportes contables y de existencias pueden
          quedar desincronizados, afectando la precisi&oacute;n de tu control de stock.
        </p>
        <p class="mt-3 text-sm font-medium text-dune-status-warning dark:text-dune-status-warning">
          Revisa que esta salida no haya sido utilizada como referencia en otros procesos antes de eliminarla.
        </p>
        <div class="mt-6 flex justify-end gap-3">
          <button type="button"
            class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            :disabled="deleting" @click="cancelDelete">
            Cancelar
          </button>
          <button type="button" :disabled="deleting"
            class="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700 disabled:opacity-50"
            @click="executeDelete">
            {{ deleting ? 'Eliminando...' : 'Sí, eliminar' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>

  <ShipmentDetailModal v-if="detailShipment" :shipment="detailShipment" @close="detailShipment = null" />

  <ShipmentEditModal v-if="editShipment" :shipment="editShipment" @close="editShipment = null"
    @saved="editShipment = null" />
</template>
