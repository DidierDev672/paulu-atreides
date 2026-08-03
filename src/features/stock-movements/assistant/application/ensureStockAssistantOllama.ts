import {
  ensureOllamaRunning,
  type OllamaEnsureResult,
} from '@/application/services/ollamaService'

/**
 * Verifies Ollama is up; Vite helper starts serve + `ollama run llama3` when needed.
 */
export async function ensureStockAssistantOllama(): Promise<OllamaEnsureResult> {
  try {
    const result = await ensureOllamaRunning()
    if (!result.ready) {
      console.error('[stock-assistant] Ollama no listo:', result.message)
    }
    return result
  } catch (err) {
    console.error('[stock-assistant] Falló ensureStockAssistantOllama:', err)
    return {
      ready: false,
      startedServe: false,
      startedModel: false,
      models: [],
      message:
        err instanceof Error
          ? err.message
          : 'No se pudo verificar Ollama. Ejecuta `ollama run llama3` manualmente si hace falta.',
    }
  }
}
