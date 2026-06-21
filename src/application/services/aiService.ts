export type AiProvider = 'gemini' | 'codex' | 'opencloud' | 'kimi' | 'custom'

const PROVIDER_ENDPOINTS: Record<Exclude<AiProvider, 'custom' | 'gemini'>, string> = {
  codex: 'https://api.openai.com/v1/chat/completions',
  opencloud: 'https://openrouter.ai/api/v1/chat/completions',
  kimi: 'https://api.moonshot.cn/v1/chat/completions',
}

interface VerifyParams {
  provider: AiProvider
  apiKey: string
  modelName?: string
  customModelName?: string
  baseUrl?: string
}

interface VerifyResult {
  success: boolean
  message: string
}

async function verifyGemini(apiKey: string, modelName?: string): Promise<VerifyResult> {
  const model = modelName ?? 'gemini-2.0-flash'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: 'responde solo "ok"' }] }] }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    return { success: false, message: body.error?.message ?? `HTTP ${res.status}` }
  }
  return { success: true, message: 'Conexión exitosa' }
}

async function verifyOpenAiCompatible(
  baseUrl: string,
  apiKey: string,
  model?: string,
): Promise<VerifyResult> {
  const url = `${baseUrl.replace(/\/+$/, '')}/v1/chat/completions`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model ?? 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'responde solo "ok"' }],
      max_tokens: 5,
    }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    return { success: false, message: body.error?.message ?? `HTTP ${res.status}` }
  }
  return { success: true, message: 'Conexión exitosa' }
}

export async function verifyAiModel(params: VerifyParams): Promise<VerifyResult> {
  const { provider, apiKey, modelName, customModelName, baseUrl } = params

  switch (provider) {
    case 'gemini':
      return verifyGemini(apiKey, modelName)
    case 'codex':
      return verifyOpenAiCompatible(PROVIDER_ENDPOINTS.codex, apiKey, modelName)
    case 'opencloud':
      return verifyOpenAiCompatible(PROVIDER_ENDPOINTS.opencloud, apiKey, modelName)
    case 'kimi':
      return verifyOpenAiCompatible(PROVIDER_ENDPOINTS.kimi, apiKey, modelName)
    case 'custom':
      if (!baseUrl) return { success: false, message: 'Se requiere la URL base del modelo personalizado.' }
      return verifyOpenAiCompatible(baseUrl, apiKey, customModelName || modelName)
  }
}
