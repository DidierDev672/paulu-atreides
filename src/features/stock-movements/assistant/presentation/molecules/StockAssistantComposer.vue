<script setup lang="ts">
import StockAssistantSendButton from '../atoms/StockAssistantSendButton.vue'

const model = defineModel<string>({ default: '' })

defineProps<{
  disabled?: boolean
  placeholder?: string
}>()

const emit = defineEmits<{
  submit: []
}>()

function onSubmit(): void {
  if (!model.value.trim()) return
  emit('submit')
}
</script>

<template>
  <form class="flex items-end gap-2 border-t border-slate-200 p-3 dark:border-slate-700" @submit.prevent="onSubmit">
    <label class="sr-only" for="stock-assistant-input">Mensaje para Paulu</label>
    <textarea
      id="stock-assistant-input"
      v-model="model"
      rows="2"
      :disabled="disabled"
      :placeholder="placeholder || 'Pregunta sobre movimientos de stock…'"
      class="min-h-[42px] flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
      @keydown.enter.exact.prevent="onSubmit"
    />
    <StockAssistantSendButton :disabled="disabled || !model.trim()" />
  </form>
</template>
