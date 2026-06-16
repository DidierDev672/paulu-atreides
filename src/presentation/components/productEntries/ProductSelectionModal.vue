<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getProductsByCompany } from '@/application/services/productService'
import type { ProductResponse } from '@/application/services/productService'

const props = defineProps<{
  companyId: string
}>()

const emit = defineEmits<{
  close: []
  confirm: [products: ProductResponse[]]
  goToProductRegistration: []
}>()

const products = ref<ProductResponse[]>([])
const selectedIds = ref<Set<string>>(new Set())
const loading = ref(true)
const error = ref('')
const search = ref('')

const filteredProducts = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return products.value
  return products.value.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.product_code.toLowerCase().includes(q) ||
      p.categories.some((c) => c.toLowerCase().includes(q)),
  )
})

const allSelected = computed(() =>
  filteredProducts.value.length > 0 && filteredProducts.value.every((p) => selectedIds.value.has(p.id)),
)

function toggleAll(): void {
  if (allSelected.value) {
    filteredProducts.value.forEach((p) => selectedIds.value.delete(p.id))
  } else {
    filteredProducts.value.forEach((p) => selectedIds.value.add(p.id))
  }
}

function toggle(id: string): void {
  if (selectedIds.value.has(id)) {
    selectedIds.value.delete(id)
  } else {
    selectedIds.value.add(id)
  }
}

function handleConfirm(): void {
  const selected = products.value.filter((p) => selectedIds.value.has(p.id))
  emit('confirm', selected)
}

onMounted(async () => {
  if (!props.companyId) {
    error.value = 'No se encontr\u00f3 la empresa. Debe registrar una empresa primero.'
    loading.value = false
    return
  }
  try {
    products.value = (await getProductsByCompany(props.companyId)) ?? []
  } catch {
    error.value = 'Error al cargar los productos.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
      @click.self="emit('close')"
    >
      <div
        class="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
      >
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <div>
            <h2 class="text-lg font-semibold text-slate-900 dark:text-white">Seleccionar productos</h2>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              Seleccione los productos a registrar en la entrada
            </p>
          </div>
          <button
            type="button"
            class="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            @click="emit('close')"
          >
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Search -->
        <div class="px-6 pt-4">
          <div class="relative">
            <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              v-model="search"
              type="text"
              placeholder="Buscar por nombre, c\u00f3digo o categor\u00eda..."
              class="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-stellar-500"
            />
          </div>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto px-6 py-4">
          <div v-if="loading" class="flex items-center justify-center py-12 text-slate-400">
            <svg class="h-6 w-6 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span class="ml-3 text-sm">Cargando productos...</span>
          </div>

          <div v-else-if="error" class="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
            {{ error }}
          </div>

          <div v-else-if="products.length === 0" class="flex flex-col items-center px-6 py-12 text-center">
            <div class="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-[0_8px_24px_rgba(251,146,60,0.3)]">
              <svg class="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>

            <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-100">
              A&uacute;n no tienes productos registrados
            </h3>

            <p class="mt-2 max-w-sm text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Cada producto que a&ntilde;adas hoy es una venta que podr&aacute;s
              controlar ma&ntilde;ana.
              <span class="font-medium text-slate-600 dark:text-slate-300">
                Las empresas m&aacute;s organizadas registran todo su inventario
                antes de empezar a operar.
              </span>
            </p>

            <p class="mt-4 text-xs italic text-slate-400 dark:text-slate-500">
              "No puedes gestionar lo que no has registrado."
            </p>

            <div class="mt-6 flex gap-3">
              <button
                type="button"
                class="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                @click="emit('close')"
              >
                Cancelar
              </button>
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-stellar-500 to-cosmic-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-stellar-400 hover:to-cosmic-400"
                @click="emit('goToProductRegistration')"
              >
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Registrar producto
              </button>
            </div>
          </div>

          <table v-else class="w-full text-left text-sm">
            <thead>
              <tr class="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:border-slate-700">
                <th class="w-10 px-2 py-3">
                  <input
                    type="checkbox"
                    :checked="allSelected"
                    :indeterminate="!allSelected && selectedIds.size > 0"
                    class="h-4 w-4 rounded border-slate-300 text-stellar-500 focus:ring-stellar-400"
                    @change="toggleAll"
                  />
                </th>
                <th class="px-2 py-3">C&oacute;digo</th>
                <th class="px-2 py-3">Nombre</th>
                <th class="px-2 py-3">Categor&iacute;as</th>
                <th class="px-2 py-3">Unidad</th>
                <th class="px-2 py-3">Stock m&iacute;n.</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="product in filteredProducts"
                :key="product.id"
                class="cursor-pointer border-b border-slate-100 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/30"
                :class="{ 'bg-stellar-50/50 dark:bg-stellar-500/5': selectedIds.has(product.id) }"
                @click="toggle(product.id)"
              >
                <td class="px-2 py-3" @click.stop>
                  <input
                    type="checkbox"
                    :checked="selectedIds.has(product.id)"
                    class="h-4 w-4 rounded border-slate-300 text-stellar-500 focus:ring-stellar-400"
                    @change="toggle(product.id)"
                  />
                </td>
                <td class="px-2 py-3 font-mono text-xs text-slate-500">{{ product.product_code }}</td>
                <td class="px-2 py-3 font-medium text-slate-800 dark:text-slate-100">{{ product.name }}</td>
                <td class="px-2 py-3">
                  <div class="flex flex-wrap gap-1">
                    <span
                      v-for="cat in product.categories"
                      :key="cat"
                      class="inline-flex rounded-md bg-stellar-50 px-2 py-0.5 text-xs text-stellar-600 dark:bg-stellar-500/10 dark:text-stellar-300"
                    >
                      {{ cat }}
                    </span>
                  </div>
                </td>
                <td class="px-2 py-3 text-slate-600 dark:text-slate-300">{{ product.unit }}</td>
                <td class="px-2 py-3 text-slate-600 dark:text-slate-300">{{ product.minimum_stock }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between border-t border-slate-200 px-6 py-4 dark:border-slate-700">
          <p class="text-sm text-slate-500 dark:text-slate-400">
            {{ selectedIds.size }} producto{{ selectedIds.size !== 1 ? 's' : '' }} seleccionado{{ selectedIds.size !== 1 ? 's' : '' }}
          </p>
          <div class="flex gap-3">
            <button
              type="button"
              class="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              @click="emit('close')"
            >
              Cancelar
            </button>
            <button
              type="button"
              :disabled="selectedIds.size === 0"
              class="rounded-xl bg-gradient-to-r from-stellar-500 to-cosmic-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-stellar-400 hover:to-cosmic-400 disabled:cursor-not-allowed disabled:opacity-50"
              @click="handleConfirm"
            >
              Agregar {{ selectedIds.size }} producto{{ selectedIds.size !== 1 ? 's' : '' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
