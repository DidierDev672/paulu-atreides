<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import type { ProductResponse } from '@/application/services/productService'
import { useProductStore } from '@/presentation/stores/productStore'
import SupplierSelectionModal from '@/presentation/components/products/SupplierSelectionModal.vue'
import WinerySelectionModal from '@/presentation/components/products/WinerySelectionModal.vue'

const props = defineProps<{
  product: ProductResponse
}>()

const emit = defineEmits<{
  saved: []
  cancel: []
}>()

const productStore = useProductStore()

const VALID_UNITS = ['Kg', 'Litro', 'Libra', 'Gramos', 'Unidad']

const form = reactive({
  name: props.product.name,
  product_code: props.product.product_code,
  categories_input: '',
  categories: [...props.product.categories],
  unit: props.product.unit,
  quantity: props.product.quantity,
  minimum_stock: props.product.minimum_stock,
  supplier_id: props.product.supplier_id,
  winery_id: props.product.winery_id,
})

const selectedSupplierName = ref('')
const showSupplierModal = ref(false)
const selectedWineryName = ref('')
const showWineryModal = ref(false)

const saving = ref(false)
const formError = ref('')
const fieldErrors = reactive({
  name: '',
  product_code: '',
  categories: '',
  unit: '',
  quantity: '',
  minimum_stock: '',
})

const FREQ_KEY = 'category_frequencies'
const categoryFrequencies = ref<Record<string, number>>({})
const showSuggestions = ref(false)

onMounted(() => {
  if (props.product.supplier_id) {
    selectedSupplierName.value = `ID: ${props.product.supplier_id.slice(0, 12)}...`
  }
  if (props.product.winery_id) {
    selectedWineryName.value = `ID: ${props.product.winery_id.slice(0, 12)}...`
  }
  try {
    categoryFrequencies.value = JSON.parse(localStorage.getItem(FREQ_KEY) || '{}')
  } catch {
    categoryFrequencies.value = {}
  }
})

function persistFrequencies(): void {
  localStorage.setItem(FREQ_KEY, JSON.stringify(categoryFrequencies.value))
}

function incrementCategory(cat: string): void {
  categoryFrequencies.value[cat] = (categoryFrequencies.value[cat] || 0) + 1
  persistFrequencies()
}

const filteredSuggestions = computed(() => {
  const input = form.categories_input.trim().toLowerCase()
  if (!input) return []
  return Object.entries(categoryFrequencies.value)
    .filter(([cat, count]) => count >= 3 && cat.toLowerCase().includes(input) && !form.categories.includes(cat))
    .map(([cat]) => cat)
    .slice(0, 6)
})

function selectSuggestion(cat: string): void {
  form.categories_input = cat
  showSuggestions.value = false
  addCategory()
}

function addCategory(): void {
  const val = form.categories_input.trim()
  if (val && !form.categories.includes(val)) {
    form.categories.push(val)
    form.categories_input = ''
    fieldErrors.categories = ''
    showSuggestions.value = false
    incrementCategory(val)
  }
}

function removeCategory(index: number): void {
  form.categories.splice(index, 1)
}

function handleCategoryKeydown(e: KeyboardEvent): void {
  if (e.key === 'Enter') {
    e.preventDefault()
    addCategory()
  }
}

function onSupplierSelected(provider: { id: string; business_name: string }): void {
  form.supplier_id = provider.id
  selectedSupplierName.value = provider.business_name
  showSupplierModal.value = false
}

function clearSupplier(): void {
  form.supplier_id = ''
  selectedSupplierName.value = ''
}

function onWinerySelected(winery: { id: string; area: string }): void {
  form.winery_id = winery.id
  selectedWineryName.value = winery.area
  showWineryModal.value = false
}

function clearWinery(): void {
  form.winery_id = ''
  selectedWineryName.value = ''
}

function generateProductCode(): void {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  form.product_code = `PROD-${timestamp}-${random}`
  fieldErrors.product_code = ''
}

