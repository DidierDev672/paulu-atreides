<script setup lang="ts">
import { ref, watch } from 'vue'
import type { SaleResponse } from '@/application/services/saleService'
import { generateInvoicePDF } from '@/services/invoiceService'
import { useProviderStore } from '@/presentation/stores/providerStore'
import { useCompanyStore } from '@/presentation/stores/companyStore'
import { getProviderById } from '@/application/services/providerService'

const props = defineProps<{
  sale: SaleResponse | null
  visible: boolean
}>()

const emit = defineEmits<{
  close: []
  'update:status': [id: string, status: string]
  'update:discount': [id: string, discount: number]
}>()

const discountInput = ref(0)
const selectedStatus = ref('')

const statusLabels: Record<string, string> = {
  PENDING: 'Pendiente',
  PAID: 'Pagado',
  CANCELED: 'Cancelado',
}

const paymentMethodLabels: Record<string, string> = {
  Cash: 'Efectivo',
  Transfer: 'Transferencia',
  Card: 'Tarjeta',
  Credit: 'Crédito',
}

watch(() => props.sale, (s) => {
  if (s) {
    discountInput.value = s.discount
    selectedStatus.value = s.status
  }
}, { immediate: true })

function applyDiscount(): void {
  if (!props.sale) return
  emit('update:discount', props.sale.sale_id, discountInput.value)
}

async function downloadInvoice(): Promise<void> {
  if (!props.sale) return
  const providerStore = useProviderStore()
  const companyStore = useCompanyStore()
  let provider = providerStore.providers.find((p) => p.id === props.sale.client_id)
  if (!provider && props.sale.client_id) {
    try { provider = await getProviderById(props.sale.client_id) } catch { /* not found */ }
  }
  const company = companyStore.selectedCompany
  generateInvoicePDF({
    ...props.sale,
    client: provider
      ? {
          name: provider.business_name,
          document: `${provider.document_type}: ${provider.document_number}`,
          email: '',
          phone: '',
        }
      : { name: props.sale.client_id, document: '', email: '', phone: '' },
    company: company
      ? {
          name: company.business_name,
          address: `${company.nit} - ${company.social_reason}`,
          phone: company.phone || company.cellphone,
          email: company.email,
        }
      : undefined,
  })
}

function changeStatus(): void {
  if (!props.sale || !selectedStatus.value) return
  emit('update:status', props.sale.sale_id, selectedStatus.value)
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      leave-active-class="transition-opacity duration-150 ease-in"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div v-if="visible && sale" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm" @click.self="emit('close')">
        <div v-motion :initial="{ opacity: 0, scale: 0.95, y: 16 }" :enter="{ opacity: 1, scale: 1, y: 0, transition: { duration: 300 } }" class="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
          <button type="button" class="absolute right-4 top-4 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300" @click="emit('close')">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          <div class="mb-6">
            <h2 class="font-display text-xl font-bold tracking-tight dark:text-white">{{ sale.sale_number }}</h2>
            <p class="text-sm text-slate-500 dark:text-slate-400">Orden origen: {{ sale.order_id }}</p>
          </div>

          <div class="mb-6 grid grid-cols-2 gap-4 text-sm">
            <div><span class="font-medium text-slate-500 dark:text-slate-400">Cliente:</span> <span class="dark:text-white">{{ sale.client_id }}</span></div>
            <div><span class="font-medium text-slate-500 dark:text-slate-400">Método de pago:</span> <span class="dark:text-white">{{ paymentMethodLabels[sale.payment_method] || sale.payment_method || '—' }}</span></div>
            <div>
              <span class="font-medium text-slate-500 dark:text-slate-400">Estado:</span>
              <span class="ml-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold"
                :class="{
                  'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400': sale.status === 'PENDING',
                  'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400': sale.status === 'PAID',
                  'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400': sale.status === 'CANCELED',
                }"
              >{{ statusLabels[sale.status] || sale.status }}</span>
            </div>
            <div><span class="font-medium text-slate-500 dark:text-slate-400">Fecha:</span> <span class="dark:text-white">{{ new Date(sale.created_at).toLocaleDateString() }}</span></div>
          </div>

          <h3 class="mb-2 font-display text-base font-semibold dark:text-white">Productos</h3>
          <div class="mb-6 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table class="w-full text-left text-sm">
              <thead class="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th class="px-3 py-2 font-medium text-slate-500 dark:text-slate-400">Producto</th>
                  <th class="px-3 py-2 font-medium text-slate-500 dark:text-slate-400">Cant.</th>
                  <th class="px-3 py-2 font-medium text-slate-500 dark:text-slate-400">Precio</th>
                  <th class="px-3 py-2 font-medium text-slate-500 dark:text-slate-400">Subtotal</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
                <tr v-for="p in sale.products" :key="p.code" class="dark:text-white">
                  <td class="px-3 py-2">{{ p.product }}</td>
                  <td class="px-3 py-2">{{ p.quantity }} {{ p.unit }}</td>
                  <td class="px-3 py-2">${{ p.price.toFixed(2) }}</td>
                  <td class="px-3 py-2">${{ p.subtotal.toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mb-6 space-y-1 text-right text-sm dark:text-white">
            <div>Subtotal: <span class="font-medium">${{ sale.subtotal.toFixed(2) }}</span></div>
            <div>IVA (19%): <span class="font-medium">${{ sale.vat.toFixed(2) }}</span></div>
            <div class="flex items-center justify-end gap-2">
              <span>Descuento:</span>
              <input v-model.number="discountInput" type="number" min="0" step="0.01" class="w-24 rounded border border-slate-300 px-2 py-0.5 text-right text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" />
              <button type="button" class="rounded bg-stellar-500 px-2 py-0.5 text-xs text-white transition hover:bg-stellar-600" @click="applyDiscount">Aplicar</button>
            </div>
            <div class="text-base font-bold dark:text-white">Total: ${{ (sale.subtotal + sale.vat - discountInput).toFixed(2) }}</div>
          </div>

          <div class="flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-700">
            <div class="flex items-center gap-2">
              <button
                type="button"
                class="rounded-lg bg-amber-500 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed"
                :disabled="sale.status === 'CANCELED'"
                @click="downloadInvoice"
              >
                Descargar factura
              </button>
            </div>
            <div class="flex items-center gap-2">
              <label class="text-sm font-medium text-slate-500 dark:text-slate-400">Cambiar estado:</label>
              <select v-model="selectedStatus" class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100">
                <option value="PENDING" class="dark:bg-slate-800">Pendiente</option>
                <option value="PAID" class="dark:bg-slate-800">Pagado</option>
                <option value="CANCELED" class="dark:bg-slate-800">Cancelado</option>
              </select>
              <button type="button" class="rounded-lg bg-stellar-500 px-3 py-1.5 text-sm text-white transition hover:bg-stellar-600" @click="changeStatus">Actualizar</button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
