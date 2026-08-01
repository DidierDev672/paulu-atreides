<script setup lang="ts">
import { ref, nextTick, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ensureOllamaRunning } from '@/application/services/ollamaService'
import { useAuthStore } from '@/presentation/stores/authStore'
import { API_BASE_URL } from '@/shared/config/api'
import { axiosInstance } from '@/infrastructure/http/axiosInstance'
import VueMarkdown from 'vue-markdown-render'

interface StoredAiModel {
  id: string
  provider: string
  label: string
  modelName: string
  apiKey: string
  baseUrl?: string
  contextWindow?: number
  maxTokens?: number
  verifiedAt: string | null
}

function loadAiModels(): StoredAiModel[] {
  try {
    const stored = localStorage.getItem('ai-models')
    return stored ? (JSON.parse(stored) as StoredAiModel[]) : []
  } catch {
    return []
  }
}

function saveAiModels(models: StoredAiModel[]): void {
  localStorage.setItem('ai-models', JSON.stringify(models))
}

function getActiveAiModel(): StoredAiModel | undefined {
  return loadAiModels().find((m) => Boolean(m.verifiedAt))
}

/** Registers or reactivates local Ollama llama3 after ensure starts the daemon. */
function registerLocalLlama3(): StoredAiModel {
  const models = loadAiModels()
  const existing = models.find(
    (m) => m.provider === 'local' && (m.modelName === 'llama3' || m.modelName.startsWith('llama3')),
  )
  if (existing) {
    existing.verifiedAt = new Date().toISOString()
    existing.baseUrl = existing.baseUrl || '/ollama-api'
    existing.modelName = 'llama3'
    existing.apiKey = existing.apiKey || 'no-key'
    saveAiModels(models)
    return existing
  }

  const created: StoredAiModel = {
    id: crypto.randomUUID(),
    provider: 'local',
    label: 'Ollama Llama 3',
    modelName: 'llama3',
    apiKey: 'no-key',
    baseUrl: '/ollama-api',
    contextWindow: 4096,
    maxTokens: 2048,
    verifiedAt: new Date().toISOString(),
  }
  models.push(created)
  saveAiModels(models)
  return created
}

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isLoggedIn = computed(() => !!authStore.session)
const isAuthPage = computed(() => route.name === 'auth')
const showFloatingButton = computed(() => !isAuthPage.value)

const chatOpen = ref(false)
const isExpanded = ref(false)
const userInput = ref('')
const messages = ref<Array<{ role: 'user' | 'assistant'; text: string }>>([])
const isTyping = ref(false)

const chatContainer = ref<HTMLElement | null>(null)

