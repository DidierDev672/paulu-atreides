/**
 * Application service for local Ollama (Llama 3).
 * - ensureOllamaRunning(): uses Vite middleware to start `ollama serve` + `ollama run llama3`
 * - chatWithLlama3(): generates structured answers via Ollama HTTP API
 */

const OLLAMA_PROXY = '/ollama-api'
const ENSURE_ENDPOINT = '/__ollama/ensure'
const MODEL = 'llama3'

export interface OllamaEnsureResult {
  ready: boolean
  startedServe: boolean
  startedModel: boolean
  models: string[]
  message: string
}

export interface OllamaChatOptions {
  prompt: string
  system?: string
  temperature?: number
  formatJson?: boolean
}

async function pingOllama(): Promise<boolean> {
  try {
    const res = await fetch(`${OLLAMA_PROXY}/api/tags`, { method: 'GET' })
    return res.ok
  } catch {
    return false
  }
}

/**
 * If Ollama is not up, asks the Vite plugin to start the daemon and warm Llama 3
 * with `ollama run llama3`. Safe to call repeatedly.
 */
export async function ensureOllamaRunning(): Promise<OllamaEnsureResult> {
  const alreadyUp = await pingOllama()
  if (alreadyUp) {
    // Still hit ensure so missing llama3 can be pulled/warmed.
  }

  try {
    const res = await fetch(ENSURE_ENDPOINT, { method: 'POST' })
    const body = (await res.json()) as OllamaEnsureResult
    return body
  } catch {
    return {
      ready: false,
      startedServe: false,
      startedModel: false,
      models: [],
      message:
        'No se pudo contactar el helper de Ollama. Ejecuta la app con `npm run dev` y asegúrate de tener Ollama instalado.',
    }
  }
}

export async function chatWithLlama3(options: OllamaChatOptions): Promise<string> {
  const ensure = await ensureOllamaRunning()
  if (!ensure.ready) {
    throw new Error(ensure.message)
  }

  const res = await fetch(`${OLLAMA_PROXY}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      stream: false,
      format: options.formatJson ? 'json' : undefined,
      options: {
        temperature: options.temperature ?? 0.1,
      },
      messages: [
        ...(options.system
          ? [{ role: 'system' as const, content: options.system }]
          : []),
        { role: 'user' as const, content: options.prompt },
      ],
    }),
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    throw new Error(
      errText || `Ollama respondió con HTTP ${res.status}. ¿Está cargado el modelo llama3?`,
    )
  }

  const data = (await res.json()) as { message?: { content?: string } }
  const content = data.message?.content?.trim()
  if (!content) {
    throw new Error('Llama 3 devolvió una respuesta vacía.')
  }
  return content
}
