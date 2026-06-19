<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useOrderStore } from '@/presentation/stores/orderStore'
import { useShipmentStore } from '@/presentation/stores/shipmentStore'
import OrderEditModal from '@/presentation/components/orders/OrderEditModal.vue'
import { useHistoryLogger } from '@/presentation/composables/useHistoryLogger'

const router = useRouter()
const orderStore = useOrderStore()
const shipmentStore = useShipmentStore()
const { logDelete, logApprove } = useHistoryLogger()
const expandedId = ref<string | null>(null)
const searchQuery = ref('')
const editingOrder = ref<string | null>(null)
const deletingOrder = ref<string | null>(null)
const showPostDeleteDialog = ref(false)
const deleting = ref(false)

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

onMounted(() => {
  orderStore.fetchOrders()
})

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

function goToShipments(): void {
  showPostDeleteDialog.value = false
  router.push({ name: 'shipments' })
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
      o.company_id.toLowerCase().includes(q),
  )
})

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatCOP(value: number): string {
  return value.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const STATUS_BADGES: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
  APPROVED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  REJECTED: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400',
  COMPLETED: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
}

const ORDER_TYPE_LABELS: Record<string, string> = {
  PURCHASE: 'Compra',
  REPLENISHMENT: 'Reabastecimiento',
  PRODUCTION: 'Producción',
  TRANSFER: 'Transferencia',
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Borrador',
  PENDING: 'Pendiente',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado',
  COMPLETED: 'Completado',
}

function canApprove(status: string): boolean {
  return status === 'DRAFT' || status === 'PENDING'
}
</script>

