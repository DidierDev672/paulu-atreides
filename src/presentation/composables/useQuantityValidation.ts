import { computed, reactive, type Ref } from 'vue'
import type { ProductEntryResponse } from '@/application/services/productEntryService'

export function useQuantityValidation(selectedEntries: Ref<ProductEntryResponse[]>) {
  const availableQuantities = computed(() => {
    const map: Record<string, number> = {}
    const seen = new Set<string>()
    for (const entry of selectedEntries.value) {
      for (const detail of entry.details) {
        if (!seen.has(detail.code)) {
          map[detail.code] = detail.quantity
          seen.add(detail.code)
        }
      }
    }
    return map
  })

  const quantityErrors = reactive<Record<string, string>>({})

  function validateQuantity(code: string, quantity: number): boolean {
    const available = availableQuantities.value[code]
    if (available !== undefined && quantity > available) {
      quantityErrors[code] = `¡Casi listo! La cantidad ingresada supera el stock disponible para esta entrada. Ingresa una cantidad igual o menor a ${available} unidades para continuar.`
      return false
    }
    delete quantityErrors[code]
    return true
  }

  function clearQuantityErrors(): void {
    Object.keys(quantityErrors).forEach((k) => delete quantityErrors[k])
  }

  return {
    availableQuantities,
    quantityErrors,
    validateQuantity,
    clearQuantityErrors,
  }
}
