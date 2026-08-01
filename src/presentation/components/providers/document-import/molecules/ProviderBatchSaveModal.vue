<script setup lang="ts">
import type { ProviderBatchSaveProgress } from '@/domain/provider-document/providerDocument.types'

const props = defineProps<{
  open: boolean
  progress: ProviderBatchSaveProgress | null
}>()

const emit = defineEmits<{
  close: []
}>()

const percent = () => {
  if (!props.progress || props.progress.total === 0) return 0
  return Math.round((props.progress.current / props.progress.total) * 100)
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open && progress"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="batch-save-title"
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
                  ? 'bg-dune-status-danger/10 text-dune-status-danger'
                  : progress.phase === 'done'
                    ? 'bg-dune-status-success/10 text-dune-status-success'
                    : 'bg-stellar-500/10 text-stellar-500'
              "
            >
              <svg
                v-if="progress.phase === 'saving'"
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
                stroke-width="2"
              >
                <circle cx="12" cy="12" r="9" />
                <path stroke-linecap="round" d="M12 8v5" />
                <circle cx="12" cy="16.5" r="0.75" fill="currentColor" stroke="none" />
              </svg>
            </div>

            <div class="min-w-0">
              <h3
                id="batch-save-title"
                class="text-base font-semibold text-slate-900 dark:text-white"
              >
                {{
                  progress.phase === 'saving'
                    ? progress.isList
                      ? 'Enviando proveedores uno por uno'
                      : 'Enviando un solo registro'
                    : progress.phase === 'done'
                      ? 'Almacenamiento completado'
                      : 'No se pudo completar el almacenamiento'
                }}
              </h3>
              <p class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {{
                  progress.isList
                    ? `${progress.current} de ${progress.total} · guardados ${progress.savedCount}`
                    : 'Registro individual vía endpoint de alta'
                }}
              </p>
            </div>
          </div>

          <p class="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {{ progress.message }}
          </p>

          <div v-if="progress.phase === 'saving'" class="mt-4">
            <div class="mb-1.5 flex justify-between text-[11px] font-medium text-slate-500">
              <span>Progreso</span>
              <span>{{ percent() }}%</span>
            </div>
            <div class="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                class="h-full rounded-full bg-gradient-to-r from-stellar-500 to-cosmic-500 transition-all duration-300"
                :style="{ width: `${percent()}%` }"
              />
            </div>
            <p
              v-if="progress.currentName"
              class="mt-2 truncate text-xs text-slate-500 dark:text-slate-400"
            >
              Actual: <span class="font-medium text-slate-700 dark:text-slate-200">{{ progress.currentName }}</span>
            </p>
          </div>
        </div>

        <div
          v-if="progress.phase !== 'saving'"
          class="flex justify-end border-t border-slate-100 px-6 py-3 dark:border-slate-800"
        >
          <button
            type="button"
            class="rounded-xl bg-stellar-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stellar-400"
            @click="emit('close')"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
