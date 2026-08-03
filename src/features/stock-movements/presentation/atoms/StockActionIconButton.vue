<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    variant?: 'neutral' | 'danger'
    disabled?: boolean
  }>(),
  {
    variant: 'neutral',
    disabled: false,
  },
)

defineEmits<{ click: [] }>()
</script>

<template>
  <button
    type="button"
    :aria-label="label"
    :title="label"
    :disabled="disabled"
    :class="[
      'inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors disabled:opacity-50',
      variant === 'danger'
        ? 'border-red-300 text-red-500 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950'
        : 'border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800',
    ]"
    @click.stop="$emit('click')"
  >
    <slot />
  </button>
</template>
