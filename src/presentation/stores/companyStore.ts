import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CompanyResponse } from '@/application/services/companyService'
import { getCompanyByUser } from '@/application/services/companyService'

export const useCompanyStore = defineStore('company', () => {
  const companies = ref<CompanyResponse[]>([])
  const selectedCompany = ref<CompanyResponse | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const company = computed(() => selectedCompany.value)

  async function fetchByUser(userId: string): Promise<CompanyResponse | null> {
    if (!userId) return null
    isLoading.value = true
    error.value = null
    try {
      const result = await getCompanyByUser(userId)
      companies.value = result
      if (result.length === 1) {
        selectedCompany.value = result[0]
      }
      return selectedCompany.value
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al obtener las empresas.'
      companies.value = []
      selectedCompany.value = null
      return null
    } finally {
      isLoading.value = false
    }
  }

  function selectCompany(c: CompanyResponse): void {
    selectedCompany.value = c
  }

  function setCompanies(list: CompanyResponse[]): void {
    companies.value = list
  }

  function setCompany(c: CompanyResponse | null): void {
    selectedCompany.value = c
  }

  function clearError(): void {
    error.value = null
  }

  return {
    companies,
    selectedCompany,
    company,
    isLoading,
    error,
    fetchByUser,
    selectCompany,
    setCompanies,
    setCompany,
    clearError,
  }
})
