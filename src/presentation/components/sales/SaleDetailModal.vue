<script setup lang="ts">
import { ref, watch } from 'vue'
import type { SaleResponse } from '@/application/services/saleService'
import { generateInvoicePDF } from '@/services/invoiceService'
import { useProviderStore } from '@/presentation/stores/providerStore'
import { useCompanyStore } from '@/presentation/stores/companyStore'
import { useFormatters } from '@/presentation/composables/useFormatters'
import { EmptyState } from '@/presentation/components/ui/empty-state'

const props = defineProps<{
  sale: SaleResponse | null
  visible: boolean
}>()

const emit = defineEmits<{
  close: []
  'update:status': [id: string, status: string]
  'update:discount': [id: string, discount: number]
  'edit-provider': [clientId: string]
  'delete-sale': [id: string]
}>()

const { formatCurrency, formatDate } = useFormatters()

const discountInput = ref(0)
const selectedStatus = ref('')
const clientInfo = ref({ business_name: '—', document_type: '—', document_number: '—' })
const clientNotFound = ref(false)

watch(() => props.sale, async (s) => {
  if (s) {
    discountInput.value = s.discount
    selectedStatus.value = s.status
    clientNotFound.value = false
    if (s.client_id) {
      const providerStore = useProviderStore()
      if (providerStore.providers.length === 0) {
        await providerStore.fetchProviders()
      }
      const provider = providerStore.providers.find(
        (p) => p.id === s.client_id || p.code === s.client_id || p.document_number === s.client_id
      )
      if (provider) {
        clientInfo.value = {
          business_name: provider.business_name,
          document_type: provider.document_type,
          document_number: provider.document_number,
        }
      } else {
        clientNotFound.value = true
        clientInfo.value = { business_name: '—', document_type: '—', document_number: '—' }
      }
    } else {
      clientNotFound.value = true
      clientInfo.value = { business_name: '—', document_type: '—', document_number: '—' }
    }
  }
}, { immediate: true })

const statusLabels: Record<string, string> = {
  PENDING: 'Pendiente',
  PAID: 'Pagado',
  CANCELED: 'Cancelado',
}

const statusConfig: Record<string, { icon: string; classes: string }> = {
  PENDING: { icon: '⏳', classes: 'bg-yellow-900/40 border-yellow-700 text-yellow-400' },
  PAID: { icon: '✓', classes: 'bg-green-900/40 border-green-700 text-green-400' },
  CANCELED: { icon: '✕', classes: 'bg-red-900/40 border-red-700 text-red-400' },
}

const paymentMethodLabels: Record<string, string> = {
  Cash: 'Efectivo',
  Transfer: 'Transferencia',
  Card: 'Tarjeta',
  Credit: 'Crédito',
}

function applyDiscount(): void {
  if (!props.sale) return
  emit('update:discount', props.sale.sale_id, discountInput.value)
}

