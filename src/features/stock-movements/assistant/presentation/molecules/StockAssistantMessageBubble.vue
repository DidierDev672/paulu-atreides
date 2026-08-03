<script setup lang="ts">
import { computed } from 'vue'
import VueMarkdown from 'vue-markdown-render'
import { parseAssistantContent } from '../../application/parseAssistantContent'
import type { StockAssistantMessage } from '../../domain/StockAssistantMessage'
import StockAssistantAvatar from '../atoms/StockAssistantAvatar.vue'
import StockAssistantHtmlTable from '../atoms/StockAssistantHtmlTable.vue'

const props = defineProps<{
  message: StockAssistantMessage
}>()

const segments = computed(() => {
  if (props.message.role !== 'assistant') {
    return [{ type: 'text' as const, text: props.message.text }]
  }
  return parseAssistantContent(props.message.text)
})
</script>

<template>
  <div
    class="flex gap-2"
    :class="message.role === 'user' ? 'flex-row-reverse' : 'flex-row'"
  >
    <StockAssistantAvatar v-if="message.role === 'assistant'" />
    <div
      class="max-w-[90%] overflow-x-auto rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed"
      :class="
        message.role === 'user'
          ? 'bg-stellar-500 text-white whitespace-pre-wrap'
          : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100'
      "
    >
      <template v-if="message.role === 'assistant'">
        <template v-for="(segment, index) in segments" :key="index">
          <VueMarkdown
            v-if="segment.type === 'text'"
            :source="segment.text"
            class="stock-assistant-prose prose prose-sm max-w-none dark:prose-invert"
          />
          <StockAssistantHtmlTable
            v-else
            :headers="segment.headers"
            :rows="segment.rows"
          />
        </template>
      </template>
      <span v-else>{{ message.text }}</span>
    </div>
  </div>
</template>

<style>
.stock-assistant-prose p {
  margin: 0.45em 0;
}
.stock-assistant-prose p:first-child {
  margin-top: 0;
}
.stock-assistant-prose p:last-child {
  margin-bottom: 0;
}
.stock-assistant-prose strong {
  font-weight: 600;
}
.stock-assistant-prose ul,
.stock-assistant-prose ol {
  margin: 0.45em 0;
  padding-left: 1.25em;
}
/* Avoid nested markdown tables; we render HTML/CSS tables separately */
.stock-assistant-prose table {
  display: none;
}
.stock-assistant-prose code {
  border-radius: 0.35rem;
  background: rgba(148, 163, 184, 0.2);
  padding: 0.1em 0.35em;
  font-size: 0.85em;
}
</style>
