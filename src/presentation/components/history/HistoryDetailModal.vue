<script setup lang="ts">
import { onMounted } from 'vue'
import { useHistoryStore } from '@/presentation/stores/historyStore'
import { useHistoryLogger } from '@/presentation/composables/useHistoryLogger'
import HistoryTimeline from '@/presentation/components/history/HistoryTimeline.vue'
import type { HistoryEntry } from '@/domain/entities/HistoryEntry'

const props = defineProps<{
  entityType: string
  entityId: string
  entityLabel?: string
}>()

const emit = defineEmits<{
  close: []
}>()

const historyStore = useHistoryStore()

onMounted(async () => {
  await historyStore.fetchEntriesByEntity(props.entityType, props.entityId)
})
<\/script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden m-4">
      <HistoryTimeline
        :entries="historyStore.entries"
        :is-loading="historyStore.isLoading"
        :title="'Historial - ' + (entityLabel ?? entityType) + ' #' + entityId.slice(0, 8)"
        @close="emit('close')"
      />
    </div>
  </div>
<\/template>
