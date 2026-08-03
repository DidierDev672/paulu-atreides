<script setup lang="ts">
import { formatCurrency } from '@/utils/formatters'

defineProps<{
  value: number
}>()
</script>

<template>
  <span class="font-mono text-[12px] text-slate-700 dark:text-slate-200">
    {{ formatCurrency(value) }}
  </span>
</template>
