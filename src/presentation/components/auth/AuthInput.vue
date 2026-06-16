<script setup lang="ts">
defineProps<{
  id: string
  label: string
  type?: string
  modelValue: string
  placeholder?: string
  autocomplete?: string
  inputmode?: 'text' | 'numeric' | 'email' | 'tel'
  required?: boolean
  error?: string | null
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="flex flex-col gap-2">
    <label :for="id" class="text-sm font-medium text-white/80">
      {{ label }}
    </label>
    <input
      :id="id"
      :type="type ?? 'text'"
      :value="modelValue"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :inputmode="inputmode"
      :required="required"
      :aria-invalid="!!error"
      :class="[
        'w-full rounded-2xl border bg-white/10 px-4 py-3.5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_24px_rgba(15,10,40,0.25)] backdrop-blur-sm transition placeholder:text-white/35 focus:bg-white/15 focus:outline-none focus:ring-2',
        error
          ? 'border-red-400/50 focus:border-red-400/60 focus:ring-red-400/30'
          : 'border-white/10 focus:border-stellar-400/60 focus:ring-stellar-400/30',
      ]"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <p v-if="error" class="text-sm text-red-300">
      {{ error }}
    </p>
  </div>
</template>
