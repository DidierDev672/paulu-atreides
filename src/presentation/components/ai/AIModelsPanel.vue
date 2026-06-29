<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { verifyAiModel } from '@/application/services/aiService'
import type { AiProvider } from '@/application/services/aiService'

interface AIModel {
  id: string
  provider: AiProvider
  label: string
  modelName: string
  apiKey: string
  customModelName?: string
  baseUrl?: string
  contextWindow?: number
  maxTokens?: number
  verifiedAt: string | null
}

type Step = 1 | 2 | 3

const PROVIDER_META: Record<string, {
  id: AiProvider
  label: string
  desc: string
  benefits: string[]
  helpUrl: string
}> = {
  gemini: {
    id: 'gemini', label: 'Gemini', desc: 'Google Generative AI',
    benefits: ['Gratuito hasta 60 solicitudes/min', 'Sin tarjeta de crédito', 'Configuración en 1 minuto'],
    helpUrl: 'https://aistudio.google.com/app/apikey',
  },
  codex: {
    id: 'codex', label: 'Codex', desc: 'OpenAI / GPT',
    benefits: ['Modelos más potentes (GPT-4, GPT-4o)', 'Amplia documentación', 'Compatible con herramientas existentes'],
    helpUrl: 'https://platform.openai.com/api-keys',
  },
  opencloud: {
    id: 'opencloud', label: 'OpenCloud', desc: 'OpenRouter',
    benefits: ['Acceso a múltiples modelos', 'Pago por uso sin suscripción', 'Compatible con OpenAI'],
    helpUrl: 'https://openrouter.ai/keys',
  },
  kimi: {
    id: 'kimi', label: 'Kimi', desc: 'Moonshot AI',
    benefits: ['Modelo especializado en chino', 'Contexto largo (128k)', 'Competitivo en precio'],
    helpUrl: 'https://platform.moonshot.cn/console/api-keys',
  },
  custom: {
    id: 'custom', label: 'Otro', desc: 'Modelo personalizado',
    benefits: ['Cualquier API compatible con OpenAI', 'Control total del endpoint', 'Auto-gestionado'],
    helpUrl: '',
  },
  local: {
    id: 'local', label: 'Modelo Local', desc: 'Servidor local (Ollama, LM Studio, vLLM, etc.)',
    benefits: ['Sin costo por uso', 'Datos nunca salen de tu máquina', 'Compatible con Ollama, LM Studio, vLLM, text-generation-webui'],
    helpUrl: '',
  },
}