// Typewriter bell sound using Web Audio API
function playBellSound() {
  try {
    const ctx = new AudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(2200, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(1800, ctx.currentTime + 0.05)

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.15)
  } catch {
    // Silent fallback if audio context is not available
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

// API Data fetching functions
async function fetchProducts(): Promise<string> {
  try {
    const res = await axiosInstance.get('/products')
    const data = res.data
    if (!data || data.length === 0) return 'No hay productos registrados.'
    const rows = data.map((p: Record<string, unknown>) =>
      `- ID: ${p.id} | Nombre: ${p.name} | Categoría: ${p.category ?? 'N/A'} | Precio: $${p.price} | Stock: ${p.stock} | Costo unitario: $${p.unit_cost} | Margen: ${p.margin ?? 'N/A'}%`
    ).join('\n')
    return `Productos encontrados (${data.length}):\n${rows}`
  } catch {
    return 'No se pudieron obtener los productos.'
  }
}

async function fetchProductById(id: string): Promise<string> {
  try {
    const res = await axiosInstance.get(`/products/${id}`)
    const p = res.data
    return `Producto: ${p.name}\n- Categoría: ${p.category ?? 'N/A'}\n- Precio: $${p.price}\n- Stock: ${p.stock} unidades\n- Costo unitario: $${p.unit_cost}\n- Margen: ${p.margin ?? 'N/A'}%`
  } catch {
    return `No se encontró el producto con ID ${id}.`
  }
}

async function fetchOrders(): Promise<string> {
  try {
    const res = await axiosInstance.get('/orders')
    const data = res.data
    if (!data || data.length === 0) return 'No hay órdenes registradas.'
    const rows = data.map((o: Record<string, unknown>) =>
      `- ID: ${o.id} | Estado: ${o.status} | Total: $${o.total} | Cliente: ${o.customer ?? 'N/A'} | Fecha: ${o.created_at ?? 'N/A'}`
    ).join('\n')
    return `Órdenes encontradas (${data.length}):\n${rows}`
  } catch {
    return 'No se pudieron obtener las órdenes.'
  }
}

async function fetchOrderById(id: string): Promise<string> {
  try {
    const res = await axiosInstance.get(`/orders/${id}`)
    const o = res.data
    return `Orden #${o.id}\n- Estado: ${o.status}\n- Total: $${o.total}\n- Cliente: ${o.customer ?? 'N/A'}\n- Items: ${JSON.stringify(o.items)}\n- Fecha: ${o.created_at ?? 'N/A'}`
  } catch {
    return `No se encontró la orden con ID ${id}.`
  }
}

async function fetchEntries(): Promise<string> {
  try {
    const res = await axiosInstance.get('/product-entries')
    const data = res.data
    if (!data || data.length === 0) return 'No hay entradas de inventario registradas.'
    const rows = data.map((e: Record<string, unknown>) =>
      `- ID: ${e.id} | Producto ID: ${e.product_id} | Cantidad: ${e.quantity} | Costo unitario: $${e.unit_cost} | Proveedor: ${e.supplier ?? 'N/A'} | Fecha: ${e.entry_date ?? 'N/A'}`
    ).join('\n')
    return `Entradas de inventario (${data.length}):\n${rows}`
  } catch {
    return 'No se pudieron obtener las entradas de inventario.'
  }
}

async function fetchEntryById(id: string): Promise<string> {
  try {
    const res = await axiosInstance.get(`/product-entries/${id}`)
    const e = res.data
    return `Entrada #${e.id}\n- Producto ID: ${e.product_id}\n- Cantidad: ${e.quantity}\n- Costo unitario: $${e.unit_cost}\n- Proveedor: ${e.supplier ?? 'N/A'}\n- Fecha: ${e.entry_date ?? 'N/A'}`
  } catch {
    return `No se encontró la entrada con ID ${id}.`
  }
}

async function fetchShipments(): Promise<string> {
  try {
    const res = await axiosInstance.get('/shipments')
    const data = res.data
    if (!data || data.length === 0) return 'No hay salidas/envíos registrados.'
    const rows = data.map((s: Record<string, unknown>) =>
      `- ID: ${s.id} | Producto ID: ${s.product_id} | Cantidad: ${s.quantity} | Motivo: ${s.reason ?? 'N/A'} | Fecha: ${s.exit_date ?? 'N/A'} | Orden ID: ${s.order_id ?? 'N/A'}`
    ).join('\n')
    return `Salidas/Envíos (${data.length}):\n${rows}`
  } catch {
    return 'No se pudieron obtener las salidas/envíos.'
  }
}

async function fetchShipmentById(id: string): Promise<string> {
  try {
    const res = await axiosInstance.get(`/shipments/${id}`)
    const s = res.data
    return `Salida/Envío #${s.id}\n- Producto ID: ${s.product_id}\n- Cantidad: ${s.quantity}\n- Motivo: ${s.reason ?? 'N/A'}\n- Fecha: ${s.exit_date ?? 'N/A'}\n- Orden ID: ${s.order_id ?? 'N/A'}`
  } catch {
    return `No se encontró la salida/envío con ID ${id}.`
  }
}

// Detect intent and fetch relevant data
async function detectIntentAndFetch(query: string): Promise<string> {
  const q = query.toLowerCase()
  const idMatch = q.match(/\b(\d{1,6})\b/)

  // Products
  if (q.includes('producto') || q.includes('productos') || q.includes('stock') || q.includes('inventario')) {
    if (idMatch && (q.includes('id') || q.includes('buscar') || q.includes('ver'))) {
      return await fetchProductById(idMatch[1])
    }
    return await fetchProducts()
  }

  // Orders
  if (q.includes('orden') || q.includes('órdenes') || q.includes('ordenes') || q.includes('pedido') || q.includes('pedidos')) {
    if (idMatch && (q.includes('id') || q.includes('buscar') || q.includes('ver'))) {
      return await fetchOrderById(idMatch[1])
    }
    return await fetchOrders()
  }

  // Entries
  if (q.includes('entrada') || q.includes('entradas') || q.includes('ingreso') || q.includes('ingresos') || q.includes('compra') || q.includes('compras')) {
    if (idMatch && (q.includes('id') || q.includes('buscar') || q.includes('ver'))) {
      return await fetchEntryById(idMatch[1])
    }
    return await fetchEntries()
  }

  // Shipments
  if (q.includes('salida') || q.includes('salidas') || q.includes('envío') || q.includes('envíos') || q.includes('envio') || q.includes('envios') || q.includes('despacho')) {
    if (idMatch && (q.includes('id') || q.includes('buscar') || q.includes('ver'))) {
      return await fetchShipmentById(idMatch[1])
    }
    return await fetchShipments()
  }

  return ''
}

async function sendMessage() {
  const text = userInput.value.trim()
  if (!text) return

  messages.value.push({ role: 'user', text })
  userInput.value = ''
  isTyping.value = true
  scrollToBottom()

  try {
    let active = getActiveAiModel()

    // Sin modelo registrado → iniciar Ollama (`ollama serve` + `ollama run llama3`) y registrarlo.
    if (!active) {
      messages.value.push({
        role: 'assistant',
        text: 'No hay modelo registrado. Iniciando **Ollama** con `llama3`…',
      })
      scrollToBottom()

      const ensure = await ensureOllamaRunning()
      if (!ensure.ready) {
        messages.value.push({
          role: 'assistant',
          text: `No se pudo preparar Ollama: ${ensure.message}\n\nInstala Ollama, ejecuta la app con \`npm run dev\` y vuelve a intentar.`,
        })
        scrollToBottom()
        return
      }

      active = registerLocalLlama3()
      messages.value.push({
        role: 'assistant',
        text: ensure.startedModel || ensure.startedServe
          ? '**llama3** listo (Ollama iniciado). Generando respuesta…'
          : '**llama3** disponible. Generando respuesta…',
      })
      scrollToBottom()
    }

    // Detect intent and fetch real data from API
    const apiData = await detectIntentAndFetch(text)

    const baseUrl = active.baseUrl || 'https://api.openai.com'
    const url = `${baseUrl.replace(/\/+$/, '')}/v1/chat/completions`

    const historyForApi = messages.value.slice(-10).map((m) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.text,
    }))

    const systemPrompt = `# SYSTEM PROMPT — Asistente Paulu
## Identidad
Eres **Paulu**, un asistente financiero y de inventario especializado en la plataforma. Consultas datos reales del sistema para responder con información actualizada y precisa.

## Dominio permitido
- Gestión y control de inventario
- Costos, precios y márgenes de productos
- Entradas y salidas de stock
- Rotación de inventario y métricas asociadas
- Pérdidas, mermas y ajustes de inventario
- Indicadores financieros vinculados al inventario (KPIs, valor del stock, punto de reorden, etc.)
- Rentabilidad y análisis económico del negocio
- Reportes y toma de decisiones financieras sobre la plataforma

## Formato de respuesta en chat
- Prosa directa para datos simples; tabla solo para 4+ registros
- Párrafos de máximo 3 líneas; una idea por párrafo
- Negritas solo para el dato principal; máximo 2 por mensaje
- Emojis como marcadores de sección, no como decoración
- Nunca más de 15 líneas seguidas sin pausar con una pregunta
- Cierra siempre con una pregunta corta o invitación a profundizar
- Sin saludos largos, sin frases de cierre formales

## Restricciones absolutas
R1 — Sin código de programación.
R2 — Sin temas de salud humana.
R3 — Sin literatura ni filosofía.
R4 — Sin temas fuera del dominio financiero/inventario.
R5 — Nunca menciones "API", "REST", "endpoint" ni cómo obtienes los datos.
R6 — Nunca muestres IDs internos del sistema. Usa numeración secuencial.

## Tono
Claro, directo y profesional. Sin tecnicismos innecesarios. Sin condescendencia.`

    const messagesWithContext = [
      { role: 'system', content: systemPrompt },
      ...historyForApi,
    ]

    // If we have API data, include it as context
    if (apiData) {
      messagesWithContext.push({
        role: 'system',
        content: `Datos actuales del sistema:\n\n${apiData}\n\nUsa esta información para responder. Renombra los elementos secuencialmente (1, 2, 3...) y nunca menciones "API" ni muestres IDs internos.`,
      })
    }

    messagesWithContext.push({ role: 'user', content: text })

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${active.apiKey || 'no-key'}`,
      },
      body: JSON.stringify({
        model: active.modelName,
        messages: messagesWithContext,
        max_tokens: 1024,
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error?.message || `HTTP ${res.status}`)
    }

    const data = await res.json()
    const reply = data.choices?.[0]?.message?.content || 'Sin respuesta del modelo.'
    messages.value.push({ role: 'assistant', text: reply })
    playBellSound()
  } catch (err) {
    messages.value.push({
      role: 'assistant',
      text: `Error: ${err instanceof Error ? err.message : 'No se pudo conectar con el modelo.'}`,
    })
  } finally {
    isTyping.value = false
    scrollToBottom()
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}
</script>

<template>
  <div class="min-h-dvh w-full">
    <router-view v-slot="{ Component }">
      <Transition name="page" mode="out-in">
        <component :is="Component" />
      </Transition>
    </router-view>

    <!-- Floating AI button (hidden on auth page) -->
    <button
      v-if="showFloatingButton"
      v-motion
      :initial="{ opacity: 0, scale: 0, y: 20 }"
      :enter="{ opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 20, delay: 400 } }"
      type="button"
      class="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/30 backdrop-blur-md transition hover:scale-110 hover:shadow-xl hover:shadow-violet-500/40 active:scale-95"
      @click="chatOpen = !chatOpen"
    >
      <img src="file:///D:/Casa-Atreides/icon/5cb6ddac-3d0b-42ae-8cc3-e88b8896be9e.svg" alt="Asistente Paulu" class="h-7 w-7 object-contain" />
    </button>

    <!-- Chat modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-300 ease-out"
        leave-active-class="transition duration-200 ease-in"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <div
          v-if="chatOpen"
          class="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-4 pt-12 backdrop-blur-sm sm:items-center sm:pb-0"
          @click.self="chatOpen = false"
        >
          <div
            v-motion
            :initial="{ opacity: 0, y: 80, scale: 0.92 }"
            :enter="{ opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 350, damping: 28, mass: 0.8 } }"
            :leave="{ opacity: 0, y: 40, scale: 0.95, transition: { duration: 0.2 } }"
            class="flex w-full flex-col rounded-3xl border border-dune-surface-dark bg-dune-bg shadow-2xl shadow-black/40 transition-all duration-300 ease-out dark:border-white/10 dark:bg-slate-900"
            :class="isExpanded ? 'fixed inset-4 z-50 h-auto sm:inset-8' : 'h-[75vh] max-w-xl sm:h-[560px]'"
            @click.stop
          >
            <!-- Header -->
            <div class="flex items-center justify-between border-b border-dune-surface-dark px-6 py-4 dark:border-white/10">
              <div class="flex items-center gap-3">
                <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-dune-primary to-dune-primary-dark">
                  <img src="file:///D:/Casa-Atreides/icon/5cb6ddac-3d0b-42ae-8cc3-e88b8896be9e.svg" alt="Asistente Paulu" class="h-7 w-7 object-contain" />
                </div>
                <div>
                  <h3 class="text-sm font-semibold text-dune-text-primary dark:text-white">Asistente Paulu</h3>
                  <p class="text-xs text-dune-text-secondary">Escribe para conversar</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  class="rounded-xl p-1.5 text-dune-text-secondary transition hover:bg-dune-surface hover:text-dune-text-primary dark:hover:bg-white/5 dark:hover:text-slate-300"
                  @click="isExpanded = !isExpanded"
                >
                  <svg v-if="!isExpanded" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                  <svg v-else class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 14h4m6-6v4m0 0v4m0-4h4M4 10V6m0 0h4M4 6l5 5m11-1l-5 5m5-5v4m0 0h-4m4 0l-5-5" />
                  </svg>
                </button>
                <button
                  type="button"
                  class="rounded-xl p-1.5 text-dune-text-secondary transition hover:bg-dune-surface hover:text-dune-text-primary dark:hover:bg-white/5 dark:hover:text-slate-300"
                  @click="chatOpen = false"
                >
                  <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Body -->
            <div ref="chatContainer" class="flex flex-1 flex-col overflow-y-auto px-6 py-4">
              <!-- Not logged in: show login prompt -->
              <div v-if="!isLoggedIn" class="flex flex-1 flex-col items-center justify-center text-center">
                <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-dune-surface dark:bg-slate-800">
                  <img src="file:///D:/Casa-Atreides/icon/5cb6ddac-3d0b-42ae-8cc3-e88b8896be9e.svg" alt="Asistente Paulu" class="h-10 w-10 object-contain" />
                </div>
                <h4 class="text-sm font-semibold text-dune-text-primary dark:text-white">Inicia sesión para continuar</h4>
                <p class="mt-1 text-xs text-dune-text-secondary">Necesitas estar autenticado para conversar con Paulu.</p>
                <button
                  type="button"
                  class="mt-4 rounded-xl bg-dune-primary px-5 py-2 text-sm font-medium text-dune-text-on-primary transition hover:bg-dune-primary-dark active:scale-95"
                  @click="router.push({ name: 'auth' })"
                >
                  Iniciar sesión
                </button>
              </div>

              <!-- Logged in: show chat -->
              <template v-else>
                <div v-if="messages.length === 0" class="space-y-3">
                  <div class="flex justify-start">
                    <div class="max-w-[90%] rounded-2xl bg-dune-surface px-4 py-3 text-sm leading-relaxed text-dune-text-primary dark:bg-slate-800 dark:text-slate-300">
                      <p>Bienvenido. Soy <strong>Paulu</strong>, y estoy aquí para ayudarte a mantener el orden en lo que más importa: el flujo de tu negocio.</p>
                      <p class="mt-2">En mi casa aprendemos que el control de los recursos no es solo una tarea — es la base sobre la que se sostiene cualquier operación. Un inventario sin visibilidad es como navegar sin mapa: se avanza, pero sin rumbo.</p>
                      <p class="mt-2">Aquí tendrás claridad. Cada producto, cada orden, cada entrada y salida tiene su lugar, y juntos nos aseguraremos de que nada quede en la oscuridad.</p>
                      <p class="mt-2"><strong>¿Por dónde quieres empezar?</strong></p>
                      <ul class="mt-2 list-disc pl-5">
                        <li><strong>Inventario</strong> — Stock, Entradas y Salidas</li>
                        <li><strong>Órdenes</strong> — Estado y seguimiento</li>
                        <li><strong>Finanzas</strong> — Márgenes y rentabilidad</li>
                        <li><strong>Productos</strong> — Más vendidos y rotación</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div v-else class="space-y-3">
                  <div
                    v-for="(msg, i) in messages"
                    :key="i"
                    class="flex"
                    :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
                  >
                    <div
                      class="max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                      :class="msg.role === 'user' ? 'bg-dune-primary text-dune-text-on-primary' : 'bg-dune-surface text-dune-text-primary dark:bg-slate-800 dark:text-slate-300'"
                    >
                      <VueMarkdown v-if="msg.role === 'assistant'" :source="msg.text" class="prose prose-sm max-w-none dark:prose-invert" />
                      <span v-else>{{ msg.text }}</span>
                    </div>
                  </div>
                  <div v-if="isTyping" class="flex justify-start">
                    <div class="flex items-center gap-1 rounded-2xl bg-dune-surface px-4 py-3 dark:bg-slate-800">
                      <span class="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-500 [animation-delay:0ms]" />
                      <span class="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-500 [animation-delay:150ms]" />
                      <span class="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-500 [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              </template>
            </div>

            <!-- Footer (hidden when not logged in) -->
            <div v-if="isLoggedIn" class="border-t border-dune-surface-dark px-6 py-4 dark:border-white/10">
              <div class="flex items-center gap-2 rounded-2xl border border-dune-surface-dark bg-dune-surface px-4 py-3 dark:border-white/10 dark:bg-slate-800/50">
                <input
                  v-model="userInput"
                  type="text"
                  placeholder="Escribe un mensaje..."
                  class="flex-1 bg-transparent text-sm text-dune-text-primary outline-none placeholder:text-dune-text-secondary dark:text-white dark:placeholder:text-slate-500"
                  :disabled="isTyping"
                  @keydown="handleKeydown"
                />
                <button
                  type="button"
                  :disabled="!userInput.trim() || isTyping"
                  class="flex h-8 w-8 items-center justify-center rounded-xl transition"
                  :class="userInput.trim() && !isTyping ? 'bg-dune-primary text-dune-text-on-primary hover:bg-dune-primary-dark' : 'bg-dune-primary/30 text-dune-primary-light cursor-not-allowed'"
                  @click="sendMessage"
                >
                  <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M22 2L11 13" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M22 2L15 22l-4-9-9-4z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* VueMarkdown styles for assistant responses */
.prose.prose-sm p {
  margin: 0.5em 0;
}
.prose.prose-sm h1,
.prose.prose-sm h2,
.prose.prose-sm h3,
.prose.prose-sm h4 {
  font-weight: 600;
  margin: 0.75em 0 0.5em;
}
.prose.prose-sm h1 { font-size: 1.25em; }
.prose.prose-sm h2 { font-size: 1.125em; }
.prose.prose-sm h3 { font-size: 1em; }
.prose.prose-sm ul,
.prose.prose-sm ol {
  margin: 0.5em 0;
  padding-left: 1.5em;
}
.prose.prose-sm li {
  margin: 0.25em 0;
}
.prose.prose-sm strong {
  font-weight: 600;
}
.prose.prose-sm code {
  padding: 0.15em 0.4em;
  border-radius: 0.25em;
  font-size: 0.875em;
}
.prose.prose-sm pre {
  border-radius: 0.5em;
  padding: 0.75em 1em;
  overflow-x: auto;
  margin: 0.75em 0;
}
.prose.prose-sm pre code {
  background: transparent;
  padding: 0;
}
.prose.prose-sm table {
  width: 100%;
  border-collapse: collapse;
  margin: 0.75em 0;
  font-size: 0.875em;
}
.prose.prose-sm th,
.prose.prose-sm td {
  padding: 0.4em 0.75em;
  text-align: left;
}
.prose.prose-sm th {
  font-weight: 600;
}
.prose.prose-sm blockquote {
  border-left: 3px solid #7c3aed;
  padding-left: 1em;
  margin: 0.75em 0;
  font-style: italic;
}
.prose.prose-sm a {
  text-decoration: underline;
}
.prose.prose-sm hr {
  margin: 1em 0;
}
</style>
