<script setup lang="ts">
import { onMounted } from 'vue'
import { useStockAssistantChat } from '../composables/useStockAssistantChat'
import StockAssistantTypingIndicator from '../atoms/StockAssistantTypingIndicator.vue'
import StockAssistantComposer from '../molecules/StockAssistantComposer.vue'
import StockAssistantMessageBubble from '../molecules/StockAssistantMessageBubble.vue'
import StockAssistantAvatar from '../atoms/StockAssistantAvatar.vue'

const {
  messages,
  draft,
  isTyping,
  isBooting,
  scrollEl,
  bootstrap,
  send,
} = useStockAssistantChat()

onMounted(() => {
  void bootstrap()
})

defineExpose({ bootstrap })
</script>

<template>
  <div class="flex h-full min-h-0 flex-col">
    <div
      ref="scrollEl"
      class="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4"
    >
      <div v-if="isBooting" class="flex items-center gap-2 text-sm text-slate-500">
        <StockAssistantAvatar />
        <span>Preparando a Paulu y verificando Ollama…</span>
      </div>

      <StockAssistantMessageBubble
        v-for="message in messages"
        :key="message.id"
        :message="message"
      />

      <div v-if="isTyping" class="flex items-center gap-2">
        <StockAssistantAvatar />
        <div class="rounded-2xl bg-slate-100 px-3 py-2 dark:bg-slate-800">
          <StockAssistantTypingIndicator />
        </div>
      </div>
    </div>

    <StockAssistantComposer
      v-model="draft"
      :disabled="isTyping || isBooting"
      @submit="send"
    />
  </div>
</template>
