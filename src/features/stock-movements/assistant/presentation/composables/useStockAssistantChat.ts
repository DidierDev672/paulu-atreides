import { nextTick, ref } from 'vue'
import { askStockAssistant } from '../../application/askStockAssistant'
import { ensureStockAssistantOllama } from '../../application/ensureStockAssistantOllama'
import { PAULU_STOCK_WELCOME } from '../../domain/pauluStockWelcome'
import type { StockAssistantMessage } from '../../domain/StockAssistantMessage'
import { stockAssistantContextGateway } from '../../infrastructure/AxiosStockAssistantContextGateway'

function createMessage(role: StockAssistantMessage['role'], text: string): StockAssistantMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    text,
    createdAt: new Date().toISOString(),
  }
}

/**
 * Presentation composable — chat state + Ollama/context orchestration (SRP UI state).
 */
export function useStockAssistantChat() {
  const messages = ref<StockAssistantMessage[]>([])
  const draft = ref('')
  const isTyping = ref(false)
  const isBooting = ref(false)
  const error = ref<string | null>(null)
  const scrollEl = ref<HTMLElement | null>(null)

  async function scrollToBottom(): Promise<void> {
    await nextTick()
    const el = scrollEl.value
    if (el) el.scrollTop = el.scrollHeight
  }

  async function bootstrap(): Promise<void> {
    if (messages.value.length > 0) return
    isBooting.value = true
    error.value = null
    try {
      const ollama = await ensureStockAssistantOllama()
      messages.value = [createMessage('assistant', PAULU_STOCK_WELCOME)]
      if (!ollama.ready) {
        messages.value.push(
          createMessage(
            'assistant',
            `Aún no puedo consultar el modelo: ${ollama.message}\nCuando Ollama esté activo con \`llama3\`, podré analizar tus movimientos de stock.`,
          ),
        )
      }
    } catch (err) {
      console.error('[stock-assistant] Falló bootstrap:', err)
      error.value = err instanceof Error ? err.message : 'No se pudo iniciar el asistente.'
      messages.value = [
        createMessage('assistant', PAULU_STOCK_WELCOME),
        createMessage(
          'assistant',
          'Hubo un problema al verificar Ollama. Puedes reintentar enviando una pregunta sobre movimientos de stock.',
        ),
      ]
    } finally {
      isBooting.value = false
      await scrollToBottom()
    }
  }

  async function send(): Promise<void> {
    const text = draft.value.trim()
    if (!text || isTyping.value) return

    messages.value.push(createMessage('user', text))
    draft.value = ''
    isTyping.value = true
    error.value = null
    await scrollToBottom()

    try {
      const result = await askStockAssistant(stockAssistantContextGateway, text)
      messages.value.push(createMessage('assistant', result.answer))
      if (result.contextErrors.length > 0) {
        console.warn('[stock-assistant] Avisos de contexto:', result.contextErrors)
      }
    } catch (err) {
      console.error('[stock-assistant] Falló send:', err)
      error.value = err instanceof Error ? err.message : 'Error al enviar el mensaje.'
      messages.value.push(
        createMessage(
          'assistant',
          'No pude responder en este momento. Intenta de nuevo con una consulta sobre movimientos de stock.',
        ),
      )
    } finally {
      isTyping.value = false
      await scrollToBottom()
    }
  }

  function reset(): void {
    messages.value = []
    draft.value = ''
    isTyping.value = false
    isBooting.value = false
    error.value = null
  }

  return {
    messages,
    draft,
    isTyping,
    isBooting,
    error,
    scrollEl,
    bootstrap,
    send,
    reset,
    scrollToBottom,
  }
}
