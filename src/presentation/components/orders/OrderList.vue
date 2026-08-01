<script setup lang="ts">
import { getUserById } from '@/application/services/userService'
import OrderDetailCard from '@/presentation/components/orders/OrderDetailCard.vue'
import OrderEditModal from '@/presentation/components/orders/OrderEditModal.vue'
import { useHistoryLogger } from '@/presentation/composables/useHistoryLogger'
import { useOrderStore } from '@/presentation/stores/orderStore'
import { useShipmentStore } from '@/presentation/stores/shipmentStore'
import { computed, onMounted, ref, watch } from 'vue'

const orderStore = useOrderStore()
const shipmentStore = useShipmentStore()
const { logDelete, logApprove } = useHistoryLogger()
const expandedId = ref<string | null>(null)
const searchQuery = ref('')
const editingOrder = ref<string | null>(null)
const deletingOrder = ref<string | null>(null)
const showPostDeleteDialog = ref(false)
const deleting = ref(false)
const userNames = ref<Record<string, string>>({})

const ORDER_TYPE_LABELS: Record<string, string> = {
  PURCHASE: 'Compra',
  REPLENISHMENT: 'Reabastecimiento',
  PRODUCTION: 'Producción',
  TRANSFER: 'Transferencia',
}

async function resolveUserNames(orders: { user_id: string }[]): Promise<void> {
  const ids = [
    ...new Set(orders.map((o) => o.user_id).filter((id): id is string => Boolean(id?.trim()))),
  ]
  const missing = ids.filter((id) => !(id in userNames.value))
  await Promise.all(
    missing.map(async (id) => {
      try {
        const user = await getUserById(id)
        userNames.value = { ...userNames.value, [id]: user.name_full }
      } catch {
        userNames.value = { ...userNames.value, [id]: id }
      }
    }),
  )
}

function userName(userId: string): string {
  return userNames.value[userId] || userId
}

function startEdit(id: string): void {
  editingOrder.value = id
}

function closeEdit(): void {
  editingOrder.value = null
}

function onEditSaved(): void {
  editingOrder.value = null
  orderStore.fetchOrders()
}

onMounted(async () => {
  await orderStore.fetchOrders()
  await resolveUserNames(orderStore.orders)
})

watch(
  () => orderStore.orders,
  (list) => {
    void resolveUserNames(list)
  },
)

function toggleExpand(id: string): void {
  expandedId.value = expandedId.value === id ? null : id
}

function confirmDelete(id: string): void {
  deletingOrder.value = id
}

function cancelDelete(): void {
  deletingOrder.value = null
}

async function handleDelete(): Promise<void> {
  const id = deletingOrder.value
  if (!id) return
  deleting.value = true
  try {
    const order = orderStore.orders.find((o) => o.id === id)
    if (order) {
      const shipmentNumber = `DES-${order.order_numeric}`
      if (shipmentStore.shipments.length === 0) {
        await shipmentStore.fetchShipments()
      }
      const shipment = shipmentStore.shipments.find((s) => s.shipment_number === shipmentNumber)
      if (shipment) {
        await shipmentStore.updateShipment(shipment.id, {
          shipment_number: shipment.shipment_number,
          record_date: shipment.record_date,
          movement_type: shipment.movement_type,
          status: shipment.status,
          company_id: shipment.company_id,
          warehouse_id: shipment.warehouse_id,
          responsible_id: shipment.responsible_id,
          source_document: shipment.source_document,
          recipient: shipment.recipient,
          details: shipment.details,
          financial_summary: shipment.financial_summary,
          remarks: `[${new Date().toLocaleDateString('es-CO')}] Orden ${order.order_numeric} eliminada. Se eliminaron los productos asociados a esta orden del registro de salida.`,
        })
      }
    }
    await orderStore.removeOrder(id)
    logDelete({
      entityType: 'ORDER',
      entityId: id,
      details: `Orden ${order?.order_numeric ?? id.slice(0, 8)} eliminada.`,
    })
    deletingOrder.value = null
    showPostDeleteDialog.value = true
  } finally {
    deleting.value = false
  }
}

