<script setup lang="ts">
import { computed, ref } from 'vue'
import DocumentImportFabButton from './atoms/DocumentImportFabButton.vue'
import DocumentFileInput from './atoms/DocumentFileInput.vue'
import ProviderDocumentValidationPanel from './molecules/ProviderDocumentValidationPanel.vue'
import ProviderBatchSaveModal from './molecules/ProviderBatchSaveModal.vue'
import { useProviderDocumentImport } from '@/presentation/composables/useProviderDocumentImport'
import type { ProviderFormDraft } from '@/domain/provider-document/providerDocument.types'

const emit = defineEmits<{
  apply: [draft: ProviderFormDraft]
  saved: [count: number]
}>()

const fileInputRef = ref<{ open: () => void } | null>(null)
const {
  phase,
  statusMessage,
  errorMessage,
  result,
  fileName,
  isSaving,
  saveModalOpen,
  saveProgress,
  importDocument,
  saveOrganizedProviders,
  closeSaveModal,
  reset,
} = useProviderDocumentImport()

const isBusy = computed(
  () =>
    phase.value === 'ensuring-ollama' ||
    phase.value === 'reading-file' ||
    phase.value === 'analyzing' ||
    isSaving.value,
)

const showPanel = computed(() => phase.value === 'done' && result.value !== null)

function openPicker(): void {
  if (isBusy.value) return
  fileInputRef.value?.open()
}

async function onFileSelected(file: File): Promise<void> {
  await importDocument(file)
}

function applyMapped(): void {
  if (!result.value) return
  emit('apply', result.value.mapped)
  reset()
}

async function saveAll(): Promise<void> {
  const batch = await saveOrganizedProviders()
  if (batch && batch.saved.length > 0) {
    emit('saved', batch.saved.length)
  }
}

function onSaveModalClose(): void {
  const savedCount = saveProgress.value?.savedCount ?? 0
  closeSaveModal()
  if (savedCount > 0) {
    // Panel already cleared by closeSaveModal when done.
  }
}
</script>

<template>
  <div>
    <div
      v-if="(isBusy && !saveModalOpen) || phase === 'error'"
      v-motion
      :initial="{ opacity: 0, y: 8 }"
      :enter="{ opacity: 1, y: 0 }"
      class="fixed bottom-24 right-6 z-40 max-w-xs rounded-xl border px-4 py-3 text-left shadow-lg sm:right-8"
      :class="
        phase === 'error'
          ? 'border-dune-status-danger/30 bg-white text-dune-status-danger dark:bg-slate-900'
          : 'border-stellar-400/30 bg-white text-slate-700 dark:bg-slate-900 dark:text-slate-200'
      "
      role="status"
      aria-live="polite"
    >
      <p class="text-xs font-semibold">
        {{ phase === 'error' ? 'No se pudo importar' : 'Procesando con Llama 3' }}
      </p>
      <p class="mt-1 text-xs leading-relaxed opacity-90">
        {{ phase === 'error' ? errorMessage : statusMessage }}
      </p>
      <button
        v-if="phase === 'error'"
        type="button"
        class="mt-2 text-xs font-semibold underline-offset-2 hover:underline"
        @click="reset"
      >
        Cerrar
      </button>
    </div>

    <slot
      name="panel"
      :show="showPanel"
      :result="result"
      :file-name="fileName"
      :dismiss="reset"
      :apply="applyMapped"
      :save="saveAll"
      :saving="isSaving"
    >
      <ProviderDocumentValidationPanel
        v-if="showPanel && result"
        :result="result"
        :file-name="fileName"
        :saving="isSaving"
        @dismiss="reset"
        @apply="applyMapped"
        @save="saveAll"
      />
    </slot>

    <ProviderBatchSaveModal
      :open="saveModalOpen"
      :progress="saveProgress"
      @close="onSaveModalClose"
    />

    <DocumentFileInput ref="fileInputRef" @select="onFileSelected" />
    <DocumentImportFabButton :loading="isBusy" @click="openPicker" />
  </div>
</template>