function validate(): boolean {
  let valid = true
  fieldErrors.name = ''
  fieldErrors.product_code = ''
  fieldErrors.categories = ''
  fieldErrors.unit = ''
  fieldErrors.quantity = ''
  fieldErrors.minimum_stock = ''

  if (!form.name.trim()) {
    fieldErrors.name = 'El nombre del producto es obligatorio.'
    valid = false
  }
  if (!form.product_code.trim()) {
    fieldErrors.product_code = 'El código del producto es obligatorio.'
    valid = false
  }
  if (form.categories.length === 0) {
    fieldErrors.categories = 'Debe agregar al menos una categoría.'
    valid = false
  }
  if (!form.unit) {
    fieldErrors.unit = 'Seleccione una unidad de medida.'
    valid = false
  }
  if (form.quantity < 0) {
    fieldErrors.quantity = 'La cantidad no puede ser negativa.'
    valid = false
  }
  if (form.minimum_stock < 0) {
    fieldErrors.minimum_stock = 'El stock mínimo no puede ser negativo.'
    valid = false
  }

  return valid
}

async function handleSave(): Promise<void> {
  formError.value = ''

  if (!validate()) return

  saving.value = true
  try {
    const result = await productStore.updateProduct(props.product.id, {
      supplier_id: form.supplier_id,
      name: form.name.trim(),
      product_code: form.product_code.trim(),
      categories: [...form.categories],
      unit: form.unit,
      quantity: form.quantity,
      minimum_stock: form.minimum_stock,
      winery_id: form.winery_id,
    })

    if (result) {
      emit('saved')
    } else {
      formError.value = productStore.error ?? 'Error al actualizar el producto.'
    }
  } catch {
    formError.value = 'Error inesperado al actualizar el producto.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-motion
      :initial="{ opacity: 0 }"
      :enter="{ opacity: 1, transition: { duration: 300 } }"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
    >
      <div
        v-motion
        :initial="{ opacity: 0, scale: 0.92, y: 24 }"
        :enter="{ opacity: 1, scale: 1, y: 0, transition: { duration: 400, ease: 'easeOut' } }"
        class="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-[#0d0a28] shadow-2xl"
      >
        <div class="pointer-events-none absolute -left-20 -top-20 h-40 w-40 rounded-full bg-stellar-600/20 blur-3xl" />
        <div class="pointer-events-none absolute -bottom-16 -right-16 h-36 w-36 rounded-full bg-cosmic-500/15 blur-3xl" />

        <div class="relative px-8 pb-2 pt-10">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="font-display text-2xl font-bold text-white">Editar producto</h2>
              <p class="mt-1 text-sm text-white/50">Actualiza los datos del producto seleccionado.</p>
            </div>
            <button
              type="button"
              class="rounded-xl p-2 text-white/40 transition hover:bg-white/10 hover:text-white/80"
              @click="emit('cancel')"
            >
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div class="relative px-8 py-5">
          <form novalidate @submit.prevent="handleSave">
            <div v-if="formError" class="mb-6 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {{ formError }}
            </div>

            <div class="space-y-6">
              <!-- Code + Name -->
              <div class="grid gap-4 sm:grid-cols-2">
                <div class="sm:col-span-2">
                  <label class="mb-1.5 block text-xs font-medium text-white/60">
                    Código del producto <span class="text-red-400">*</span>
                  </label>
                  <div class="flex gap-2">
                    <input
                      v-model="form.product_code"
                      type="text"
                      placeholder="Ej: PROD-001"
                      class="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20"
                      :class="{ 'border-red-400': fieldErrors.product_code }"
                    />
                    <button
                      type="button"
                      class="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/10"
                      title="Generar código automáticamente"
                      @click="generateProductCode"
                    >
                      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Generar
                    </button>
                  </div>
                  <p v-if="fieldErrors.product_code" class="mt-1 text-xs text-red-400">{{ fieldErrors.product_code }}</p>
                </div>

                <div class="sm:col-span-2">
                  <label class="mb-1.5 block text-xs font-medium text-white/60">
                    Nombre del producto <span class="text-red-400">*</span>
                  </label>
                  <input
                    v-model="form.name"
                    type="text"
                    placeholder="Ej: Café Molido Premium 500g"
                    class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20"
                    :class="{ 'border-red-400': fieldErrors.name }"
                  />
                  <p v-if="fieldErrors.name" class="mt-1 text-xs text-red-400">{{ fieldErrors.name }}</p>
                </div>
              </div>

              <!-- Unit + Min stock -->
              <div class="grid gap-4 sm:grid-cols-2">
                <div>
                  <label class="mb-1.5 block text-xs font-medium text-white/60">
                    Unidad de medida <span class="text-red-400">*</span>
                  </label>
                  <select
                    v-model="form.unit"
                    class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20"
                    :class="{ 'border-red-400': fieldErrors.unit }"
                  >
                    <option value="" disabled class="bg-[#0d0a28]">Seleccione una unidad</option>
                    <option v-for="u in VALID_UNITS" :key="u" :value="u" class="bg-[#0d0a28]">{{ u }}</option>
                  </select>
                  <p v-if="fieldErrors.unit" class="mt-1 text-xs text-red-400">{{ fieldErrors.unit }}</p>
                </div>

                <div>
                  <label class="mb-1.5 block text-xs font-medium text-white/60">Cantidad de productos</label>
                  <input
                    v-model.number="form.quantity"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20"
                    :class="{ 'border-red-400': fieldErrors.quantity }"
                  />
                  <p v-if="fieldErrors.quantity" class="mt-1 text-xs text-red-400">{{ fieldErrors.quantity }}</p>
                </div>

                <div>
                  <label class="mb-1.5 block text-xs font-medium text-white/60">Stock mínimo</label>
                  <input
                    v-model.number="form.minimum_stock"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20"
                    :class="{ 'border-red-400': fieldErrors.minimum_stock }"
                  />
                  <p v-if="fieldErrors.minimum_stock" class="mt-1 text-xs text-red-400">{{ fieldErrors.minimum_stock }}</p>
                </div>
              </div>

              <!-- Categories -->
              <div>
                <label class="mb-1.5 block text-xs font-medium text-white/60">
                  Categorías <span class="text-red-400">*</span>
                </label>
                <div class="flex gap-2">
                  <div class="relative flex-1">
                    <input
                      v-model="form.categories_input"
                      type="text"
                      placeholder="Escriba una categoría y presione Enter"
                      class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20"
                      @keydown="handleCategoryKeydown"
                      @input="showSuggestions = filteredSuggestions.length > 0"
                      @focus="showSuggestions = filteredSuggestions.length > 0"
                      @blur="setTimeout(() => showSuggestions = false, 200)"
                    />
                    <Transition name="fade">
                      <div
                        v-if="showSuggestions && filteredSuggestions.length > 0"
                        class="absolute left-0 right-0 top-full z-10 mt-1 max-h-40 overflow-y-auto rounded-xl border border-white/10 bg-[#0d0a28] shadow-lg"
                      >
                        <button
                          v-for="suggestion in filteredSuggestions"
                          :key="suggestion"
                          type="button"
                          class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-white/70 transition hover:bg-white/5"
                          @mousedown.prevent="selectSuggestion(suggestion)"
                        >
                          <svg class="h-3.5 w-3.5 shrink-0 text-stellar-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          {{ suggestion }}
                        </button>
                      </div>
                    </Transition>
                  </div>
                  <button
                    type="button"
                    class="inline-flex items-center gap-1.5 rounded-xl bg-stellar-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-stellar-400"
                    @click="addCategory"
                  >
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Agregar
                  </button>
                </div>
                <p v-if="fieldErrors.categories" class="mt-1 text-xs text-red-400">{{ fieldErrors.categories }}</p>

                <div v-if="form.categories.length > 0" class="mt-3 flex flex-wrap gap-2">
                  <span
                    v-for="(cat, index) in form.categories"
                    :key="index"
                    class="inline-flex items-center gap-1.5 rounded-lg bg-stellar-500/10 px-3 py-1.5 text-xs font-medium text-stellar-300"
                  >
                    {{ cat }}
                    <button
                      type="button"
                      class="inline-flex rounded-full p-0.5 transition hover:bg-stellar-500/20 hover:text-stellar-100"
                      @click="removeCategory(index)"
                    >
                      <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                </div>
              </div>

              <!-- Winery -->
              <div>
                <label class="mb-1.5 block text-xs font-medium text-white/60">Bodega</label>
                <div v-if="!form.winery_id">
                  <p class="mb-3 text-sm text-white/40">Asocie una bodega a este producto.</p>
                  <button
                    type="button"
                    class="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/10"
                    @click="showWineryModal = true"
                  >
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Buscar bodega
                  </button>
                </div>
                <div v-else class="flex items-center gap-3 rounded-xl bg-stellar-500/10 px-4 py-3">
                  <div class="flex h-10 w-10 items-center justify-center rounded-full bg-stellar-500/20 text-stellar-300">
                    <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3 21V7l9-4 9 4v14M9 17h6v4H9zm0-6h6" />
                    </svg>
                  </div>
                  <div class="flex-1">
                    <p class="text-sm font-medium text-white">{{ selectedWineryName || 'Bodega seleccionada' }}</p>
                    <p class="text-xs text-white/40">Bodega asignada</p>
                  </div>
                  <button
                    type="button"
                    class="rounded-xl p-2 text-white/40 transition hover:bg-white/10 hover:text-white/70"
                    title="Cambiar bodega"
                    @click="showWineryModal = true"
                  >
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    class="rounded-xl p-2 text-white/40 transition hover:bg-white/10 hover:text-red-400"
                    title="Quitar bodega"
                    @click="clearWinery"
                  >
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Supplier -->
              <div>
                <label class="mb-1.5 block text-xs font-medium text-white/60">Proveedor</label>
                <div v-if="!form.supplier_id">
                  <p class="mb-3 text-sm text-white/40">Asocie un proveedor a este producto.</p>
                  <button
                    type="button"
                    class="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/10"
                    @click="showSupplierModal = true"
                  >
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Buscar proveedor
                  </button>
                </div>
                <div v-else class="flex items-center gap-3 rounded-xl bg-stellar-500/10 px-4 py-3">
                  <div class="flex h-10 w-10 items-center justify-center rounded-full bg-stellar-500/20 text-stellar-300">
                    <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div class="flex-1">
                    <p class="text-sm font-medium text-white">{{ selectedSupplierName || 'Proveedor seleccionado' }}</p>
                    <p class="text-xs text-white/40">Proveedor asignado</p>
                  </div>
                  <button
                    type="button"
                    class="rounded-xl p-2 text-white/40 transition hover:bg-white/10 hover:text-white/70"
                    title="Cambiar proveedor"
                    @click="showSupplierModal = true"
                  >
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    class="rounded-xl p-2 text-white/40 transition hover:bg-white/10 hover:text-red-400"
                    title="Quitar proveedor"
                    @click="clearSupplier"
                  >
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="mt-8 flex justify-end gap-3 border-t border-white/10 pt-6">
              <button
                type="button"
                class="rounded-xl border border-white/10 px-6 py-2.5 text-sm font-semibold text-white/50 transition hover:border-white/20 hover:text-white/70"
                @click="emit('cancel')"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="saving"
                class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-stellar-500 to-cosmic-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:from-stellar-400 hover:to-cosmic-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg
                  v-if="saving"
                  class="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <svg
                  v-else
                  class="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {{ saving ? 'Guardando...' : 'Guardar cambios' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Teleport>

  <SupplierSelectionModal
    v-if="showSupplierModal"
    @close="showSupplierModal = false"
    @confirm="onSupplierSelected"
  />
  <WinerySelectionModal
    v-if="showWineryModal"
    :company-id="props.product.company_id"
    @close="showWineryModal = false"
    @confirm="onWinerySelected"
  />
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
