import type { Plugin, Connect } from 'vite'
import { spawn, type ChildProcess } from 'node:child_process'
import http from 'node:http'

const OLLAMA_HOST = '127.0.0.1'
const OLLAMA_PORT = 11434
const OLLAMA_BASE = `http://${OLLAMA_HOST}:${OLLAMA_PORT}`
const MODEL = 'llama3'
const ENSURE_PATH = '/__ollama/ensure'

let serveProcess: ChildProcess | null = null

function json(res: Connect.ServerResponse, status: number, body: unknown): void {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function httpGetJson(url: string, timeoutMs = 4000): Promise<{ ok: boolean; data?: unknown }> {
  return new Promise((resolve) => {
    const req = http.get(url, { timeout: timeoutMs }, (res) => {
      let raw = ''
      res.on('data', (chunk) => {
        raw += chunk
      })
      res.on('end', () => {
        try {
          resolve({ ok: (res.statusCode ?? 500) < 400, data: JSON.parse(raw) })
        } catch {
          resolve({ ok: false })
        }
      })
    })
    req.on('timeout', () => {
      req.destroy()
      resolve({ ok: false })
    })
    req.on('error', () => resolve({ ok: false }))
  })
}

async function isOllamaUp(): Promise<boolean> {
  const result = await httpGetJson(`${OLLAMA_BASE}/api/tags`)
  return result.ok
}

async function listModels(): Promise<string[]> {
  const result = await httpGetJson(`${OLLAMA_BASE}/api/tags`)
  if (!result.ok || !result.data || typeof result.data !== 'object') return []
  const models = (result.data as { models?: { name?: string }[] }).models ?? []
  return models.map((m) => m.name ?? '').filter(Boolean)
}

function hasLlama3(models: string[]): boolean {
  return models.some((name) => name === MODEL || name.startsWith(`${MODEL}:`))
}

function spawnDetached(command: string, args: string[]): ChildProcess {
  const child = spawn(command, args, {
    detached: true,
    stdio: 'ignore',
    shell: process.platform === 'win32',
    windowsHide: true,
  })
  child.unref()
  return child
}

async function startOllamaServe(): Promise<void> {
  if (serveProcess && !serveProcess.killed) return
  serveProcess = spawnDetached('ollama', ['serve'])
}

/**
 * Warm the model the way the user requested (`ollama run llama3`).
 * Detached so the Vite process is not blocked by the interactive session.
 */
async function runLlama3(): Promise<void> {
  spawnDetached('ollama', ['run', MODEL])
}

async function waitForOllama(attempts = 30, delayMs = 1000): Promise<boolean> {
  for (let i = 0; i < attempts; i++) {
    if (await isOllamaUp()) return true
    await sleep(delayMs)
  }
  return false
}

async function ensureOllamaAndLlama3(): Promise<{
  ready: boolean
  startedServe: boolean
  startedModel: boolean
  models: string[]
  message: string
}> {
  let startedServe = false
  let startedModel = false

  const alreadyUp = await isOllamaUp()
  if (!alreadyUp) {
    startedServe = true
    await startOllamaServe()
    const up = await waitForOllama()
    if (!up) {
      return {
        ready: false,
        startedServe,
        startedModel,
        models: [],
        message:
          'No se pudo iniciar Ollama. Verifica que esté instalado y disponible en el PATH (`ollama --version`).',
      }
    }
  }

  let models = await listModels()
  if (!hasLlama3(models)) {
    startedModel = true
    await runLlama3()
    // First `ollama run` may pull the model; wait until it appears in /api/tags.
    for (let i = 0; i < 90; i++) {
      await sleep(2000)
      models = await listModels()
      if (hasLlama3(models)) break
    }
  } else {
    // Model exists; still warm it with `ollama run llama3` if we just started the daemon.
    if (startedServe) {
      startedModel = true
      await runLlama3()
      await sleep(1500)
    }
  }

  models = await listModels()
  if (!hasLlama3(models)) {
    return {
      ready: false,
      startedServe,
      startedModel,
      models,
      message:
        'Ollama está en marcha, pero el modelo llama3 aún no está disponible. Espera a que termine la descarga (`ollama pull llama3`).',
    }
  }

  return {
    ready: true,
    startedServe,
    startedModel,
    models,
    message: startedServe || startedModel
      ? 'Ollama y Llama 3 listos (servicio/modelo iniciados).'
      : 'Ollama y Llama 3 ya estaban disponibles.',
  }
}

function createEnsureMiddleware(): Connect.NextHandleFunction {
  return async (req, res, next) => {
    if (!req.url?.startsWith(ENSURE_PATH)) {
      next()
      return
    }

    if (req.method !== 'POST' && req.method !== 'GET') {
      json(res, 405, { ready: false, message: 'Method not allowed' })
      return
    }

    try {
      const result = await ensureOllamaAndLlama3()
      json(res, result.ready ? 200 : 503, result)
    } catch (error) {
      json(res, 500, {
        ready: false,
        message: error instanceof Error ? error.message : 'Error al preparar Ollama',
      })
    }
  }
}

/** Dev/preview middleware: ensures Ollama is running and Llama 3 is available. */
export function ollamaEnsurePlugin(): Plugin {
  return {
    name: 'ollama-ensure',
    configureServer(server) {
      server.middlewares.use(createEnsureMiddleware())
    },
    configurePreviewServer(server) {
      server.middlewares.use(createEnsureMiddleware())
    },
  }
}