async function downloadInvoice(): Promise<void> {
  if (!props.sale) return
  const providerStore = useProviderStore()
  const companyStore = useCompanyStore()
  if (providerStore.providers.length === 0) {
    await providerStore.fetchProviders()
  }
  const provider = providerStore.providers.find(
    (p) => p.id === props.sale.client_id || p.code === props.sale.client_id || p.document_number === props.sale.client_id
  )
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

function handleEditClient(): void {
  if (!props.sale) return
  emit('edit-provider', props.sale.client_id)
}

function handleDeleteSale(): void {
  if (!props.sale) return
  emit('delete-sale', props.sale.sale_id)
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-180 ease-out"
      leave-active-class="transition-opacity duration-150 ease-in"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="visible && sale"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        :aria-label="`Detalle de venta ${sale.sale_number}`"
        @click.self="emit('close')"
      >
        <div
          v-motion
          :initial="{ opacity: 0, y: 20, scale: 0.97 }"
          :enter="{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.22, easing: 'ease-out' } }"
          :leave="{ opacity: 0, y: 12, scale: 0.97, transition: { duration: 0.18 } }"
          class="relative flex flex-col max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white dark:bg-[#111827] shadow-2xl"
        >
          <!-- LAYER 1 — Header -->
          <div class="flex items-start justify-between px-5 py-4 bg-gray-50 dark:bg-[#1F2937] border-b border-gray-200 dark:border-[#1F2937]">
            <div>
              <h2 class="text-[15px] font-semibold font-serif text-gray-900 dark:text-white">
                {{ sale.sale_number }}
              </h2>
              <p class="text-[11px] text-gray-400 mt-0.5">
                Orden origen: {{ sale.order_id }}
              </p>
            </div>
            <button
              type="button"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors text-lg leading-none mt-0.5"
              aria-label="Cerrar modal"
              @click="emit('close')"
            >
              ×
            </button>
          </div>

          <!-- Scrollable body -->
          <div class="overflow-y-auto flex-1">
            <!-- LAYER 2 — Metadata grid -->
            <div class="px-5 py-4 border-b border-gray-100 dark:border-[#1F2937]">
              <!-- Client not found state -->
              <EmptyState
                v-if="clientNotFound"
                variant="error"
                size="sm"
                title="No se pudo obtener la información del cliente"
                description="El cliente de esta venta no fue encontrado en el sistema."
                :causes="[
                  'El registro del cliente pudo haber sido eliminado o desactivado.',
                  'El código del cliente en esta venta puede ser incorrecto.',
                  'Puede ser un error temporal de conexión.'
                ]"
                collapsible-causes
                action-label="Editar cliente"
                destructive-action-label="Eliminar venta"
                @action="handleEditClient"
                @destructive-action="handleDeleteSale"
              />

              <!-- Client found state -->
              <div v-else class="grid grid-cols-2 gap-x-6 gap-y-3">
                <div class="flex flex-col gap-0.5">
                  <span class="text-[10px] text-gray-400">Cliente</span>
                  <span class="text-[13px] font-medium text-gray-900 dark:text-white">
                    {{ clientInfo.business_name }}
                  </span>
                </div>

                <div class="flex flex-col gap-0.5">
                  <span class="text-[10px] text-gray-400">Método de pago</span>
                  <span class="text-[13px] font-medium text-gray-900 dark:text-white">
                    {{ paymentMethodLabels[sale.payment_method] || sale.payment_method || '—' }}
                  </span>
                </div>

                <div class="flex flex-col gap-0.5">
                  <span class="text-[10px] text-gray-400">Tipo de documento</span>
                  <span class="text-[13px] font-medium text-gray-900 dark:text-white">
                    {{ clientInfo.document_type }}
                  </span>
                </div>

                <div class="flex flex-col gap-0.5">
                  <span class="text-[10px] text-gray-400">Número de documento</span>
                  <span class="text-[13px] font-medium text-gray-900 dark:text-white">
                    {{ clientInfo.document_number }}
                  </span>
                </div>

                <div class="flex flex-col gap-0.5">
                  <span class="text-[10px] text-gray-400">Estado</span>
                  <span
                    :class="[
                      'inline-flex items-center gap-1 px-2 py-0.5 w-fit',
                      'rounded-full text-[11px] font-medium border',
                      statusConfig[sale.status]?.classes || ''
                    ]"
                  >
                    {{ statusConfig[sale.status]?.icon }} {{ statusLabels[sale.status] || sale.status }}
                  </span>
                </div>

                <div class="flex flex-col gap-0.5">
                  <span class="text-[10px] text-gray-400">Fecha</span>
                  <span class="text-[13px] font-medium text-gray-900 dark:text-white">
                    {{ formatDate(sale.created_at) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- LAYER 3 — Products table -->
            <div class="px-5 py-4 border-b border-gray-100 dark:border-[#1F2937]">
              <p class="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-3">
                Productos
              </p>
              <table class="w-full text-[12px]">
                <thead>
                  <tr class="border-b border-gray-200 dark:border-gray-700">
                    <th class="text-left pb-2 text-[10px] text-gray-400 font-medium">
                      Producto
                    </th>
                    <th class="text-right pb-2 text-[10px] text-gray-400 font-medium">
                      Cant.
                    </th>
                    <th class="text-right pb-2 text-[10px] text-gray-400 font-medium">
                      Precio
                    </th>
                    <th class="text-right pb-2 text-[10px] text-gray-400 font-medium">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="p in sale.products"
                    :key="p.code"
                    class="border-b border-gray-50 dark:border-[#1F2937] last:border-none"
                  >
                    <td class="py-2 text-gray-800 dark:text-gray-200">
                      {{ p.product }}
                    </td>
                    <td class="py-2 text-right text-gray-400 font-mono">
                      {{ p.quantity }} {{ p.unit?.toLowerCase() }}
                    </td>
                    <td class="py-2 text-right text-gray-700 dark:text-gray-300 font-mono">
                      {{ formatCurrency(p.price) }}
                    </td>
                    <td class="py-2 text-right text-gray-900 dark:text-white font-mono font-medium">
                      {{ formatCurrency(p.subtotal) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- LAYER 4 — Totals block -->
            <div class="px-5 py-4 bg-gray-50 dark:bg-[#0F172A] border-b border-gray-100 dark:border-[#1F2937]">
              <div class="flex justify-between items-center py-1">
                <span class="text-[12px] text-gray-400">Subtotal</span>
                <span class="text-[12px] text-gray-500 dark:text-gray-300 font-mono">
                  {{ formatCurrency(sale.subtotal) }}
                </span>
              </div>

              <div class="flex justify-between items-center py-1">
                <span class="text-[12px] text-gray-400">IVA (19%)</span>
                <span class="text-[12px] text-gray-500 dark:text-gray-300 font-mono">
                  {{ formatCurrency(sale.vat) }}
                </span>
              </div>

              <div class="flex justify-between items-center py-1">
                <span class="text-[12px] text-gray-400">Descuento</span>
                <div class="flex items-center gap-2">
                  <input
                    v-model.number="discountInput"
                    type="number"
                    min="0"
                    step="1"
                    class="w-20 px-2 py-1 text-right text-[12px] font-mono
                           bg-white dark:bg-[#1F2937]
                           border border-gray-300 dark:border-gray-700
                           text-gray-900 dark:text-white rounded-md
                           focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                  <button
                    type="button"
                    class="px-3 py-1 text-[11px] font-medium
                           bg-violet-600 hover:bg-violet-700
                           text-white rounded-md transition-colors"
                    @click="applyDiscount"
                  >
                    Aplicar
                  </button>
                </div>
              </div>

              <div class="border-t border-gray-200 dark:border-gray-700 my-3"></div>

              <div class="flex justify-between items-center">
                <span class="text-[13px] font-medium text-gray-700 dark:text-gray-200">
                  Total
                </span>
                <span class="text-[16px] font-semibold text-gray-900 dark:text-white font-mono">
                  {{ formatCurrency((sale.subtotal + sale.vat - discountInput)) }}
                </span>
              </div>
            </div>
          </div>

          <!-- LAYER 5 — Footer -->
          <div class="flex items-center justify-between px-5 py-3 bg-gray-50 dark:bg-[#1F2937] border-t border-gray-200 dark:border-[#1F2937]">
            <button
              type="button"
              class="inline-flex items-center gap-2
                     px-4 py-2 text-[12px] font-medium
                     bg-amber-600 hover:bg-amber-700
                     text-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              :disabled="sale.status === 'CANCELED'"
              @click="downloadInvoice"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Descargar factura
            </button>

            <div class="flex items-center gap-2">
              <span class="text-[11px] text-gray-400">Estado</span>
              <select
                v-model="selectedStatus"
                class="px-2 py-1.5 text-[12px]
                       bg-white dark:bg-[#111827]
                       border border-gray-300 dark:border-gray-700
                       text-gray-900 dark:text-white rounded-md
                       focus:outline-none focus:ring-1 focus:ring-violet-500"
              >
                <option value="PENDING" class="dark:bg-[#111827]">Pendiente</option>
                <option value="PAID" class="dark:bg-[#111827]">Pagado</option>
                <option value="CANCELED" class="dark:bg-[#111827]">Cancelado</option>
              </select>
              <button
                type="button"
                class="px-3 py-1.5 text-[12px] font-medium
                       bg-violet-600 hover:bg-violet-700
                       text-white rounded-lg transition-colors"
                @click="changeStatus"
              >
                Actualizar
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
