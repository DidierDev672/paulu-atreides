<script setup lang="ts">
import { formatCurrency, formatDate } from '@/utils/formatters'
import { useModalMotion } from '@/presentation/composables/useModalMotion'
import type { StockMovement } from '../../domain/StockMovement'
import type { StockProduct } from '../../domain/StockProduct'
import MovementTypePill from '../atoms/MovementTypePill.vue'
import StockMovementProductSection from '../molecules/StockMovementProductSection.vue'

defineProps<{
  visible: boolean
  movement: StockMovement
  product?: StockProduct | null
  productLoading?: boolean
  companyName?: string | null
  companyLoading?: boolean
  providerName?: string | null
  providerLoading?: boolean
  wineryName?: string | null
  wineryLoading?: boolean
  orderReferenceLabel?: string
  orderLoading?: boolean
}>()

const emit = defineEmits<{
  close: []
  closed: []
}>()

const { panelMotion, backdropTransition } = useModalMotion()

function requestClose(): void {
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition
      :enter-active-class="backdropTransition.enterActiveClass"
      :leave-active-class="backdropTransition.leaveActiveClass"
      :enter-from-class="backdropTransition.enterFromClass"
      :leave-to-class="backdropTransition.leaveToClass"
      @after-leave="emit('closed')"
    >
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
        @click.self="requestClose"
      >
        <div
          v-motion
          :initial="panelMotion.initial"
          :enter="panelMotion.enter"
          :leave="panelMotion.leave"
          class="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
          role="dialog"
          aria-modal="true"
          aria-labelledby="stock-movement-detail-title"
        >
          <div class="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 id="stock-movement-detail-title" class="text-lg font-semibold text-slate-900 dark:text-white">
                Detalle del movimiento
              </h2>
              <p class="mt-1 font-mono text-[11px] text-slate-500">{{ movement.id }}</p>
            </div>
            <button
              type="button"
              class="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              aria-label="Cerrar"
              @click="requestClose"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <StockMovementProductSection
            class="mb-5"
            :product="product ?? null"
            :product-id-fallback="movement.product_id"
            :loading="productLoading"
            :company-name="companyName"
            :company-loading="companyLoading"
            :provider-name="providerName"
            :provider-loading="providerLoading"
            :winery-name="wineryName"
            :winery-loading="wineryLoading"
          />

          <dl class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt class="text-[10px] uppercase tracking-wider text-slate-500">Tipo</dt>
              <dd class="mt-1"><MovementTypePill :type="movement.movement_type" /></dd>
            </div>
            <div>
              <dt class="text-[10px] uppercase tracking-wider text-slate-500">Referencia a la entrada</dt>
              <dd class="mt-0.5 text-sm text-slate-800 dark:text-slate-100">
                <span v-if="orderLoading" class="inline-flex items-center gap-2 text-slate-500">
                  <span class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-stellar-500 border-t-transparent" />
                  Cargando referencia…
                </span>
                <span v-else>{{ orderReferenceLabel || movement.reference_id || '—' }}</span>
              </dd>
            </div>
            <div>
              <dt class="text-[10px] uppercase tracking-wider text-slate-500">Cantidad del movimiento</dt>
              <dd class="mt-0.5 font-mono text-sm text-slate-800 dark:text-slate-100">{{ movement.quantity }}</dd>
            </div>
            <div>
              <dt class="text-[10px] uppercase tracking-wider text-slate-500">Costo unitario</dt>
              <dd class="mt-0.5 font-mono text-sm text-slate-800 dark:text-slate-100">
                {{ formatCurrency(movement.unit_cost) }}
              </dd>
            </div>
            <div>
              <dt class="text-[10px] uppercase tracking-wider text-slate-500">Creado</dt>
              <dd class="mt-0.5 text-sm text-slate-800 dark:text-slate-100">
                {{ formatDate(movement.created_at) }}
              </dd>
            </div>
            <div>
              <dt class="text-[10px] uppercase tracking-wider text-slate-500">Actualizado</dt>
              <dd class="mt-0.5 text-sm text-slate-800 dark:text-slate-100">
                {{ formatDate(movement.updated_at) }}
              </dd>
            </div>
          </dl>

          <div class="mt-6 flex justify-end">
            <button
              type="button"
              class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              @click="requestClose"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
