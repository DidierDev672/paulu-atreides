<script setup lang="ts">
import { formatCurrency } from '@/utils/formatters'

withDefaults(
  defineProps<{
    label: string
    value?: number | null
    highlight?: boolean
    color?: string
    prefix?: string
  }>(),
  {
    highlight: false,
    color: '',
    prefix: '',
  },
)
</script>

<template>
  <div class="flex flex-col gap-0.5">
    <span class="text-[10px] text-slate-400 dark:text-[#4B5563]">{{ label }}</span>
    <span
      :class="[
        'font-mono font-medium',
        highlight ? 'text-[15px] text-slate-900 dark:text-gray-100' : 'text-[13px] text-slate-600 dark:text-[#D1D5DB]',
        color === 'green' ? 'text-green-600 dark:text-green-400' : '',
      ]"
    >
      {{ prefix }}{{ formatCurrency(value) }}
    </span>
  </div>
</template>