<template>
  <div v-motion :initial="{ opacity: 0, y: 8 }" :enter="{ opacity: 1, y: 0, transition: { duration: 350 } }">
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">Órdenes</h1>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Gestión de órdenes de compra y abastecimiento</p>
      </div>
      <div class="relative w-full sm:w-64">
        <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input v-model="searchQuery" type="search" placeholder="Buscar órdenes…" class="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800" />
      </div>
    </div>

    <div v-if="orderStore.isLoading" class="flex items-center justify-center py-20">
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-stellar-500 border-t-transparent" />
    </div>

    <div v-else-if="orderStore.error" class="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
      {{ orderStore.error }}
    </div>

    <div v-else-if="filteredOrders.length === 0" class="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
      <p class="text-slate-500 dark:text-slate-400">No se encontraron órdenes.</p>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="(order, index) in filteredOrders"
        :key="order.id"
        v-motion
        :initial="{ opacity: 0, y: 12 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 300, delay: index * 50 } }"
        class="rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
      >
        <div class="flex cursor-pointer items-center gap-4 px-5 py-4" @click="toggleExpand(order.id)">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="font-semibold text-slate-900 dark:text-white">{{ order.order_numeric }}</span>
              <span class="rounded-lg px-2 py-0.5 text-xs font-semibold" :class="STATUS_BADGES[order.status] || 'bg-slate-100 text-slate-600'">{{ STATUS_LABELS[order.status] || order.status }}</span>
              <span class="rounded-lg bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">{{ ORDER_TYPE_LABELS[order.order_type] || order.order_type }}</span>
            </div>
            <p class="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
              {{ order.company_id }} · {{ formatDate(order.createdAt) }} · {{ formatCOP(order.financial_summary.purchase_total) }}
            </p>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <button
              v-if="canApprove(order.status)"
              type="button"
              class="rounded-xl bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-500/20 dark:text-emerald-400"
              @click.stop="handleApprove(order.id)"
            >
              Aprobar
            </button>
            <button
              type="button"
              class="rounded-xl bg-sky-500/10 px-3 py-1.5 text-xs font-semibold text-sky-600 transition hover:bg-sky-500/20 dark:text-sky-400"
              @click.stop="startEdit(order.id)"
            >
              Editar
            </button>
            <button
              type="button"
              class="rounded-xl px-3 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-50 dark:hover:bg-red-500/10"
              @click.stop="confirmDelete(order.id)"
            >
              Eliminar
            </button>
            <svg class="h-4 w-4 text-slate-400 transition" :class="expandedId === order.id ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
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
          <div v-if="expandedId === order.id" class="border-t border-slate-100 px-5 py-4 dark:border-slate-800">
            <div class="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3 lg:grid-cols-4">
              <div><span class="text-slate-500">Compañía:</span> {{ order.company_id }}</div>
              <div><span class="text-slate-500">Usuario:</span> {{ order.user_id }}</div>
              <div><span class="text-slate-500">Solicitado por:</span> {{ order.requested_by || '—' }}</div>
              <div><span class="text-slate-500">Razón:</span> {{ order.reason_for_order || '—' }}</div>
              <div><span class="text-slate-500">Subtotal:</span> {{ formatCOP(order.financial_summary.purchase_subtotal) }}</div>
              <div><span class="text-slate-500">IVA (19%):</span> {{ formatCOP(order.financial_summary.vat) }}</div>
              <div><span class="text-slate-500">Descuento:</span> {{ formatCOP(order.financial_summary.discount) }}</div>
              <div><span class="text-slate-500">Total:</span> <strong>{{ formatCOP(order.financial_summary.purchase_total) }}</strong></div>
            </div>

            <div v-if="order.details.length" class="mt-4 overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead>
                  <tr class="border-b border-slate-200 text-slate-400 dark:border-slate-700">
                    <th class="px-2 py-1">Código</th>
                    <th class="px-2 py-1">Producto</th>
                    <th class="px-2 py-1">Unidad</th>
                    <th class="px-2 py-1">Cant. solicitada</th>
                    <th class="px-2 py-1">Costo est.</th>
                    <th class="px-2 py-1">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="d in order.details" :key="d.code" class="border-b border-slate-100 dark:border-slate-800">
                    <td class="px-2 py-1">{{ d.code }}</td>
                    <td class="px-2 py-1">{{ d.product }}</td>
                    <td class="px-2 py-1">{{ d.unit }}</td>
                    <td class="px-2 py-1">{{ d.quantity_requested }}</td>
                    <td class="px-2 py-1">{{ formatCOP(d.estimated_cost) }}</td>
                    <td class="px-2 py-1">{{ formatCOP(d.subtotal) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>

  <OrderEditModal
    v-if="editingOrder"
    :order="orderStore.orders.find((o) => o.id === editingOrder)!"
    @close="closeEdit"
    @saved="onEditSaved"
  />

  <Teleport v-if="deletingOrder" to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div class="w-full max-w-md rounded-2xl border bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div class="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20">
          <svg class="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-slate-900 dark:text-white">¿Eliminar esta orden?</h3>
        <p class="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Esta acción no se puede deshacer. Al eliminar la orden, el registro de salida de productos
          asociado quedará huérfano, lo que puede generar inconsistencias en tu inventario y en los
          reportes financieros. La trazabilidad de los productos se verá afectada y podrías perder
          el control sobre el movimiento real de tu mercancía.
        </p>
        <p class="mt-3 text-sm font-medium text-amber-600 dark:text-amber-400">
          Asegúrate de haber revisado las consecuencias antes de continuar.
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
            @click="handleDelete"
          >
            {{ deleting ? 'Eliminando...' : 'Sí, eliminar' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>

  <Teleport v-if="showPostDeleteDialog" to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div class="w-full max-w-md rounded-2xl border bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div class="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/20">
          <svg class="h-6 w-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Orden eliminada</h3>
        <p class="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          La orden ha sido eliminada y el registro de salida se actualizó con una observación.
          Te recomendamos revisar los registros de salida de productos para verificar que los
          movimientos de inventario reflejen correctamente el estado actual.
        </p>
        <div class="mt-6 flex justify-end gap-3">
          <button
            type="button"
            class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            @click="showPostDeleteDialog = false"
          >
            Cerrar
          </button>
          <button
            type="button"
            class="rounded-xl bg-stellar-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-stellar-600"
            @click="goToShipments"
          >
            Ir a registros de salida
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
