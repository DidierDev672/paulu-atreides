<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  select: [file: File]
}>()

const inputRef = ref<HTMLInputElement | null>(null)

function open(): void {
  inputRef.value?.click()
}

function onChange(event: Event): void {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) emit('select', file)
  input.value = ''
}

defineExpose({ open })
</script>

<template>
  <input
    ref="inputRef"
    type="file"
    class="sr-only"
    accept=".docx,.xlsx,.xls,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
    @change="onChange"
  />
</template>
