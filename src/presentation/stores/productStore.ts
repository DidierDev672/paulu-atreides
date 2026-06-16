import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ProductResponse, CreateProductRequest, UpdateProductRequest } from '@/application/services/productService'
import {
  getProducts as apiGetProducts,
  getProductsByCompany as apiGetProductsByCompany,
  getProductById as apiGetProductById,
  createProduct as apiCreateProduct,
  updateProduct as apiUpdateProduct,
  deleteProduct as apiDeleteProduct,
} from '@/application/services/productService'

export const useProductStore = defineStore('product', () => {
  const products = ref<ProductResponse[]>([])
  const currentProduct = ref<ProductResponse | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchProducts(): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      products.value = (await apiGetProducts()) ?? []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al obtener productos.'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchProductsByCompany(companyId: string): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      products.value = await apiGetProductsByCompany(companyId)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al obtener productos.'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchProductById(id: string): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      currentProduct.value = await apiGetProductById(id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al obtener el producto.'
    } finally {
      isLoading.value = false
    }
  }

  async function createProduct(data: CreateProductRequest): Promise<ProductResponse | null> {
    isLoading.value = true
    error.value = null
    try {
      const created = await apiCreateProduct(data)
      products.value.push(created)
      return created
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al crear el producto.'
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function updateProduct(id: string, data: UpdateProductRequest): Promise<ProductResponse | null> {
    isLoading.value = true
    error.value = null
    try {
      const updated = await apiUpdateProduct(id, data)
      const index = products.value.findIndex((p) => p.id === id)
      if (index !== -1) products.value[index] = updated
      if (currentProduct.value?.id === id) currentProduct.value = updated
      return updated
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al actualizar el producto.'
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function removeProduct(id: string): Promise<boolean> {
    isLoading.value = true
    error.value = null
    try {
      await apiDeleteProduct(id)
      products.value = products.value.filter((p) => p.id !== id)
      if (currentProduct.value?.id === id) currentProduct.value = null
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al eliminar el producto.'
      return false
    } finally {
      isLoading.value = false
    }
  }

  function clearError(): void {
    error.value = null
  }

  return {
    products,
    currentProduct,
    isLoading,
    error,
    fetchProducts,
    fetchProductsByCompany,
    fetchProductById,
    createProduct,
    updateProduct,
    removeProduct,
    clearError,
  }
})
