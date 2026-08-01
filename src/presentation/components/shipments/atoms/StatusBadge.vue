<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  status: string
}>()

const map: Record<string, { label: string; icon: string; classes: string }> = {
  confirmed: {
    label: 'Confirmado',
    icon: '✓',
    classes: 'bg-green-50 border-green-200 text-green-700 dark:bg-[#14532D] dark:border-[#166534] dark:text-green-300',
  },
  confirmado: {
    label: 'Confirmado',
    icon: '✓',
    classes: 'bg-green-50 border-green-200 text-green-700 dark:bg-[#14532D] dark:border-[#166534] dark:text-green-300',
  },
  approved: {
    label: 'Aprobado',
    icon: '✓',
    classes: 'bg-green-50 border-green-200 text-green-700 dark:bg-[#14532D] dark:border-[#166534] dark:text-green-300',
  },
  draft: {
    label: 'Borrador',
    icon: '○',
    classes: 'bg-slate-100 border-slate-200 text-slate-700 dark:bg-[#1E2937] dark:border-[#334155] dark:text-slate-300',
  },
  pending: {
    label: 'Pendiente',
    icon: '⏳',
    classes: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-[#78350F] dark:border-[#92400E] dark:text-amber-300',
  },
  pendiente: {
    label: 'Pendiente',
    icon: '⏳',
    classes: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-[#78350F] dark:border-[#92400E] dark:text-amber-300',
  },
  processing: {
    label: 'En proceso',
    icon: '⟳',
    classes: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-[#1E3A5F] dark:border-[#1D4ED8] dark:text-blue-300',
  },
  completed: {
    label: 'Completado',
    icon: '✓',
    classes: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-[#1E3A5F] dark:border-[#1D4ED8] dark:text-blue-300',
  },
  rejected: {
    label: 'Rechazado',
    icon: '✕',
    classes: 'bg-red-50 border-red-200 text-red-700 dark:bg-[#450A0A] dark:border-[#7F1D1D] dark:text-red-300',
  },
  canceled: {
    label: 'Cancelado',
    icon: '✕',
    classes: 'bg-red-50 border-red-200 text-red-700 dark:bg-[#450A0A] dark:border-[#7F1D1D] dark:text-red-300',
  },
  cancelado: {
    label: 'Cancelado',
    icon: '✕',
    classes: 'bg-red-50 border-red-200 text-red-700 dark:bg-[#450A0A] dark:border-[#7F1D1D] dark:text-red-300',
  },
}

const config = computed(() => map[props.status?.toLowerCase()] ?? map.pending)
</script>

<template>
  <span
    :class="[
      'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold',
      config.classes,
    ]"
  >
    {{ config.icon }} {{ config.label }}
  </span>
</template>
