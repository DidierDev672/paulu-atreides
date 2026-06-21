<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import { useSaleStore } from '@/presentation/stores/saleStore'
import { useProviderStore } from '@/presentation/stores/providerStore'
import SaleDetailModal from './SaleDetailModal.vue'
import CreateSaleModal from './CreateSaleModal.vue'
import { useAuthStore } from '@/presentation/stores/authStore'

const saleStore = useSaleStore()
const authStore = useAuthStore()
const providerStore = useProviderStore()

const searchQuery = ref('')
const statusFilter = ref('ALL')
const selectedSaleId = ref<string | null>(null)
const showDetailModal = ref(false)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const saleToDelete = ref<string | null>(null)
const page = ref(1)
const limit = ref(20)

function formatCOP(value: number): string {
  return value.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const providerMap = computed(() => {
  const map: Record<string, string> = {}
  providerStore.providers.forEach((p) => {
    map[p.id] = p.business_name
  })
  return map
})

const selectedSale = computed(() =>
  selectedSaleId.value
    ? saleStore.sales.find((s) => s.sale_id === selectedSaleId.value) ?? null
    : null
)

const filteredSales = computed(() => {
  let items = saleStore.sales
  if (statusFilter.value !== 'ALL') {
    items = items.filter((s) => s.status === statusFilter.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    items = items.filter(
      (s) =>
        s.sale_number.toLowerCase().includes(q) ||
        (providerMap.value[s.client_id] || s.client_id).toLowerCase().includes(q) ||
        s.order_id.toLowerCase().includes(q)
    )
  }
  return items
})

const paginatedSales = computed(() => {
  const start = (page.value - 1) * limit.value
  return filteredSales.value.slice(start, start + limit.value)
})

const totalPages = computed(() => Math.ceil(filteredSales.value.length / limit.value))

function openDetail(id: string): void {
  selectedSaleId.value = id
  showDetailModal.value = true
}

function openEdit(id: string): void {
  selectedSaleId.value = id
  showEditModal.value = true
}

function confirmDelete(id: string): void {
  saleToDelete.value = id
  showDeleteModal.value = true
}

async function handleDelete(): Promise<void> {
  if (!saleToDelete.value) return
  const ok = await saleStore.removeSale(saleToDelete.value)
  if (ok) {
    showDeleteModal.value = false
    saleToDelete.value = null
  }
}

async function handleUpdateStatus(id: string, status: string): Promise<void> {
  await saleStore.updateStatus(id, status)
}

async function handleUpdateDiscount(id: string, discount: number): Promise<void> {
  await saleStore.updateDiscount(id, discount)
}

const editPaymentMethod = ref('')
const editDiscount = ref(0)
const editStatus = ref('')

watch(selectedSale, (s) => {
  if (s) {
    editPaymentMethod.value = s.payment_method
    editDiscount.value = s.discount
    editStatus.value = s.status
  }
})

async function saveEdit(): Promise<void> {
  if (!selectedSaleId.value || !selectedSale.value) return
  const sale = selectedSale.value
  const ok = await saleStore.updateSale(selectedSaleId.value, {
    sale_number: sale.sale_number,
    order_id: sale.order_id,
    order_type: sale.order_type,
    provider_id: sale.client_id,
    warehouse_id: sale.warehouse_id,
    products: sale.products,
    subtotal: sale.subtotal,
    vat: sale.vat,
    discount: editDiscount.value,
    total: sale.subtotal + sale.vat - editDiscount.value,
    payment_method: editPaymentMethod.value,
    created_by: sale.created_by,
    company_id: sale.company_id,
  })
  if (ok) {
    await saleStore.updateStatus(selectedSaleId.value, editStatus.value)
    showEditModal.value = false
  }
}

const paymentMethodLabels: Record<string, string> = {
  Cash: 'Efectivo',
  Transfer: 'Transferencia',
  Card: 'Tarjeta',
  Credit: 'Crédito',
}

onMounted(() => {
  saleStore.fetchSales({ company_id: authStore.user?.company_id, limit: 200 })
  providerStore.fetchProviders()
})
</script>

<template>
  <div>
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="font-display text-2xl font-bold tracking-tight sm:text-3xl">Ventas</h1>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Consulta y gestiona las ventas generadas desde órdenes.</p>
      </div>
      <button type="button" class="rounded-xl bg-stellar-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-stellar-600" @click="showCreateModal = true">
        + Crear venta
      </button>
    </div>

    <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
      <div class="relative flex-1">
        <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <input v-model="searchQuery" type="text" placeholder="Buscar venta, cliente, orden..." class="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
      </div>
      <select v-model="statusFilter" class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
        <option value="ALL">Todos los estados</option>
        <option value="PENDING">Pendiente</option>
        <option value="PAID">Pagado</option>
        <option value="CANCELED">Cancelado</option>
      </select>
    </div>

    <div v-if="saleStore.isLoading" class="flex items-center justify-center py-12">
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-stellar-500 border-t-transparent" />
    </div>

    <div v-else-if="saleStore.error" class="rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
      {{ saleStore.error }}
    </div>

    <div v-else class="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
      <table class="w-full text-left text-sm">
        <thead class="bg-slate-50 dark:bg-slate-800">
          <tr>
            <th class="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Venta</th>
            <th class="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Orden</th>
            <th class="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Cliente</th>
            <th class="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Subtotal</th>
            <th class="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">IVA</th>
            <th class="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Total</th>
            <th class="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Método</th>
            <th class="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Estado</th>
            <th class="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Fecha</th>
            <th class="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
          <tr v-for="(sale, i) in paginatedSales" :key="sale.sale_id" v-motion :initial="{ opacity: 0, y: 8 }" :enter="{ opacity: 1, y: 0, transition: { delay: i * 30 } }" class="transition hover:bg-slate-50 dark:hover:bg-slate-800/50">
            <td class="px-4 py-3 font-medium">{{ sale.sale_number }}</td>
            <td class="px-4 py-3 text-slate-500">{{ sale.order_id.slice(0, 8) }}...</td>
            <td class="px-4 py-3">{{ providerMap[sale.client_id] || sale.client_id || '—' }}</td>
            <td class="px-4 py-3">${{ formatCOP(sale.subtotal) }}</td>
            <td class="px-4 py-3">${{ formatCOP(sale.vat) }}</td>
            <td class="px-4 py-3 font-medium">${{ formatCOP(sale.total) }}</td>
            <td class="px-4 py-3">{{ paymentMethodLabels[sale.payment_method] || sale.payment_method || '—' }}</td>
            <td class="px-4 py-3">
              <span class="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold"
                :class="{
                  'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400': sale.status === 'PENDING',
                  'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400': sale.status === 'PAID',
                  'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400': sale.status === 'CANCELED',
                }"
              >{{ sale.status === 'PENDING' ? 'Pendiente' : sale.status === 'PAID' ? 'Pagado' : 'Cancelado' }}</span>
            </td>
            <td class="px-4 py-3 text-slate-500">{{ new Date(sale.created_at).toLocaleDateString() }}</td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-1">
                <button type="button" class="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-stellar-600 dark:hover:bg-slate-700" title="Ver detalle" @click="openDetail(sale.sale_id)">
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                </button>
                <button type="button" class="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-amber-600 dark:hover:bg-slate-700" title="Editar" @click="openEdit(sale.sale_id)">
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </button>
                <button type="button" class="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-red-600 dark:hover:bg-slate-700" title="Eliminar" @click="confirmDelete(sale.sale_id)">
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="paginatedSales.length === 0">
            <td colspan="11" class="px-4 py-8 text-center text-slate-400">No hay ventas registradas.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="totalPages > 1" class="mt-4 flex items-center justify-center gap-2">
      <button type="button" class="rounded-lg border border-slate-200 px-3 py-1.5 text-sm transition hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800" :disabled="page <= 1" @click="page--">Anterior</button>
      <span class="text-sm text-slate-500 dark:text-slate-300">Pág. {{ page }} de {{ totalPages }}</span>
      <button type="button" class="rounded-lg border border-slate-200 px-3 py-1.5 text-sm transition hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800" :disabled="page >= totalPages" @click="page++">Siguiente</button>
    </div>

    <SaleDetailModal
      :sale="selectedSale"
      :visible="showDetailModal"
      @close="showDetailModal = false"
      @update:status="handleUpdateStatus"
      @update:discount="handleUpdateDiscount"
    />

    <CreateSaleModal
      :visible="showCreateModal"
      @close="showCreateModal = false"
      @created="showCreateModal = false; saleStore.fetchSales({ company_id: authStore.user?.company_id, limit: 200 })"
    />

    <!-- Edit Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity duration-200 ease-out"
        leave-active-class="transition-opacity duration-150 ease-in"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <div v-if="showEditModal && selectedSale" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm" @click.self="showEditModal = false">
          <div v-motion :initial="{ opacity: 0, scale: 0.95, y: 16 }" :enter="{ opacity: 1, scale: 1, y: 0, transition: { duration: 300 } }" class="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <button type="button" class="absolute right-4 top-4 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300" @click="showEditModal = false">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <h2 class="mb-6 font-display text-xl font-bold tracking-tight dark:text-white">Editar venta</h2>

            <div class="space-y-4">
              <div>
                <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Método de pago</label>
                <select v-model="editPaymentMethod" class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-stellar-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                  <option value="Cash">Efectivo</option>
                  <option value="Transfer">Transferencia</option>
                  <option value="Card">Tarjeta</option>
                  <option value="Credit">Crédito</option>
                </select>
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Descuento</label>
                <input v-model.number="editDiscount" type="number" min="0" step="0.01" class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-stellar-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Estado</label>
                <select v-model="editStatus" class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-stellar-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                  <option value="PENDING">Pendiente</option>
                  <option value="PAID">Pagado</option>
                  <option value="CANCELED">Cancelado</option>
                </select>
              </div>
            </div>

            <p v-if="saleStore.error" class="mt-4 text-sm text-red-600 dark:text-red-400">{{ saleStore.error }}</p>

            <div class="mt-6 flex justify-end gap-2 border-t border-slate-200 pt-4 dark:border-slate-700">
              <button type="button" class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" @click="showEditModal = false">
                Cancelar
              </button>
              <button type="button" class="rounded-lg bg-stellar-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-stellar-600" :disabled="saleStore.isLoading" @click="saveEdit">
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity duration-200 ease-out"
        leave-active-class="transition-opacity duration-150 ease-in"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm" @click.self="showDeleteModal = false">
          <div v-motion :initial="{ opacity: 0, scale: 0.95, y: 16 }" :enter="{ opacity: 1, scale: 1, y: 0, transition: { duration: 300 } }" class="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div class="mb-4 flex items-center gap-3">
              <div class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/15">
                <svg class="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
              </div>
              <div>
                <h3 class="text-lg font-bold text-slate-900 dark:text-white">Eliminar venta</h3>
                <p class="text-sm text-slate-500 dark:text-slate-400">Esta acción no se puede deshacer</p>
              </div>
            </div>

            <div class="mb-6 rounded-lg bg-amber-50 p-4 dark:bg-amber-500/10">
              <p class="text-sm text-amber-800 dark:text-amber-300">
                <span class="font-semibold">Advertencia:</span> Al eliminar esta venta, se perderá permanentemente el registro financiero, el historial de movimientos de inventario asociados y cualquier referencia contable vinculada. Esta operación es irreversible y podría afectar la integridad de tus reportes fiscales y financieros.
              </p>
            </div>

            <p v-if="saleStore.error" class="mb-4 text-sm text-red-600 dark:text-red-400">{{ saleStore.error }}</p>

            <div class="flex justify-end gap-2">
              <button type="button" class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" @click="showDeleteModal = false">
                Conservar venta
              </button>
              <button type="button" class="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-50" :disabled="saleStore.isLoading" @click="handleDelete">
                {{ saleStore.isLoading ? 'Eliminando...' : 'Sí, eliminar venta' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
