/**
 * Application service: persists providers one-by-one through the existing
 * create-provider endpoint (providerService.createProvider).
 * SRP: sequential storage + progress reporting only.
 */

import {
  createProvider,
  type CreateProviderRequest,
  type ProviderResponse,
} from '@/application/services/providerService'
import type {
  ProviderBatchSaveProgress,
  ProviderFormDraft,
} from '@/domain/provider-document/providerDocument.types'

export interface StoreProvidersIndividuallyResult {
  saved: ProviderResponse[]
  failed: { draft: ProviderFormDraft; error: string; index: number }[]
}

function draftToRequest(draft: ProviderFormDraft): CreateProviderRequest {
  return {
    code: draft.code.trim(),
    type_person: draft.type_person,
    document_type: draft.document_type,
    document_number: draft.document_number.trim(),
    verification_digit: draft.verification_digit.trim(),
    business_name: draft.business_name.trim(),
    business_activity: draft.business_activity.trim(),
    status: draft.status,
  }
}

function isDraftReady(draft: ProviderFormDraft): boolean {
  return (
    draft.code.trim() !== '' &&
    draft.type_person !== '' &&
    draft.document_type !== '' &&
    draft.document_number.trim() !== '' &&
    draft.business_name.trim() !== ''
  )
}

/**
 * Stores each provider individually (one HTTP POST per item) using the
 * register-provider endpoint consumed by providerService.
 */
export async function storeProvidersIndividually(
  drafts: ProviderFormDraft[],
  options?: {
    onProgress?: (progress: ProviderBatchSaveProgress) => void
  },
): Promise<StoreProvidersIndividuallyResult> {
  const total = drafts.length
  const isList = total > 1
  const saved: ProviderResponse[] = []
  const failed: StoreProvidersIndividuallyResult['failed'] = []

  if (total === 0) {
    options?.onProgress?.({
      current: 0,
      total: 0,
      isList: false,
      currentName: '',
      phase: 'error',
      message: 'No hay proveedores para almacenar.',
      savedCount: 0,
      failedCount: 0,
    })
    return { saved, failed }
  }

  for (let i = 0; i < drafts.length; i++) {
    const draft = drafts[i]
    const current = i + 1
    const currentName = draft.business_name.trim() || draft.code.trim() || `Registro ${current}`

    options?.onProgress?.({
      current,
      total,
      isList,
      currentName,
      phase: 'saving',
      message: isList
        ? `Se están enviando, uno por uno, los proveedores a registrar (${current} de ${total}): ${currentName}.`
        : `Se está enviando un solo registro a registrar: ${currentName}.`,
      savedCount: saved.length,
      failedCount: failed.length,
    })

    if (!isDraftReady(draft)) {
      failed.push({
        draft,
        index: current,
        error: 'Faltan campos obligatorios; se omitió este registro.',
      })
      continue
    }

    try {
      const created = await createProvider(draftToRequest(draft))
      saved.push(created)
    } catch (error) {
      failed.push({
        draft,
        index: current,
        error: error instanceof Error ? error.message : 'Error al registrar el proveedor.',
      })
    }
  }

  const phase: ProviderBatchSaveProgress['phase'] =
    failed.length === 0 ? 'done' : saved.length === 0 ? 'error' : 'done'

  options?.onProgress?.({
    current: total,
    total,
    isList,
    currentName: '',
    phase,
    message:
      failed.length === 0
        ? isList
          ? `Listo. Se almacenaron los ${saved.length} proveedores de la lista, uno por uno.`
          : 'Listo. Se almacenó el registro del proveedor.'
        : isList
          ? `Proceso terminado: ${saved.length} guardados, ${failed.length} con error.`
          : `No se pudo almacenar el registro: ${failed[0]?.error ?? 'error desconocido'}.`,
    savedCount: saved.length,
    failedCount: failed.length,
  })

  return { saved, failed }
}