const MODEL_OPTIONS: Record<string, { value: string; label: string; badge?: string }[]> = {
  gemini: [
    { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', badge: 'Recomendado' },
    { value: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash' },
    { value: 'gemini-2.0-pro', label: 'Gemini 2.0 Pro' },
    { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
    { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
  ],
  codex: [
    { value: 'gpt-4o', label: 'GPT-4o', badge: 'Recomendado' },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
  ],
  opencloud: [
    { value: 'openai/gpt-4o', label: 'OpenAI GPT-4o', badge: 'Recomendado' },
    { value: 'openai/gpt-4o-mini', label: 'OpenAI GPT-4o Mini' },
    { value: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet' },
    { value: 'google/gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
    { value: 'meta-llama/llama-3-70b', label: 'Llama 3 70B' },
  ],
  kimi: [
    { value: 'moonshot-v1-8k', label: 'Moonshot v1 8K', badge: 'Recomendado' },
    { value: 'moonshot-v1-32k', label: 'Moonshot v1 32K' },
    { value: 'moonshot-v1-128k', label: 'Moonshot v1 128K' },
  ],
}

const OTHER_KEYS = ['codex', 'opencloud', 'kimi', 'custom', 'local'] as const
type OtherKey = typeof OTHER_KEYS[number]

const RECOMMENDED = PROVIDER_META.gemini

const models = ref<AIModel[]>([])
function loadModels() {
  try {
    const stored = localStorage.getItem('ai-models')
    if (stored) models.value = JSON.parse(stored)
  } catch { models.value = [] }
}
function persistModels() {
  localStorage.setItem('ai-models', JSON.stringify(models.value))
}
loadModels()

const step = ref<Step>(1)

const selectedProvider = ref<AiProvider | null>(null)
const selectedModel = ref('')
const apiKey = ref('')
const customModelName = ref('')
const baseUrl = ref('')
const acceptedTerms = ref(false)

const localModelName = ref('')
const localBaseUrl = ref('http://localhost:11434')
const localContextWindow = ref(4096)
const localMaxTokens = ref(2048)
const localApiKey = ref('')

const otherOpen = ref(false)
const expandedOther = ref<OtherKey | null>(null)

const isCustom = computed(() => selectedProvider.value === 'custom')
const isLocal = computed(() => selectedProvider.value === 'local')
const needsUrl = computed(() => isCustom.value || isLocal.value)

watch(selectedProvider, (p) => {
  if (p && !isCustom.value && !isLocal.value) {
    const options = MODEL_OPTIONS[p]
    if (options && options.length > 0) {
      selectedModel.value = options[0].value
    }
  }
})

// Validation
const apiKeyTouched = ref(false)
const apiKeyValid = computed(() => {
  if (isLocal.value) return true
  if (!apiKey.value) return false
  const p = selectedProvider.value
  if (p === 'gemini') return apiKey.value.length >= 10
  if (p === 'custom') return apiKey.value.length >= 8
  return apiKey.value.startsWith('sk-') || apiKey.value.length >= 10
})

const customModelValid = computed(() => !isCustom.value || customModelName.value.length >= 2)
const baseUrlValid = computed(() => !needsUrl.value || baseUrl.value.startsWith('http'))
const localModelValid = computed(() => !isLocal.value || localModelName.value.length >= 2)
const localUrlValid = computed(() => !isLocal.value || localBaseUrl.value.startsWith('http'))

const stepValid = computed(() => {
  if (step.value === 1) return selectedProvider.value !== null
  if (step.value === 2) {
    if (isLocal.value) {
      return localModelName.value.length >= 2 && localBaseUrl.value.startsWith('http')
    }
    if (!apiKey.value) return false
    if (isCustom.value && (!customModelName.value || !baseUrl.value)) return false
    return true
  }
  if (step.value === 3) return acceptedTerms.value
  return false
})

function selectRecommended() {
  selectedProvider.value = RECOMMENDED.id
  step.value = 2
}

function selectOther(key: OtherKey) {
  selectedProvider.value = PROVIDER_META[key].id
  otherOpen.value = true
  expandedOther.value = key
  setTimeout(() => step.value = 2, 50)
}

function goToStep(s: Step) {
  step.value = s
}

function resetForm() {
  step.value = 1
  selectedProvider.value = null
  selectedModel.value = ''
  apiKey.value = ''
  customModelName.value = ''
  baseUrl.value = ''
  localModelName.value = ''
  localBaseUrl.value = 'http://localhost:11434'
  localContextWindow.value = 4096
  localMaxTokens.value = 2048
  localApiKey.value = ''
  acceptedTerms.value = false
  apiKeyTouched.value = false
  otherOpen.value = false
  expandedOther.value = null
}

// Verification
const verifying = ref(false)
const showVerification = ref(false)
const verificationResult = ref<{ success: boolean; message: string } | null>(null)

async function handleSave() {
  if (!selectedProvider.value) return
  if (isLocal.value) {
    if (!localModelName.value || !localBaseUrl.value) return
  } else {
    if (!apiKey.value) return
    if (isCustom.value && (!customModelName.value || !baseUrl.value)) return
  }
  showVerification.value = true
  verificationResult.value = null
  runVerification()
}

async function runVerification() {
  verifying.value = true
  verificationResult.value = null
  try {
    const result = await verifyAiModel({
      provider: selectedProvider.value!,
      apiKey: isLocal.value ? (localApiKey.value || 'no-key') : apiKey.value,
      modelName: isLocal.value ? localModelName.value : (isCustom.value ? customModelName.value : selectedModel.value),
      customModelName: isLocal.value ? localModelName.value : (isCustom.value ? customModelName.value : undefined),
      baseUrl: (isCustom.value || isLocal.value) ? (isLocal.value ? localBaseUrl.value : baseUrl.value) : undefined,
      contextWindow: isLocal.value ? localContextWindow.value : undefined,
      maxTokens: isLocal.value ? localMaxTokens.value : undefined,
    })
    verificationResult.value = result
    if (result.success) {
      const model: AIModel = {
        id: crypto.randomUUID(),
        provider: selectedProvider.value!,
        label: isLocal.value
          ? localModelName.value
          : isCustom.value
            ? customModelName.value
            : PROVIDER_META[selectedProvider.value!].label,
        modelName: isLocal.value ? localModelName.value : (isCustom.value ? customModelName.value : selectedModel.value),
        apiKey: isLocal.value ? (localApiKey.value || 'no-key') : apiKey.value,
        customModelName: isLocal.value ? localModelName.value : (isCustom.value ? customModelName.value : undefined),
        baseUrl: (isCustom.value || isLocal.value) ? (isLocal.value ? localBaseUrl.value : baseUrl.value) : undefined,
        contextWindow: isLocal.value ? localContextWindow.value : undefined,
        maxTokens: isLocal.value ? localMaxTokens.value : undefined,
        verifiedAt: new Date().toISOString(),
      }
      models.value.push(model)
      persistModels()
      setTimeout(() => {
        showVerification.value = false
        resetForm()
      }, 1800)
    }
  } catch (err) {
    verificationResult.value = {
      success: false,
      message: err instanceof Error ? err.message : 'Error de conexión',
    }
  } finally {
    verifying.value = false
  }
}

function handleRetry() {
  runVerification()
}

function handleCancelVerification() {
  showVerification.value = false
  verificationResult.value = null
}

function removeModel(id: string) {
  models.value = models.value.filter((m) => m.id !== id)
  persistModels()
}

function maskKey(key: string): string {
  if (key.length <= 8) return '•'.repeat(key.length)
  return key.slice(0, 4) + '•'.repeat(key.length - 8) + key.slice(-4)
}

const providerLabel = computed(() => selectedProvider.value ? PROVIDER_META[selectedProvider.value]?.label ?? '—' : '—')

const stepLabel = computed(() => {
  if (step.value === 1) return 'Seleccionar proveedor'
  if (step.value === 2) {
    if (isLocal.value) return 'Configurar modelo local'
    if (isCustom.value) return 'Configurar modelo'
    return 'Configurar API Key'
  }
  return 'Revisar y guardar'
})
</script>

<template>
  <div class="mx-auto max-w-2xl space-y-6">
    <!-- Header -->
    <div v-motion :initial="{ opacity: 0, y: 12 }" :enter="{ opacity: 1, y: 0, duration: 300 }">
      <h1 class="text-xl font-semibold text-white">Modelos de IA</h1>
      <p class="mt-1 text-sm text-slate-400">Configura los modelos que usar&aacute; Paulu para asistirte.</p>
    </div>

    <!-- Progress indicator -->
    <div v-motion :initial="{ opacity: 0, y: 8 }" :enter="{ opacity: 1, y: 0, duration: 300, delay: 80 }" class="flex items-center gap-2 px-1">
      <div class="flex items-center gap-1.5">
        <div class="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold transition-colors"
          :class="step >= 1 ? 'bg-violet-500 text-white' : 'bg-slate-800 text-slate-500'">1</div>
        <span class="text-xs font-medium" :class="step === 1 ? 'text-white' : 'text-slate-500'">Proveedor</span>
      </div>
      <div class="h-px flex-1 transition-colors" :class="step >= 2 ? 'bg-violet-500' : 'bg-slate-700'" />
      <div class="flex items-center gap-1.5">
        <div class="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold transition-colors"
          :class="step >= 2 ? 'bg-violet-500 text-white' : 'bg-slate-800 text-slate-500'">2</div>
        <span class="text-xs font-medium" :class="step === 2 ? 'text-white' : 'text-slate-500'">API Key</span>
      </div>
      <div class="h-px flex-1 transition-colors" :class="step >= 3 ? 'bg-violet-500' : 'bg-slate-700'" />
      <div class="flex items-center gap-1.5">
        <div class="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold transition-colors"
          :class="step >= 3 ? 'bg-violet-500 text-white' : 'bg-slate-800 text-slate-500'">3</div>
        <span class="text-xs font-medium" :class="step === 3 ? 'text-white' : 'text-slate-500'">Guardar</span>
      </div>
    </div>

    <!-- Step label -->
    <p class="text-xs font-medium uppercase tracking-wider text-violet-400">Paso {{ step }} de 3 &middot; {{ stepLabel }}</p>

    <!-- ── STEP 1: Provider ── -->
    <div v-if="step === 1" v-motion :initial="{ opacity: 0, x: -16 }" :enter="{ opacity: 1, x: 0, duration: 300 }" class="space-y-4">

      <!-- Recommended card -->
      <button
        type="button"
        class="group relative w-full rounded-2xl border-2 border-violet-500/40 bg-gradient-to-br from-violet-600/20 to-purple-600/10 p-5 text-left shadow-lg shadow-violet-500/10 transition hover:border-violet-400 hover:shadow-xl hover:shadow-violet-500/20"
        @click="selectRecommended"
      >
        <span class="absolute -top-2.5 right-4 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white shadow-lg">Recomendado</span>
        <div class="flex items-start gap-4">
          <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-md">
            <svg class="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 4a4 4 0 0 1 3.5 2.1 7 7 0 0 1 2.5-.6 7 7 0 0 1 4.8 2 7 7 0 0 1-2.8 11.5 4 4 0 0 1-7.5.8 4 4 0 0 1-7.5-.8A7 7 0 0 1 1.2 7.5a7 7 0 0 1 4.8-2 7 7 0 0 1 2.5.6A4 4 0 0 1 12 4z" />
            </svg>
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-base font-semibold text-white group-hover:text-violet-200">{{ RECOMMENDED.label }}</p>
            <p class="text-sm text-slate-400">{{ RECOMMENDED.desc }}</p>
            <ul class="mt-2 space-y-1">
              <li v-for="b in RECOMMENDED.benefits" :key="b" class="flex items-center gap-1.5 text-xs text-slate-300">
                <svg class="h-3.5 w-3.5 shrink-0 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                {{ b }}
              </li>
            </ul>
          </div>
          <svg class="mt-1 h-5 w-5 shrink-0 text-violet-400 opacity-0 transition group-hover:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
        </div>
      </button>

      <!-- Other options accordion -->
      <div class="rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-sm">
        <button
          type="button"
          class="flex w-full items-center justify-between px-5 py-3.5 text-sm font-medium text-slate-300 transition hover:text-white"
          @click="otherOpen = !otherOpen"
        >
          <span>Otras opciones de proveedor</span>
          <svg class="h-4 w-4 transition duration-200" :class="otherOpen ? 'rotate-180' : ''" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
        </button>
        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          leave-active-class="transition-all duration-150 ease-in"
          enter-from-class="max-h-0 opacity-0"
          enter-to-class="max-h-[600px] opacity-100"
          leave-from-class="max-h-[600px] opacity-100"
          leave-to-class="max-h-0 opacity-0"
        >
          <div v-if="otherOpen" class="overflow-hidden border-t border-white/10">
            <div v-for="key in OTHER_KEYS" :key="key" class="border-b border-white/5 last:border-b-0">
              <button
                type="button"
                class="flex w-full items-center justify-between px-5 py-3 text-left text-sm text-slate-400 transition hover:bg-white/5 hover:text-slate-200"
                @click="expandedOther = expandedOther === key ? null : key"
              >
                <span class="font-medium">{{ PROVIDER_META[key].label }}</span>
                <svg class="h-3.5 w-3.5 transition duration-200" :class="expandedOther === key ? 'rotate-180' : ''" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>
              <Transition
                enter-active-class="transition-all duration-200 ease-out"
                leave-active-class="transition-all duration-150 ease-in"
                enter-from-class="max-h-0 opacity-0"
                enter-to-class="max-h-40 opacity-100"
                leave-from-class="max-h-40 opacity-100"
                leave-to-class="max-h-0 opacity-0"
              >
                <div v-if="expandedOther === key" class="overflow-hidden border-t border-white/5">
                  <div class="space-y-2 px-5 py-3">
                    <p class="text-xs text-slate-500">{{ PROVIDER_META[key].desc }}</p>
                    <ul class="space-y-1">
                      <li v-for="b in PROVIDER_META[key].benefits" :key="b" class="flex items-center gap-1.5 text-xs text-slate-400">
                        <svg class="h-3 w-3 shrink-0 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                        {{ b }}
                      </li>
                    </ul>
                    <button
                      type="button"
                      class="mt-1 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-4 py-1.5 text-xs font-medium text-white shadow transition hover:shadow-lg"
                      @click="selectOther(key)"
                    >
                      Usar {{ PROVIDER_META[key].label }}
                    </button>
                  </div>
                </div>
              </Transition>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- ── STEP 2: API Key ── -->
    <div v-else-if="step === 2" v-motion :initial="{ opacity: 0, x: -16 }" :enter="{ opacity: 1, x: 0, duration: 300 }" class="space-y-5">

      <!-- Previous step summary -->
      <div class="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-800/40 px-4 py-2.5">
        <div class="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/20">
          <svg class="h-3.5 w-3.5 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 4a4 4 0 0 1 3.5 2.1 7 7 0 0 1 2.5-.6 7 7 0 0 1 4.8 2 7 7 0 0 1-2.8 11.5 4 4 0 0 1-7.5.8 4 4 0 0 1-7.5-.8A7 7 0 0 1 1.2 7.5a7 7 0 0 1 4.8-2 7 7 0 0 1 2.5.6A4 4 0 0 1 12 4z" />
          </svg>
        </div>
        <span class="text-sm text-slate-300">Proveedor: <strong class="text-white">{{ providerLabel }}</strong></span>
        <button type="button" class="ml-auto text-xs text-violet-400 transition hover:text-violet-300" @click="goToStep(1)">Cambiar</button>
      </div>

      <!-- Model selector (non-custom, non-local) -->
      <div v-if="!isCustom && !isLocal && selectedProvider && MODEL_OPTIONS[selectedProvider]">
        <label class="mb-2 block text-sm font-medium text-white">Modelo <span class="text-violet-400">*</span></label>
        <div class="grid gap-2 sm:grid-cols-2">
          <button
            v-for="opt in MODEL_OPTIONS[selectedProvider]"
            :key="opt.value"
            type="button"
            class="relative flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition"
            :class="
              selectedModel === opt.value
                ? 'border-violet-500 bg-violet-500/10 text-violet-200'
                : 'border-white/10 bg-slate-800/40 text-slate-400 hover:border-white/20 hover:text-slate-200'
            "
            @click="selectedModel = opt.value"
          >
            <div
              class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition"
              :class="
                selectedModel === opt.value
                  ? 'border-violet-400 bg-violet-500'
                  : 'border-slate-600'
              "
            >
              <div v-if="selectedModel === opt.value" class="h-2 w-2 rounded-full bg-white" />
            </div>
            <div class="min-w-0">
              <span class="block truncate font-medium">{{ opt.label }}</span>
              <span class="mt-0.5 block truncate text-[11px] opacity-60">{{ opt.value }}</span>
            </div>
            <span
              v-if="opt.badge"
              class="ml-auto shrink-0 rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-semibold text-violet-400"
            >{{ opt.badge }}</span>
          </button>
        </div>
      </div>

      <!-- Local model fields -->
      <template v-if="isLocal">
        <div class="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <div class="flex items-center gap-2 mb-3">
            <svg class="h-4 w-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>
            <span class="text-xs font-medium text-emerald-300">Modelo local detectado &mdash; los datos permanecen en tu dispositivo</span>
          </div>
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium text-white">URL del servidor <span class="text-violet-400">*</span></label>
          <input v-model="localBaseUrl" type="url" placeholder="http://localhost:11434"
            class="w-full rounded-2xl border border-white/10 bg-slate-800/50 px-4 py-3.5 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20" />
          <p class="mt-1.5 text-[11px] text-slate-500">Ollama: <code class="text-slate-400">http://localhost:11434</code> &middot; LM Studio: <code class="text-slate-400">http://localhost:1234</code> &middot; vLLM: <code class="text-slate-400">http://localhost:8000</code></p>
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium text-white">Nombre del modelo <span class="text-violet-400">*</span></label>
          <input v-model="localModelName" type="text" placeholder="Ej: llama3, mistral, codellama"
            class="w-full rounded-2xl border border-white/10 bg-slate-800/50 px-4 py-3.5 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20" />
          <p class="mt-1.5 text-[11px] text-slate-500">El nombre exacto del modelo como aparece en tu servidor (ej: <code class="text-slate-400">llama3:8b</code>, <code class="text-slate-400">mistral</code>, <code class="text-slate-400">codellama:34b</code>)</p>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-2 block text-sm font-medium text-white">Context Window</label>
            <input v-model.number="localContextWindow" type="number" min="512" max="1000000" step="512"
              class="w-full rounded-2xl border border-white/10 bg-slate-800/50 px-4 py-3.5 text-sm text-white outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20" />
            <p class="mt-1.5 text-[11px] text-slate-500">Tamaño máximo de contexto en tokens</p>
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-white">Max Tokens</label>
            <input v-model.number="localMaxTokens" type="number" min="1" max="100000" step="1"
              class="w-full rounded-2xl border border-white/10 bg-slate-800/50 px-4 py-3.5 text-sm text-white outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20" />
            <p class="mt-1.5 text-[11px] text-slate-500">Máximo de tokens a generar por respuesta</p>
          </div>
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium text-white">API Key <span class="text-slate-500">(opcional)</span></label>
          <input v-model="localApiKey" type="password" placeholder="Obligatoria si tu servidor requiere autenticación"
            class="w-full rounded-2xl border border-white/10 bg-slate-800/50 px-4 py-3.5 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20" />
          <p class="mt-1.5 text-[11px] text-slate-500">La mayoría de servidores locales no requieren API Key. Déjalo vacío si no necesitas una.</p>
        </div>
      </template>

      <!-- API Key (non-local) -->
      <div v-if="!isLocal">
        <label class="mb-2 block text-sm font-medium text-white">API Key <span class="text-violet-400">*</span></label>
        <div class="relative">
          <input
            v-model="apiKey"
            type="password"
            placeholder="Pega tu API Key aqu&iacute;"
            class="w-full rounded-2xl border bg-slate-800/50 px-4 py-3.5 pr-10 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20"
            :class="apiKeyTouched && !apiKeyValid ? 'border-red-500/50' : 'border-white/10'"
            @blur="apiKeyTouched = true"
            @input="apiKeyTouched = true"
          />
          <svg v-if="apiKey && apiKeyValid" class="absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
          <svg v-else-if="apiKeyTouched && apiKey && !apiKeyValid" class="absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M12 3l9.66 9.66a1 1 0 010 1.68L12 24l-9.66-9.66a1 1 0 010-1.68L12 3z" /></svg>
        </div>
        <p v-if="apiKeyTouched && !apiKeyValid && apiKey" class="mt-1.5 text-xs text-red-400">
          {{ selectedProvider === 'gemini' ? 'La clave debe tener al menos 10 caracteres.' : 'La clave debe comenzar con sk- o tener al menos 10 caracteres.' }}
        </p>
      </div>

      <!-- Custom fields (non-local) -->
      <template v-if="isCustom">
        <div>
          <label class="mb-2 block text-sm font-medium text-white">Nombre del modelo <span class="text-violet-400">*</span></label>
          <input v-model="customModelName" type="text" placeholder="Ej: mi-modelo"
            class="w-full rounded-2xl border border-white/10 bg-slate-800/50 px-4 py-3.5 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20" />
        </div>
        <div>
          <label class="mb-2 block text-sm font-medium text-white">Base URL <span class="text-violet-400">*</span></label>
          <input v-model="baseUrl" type="url" placeholder="https://api.ejemplo.com"
            class="w-full rounded-2xl border border-white/10 bg-slate-800/50 px-4 py-3.5 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20" />
        </div>
      </template>

      <!-- Contextual help -->
      <div class="rounded-xl border border-white/10 bg-slate-800/30">
        <details class="group">
          <summary class="flex cursor-pointer items-center gap-2 px-4 py-3 text-xs font-medium text-slate-400 transition hover:text-slate-200">
            <svg class="h-4 w-4 shrink-0 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" /><path stroke-linecap="round" stroke-linejoin="round" d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3m.08 4h.01" /></svg>
            &iquest;D&oacute;nde encuentro mi API Key?
            <svg class="ml-auto h-3.5 w-3.5 transition group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </summary>
          <div class="border-t border-white/10 px-4 py-3">
            <p v-if="selectedProvider" class="text-xs text-slate-500">
              <span class="font-medium text-slate-300">{{ PROVIDER_META[selectedProvider]?.label ?? 'Este proveedor' }}:</span>
              {{ selectedProvider === 'gemini' ? 'Ve a Google AI Studio, crea o inicia sesión, y genera una API Key en el menú "Get API Key".' :
                 selectedProvider === 'codex' ? 'Inicia sesión en platform.openai.com, ve a API keys y crea una nueva clave secreta.' :
                 selectedProvider === 'opencloud' ? 'Inicia sesión en OpenRouter, ve a Keys y genera una nueva clave.' :
                 selectedProvider === 'kimi' ? 'Inicia sesión en la plataforma de Moonshot, ve a API Keys y crea una nueva.' :
                 selectedProvider === 'local' ? 'Asegúrate de que tu servidor local esté corriendo. Ollama usa el puerto 11434, LM Studio el 1234, vLLM el 8000.' :
                 'Consulta la documentación de tu proveedor para obtener una API Key.' }}
            </p>
            <a v-if="selectedProvider && PROVIDER_META[selectedProvider]?.helpUrl" :href="PROVIDER_META[selectedProvider].helpUrl" target="_blank" class="mt-2 inline-flex items-center gap-1 text-xs text-violet-400 transition hover:text-violet-300">
              Abrir p&aacute;gina de API Keys
              <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6m4-3h6v6m-11 5L21 3" /></svg>
            </a>
          </div>
        </details>
      </div>
    </div>

    <!-- ── STEP 3: Review & Save ── -->
    <div v-else-if="step === 3" v-motion :initial="{ opacity: 0, x: -16 }" :enter="{ opacity: 1, x: 0, duration: 300 }" class="space-y-5">

      <!-- Summary card -->
      <div class="rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-sm">
        <h3 class="mb-4 text-sm font-semibold text-white">Resumen de configuraci&oacute;n</h3>
        <div class="space-y-3">
          <div class="flex items-center justify-between rounded-xl bg-slate-800/40 px-4 py-3">
            <span class="text-sm text-slate-400">Proveedor</span>
            <span class="text-sm font-medium text-white">{{ providerLabel }}</span>
          </div>
          <div v-if="!isCustom && !isLocal" class="flex items-center justify-between rounded-xl bg-slate-800/40 px-4 py-3">
            <span class="text-sm text-slate-400">Modelo</span>
            <span class="text-sm font-medium text-white">{{ selectedModel }}</span>
          </div>
          <template v-if="isLocal">
            <div class="flex items-center justify-between rounded-xl bg-slate-800/40 px-4 py-3">
              <span class="text-sm text-slate-400">Modelo</span>
              <span class="text-sm font-medium text-white">{{ localModelName }}</span>
            </div>
            <div class="flex items-center justify-between rounded-xl bg-slate-800/40 px-4 py-3">
              <span class="text-sm text-slate-400">URL del servidor</span>
              <span class="text-sm font-medium text-white break-all text-right max-w-[60%]">{{ localBaseUrl }}</span>
            </div>
            <div class="flex items-center justify-between rounded-xl bg-slate-800/40 px-4 py-3">
              <span class="text-sm text-slate-400">Context Window</span>
              <span class="text-sm font-medium text-white">{{ localContextWindow.toLocaleString() }} tokens</span>
            </div>
            <div class="flex items-center justify-between rounded-xl bg-slate-800/40 px-4 py-3">
              <span class="text-sm text-slate-400">Max Tokens</span>
              <span class="text-sm font-medium text-white">{{ localMaxTokens.toLocaleString() }}</span>
            </div>
            <div class="flex items-center justify-between rounded-xl bg-slate-800/40 px-4 py-3">
              <span class="text-sm text-slate-400">API Key</span>
              <span class="text-sm font-medium text-white">{{ localApiKey ? maskKey(localApiKey) : 'No requerida' }}</span>
            </div>
          </template>
          <template v-else-if="isCustom">
            <div class="flex items-center justify-between rounded-xl bg-slate-800/40 px-4 py-3">
              <span class="text-sm text-slate-400">Modelo</span>
              <span class="text-sm font-medium text-white">{{ customModelName }}</span>
            </div>
            <div class="flex items-center justify-between rounded-xl bg-slate-800/40 px-4 py-3">
              <span class="text-sm text-slate-400">Base URL</span>
              <span class="text-sm font-medium text-white break-all text-right max-w-[60%]">{{ baseUrl }}</span>
            </div>
          </template>
          <div v-if="!isLocal" class="flex items-center justify-between rounded-xl bg-slate-800/40 px-4 py-3">
            <span class="text-sm text-slate-400">API Key</span>
            <span class="text-sm font-medium text-white">{{ maskKey(apiKey) }}</span>
          </div>
        </div>
      </div>

      <!-- Terms -->
      <label class="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-slate-900/40 px-4 py-3 transition hover:border-white/20">
        <input type="checkbox" v-model="acceptedTerms" class="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 bg-slate-800 text-violet-500 focus:ring-violet-500/30" />
        <span class="text-sm text-slate-400">
          <template v-if="isLocal">
            Confirmo que el servidor local est&aacute; corriendo y acepto que Paulu use
            <strong class="text-slate-200">{{ localModelName }}</strong> para realizar consultas de forma local.
          </template>
          <template v-else>
            Confirmo que la API Key ingresada es correcta y acepto que Paulu la use para realizar consultas a
            <strong class="text-slate-200">{{ providerLabel }}</strong>.
          </template>
        </span>
      </label>
    </div>

    <!-- Navigation buttons -->
    <div class="flex items-center justify-between gap-3">
      <button
        v-if="step > 1"
        type="button"
        class="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
        @click="goToStep((step - 1) as Step)"
      >
        &larr; Atr&aacute;s
      </button>
      <div v-else />
      <button
        v-if="step < 3"
        type="button"
        :disabled="!stepValid"
        class="rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:shadow-xl hover:shadow-violet-500/30 disabled:cursor-not-allowed disabled:opacity-40"
        @click="goToStep((step + 1) as Step)"
      >
        Siguiente &rarr;
      </button>
      <button
        v-else
        type="button"
        :disabled="!stepValid"
        class="rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:shadow-xl hover:shadow-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-40"
        @click="handleSave"
      >
        Guardar modelo
      </button>
    </div>

    <!-- Border separator -->
    <div class="border-t border-white/5" />

    <!-- Registered models -->
    <div v-motion :initial="{ opacity: 0, y: 16 }" :enter="{ opacity: 1, y: 0, duration: 350, delay: 150 }">
      <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Modelos registrados ({{ models.length }})
      </h2>
      <div v-if="models.length === 0" class="rounded-2xl border border-dashed border-white/10 py-8 text-center">
        <svg class="mx-auto mb-2 h-7 w-7 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 4a4 4 0 0 1 3.5 2.1 7 7 0 0 1 2.5-.6 7 7 0 0 1 4.8 2 7 7 0 0 1-2.8 11.5 4 4 0 0 1-7.5.8 4 4 0 0 1-7.5-.8A7 7 0 0 1 1.2 7.5a7 7 0 0 1 4.8-2 7 7 0 0 1 2.5.6A4 4 0 0 1 12 4z" />
        </svg>
        <p class="text-xs text-slate-500">A&uacute;n no hay modelos registrados. Usa el asistente de arriba.</p>
      </div>
      <div v-else class="space-y-1.5">
        <div
          v-for="model in models"
          :key="model.id"
          class="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-900/30 px-4 py-2.5 transition hover:border-white/20"
        >
          <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
            <svg class="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 4a4 4 0 0 1 3.5 2.1 7 7 0 0 1 2.5-.6 7 7 0 0 1 4.8 2 7 7 0 0 1-2.8 11.5 4 4 0 0 1-7.5.8 4 4 0 0 1-7.5-.8A7 7 0 0 1 1.2 7.5a7 7 0 0 1 4.8-2 7 7 0 0 1 2.5.6A4 4 0 0 1 12 4z" />
            </svg>
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-white">{{ model.label }}</p>
            <p class="text-xs text-slate-500">
              <span class="text-violet-400">{{ model.modelName }}</span>
              <template v-if="model.provider === 'local'">
                &middot; <span class="text-emerald-400">{{ model.baseUrl }}</span>
                <template v-if="model.contextWindow"> &middot; {{ model.contextWindow?.toLocaleString() }} ctx</template>
              </template>
              <template v-else>
                &middot; {{ maskKey(model.apiKey) }}
              </template>
            </p>
          </div>
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
              :class="model.verifiedAt ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'">
              <span class="h-1.5 w-1.5 rounded-full" :class="model.verifiedAt ? 'bg-emerald-400' : 'bg-amber-400'" />
              {{ model.verifiedAt ? 'Verificado' : 'Pendiente' }}
            </span>
            <button type="button" class="rounded-lg p-1 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400" @click="removeModel(model.id)">
              <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Verification modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        leave-active-class="transition duration-150 ease-in"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <div v-if="showVerification" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <Transition
            enter-active-class="transition duration-200 ease-out"
            leave-active-class="transition duration-150 ease-in"
            enter-from-class="opacity-0 scale-95 translate-y-4"
            leave-to-class="opacity-0 scale-95 translate-y-4"
          >
            <div v-if="showVerification" class="w-full max-w-sm rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
              <div v-if="!verificationResult" class="text-center">
                <div class="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-violet-500/20 border-t-violet-500" />
                <p class="text-sm font-medium text-white">Verificando conexi&oacute;n...</p>
                <p class="mt-1 text-xs text-slate-500">Probando la API Key con una solicitud de ejemplo.</p>
              </div>
              <div v-else-if="verificationResult.success" class="text-center">
                <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10">
                  <svg class="h-6 w-6 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
                <p class="text-sm font-semibold text-emerald-400">Conexi&oacute;n exitosa</p>
                <p class="mt-1 text-xs text-slate-500">Modelo registrado correctamente.</p>
              </div>
              <div v-else class="text-center">
                <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10">
                  <svg class="h-6 w-6 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M12 3l9.66 9.66a1 1 0 010 1.68L12 24l-9.66-9.66a1 1 0 010-1.68L12 3z" /></svg>
                </div>
                <p class="text-sm font-semibold text-red-400">Error de conexi&oacute;n</p>
                <p class="mt-1 text-xs text-slate-400">{{ verificationResult.message }}</p>
                <div class="mt-5 flex justify-center gap-3">
                  <button type="button" class="rounded-xl bg-slate-800 px-4 py-2 text-xs font-medium text-slate-300 transition hover:bg-slate-700" @click="handleCancelVerification">Cancelar</button>
                  <button type="button" class="rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-4 py-2 text-xs font-medium text-white shadow-lg shadow-violet-500/25 transition hover:shadow-xl" @click="handleRetry">Reintentar</button>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
