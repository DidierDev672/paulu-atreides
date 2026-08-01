<script setup lang="ts">
import type { ProductBatchSaveProgress } from '@/domain/product-document/productDocument.types'

const props = defineProps<{
  open: boolean
  progress: ProductBatchSaveProgress | null
}>()

const emit = defineEmits<{
  close: []
}>()

function percent(): number {
  if (!props.progress || props.progress.total === 0) return 0
  if (props.progress.phase === 'organizing') return 12
  if (props.progress.phase === 'saving-entry') return 95
  if (props.progress.phase === 'done') return 100
  return Math.round((props.progress.current / props.progress.total) * 90)
}

const isWorking = () => {
  const phase = props.progress?.phase
  return phase === 'organizing' || phase === 'saving-products' || phase === 'saving-entry'
}

function titleForPhase(progress: ProductBatchSaveProgress): string {
  switch (progress.phase) {
    case 'organizing':
      return 'La inteligencia artificial está organizando la información'
    case 'saving-products':
      return progress.isList ? 'Enviando productos uno por uno' : 'Enviando un solo producto'
    case 'saving-entry':
      return 'Creando entrada de inventario'
    case 'done':
      return 'Información almacenada correctamente'
    default:
      return 'No se pudo persistir la información'
  }
}

function subtitleForPhase(progress: ProductBatchSaveProgress): string {
  switch (progress.phase) {
    case 'organizing':
      return 'Proveedor y bodega · preparando el formato del endpoint'
    case 'error':
      return progress.failedCount > 0
        ? `${progress.failedCount} producto(s) sin guardar · revisa el mensaje`
        : 'Revisa el mensaje con calma; puedes intentarlo de nuevo'
    case 'saving-entry':
      return 'Productos listos · generando entrada'
    case 'done':
      return progress.entryCreated
        ? 'Productos y entrada de inventario listos'
        : 'Productos guardados'
    default:
      return progress.isList
        ? `${progress.current} de ${progress.total} · guardados ${progress.savedCount}`
        : 'Registro individual + entrada'
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open && progress"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-batch-save-title"
    >
      <div
        v-motion
        :initial="{ opacity: 0, scale: 0.96 }"
        :enter="{ opacity: 1, scale: 1 }"
        class="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900"
      >
        <div class="px-6 py-5">
          <div class="mb-4 flex items-center gap-3">
            <div
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
              :class="
                progress.phase === 'error'
                  ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                  : progress.phase === 'done'
                    ? 'bg-dune-status-success/10 text-dune-status-success'
                    : 'bg-stellar-500/10 text-stellar-500'
              "
            >
              <svg
                v-if="isWorking()"
                class="h-5 w-5 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <svg
                v-else-if="progress.phase === 'done'"
                class="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <svg
                v-else
                class="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
            </div>

            <div class="min-w-0">
              <h3
                id="product-batch-save-title"
                class="text-base font-semibold text-slate-900 dark:text-white"
              >
                {{ titleForPhase(progress) }}
              </h3>
              <p class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {{ subtitleForPhase(progress) }}
              </p>
            </div>
          </div>

          <p
            class="text-sm leading-relaxed whitespace-pre-line"
            :class="
              progress.phase === 'error'
                ? 'rounded-xl bg-amber-50 px-3 py-2.5 text-amber-900 dark:bg-amber-500/10 dark:text-amber-100'
                : progress.phase === 'done'
                  ? 'rounded-xl bg-dune-status-success/5 px-3 py-2.5 text-slate-700 dark:bg-dune-status-success/10 dark:text-slate-200'
                  : 'text-slate-600 dark:text-slate-300'
            "
          >
            {{ progress.message }}
          </p>

          <div v-if="isWorking()" class="mt-4">
            <div class="mb-1.5 flex justify-between text-[11px] font-medium text-slate-500">
              <span>{{ progress.phase === 'organizing' ? 'Organizando con IA' : 'Progreso' }}</span>
              <span>{{ percent() }}%</span>
            </div>
            <div class="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                class="h-full rounded-full bg-gradient-to-r from-stellar-500 to-cosmic-500 transition-all duration-300"
                :style="{ width: `${percent()}%` }"
              />
            </div>
            <p
              v-if="progress.phase === 'organizing'"
              class="mt-2 text-xs text-slate-500 dark:text-slate-400"
            >
              Un momento: estamos alineando cada producto al formato que espera el servidor.
            </p>
            <p
              v-else-if="progress.currentName"
              class="mt-2 truncate text-xs text-slate-500 dark:text-slate-400"
            >
              Actual:
              <span class="font-medium text-slate-700 dark:text-slate-200">{{ progress.currentName }}</span>
            </p>
          </div>
        </div>

        <div
          v-if="!isWorking()"
          class="flex justify-end border-t border-slate-100 px-6 py-3 dark:border-slate-800"
        >
          <button
            type="button"
            class="rounded-xl bg-stellar-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stellar-400"
            @click="emit('close')"
          >
            {{ progress.phase === 'done' ? 'Perfecto' : 'Entendido' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
