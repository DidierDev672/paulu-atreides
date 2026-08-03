<script setup lang="ts">
import { formatCurrency } from '@/utils/formatters'

defineProps<{
  value: number
}>()
</script>

<template>
  <span class="font-mono text-[12px] text-black dark:text-white">
    {{ formatCurrency(value) }}
  </span>
</template>
