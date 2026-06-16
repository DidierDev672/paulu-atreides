<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useOrderStore } from '@/presentation/stores/orderStore'
import OrderForm from '@/presentation/components/orders/OrderForm.vue'

const orderStore = useOrderStore()
const view = ref<'list' | 'create'>('list')
const expandedId = ref<string | null>(null)
const searchQuery = ref('')
const statusFilter = ref<string>('ALL')

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'Todos' },
  { value: 'DRAFT', label: 'Borrador' },
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'APPROVED', label: 'Aprobado' },
  { value: 'REJECTED', label: 'Rechazado' },
  { value: 'COMPLETED', label: 'Completado' },
]

const STATUS_BADGES: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
  APPROVED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  REJECTED: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400',
  COMPLETED: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Borrador',
  PENDING: 'Pendiente',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado',
  COMPLETED: 'Completado',
}

onMounted(() => {
  orderStore.fetchOrders()
})

function toggleExpand(id: string): void {
  expandedId.value = expandedId.value === id ? null : id
}

async function handleDelete(id: string): Promise<void> {
  if (!confirm('¿Eliminar esta orden?')) return
  await orderStore.removeOrder(id)
}

async function handleApprove(id: string): Promise<void> {
  if (!confirm('¿Aprobar esta orden?')) return
  await orderStore.approveOrder(id)
}

function onSaved(): void {
  view.value = 'list'
  orderStore.fetchOrders()
}

