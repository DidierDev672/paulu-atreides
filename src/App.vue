<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { API_BASE_URL } from '@/shared/config/api'
import { axiosInstance } from '@/infrastructure/http/axiosInstance'
import VueMarkdown from 'vue-markdown-render'

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
    const stored = localStorage.getItem('ai-models')
    const models = stored ? JSON.parse(stored) : []
    const active = models.find((m: { verifiedAt: string | null }) => m.verifiedAt)

    if (!active) {
      messages.value.push({
        role: 'assistant',
        text: 'No hay ningún modelo de IA configurado. Ve a **Modelos de IA** en el menú para agregar uno.',
      })
      scrollToBottom()
      return
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

    <!-- Floating AI button -->
    <button
      v-motion
      :initial="{ opacity: 0, scale: 0, y: 20 }"
      :enter="{ opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 20, delay: 400 } }"
      type="button"
      class="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/30 backdrop-blur-md transition hover:scale-110 hover:shadow-xl hover:shadow-violet-500/40 active:scale-95"
      @click="chatOpen = !chatOpen"
    >
      <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 4a4 4 0 0 1 3.5 2.1 7 7 0 0 1 2.5-.6 7 7 0 0 1 4.8 2 7 7 0 0 1-2.8 11.5 4 4 0 0 1-7.5.8 4 4 0 0 1-7.5-.8A7 7 0 0 1 1.2 7.5a7 7 0 0 1 4.8-2 7 7 0 0 1 2.5.6A4 4 0 0 1 12 4z" />
        <circle cx="9" cy="12" r="1" fill="currentColor" />
        <circle cx="15" cy="12" r="1" fill="currentColor" />
        <path d="M9 15.5a3.5 3.5 0 0 0 6 0" />
      </svg>
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
            class="flex w-full flex-col rounded-3xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/40 transition-all duration-300 ease-out"
            :class="isExpanded ? 'fixed inset-4 z-50 h-auto sm:inset-8' : 'h-[75vh] max-w-xl sm:h-[560px]'"
            @click.stop
          >
            <!-- Header -->
            <div class="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
                  <svg viewBox="0 0 24 24" class="h-5 w-5 text-white" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 4a4 4 0 0 1 3.5 2.1 7 7 0 0 1 2.5-.6 7 7 0 0 1 4.8 2 7 7 0 0 1-2.8 11.5 4 4 0 0 1-7.5.8 4 4 0 0 1-7.5-.8A7 7 0 0 1 1.2 7.5a7 7 0 0 1 4.8-2 7 7 0 0 1 2.5.6A4 4 0 0 1 12 4z" />
                    <circle cx="9" cy="12" r="1" fill="currentColor" />
                    <circle cx="15" cy="12" r="1" fill="currentColor" />
                    <path d="M9 15.5a3.5 3.5 0 0 0 6 0" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-sm font-semibold text-white">Asistente Paulu</h3>
                  <p class="text-xs text-slate-500">Escribe para conversar</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  class="rounded-xl p-1.5 text-slate-500 transition hover:bg-white/5 hover:text-slate-300"
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
                  class="rounded-xl p-1.5 text-slate-500 transition hover:bg-white/5 hover:text-slate-300"
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
              <div v-if="messages.length === 0" class="space-y-3">
                <div class="flex justify-start">
                  <div class="max-w-[90%] rounded-2xl bg-slate-800 px-4 py-3 text-sm leading-relaxed text-slate-300">
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
                    :class="msg.role === 'user' ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-300'"
                  >
                    <VueMarkdown v-if="msg.role === 'assistant'" :source="msg.text" class="prose prose-invert prose-sm max-w-none" />
                    <span v-else>{{ msg.text }}</span>
                  </div>
                </div>
                <div v-if="isTyping" class="flex justify-start">
                  <div class="flex items-center gap-1 rounded-2xl bg-slate-800 px-4 py-3">
                    <span class="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-500 [animation-delay:0ms]" />
                    <span class="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-500 [animation-delay:150ms]" />
                    <span class="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-500 [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="border-t border-white/10 px-6 py-4">
              <div class="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-800/50 px-4 py-3">
                <input
                  v-model="userInput"
                  type="text"
                  placeholder="Escribe un mensaje..."
                  class="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                  :disabled="isTyping"
                  @keydown="handleKeydown"
                />
                <button
                  type="button"
                  :disabled="!userInput.trim() || isTyping"
                  class="flex h-8 w-8 items-center justify-center rounded-xl transition"
                  :class="userInput.trim() && !isTyping ? 'bg-violet-600 text-white hover:bg-violet-500' : 'bg-violet-600/30 text-violet-400 cursor-not-allowed'"
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
.prose.prose-invert.prose-sm p {
  margin: 0.5em 0;
}
.prose.prose-invert.prose-sm h1,
.prose.prose-invert.prose-sm h2,
.prose.prose-invert.prose-sm h3,
.prose.prose-invert.prose-sm h4 {
  color: #e2e8f0;
  font-weight: 600;
  margin: 0.75em 0 0.5em;
}
.prose.prose-invert.prose-sm h1 { font-size: 1.25em; }
.prose.prose-invert.prose-sm h2 { font-size: 1.125em; }
.prose.prose-invert.prose-sm h3 { font-size: 1em; }
.prose.prose-invert.prose-sm ul,
.prose.prose-invert.prose-sm ol {
  margin: 0.5em 0;
  padding-left: 1.5em;
}
.prose.prose-invert.prose-sm li {
  margin: 0.25em 0;
}
.prose.prose-invert.prose-sm strong {
  color: #f1f5f9;
  font-weight: 600;
}
.prose.prose-invert.prose-sm em {
  color: #cbd5e1;
}
.prose.prose-invert.prose-sm code {
  background: rgba(148, 163, 184, 0.1);
  padding: 0.15em 0.4em;
  border-radius: 0.25em;
  font-size: 0.875em;
  color: #e2e8f0;
}
.prose.prose-invert.prose-sm pre {
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 0.5em;
  padding: 0.75em 1em;
  overflow-x: auto;
  margin: 0.75em 0;
}
.prose.prose-invert.prose-sm pre code {
  background: transparent;
  padding: 0;
}
.prose.prose-invert.prose-sm table {
  width: 100%;
  border-collapse: collapse;
  margin: 0.75em 0;
  font-size: 0.875em;
}
.prose.prose-invert.prose-sm th,
.prose.prose-invert.prose-sm td {
  border: 1px solid rgba(148, 163, 184, 0.15);
  padding: 0.4em 0.75em;
  text-align: left;
}
.prose.prose-invert.prose-sm th {
  background: rgba(30, 41, 59, 0.5);
  color: #e2e8f0;
  font-weight: 600;
}
.prose.prose-invert.prose-sm blockquote {
  border-left: 3px solid #7c3aed;
  padding-left: 1em;
  margin: 0.75em 0;
  color: #94a3b8;
  font-style: italic;
}
.prose.prose-invert.prose-sm a {
  color: #a78bfa;
  text-decoration: underline;
}
.prose.prose-invert.prose-sm hr {
  border-color: rgba(148, 163, 184, 0.15);
  margin: 1em 0;
}
</style>
