import { chatWithLlama3 } from '@/application/services/ollamaService'
import type { IStockAssistantContextGateway } from '../domain/IStockAssistantContextGateway'
import {
  PAULU_STOCK_OFF_TOPIC,
  PAULU_STOCK_REQUEST_EXAMPLES,
  pauluContextFailureMessage,
  pauluModelErrorMessage,
  pauluOllamaNotReadyMessage,
} from '../domain/pauluFriendlyMessages'
import { STOCK_ASSISTANT_SYSTEM_PROMPT } from '../domain/stockAssistantSystemPrompt'
import { buildStockAssistantContext } from './buildStockAssistantContext'
import { ensureStockAssistantOllama } from './ensureStockAssistantOllama'
import { isStockDomainQuestion } from './isStockDomainQuestion'

export interface AskStockAssistantResult {
  answer: string
  ollamaReady: boolean
  contextErrors: string[]
}

/**
 * Use case (SRP): ensure Ollama, load stock context, ask Paulu within domain bounds.
 */
export async function askStockAssistant(
  gateway: IStockAssistantContextGateway,
  userQuestion: string,
): Promise<AskStockAssistantResult> {
  try {
    if (!isStockDomainQuestion(userQuestion)) {
      return {
        answer: PAULU_STOCK_OFF_TOPIC,
        ollamaReady: true,
        contextErrors: [],
      }
    }

    const ollama = await ensureStockAssistantOllama()
    if (!ollama.ready) {
      return {
        answer: pauluOllamaNotReadyMessage(ollama.message),
        ollamaReady: false,
        contextErrors: [ollama.message],
      }
    }

    let context = ''
    let loadErrors: string[] = []

    try {
      const built = await buildStockAssistantContext(gateway, userQuestion)
      context = built.context
      loadErrors = built.loadErrors
    } catch (err) {
      console.error('[stock-assistant] Contexto no disponible:', err)
      return {
        answer: pauluContextFailureMessage(),
        ollamaReady: true,
        contextErrors: [err instanceof Error ? err.message : String(err)],
      }
    }

    const prompt = [
      'Pregunta del usuario:',
      userQuestion,
      '',
      'Responde en texto claro. No generes tablas HTML ni CSS.',
      '',
      'Datos actuales del inventario / movimientos (usa solo esto; no inventes):',
      context,
      '',
      loadErrors.length > 0
        ? `Hubo avisos al cargar algunos datos: ${loadErrors.join(' | ')}. Si no puedes completar la petición, explícalo con amabilidad y ofrece ejemplos.`
        : 'Los datos principales se cargaron correctamente.',
      '',
      'Responde como Paulu, solo sobre movimientos de stock e inventario relacionado.',
      '',
      PAULU_STOCK_REQUEST_EXAMPLES,
    ].join('\n')

    try {
      const answer = await chatWithLlama3({
        system: STOCK_ASSISTANT_SYSTEM_PROMPT,
        prompt,
        temperature: 0.2,
      })

      return { answer, ollamaReady: true, contextErrors: loadErrors }
    } catch (err) {
      console.error('[stock-assistant] Falló chatWithLlama3:', err)
      return {
        answer: pauluModelErrorMessage(),
        ollamaReady: true,
        contextErrors: [err instanceof Error ? err.message : String(err)],
      }
    }
  } catch (err) {
    console.error('[stock-assistant] Falló askStockAssistant:', err)
    return {
      answer: pauluContextFailureMessage(),
      ollamaReady: false,
      contextErrors: [err instanceof Error ? err.message : String(err)],
    }
  }
}
