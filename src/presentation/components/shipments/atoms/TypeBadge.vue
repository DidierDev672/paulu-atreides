<script setup lang="ts">
defineProps<{
  type: string
}>()
</script>

<template>
  <span
    class="inline-flex shrink-0 items-center rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:border-[#374151] dark:bg-[#111827] dark:text-gray-300"
  >
    {{ type }}
  </span>
</template>
