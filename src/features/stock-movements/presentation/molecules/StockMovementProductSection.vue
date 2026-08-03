<script setup lang="ts">
import type { StockProduct } from '../../domain/StockProduct'

defineProps<{
  product: StockProduct | null
  productIdFallback: string
  companyName?: string | null
  companyLoading?: boolean
  providerName?: string | null
  providerLoading?: boolean
  wineryName?: string | null
  wineryLoading?: boolean
  loading?: boolean
}>()
</script>

<template>
  <section
    class="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-800/40"
    aria-labelledby="stock-movement-product-heading"
  >
    <h3
      id="stock-movement-product-heading"
      class="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
    >
      Producto
    </h3>

    <div v-if="loading" class="mt-3 flex items-center gap-2 text-sm text-slate-500">
      <div class="h-4 w-4 animate-spin rounded-full border-2 border-stellar-500 border-t-transparent" />
      Cargando datos del producto…
    </div>

    <template v-else-if="product">
      <p class="mt-2 text-base font-semibold text-slate-900 dark:text-white">
        {{ product.name || 'Producto sin nombre' }}
      </p>
      <p class="mt-0.5 font-mono text-[11px] text-slate-500">
        {{ product.product_code || '—' }}
      </p>

      <dl class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <dt class="text-[10px] uppercase tracking-wider text-slate-500">Categorías</dt>
          <dd class="mt-1 flex flex-wrap gap-1.5">
            <template v-if="product.categories.length">
              <span
                v-for="category in product.categories"
                :key="category"
                class="inline-flex rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300"
              >
                {{ category }}
              </span>
            </template>
            <span v-else class="text-sm text-slate-400">—</span>
          </dd>
        </div>

        <div>
          <dt class="text-[10px] uppercase tracking-wider text-slate-500">Unidad</dt>
          <dd class="mt-0.5 text-sm text-slate-800 dark:text-slate-100">{{ product.unit || '—' }}</dd>
        </div>

        <div>
          <dt class="text-[10px] uppercase tracking-wider text-slate-500">Cantidad en inventario</dt>
          <dd class="mt-0.5 font-mono text-sm text-slate-800 dark:text-slate-100">
            {{ product.quantity }}
          </dd>
        </div>

        <div>
          <dt class="text-[10px] uppercase tracking-wider text-slate-500">Stock mínimo</dt>
          <dd class="mt-0.5 font-mono text-sm text-slate-800 dark:text-slate-100">
            {{ product.minimum_stock }}
          </dd>
        </div>

        <div>
          <dt class="text-[10px] uppercase tracking-wider text-slate-500">Compañía</dt>
          <dd class="mt-0.5 text-sm text-slate-800 dark:text-slate-100">
            <span v-if="companyLoading" class="inline-flex items-center gap-2 text-slate-500">
              <span class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-stellar-500 border-t-transparent" />
              Cargando compañía…
            </span>
            <span v-else>{{ companyName || product.company_id || '—' }}</span>
          </dd>
        </div>

        <div>
          <dt class="text-[10px] uppercase tracking-wider text-slate-500">Proveedor</dt>
          <dd class="mt-0.5 text-sm text-slate-800 dark:text-slate-100">
            <span v-if="providerLoading" class="inline-flex items-center gap-2 text-slate-500">
              <span class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-stellar-500 border-t-transparent" />
              Cargando proveedor…
            </span>
            <span v-else>{{ providerName || product.supplier_id || '—' }}</span>
          </dd>
        </div>

        <div class="sm:col-span-2">
          <dt class="text-[10px] uppercase tracking-wider text-slate-500">Bodega</dt>
          <dd class="mt-0.5 text-sm text-slate-800 dark:text-slate-100">
            <span v-if="wineryLoading" class="inline-flex items-center gap-2 text-slate-500">
              <span class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-stellar-500 border-t-transparent" />
              Cargando bodega…
            </span>
            <span v-else>{{ wineryName || product.winery_id || '—' }}</span>
          </dd>
        </div>
      </dl>
    </template>

    <template v-else>
      <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">
        No encontramos el producto en el catálogo. Mostramos el identificador del movimiento para que
        no pierdas el rastro.
      </p>
      <p class="mt-2 font-mono text-[12px] text-slate-800 dark:text-slate-100">
        {{ productIdFallback || '—' }}
      </p>
    </template>
  </section>
</template>
