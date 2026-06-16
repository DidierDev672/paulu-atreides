<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useProductStore } from '@/presentation/stores/productStore'
import { useCompanyStore } from '@/presentation/stores/companyStore'
import type { ProductResponse } from '@/application/services/productService'
import ConfirmDeleteModal from '@/presentation/components/products/ConfirmDeleteModal.vue'
import ProductEditModal from '@/presentation/components/products/ProductEditModal.vue'

const productStore = useProductStore()
const companyStore = useCompanyStore()
const searchQuery = ref('')

const productToDelete = ref<ProductResponse | null>(null)
const productToEdit = ref<ProductResponse | null>(null)

onMounted(() => {
  fetchProducts()
})

function fetchProducts(): void {
  if (companyStore.selectedCompany) {
    productStore.fetchProductsByCompany(companyStore.selectedCompany.id)
  } else {
    productStore.fetchProducts()
  }
}

function handleDelete(product: ProductResponse): void {
  productToDelete.value = product
}

async function confirmDelete(): Promise<void> {
  if (!productToDelete.value) return
  const id = productToDelete.value.id
  productToDelete.value = null
  await productStore.removeProduct(id)
}

function cancelDelete(): void {
  productToDelete.value = null
}

function handleEdit(product: ProductResponse): void {
  productToEdit.value = product
}

function handleEditSaved(): void {
  productToEdit.value = null
  fetchProducts()
}

function cancelEdit(): void {
  productToEdit.value = null
}

const emit = defineEmits<{
  goToRegisterProduct: []
}>()

const companyName = computed(() => {
  return companyStore.selectedCompany?.business_name ?? ''
})

const totalProducts = computed(() => productStore.products.length)

const filteredProducts = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return productStore.products
  return productStore.products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.product_code.toLowerCase().includes(q) ||
      p.categories.some((c) => c.toLowerCase().includes(q)),
  )
})
</script>

<template>
  <div v-motion :initial="{ opacity: 0, y: 8 }" :enter="{ opacity: 1, y: 0, transition: { duration: 350 } }">
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">Productos</h1>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Listado de productos
          <template v-if="companyStore.selectedCompany">
            de <span class="font-medium text-slate-700 dark:text-slate-300">{{ companyStore.selectedCompany.business_name }}</span>
          </template>.
        </p>
      </div>
      <div class="flex items-center gap-3">
        <div class="relative">
          <svg class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar producto..."
            class="w-56 rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-3 text-sm outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
          />
        </div>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-xl bg-stellar-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-stellar-400"
          @click="fetchProducts()"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualizar
        </button>
      </div>
    </div>

    <div v-if="productStore.isLoading" class="flex items-center justify-center py-20">
      <svg class="h-8 w-8 animate-spin text-stellar-500" viewBox="0 0 24 24" fill="none">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>

    <div v-else-if="productStore.error" class="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
      {{ productStore.error }}
    </div>

    <div v-else-if="filteredProducts.length === 0" class="flex flex-col items-center gap-3 py-20 text-slate-400">
      <svg class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
      <p class="text-sm">No hay productos registrados{{ companyStore.selectedCompany ? ' para esta empresa' : '' }}.</p>
    </div>

    <div v-else class="mb-6 rounded-xl border border-emerald-200/70 bg-gradient-to-r from-emerald-50 to-teal-50 px-5 py-4 dark:border-emerald-800/40 dark:from-emerald-950/40 dark:to-teal-950/40">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex-1">
          <p class="text-sm font-medium text-emerald-800 dark:text-emerald-200">
            {{ totalProducts }} producto{{ totalProducts !== 1 ? 's' : '' }} registrado{{ totalProducts !== 1 ? 's' : '' }}
            <template v-if="companyName">para <span class="font-semibold">{{ companyName }}</span></template>.
          </p>
          <p class="mt-1 text-xs leading-relaxed text-emerald-600 dark:text-emerald-300">
            Cada producto registrado consolida la identidad de tu negocio, proyecta
            profesionalismo ante tus clientes y construye la base de datos que convierte
            una idea en una empresa formal. Los negocios que gestionan su inventario con
            orden transmiten confianza y crecen m&aacute;s r&aacute;pido.
          </p>
        </div>
        <button
          type="button"
          class="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-500"
          @click="emit('goToRegisterProduct')"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Registrar producto
        </button>
      </div>
    </div>

    <div class="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:border-slate-800">
              <th class="px-5 py-3">Código</th>
              <th class="px-5 py-3">Nombre</th>
              <th class="px-5 py-3 hidden sm:table-cell">Categorías</th>
              <th class="px-5 py-3">Unidad</th>
              <th class="px-5 py-3 hidden md:table-cell">Stock mín.</th>
              <th class="px-5 py-3 text-right">Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(product, index) in filteredProducts"
              :key="product.id"
              v-motion
              :initial="{ opacity: 0 }"
              :enter="{ opacity: 1, transition: { duration: 350, delay: 50 + index * 60 } }"
              class="border-b border-slate-50 transition hover:bg-slate-50/80 dark:border-slate-800/50 dark:hover:bg-slate-800/30"
            >
              <td class="px-5 py-4 font-mono text-xs text-slate-500">{{ product.product_code }}</td>
              <td class="px-5 py-4">
                <p class="font-medium text-slate-800 dark:text-slate-200">{{ product.name }}</p>
              </td>
              <td class="hidden px-5 py-4 sm:table-cell">
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="cat in product.categories"
                    :key="cat"
                    class="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  >
                    {{ cat }}
                  </span>
                </div>
              </td>
              <td class="px-5 py-4 text-slate-700 dark:text-slate-300">{{ product.unit }}</td>
              <td class="hidden px-5 py-4 md:table-cell">
                <span
                  class="font-medium"
                  :class="product.minimum_stock > 0 ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'"
                >
                  {{ product.minimum_stock }}
                </span>
              </td>
              <td class="px-5 py-4 text-right">
                <div class="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    class="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-stellar-600 dark:hover:bg-slate-700 dark:hover:text-stellar-300"
                    title="Editar"
                    @click="handleEdit(product)"
                  >
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    class="rounded-lg p-1.5 text-red-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                    title="Eliminar"
                    @click="handleDelete(product)"
                  >
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <ConfirmDeleteModal
    v-if="productToDelete"
    :product="productToDelete"
    @cancel="cancelDelete"
    @confirm="confirmDelete"
  />

  <ProductEditModal
    v-if="productToEdit"
    :product="productToEdit"
    @saved="handleEditSaved"
    @cancel="cancelEdit"
  />
</template>