function canApprove(status: string): boolean {
  return status === 'DRAFT' || status === 'PENDING'
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatCOP(value: number): string {
  return value.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const filteredOrders = computed(() => {
  let orders = orderStore.orders
  const q = searchQuery.value.toLowerCase().trim()
  if (q) {
    orders = orders.filter(
      (o) =>
        o.order_numeric.toLowerCase().includes(q) ||
        o.order_type.toLowerCase().includes(q) ||
        o.status.toLowerCase().includes(q) ||
        o.company_id.toLowerCase().includes(q),
    )
  }
  if (statusFilter.value !== 'ALL') {
    orders = orders.filter((o) => o.status === statusFilter.value)
  }
  return orders
})

const stats = computed(() => {
  const orders = orderStore.orders
  return {
    total: orders.length,
    draft: orders.filter((o) => o.status === 'DRAFT').length,
    pending: orders.filter((o) => o.status === 'PENDING').length,
    approved: orders.filter((o) => o.status === 'APPROVED').length,
    rejected: orders.filter((o) => o.status === 'REJECTED').length,
    completed: orders.filter((o) => o.status === 'COMPLETED').length,
    totalValue: orders.reduce((s, o) => s + o.financial_summary.purchase_total, 0),
  }
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950">
    <!-- Navigation bar -->
    <div class="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
      <div class="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
        <h1 class="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Órdenes</h1>
        <div class="ml-auto flex gap-2">
          <button
            type="button"
            class="rounded-xl px-4 py-2 text-sm font-medium transition"
            :class="view === 'list' ? 'bg-stellar-500 text-white shadow-sm' : 'border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400'"
            @click="view = 'list'"
          >
            Lista
          </button>
          <button
            type="button"
            class="rounded-xl px-4 py-2 text-sm font-medium transition"
            :class="view === 'create' ? 'bg-stellar-500 text-white shadow-sm' : 'border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400'"
            @click="view = 'create'"
          >
            + Nueva orden
          </button>
        </div>
      </div>
    </div>

    <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <!-- Form view -->
      <div v-if="view === 'create'">
        <OrderForm @saved="onSaved" @go-to-provider-registration="view = 'list'" />
      </div>

      <!-- List view -->
      <template v-else>
        <!-- Summary cards -->
        <div class="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
          <div class="rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p class="text-xs font-medium text-slate-500 dark:text-slate-400">Total</p>
            <p class="mt-1 text-xl font-bold text-slate-900 dark:text-white">{{ stats.total }}</p>
          </div>
          <div class="rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p class="text-xs font-medium text-slate-500 dark:text-slate-400">Borrador</p>
            <p class="mt-1 text-xl font-bold text-slate-600 dark:text-slate-300">{{ stats.draft }}</p>
          </div>
          <div class="rounded-xl border border-amber-200/60 bg-white p-3 shadow-sm dark:border-amber-800/30 dark:bg-slate-900">
            <p class="text-xs font-medium text-amber-600 dark:text-amber-400">Pendiente</p>
            <p class="mt-1 text-xl font-bold text-amber-700 dark:text-amber-300">{{ stats.pending }}</p>
          </div>
          <div class="rounded-xl border border-emerald-200/60 bg-white p-3 shadow-sm dark:border-emerald-800/30 dark:bg-slate-900">
            <p class="text-xs font-medium text-emerald-600 dark:text-emerald-400">Aprobado</p>
            <p class="mt-1 text-xl font-bold text-emerald-700 dark:text-emerald-300">{{ stats.approved }}</p>
          </div>
          <div class="rounded-xl border border-red-200/60 bg-white p-3 shadow-sm dark:border-red-800/30 dark:bg-slate-900">
            <p class="text-xs font-medium text-red-600 dark:text-red-400">Rechazado</p>
            <p class="mt-1 text-xl font-bold text-red-700 dark:text-red-300">{{ stats.rejected }}</p>
          </div>
          <div class="rounded-xl border border-blue-200/60 bg-white p-3 shadow-sm dark:border-blue-800/30 dark:bg-slate-900">
            <p class="text-xs font-medium text-blue-600 dark:text-blue-400">Completado</p>
            <p class="mt-1 text-xl font-bold text-blue-700 dark:text-blue-300">{{ stats.completed }}</p>
          </div>
          <div class="rounded-xl border border-stellar-200/60 bg-white p-3 shadow-sm dark:border-stellar-800/30 dark:bg-slate-900 sm:col-span-2 lg:col-span-1">
            <p class="text-xs font-medium text-stellar-600 dark:text-stellar-400">Valor total</p>
            <p class="mt-1 truncate text-lg font-bold text-stellar-700 dark:text-stellar-300">{{ formatCOP(stats.totalValue) }}</p>
          </div>
        </div>

        <!-- Search & filter bar -->
        <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div class="relative flex-1">
            <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input v-model="searchQuery" type="search" placeholder="Buscar por código, tipo, estado..." class="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
          </div>
          <select v-model="statusFilter" class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-stellar-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
            <option v-for="opt in STATUS_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </div>

        <!-- Loading -->
        <div v-if="orderStore.isLoading" class="flex items-center justify-center py-20">
          <div class="h-8 w-8 animate-spin rounded-full border-4 border-stellar-500 border-t-transparent" />
        </div>

        <!-- Error -->
        <div v-else-if="orderStore.error" class="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {{ orderStore.error }}
        </div>

        <!-- Empty -->
        <div v-else-if="filteredOrders.length === 0" class="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <svg class="mx-auto mb-3 h-12 w-12 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <p class="text-slate-500 dark:text-slate-400">No se encontraron órdenes.</p>
        </div>

        <!-- Order cards -->
        <div v-else class="space-y-3">
          <div
            v-for="order in filteredOrders"
            :key="order.id"
            class="rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <div class="flex cursor-pointer items-center gap-4 px-5 py-4" @click="toggleExpand(order.id)">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <span class="font-semibold text-slate-900 dark:text-white">{{ order.order_numeric }}</span>
                  <span class="rounded-lg px-2 py-0.5 text-xs font-semibold" :class="STATUS_BADGES[order.status] || 'bg-slate-100 text-slate-600'">{{ STATUS_LABELS[order.status] || order.status }}</span>
                  <span class="rounded-lg bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">{{ order.order_type }}</span>
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
                  class="rounded-xl px-3 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-50 dark:hover:bg-red-500/10"
                  @click.stop="handleDelete(order.id)"
                >
                  Eliminar
                </button>
                <svg class="h-4 w-4 text-slate-400 transition" :class="expandedId === order.id ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <!-- Expanded detail -->
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
                  <div><span class="text-slate-500">Total:</span> <strong class="text-stellar-600">{{ formatCOP(order.financial_summary.purchase_total) }}</strong></div>
                </div>

                <div v-if="order.details.length" class="mt-4 overflow-x-auto">
                  <h4 class="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Detalle de productos</h4>
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
                        <td class="px-2 py-1 font-mono text-slate-500">{{ d.code }}</td>
                        <td class="px-2 py-1 font-medium">{{ d.product }}</td>
                        <td class="px-2 py-1 text-slate-500">{{ d.unit }}</td>
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
      </template>
    </div>
  </div>
</template>