async function handleApprove(id: string): Promise<void> {
  if (!confirm('¿Aprobar esta orden?')) return
  await orderStore.approveOrder(id)
  const order = orderStore.orders.find((o) => o.id === id)
  logApprove({
    entityType: 'ORDER',
    entityId: id,
    details: `Orden ${order?.order_numeric ?? id.slice(0, 8)} aprobada.`,
  })
}

const filteredOrders = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return orderStore.orders
  return orderStore.orders.filter(
    (o) =>
      o.order_numeric.toLowerCase().includes(q) ||
      o.order_type.toLowerCase().includes(q) ||
      o.status.toLowerCase().includes(q) ||
      o.company_id.toLowerCase().includes(q) ||
      o.user_id.toLowerCase().includes(q) ||
      userName(o.user_id).toLowerCase().includes(q) ||
      (o.requested_by || '').toLowerCase().includes(q),
  )
})

function canApprove(status: string): boolean {
  return status === 'DRAFT' || status === 'PENDING'
}
</script>

<template>
  <div v-motion :initial="{ opacity: 0, y: 8 }" :enter="{ opacity: 1, y: 0, transition: { duration: 200 } }">
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">Órdenes</h1>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Gestión de órdenes de compra y abastecimiento</p>
      </div>
      <div class="relative w-full sm:w-64">
        <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none"
          viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input v-model="searchQuery" type="search" placeholder="Buscar órdenes…"
          class="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm outline-none transition-colors focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800" />
      </div>
    </div>

    <div v-if="orderStore.isLoading" class="flex items-center justify-center py-20">
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-stellar-500 border-t-transparent" />
    </div>

    <div v-else-if="orderStore.error"
      class="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
      {{ orderStore.error }}
    </div>

    <div v-else-if="filteredOrders.length === 0"
      class="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
      <p class="text-slate-500 dark:text-slate-400">No se encontraron órdenes.</p>
    </div>

    <div v-else class="space-y-3">
      <OrderDetailCard
        v-for="order in filteredOrders"
        :key="order.id"
        :order="order"
        :expanded="expandedId === order.id"
        :usuario-nombre="userName(order.user_id)"
        :tipo-label="ORDER_TYPE_LABELS[order.order_type] || order.order_type"
        :can-approve="canApprove(order.status)"
        @toggle="toggleExpand(order.id)"
        @edit="startEdit(order.id)"
        @delete="confirmDelete(order.id)"
        @approve="handleApprove(order.id)"
      />
    </div>
  </div>

  <OrderEditModal v-if="editingOrder" :order="orderStore.orders.find((o) => o.id === editingOrder)!" @close="closeEdit"
    @saved="onEditSaved" />

  <Teleport v-if="deletingOrder" to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div class="w-full max-w-md rounded-2xl border bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div class="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20">
          <svg class="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"
            stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-slate-900 dark:text-white">¿Eliminar esta orden?</h3>
        <p class="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Esta acción no se puede deshacer. Al eliminar la orden, el registro de salida de productos
          asociado quedará huérfano, lo que puede generar inconsistencias en tu inventario y en los
          reportes financieros. La trazabilidad de los productos se verá afectada y podrías perder
          el control sobre el movimiento real de tu mercancía.
        </p>
        <p class="mt-3 text-sm font-medium text-dune-status-warning dark:text-dune-status-warning">
          Asegúrate de haber revisado las consecuencias antes de continuar.
        </p>
        <div class="mt-6 flex justify-end gap-3">
          <button type="button"
            class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            :disabled="deleting" @click="cancelDelete">
            Cancelar
          </button>
          <button type="button" :disabled="deleting"
            class="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700 disabled:opacity-50"
            @click="handleDelete">
            {{ deleting ? 'Eliminando...' : 'Sí, eliminar' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>

  <Teleport v-if="showPostDeleteDialog" to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div class="w-full max-w-md rounded-2xl border bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div
          class="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-dune-surface dark:bg-dune-status-warning/20">
          <svg class="h-6 w-6 text-dune-status-warning dark:text-dune-status-warning" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Orden eliminada</h3>
        <p class="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          La orden ha sido eliminada y el registro de salida se actualizó con una observación.
          Te recomendamos revisar los registros de salida de productos para verificar que los
          movimientos de inventario reflejen correctamente el estado actual.
        </p>
        <div class="mt-6 flex justify-end gap-3">
          <button type="button"
            class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            @click="showPostDeleteDialog = false">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
