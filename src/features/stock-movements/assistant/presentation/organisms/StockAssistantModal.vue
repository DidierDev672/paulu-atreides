<script setup lang="ts">
import { useModalMotion } from '@/presentation/composables/useModalMotion'
import StockAssistantChatPanel from './StockAssistantChatPanel.vue'

defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  close: []
  closed: []
}>()

const { panelMotion, backdropTransition } = useModalMotion()
</script>

<template>
  <Teleport to="body">
    <Transition
      :enter-active-class="backdropTransition.enterActiveClass"
      :leave-active-class="backdropTransition.leaveActiveClass"
      :enter-from-class="backdropTransition.enterFromClass"
      :leave-to-class="backdropTransition.leaveToClass"
      @after-leave="emit('closed')"
    >
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
        @click.self="emit('close')"
      >
        <div
          v-motion
          :initial="panelMotion.initial"
          :enter="panelMotion.enter"
          :leave="panelMotion.leave"
          class="flex h-[min(720px,90vh)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
          role="dialog"
          aria-modal="true"
          aria-labelledby="stock-assistant-title"
        >
          <header class="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-700">
            <div>
              <h2 id="stock-assistant-title" class="text-lg font-semibold text-slate-900 dark:text-white">
                Asistente movimientos
              </h2>
              <p class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Paulu — solo consultas sobre movimientos de stock e inventario
              </p>
            </div>
            <button
              type="button"
              class="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              aria-label="Cerrar asistente"
              @click="emit('close')"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </header>

          <StockAssistantChatPanel class="min-h-0 flex-1" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
