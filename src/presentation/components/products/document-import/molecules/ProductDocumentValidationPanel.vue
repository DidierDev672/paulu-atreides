<script setup lang="ts">
import { computed } from 'vue'
import type { ProductDocumentValidationResult } from '@/domain/product-document/productDocument.types'

const props = defineProps<{
  result: ProductDocumentValidationResult
  fileName: string
  saving?: boolean
}>()

const emit = defineEmits<{
  dismiss: []
  save: []
}>()

const totalCount = computed(() => props.result.products.length)
const canSave = computed(() => totalCount.value > 0 && !props.saving)

const saveLabel = computed(() => {
  if (props.result.isList) {
    return `Guardar lista (${totalCount.value})`
  }
  return 'Guardar producto y entrada'
})
</script>

<template>
  <div
    v-motion
    :initial="{ opacity: 0, y: 12 }"
    :enter="{ opacity: 1, y: 0 }"
    class="mb-6 overflow-hidden rounded-2xl border shadow-sm"
    :class="
      result.isValid
        ? 'border-dune-status-success/30 bg-dune-status-success/5'
        : 'border-dune-status-warning/35 bg-dune-status-warning/5'
    "
    role="status"
    aria-live="polite"
  >
    <div class="flex items-start justify-between gap-3 px-5 py-4">
      <div class="min-w-0">
        <p
          class="text-sm font-semibold"
          :class="result.isValid ? 'text-dune-status-success' : 'text-dune-status-warning'"
        >
          {{
            result.isList
              ? `Lista de ${result.products.length} productos organizada`
              : result.isValid
                ? 'Producto organizado'
                : 'Producto con campos a revisar'
          }}
        </p>
        <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Archivo:
          <span class="font-medium text-slate-700 dark:text-slate-300">{{ fileName }}</span>
          · Llama 3 · al guardar también se crea la entrada
        </p>
        <p class="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {{ result.summary }}
        </p>
      </div>
      <button
        type="button"
        class="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/60 hover:text-slate-600 dark:hover:bg-slate-800"
        aria-label="Cerrar panel"
        @click="emit('dismiss')"
      >
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </div>

    <div class="border-t border-black/5 px-5 py-3 dark:border-white/5">
      <p class="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
        {{ result.isList ? 'Productos organizados' : 'Registro organizado' }}
      </p>
      <div class="overflow-x-auto rounded-xl border border-slate-200/80 bg-white/80 dark:border-slate-700 dark:bg-slate-900/60">
        <table class="w-full min-w-[720px] text-left text-xs">
          <thead>
            <tr class="border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400 dark:border-slate-800">
              <th v-if="result.isList" class="px-3 py-2">#</th>
              <th class="px-3 py-2">Código</th>
              <th class="px-3 py-2">Nombre</th>
              <th class="px-3 py-2">Unidad</th>
              <th class="px-3 py-2">Cant.</th>
              <th class="px-3 py-2 hidden sm:table-cell">Costo</th>
              <th class="px-3 py-2">Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in result.products"
              :key="`${item.mapped.product_code}-${index}`"
              class="border-b border-slate-50 last:border-0 dark:border-slate-800/60"
              :class="item.isValid ? '' : 'bg-dune-status-warning/5'"
            >
              <td v-if="result.isList" class="px-3 py-2.5 text-slate-400">{{ index + 1 }}</td>
              <td class="px-3 py-2.5 font-mono text-slate-600 dark:text-slate-300">
                {{ item.mapped.product_code || '—' }}
              </td>
              <td class="px-3 py-2.5 font-medium text-slate-800 dark:text-slate-100">
                {{ item.mapped.name || '—' }}
              </td>
              <td class="px-3 py-2.5 text-slate-600 dark:text-slate-300">
                {{ item.mapped.unit || '—' }}
              </td>
              <td class="px-3 py-2.5 text-slate-600 dark:text-slate-300">
                {{ item.mapped.quantity }}
              </td>
              <td class="hidden px-3 py-2.5 text-slate-600 sm:table-cell dark:text-slate-300">
                {{ item.mapped.unit_cost > 0 ? item.mapped.unit_cost : '—' }}
              </td>
              <td class="px-3 py-2.5">
                <span
                  class="inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold"
                  :class="
                    item.isValid
                      ? 'bg-dune-status-success/15 text-dune-status-success'
                      : 'bg-dune-status-warning/15 text-dune-status-warning'
                  "
                >
                  {{ item.isValid ? 'Listo' : 'Revisar' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div
      v-if="result.mismatches.length"
      class="border-t border-black/5 px-5 py-3 dark:border-white/5"
    >
      <p class="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
        Datos que no encajan
      </p>
      <ul class="max-h-40 space-y-2 overflow-y-auto">
        <li
          v-for="(item, index) in result.mismatches"
          :key="`${item.field}-${index}`"
          class="rounded-xl border border-dune-status-warning/20 bg-white/70 px-3 py-2 text-left text-xs dark:bg-slate-900/50"
        >
          <p class="font-semibold text-slate-800 dark:text-slate-100">
            <span v-if="item.productIndex" class="mr-1 text-slate-400">#{{ item.productIndex }}</span>
            {{ item.field }}
          </p>
          <p class="mt-0.5 text-slate-600 dark:text-slate-300">{{ item.issue }}</p>
        </li>
      </ul>
    </div>

    <div class="flex flex-wrap items-center justify-end gap-2 border-t border-black/5 px-5 py-3 dark:border-white/5">
      <button
        type="button"
        class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        :disabled="saving"
        @click="emit('dismiss')"
      >
        Cerrar
      </button>
      <button
        type="button"
        class="inline-flex items-center gap-1.5 rounded-xl bg-stellar-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-stellar-400 disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="!canSave"
        @click="emit('save')"
      >
        <svg
          v-if="saving"
          class="h-4 w-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        {{ saveLabel }}
      </button>
    </div>
  </div>
</template>
