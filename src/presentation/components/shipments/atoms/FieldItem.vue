<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    value?: string | null
    mono?: boolean
  }>(),
  {
    mono: false,
  },
)
</script>

<template>
  <div class="flex flex-col gap-0.5">
    <span class="text-[10px] font-normal leading-tight text-slate-500 dark:text-slate-500">
      {{ label }}
    </span>
    <span
      :class="[
        'font-medium leading-tight text-slate-800 dark:text-slate-100',
        mono ? 'font-mono text-[12px]' : 'text-[13px]',
      ]"
    >
      {{ value || '—' }}
    </span>
  </div>
</template>
