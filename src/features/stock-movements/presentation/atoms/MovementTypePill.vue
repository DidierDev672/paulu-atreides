<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  type: string
}>()

const label = computed(() => {
  const t = props.type?.toLowerCase()
  if (t === 'in') return 'Entrada'
  if (t === 'out') return 'Salida'
  return props.type || '—'
})

const classes = computed(() => {
  const t = props.type?.toLowerCase()
  if (t === 'in') {
    return 'bg-green-50 text-green-700 border-green-200 dark:bg-[#14532D] dark:text-green-300 dark:border-[#166534]'
  }
  if (t === 'out') {
    return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-[#78350F] dark:text-amber-300 dark:border-[#92400E]'
  }
  return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600'
})
</script>

<template>
  <span
    :class="[
      'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold',
      classes,
    ]"
  >
    {{ label }}
  </span>
</template>
