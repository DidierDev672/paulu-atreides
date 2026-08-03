<script setup lang="ts">
const model = defineModel<string>({ default: '' })

defineProps<{
  placeholder?: string
  disabled?: boolean
}>()
</script>

<template>
  <div class="relative w-full sm:w-64">
    <svg
      class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="2"
      aria-hidden="true"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
    <input
      v-model="model"
      type="search"
      autocomplete="off"
      :disabled="disabled"
      :placeholder="placeholder || 'Buscar por nombre de producto…'"
      class="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-3 text-sm outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
      aria-label="Buscar movimientos por nombre de producto"
    />
  </div>
</template>
