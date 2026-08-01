import { ref, readonly, nextTick } from 'vue'
import { ensureOllamaRunning } from '@/application/services/ollamaService'
import { extractTextFromProviderDocument } from '@/application/services/documentTextExtractor'
import { validateProviderDocumentWithLlama3 } from '@/application/services/providerDocumentValidator'
import { storeProvidersIndividually } from '@/application/services/providerBatchStoreService'
import type {
  ProviderBatchSaveProgress,
  ProviderDocumentValidationResult,
  ProviderFormDraft,
} from '@/domain/provider-document/providerDocument.types'
import type { StoreProvidersIndividuallyResult } from '@/application/services/providerBatchStoreService'

export type ImportPhase =
  | 'idle'
  | 'ensuring-ollama'
  | 'reading-file'
  | 'analyzing'
  | 'done'
  | 'error'

export function useProviderDocumentImport() {
  const phase = ref<ImportPhase>('idle')
  const statusMessage = ref('')
  const errorMessage = ref('')
  const result = ref<ProviderDocumentValidationResult | null>(null)
  const fileName = ref('')
  const isSaving = ref(false)
  const saveModalOpen = ref(false)
  const saveProgress = ref<ProviderBatchSaveProgress | null>(null)
  const lastSaveResult = ref<StoreProvidersIndividuallyResult | null>(null)

  function reset(): void {
    phase.value = 'idle'
    statusMessage.value = ''
    errorMessage.value = ''
    result.value = null
    fileName.value = ''
    isSaving.value = false
    saveModalOpen.value = false
    saveProgress.value = null
    lastSaveResult.value = null
  }

  function closeSaveModal(): void {
    saveModalOpen.value = false
    if (saveProgress.value?.phase === 'done' && (lastSaveResult.value?.saved.length ?? 0) > 0) {
      reset()
    }
  }

  async function importDocument(file: File): Promise<ProviderDocumentValidationResult | null> {
    errorMessage.value = ''
    result.value = null
    fileName.value = file.name
    lastSaveResult.value = null

    try {
      phase.value = 'ensuring-ollama'
      statusMessage.value = 'Comprobando Ollama y el modelo Llama 3…'
      const ensure = await ensureOllamaRunning()
      if (!ensure.ready) {
        throw new Error(ensure.message)
      }
      statusMessage.value = ensure.message

      phase.value = 'reading-file'
      statusMessage.value = `Leyendo ${file.name}…`
      const extracted = await extractTextFromProviderDocument(file)

      phase.value = 'analyzing'
      statusMessage.value =
        'Llama 3 está organizando el/los proveedor(es) al formato de registro…'
      const validation = await validateProviderDocumentWithLlama3(
        extracted.text,
        extracted.fileName,
      )

      result.value = validation
      phase.value = 'done'
      statusMessage.value = validation.summary
      return validation
    } catch (error) {
      phase.value = 'error'
      errorMessage.value =
        error instanceof Error ? error.message : 'No se pudo procesar el documento.'
      statusMessage.value = ''
      return null
    }
  }

  /**
   * Opens the progress modal immediately, then persists each organized provider
   * one-by-one via the create-provider endpoint.
   */
  async function saveOrganizedProviders(): Promise<StoreProvidersIndividuallyResult | null> {
    if (!result.value || result.value.providers.length === 0) {
      errorMessage.value = 'No hay proveedores organizados para guardar.'
      return null
    }

    // Send every organized row from Llama 3 (not only the ones marked isValid).
    const drafts: ProviderFormDraft[] = result.value.providers.map((item) => item.mapped)
    const isList = drafts.length > 1 || result.value.isList

    isSaving.value = true
    saveModalOpen.value = true
    saveProgress.value = {
      current: 0,
      total: drafts.length,
      isList,
      currentName: '',
      phase: 'saving',
      message: isList
        ? `Se están enviando, uno por uno, los ${drafts.length} proveedores a registrar en el sistema.`
        : 'Se está enviando un solo registro de proveedor a registrar en el sistema.',
      savedCount: 0,
      failedCount: 0,
    }

    // Let Vue paint the modal before the sequential HTTP calls begin.
    await nextTick()

    try {
      const batchResult = await storeProvidersIndividually(drafts, {
        onProgress: (progress) => {
          saveProgress.value = {
            ...progress,
            isList: progress.isList || isList,
            message:
              progress.phase === 'saving'
                ? isList
                  ? `Enviando proveedores uno por uno (${progress.current} de ${progress.total}): ${progress.currentName || '…'}`
                  : `Enviando el registro a registrar: ${progress.currentName || '…'}`
                : progress.message,
          }
        },
      })
      lastSaveResult.value = batchResult
      return batchResult
    } catch (error) {
      saveProgress.value = {
        current: 0,
        total: drafts.length,
        isList,
        currentName: '',
        phase: 'error',
        message: error instanceof Error ? error.message : 'Error al almacenar los proveedores.',
        savedCount: 0,
        failedCount: drafts.length,
      }
      return null
    } finally {
      isSaving.value = false
    }
  }

  return {
    phase: readonly(phase),
    statusMessage: readonly(statusMessage),
    errorMessage: readonly(errorMessage),
    result: readonly(result),
    fileName: readonly(fileName),
    isSaving: readonly(isSaving),
    saveModalOpen: readonly(saveModalOpen),
    saveProgress: readonly(saveProgress),
    lastSaveResult: readonly(lastSaveResult),
    importDocument,
    saveOrganizedProviders,
    closeSaveModal,
    reset,
  }
}
