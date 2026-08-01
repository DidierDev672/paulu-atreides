<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import DocumentImportFabButton from '@/presentation/components/providers/document-import/atoms/DocumentImportFabButton.vue'
import DocumentFileInput from '@/presentation/components/providers/document-import/atoms/DocumentFileInput.vue'
import ProductDocumentValidationPanel from './molecules/ProductDocumentValidationPanel.vue'
import ProductBatchSaveModal from './molecules/ProductBatchSaveModal.vue'
import { useProductDocumentImport } from '@/presentation/composables/useProductDocumentImport'
import { useCompanyStore } from '@/presentation/stores/companyStore'
import { useAuthStore } from '@/presentation/stores/authStore'
import { useProviderStore } from '@/presentation/stores/providerStore'
import { useWineryStore } from '@/presentation/stores/wineryStore'
import {
  getMissingProductAssociation,
  type ProductBatchMissingAssociation,
  type ProductBatchStoreContext,
} from '@/application/services/productBatchStoreService'

const props = defineProps<{
  /** Prefer the form's company when store selection is empty (e.g. ProductRegistrationForm). */
  companyId?: string
  /** Supplier already selected on the registration form — used for the whole import list. */
  supplierId?: string
  /** Winery already selected on the registration form — used for the whole import list. */
  wineryId?: string
}>()

const emit = defineEmits<{
  saved: [count: number]
  'require-association': [missing: Exclude<ProductBatchMissingAssociation, null>]
}>()

const companyStore = useCompanyStore()
const authStore = useAuthStore()
const providerStore = useProviderStore()
const wineryStore = useWineryStore()

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
  saveOrganizedProducts,
  closeSaveModal,
  reset,
} = useProductDocumentImport()

const resolvedCompanyId = computed(
  () => props.companyId?.trim() || companyStore.selectedCompany?.id || '',
)

async function loadDependencies(companyId: string): Promise<void> {
  if (providerStore.providers.length === 0) {
    await providerStore.fetchProviders()
  }
  // Misma fuente que WinerySelectionModal: GET /wineries.
  if (wineryStore.wineries.length === 0 || companyId) {
    await wineryStore.fetchWineries()
  }
}

onMounted(() => {
  loadDependencies(resolvedCompanyId.value)
})

watch(resolvedCompanyId, (id) => {
  if (id) loadDependencies(id)
})

const isBusy = computed(
  () =>
    phase.value === 'ensuring-ollama' ||
    phase.value === 'reading-file' ||
    phase.value === 'analyzing' ||
    isSaving.value,
)

const showPanel = computed(() => phase.value === 'done' && result.value !== null)

function buildStoreContext(): ProductBatchStoreContext {
  const companyId = resolvedCompanyId.value
  const userId = authStore.session?.user?.id ?? ''
  const suppliers = providerStore.providers.map((p) => ({
    id: p.id,
    business_name: p.business_name,
  }))
  const wineries = wineryStore.wineries
    .filter((w) => !companyId || w.company_id === companyId)
    .map((w) => ({
      id: w.id,
      area: w.area,
    }))

  // Previously selected form values are the source of truth for import save.
  const formSupplierId = props.supplierId?.trim() || ''
  const formWineryId = props.wineryId?.trim() || ''

  return {
    companyId,
    userId,
    defaultSupplierId: formSupplierId || suppliers[0]?.id || '',
    // Bodega del formulario: se asocia a cada producto de la lista importada.
    defaultWineryId: formWineryId || wineries[0]?.id || '',
    suppliers,
    wineries,
  }
}

function openPicker(): void {
  if (isBusy.value) return
  fileInputRef.value?.open()
}

async function onFileSelected(file: File): Promise<void> {
  await importDocument(file)
}

async function saveAll(): Promise<void> {
  const formSupplierId = props.supplierId?.trim() || ''
  const formWineryId = props.wineryId?.trim() || ''

  // On ProductRegistrationForm both props are bound: require the user's prior selections
  // and never open the winery modal — use those IDs for the whole list.
  const boundToForm = props.supplierId !== undefined && props.wineryId !== undefined
  if (boundToForm) {
    if (!formSupplierId || !formWineryId) {
      const missing: Exclude<ProductBatchMissingAssociation, null> =
        !formSupplierId && !formWineryId
          ? 'both'
          : !formSupplierId
            ? 'supplier'
            : 'winery'
      emit('require-association', missing)
      return
    }

    const ctx = buildStoreContext()
    // El proveedor (y bodega) del formulario se propaga a cada producto de la lista.
    ctx.defaultSupplierId = formSupplierId
    ctx.defaultWineryId = formWineryId
    ctx.forceFormAssociations = true

    const batch = await saveOrganizedProducts(ctx)
    if (batch && batch.savedProducts.length > 0) {
      emit('saved', batch.savedProducts.length)
    }
    return
  }

  const ctx = buildStoreContext()
  // Si hay proveedor/bodega seleccionados, forzarlos en todos los productos de la lista.
  if (ctx.defaultSupplierId || ctx.defaultWineryId) {
    ctx.forceFormAssociations = true
  }
  const missing = getMissingProductAssociation(ctx)
  if (missing) {
    emit('require-association', missing)
    return
  }

  const batch = await saveOrganizedProducts(ctx)
  if (batch && batch.savedProducts.length > 0) {
    emit('saved', batch.savedProducts.length)
  }
}

function onSaveModalClose(): void {
  closeSaveModal()
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

    <ProductDocumentValidationPanel
      v-if="showPanel && result"
      :result="result"
      :file-name="fileName"
      :saving="isSaving"
      @dismiss="reset"
      @save="saveAll"
    />

    <ProductBatchSaveModal
      :open="saveModalOpen"
      :progress="saveProgress"
      @close="onSaveModalClose"
    />

    <DocumentFileInput ref="fileInputRef" @select="onFileSelected" />
    <DocumentImportFabButton
      :loading="isBusy"
      title="Importar productos desde Word o Excel"
      tooltip="Productos · Word / Excel → Llama 3"
      @click="openPicker"
    />
  </div>
</template>
