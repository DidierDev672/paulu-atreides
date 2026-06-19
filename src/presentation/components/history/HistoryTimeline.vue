<script setup lang="ts">
import type { HistoryEntry } from '@/domain/entities/HistoryEntry'
import { computed, ref } from 'vue'
import { getUserById } from '@/application/services/userService'
import { getCompanyById } from '@/application/services/companyService'

const props = defineProps<{
  entries: HistoryEntry[]
  isLoading?: boolean
  title?: string
}>()

const searchQuery = ref('')
const expandedIds = ref<Set<string>>(new Set())

const filteredEntries = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return props.entries
  return props.entries.filter((e) =>
    e.details.toLowerCase().includes(q) ||
    e.entityType.toLowerCase().includes(q) ||
    e.action.toLowerCase().includes(q) ||
    e.userId.toLowerCase().includes(q) ||
    e.entityId.toLowerCase().includes(q) ||
    (e.documentName && e.documentName.toLowerCase().includes(q))
  )
})
const userNames = ref<Record<string, string>>({})
const companyNames = ref<Record<string, string>>({})

async function toggleExpand(id: string): Promise<void> {
  const s = new Set(expandedIds.value)
  if (s.has(id)) {
    s.delete(id)
  } else {
    s.add(id)
    const entry = props.entries.find((e) => e.id === id)
    if (entry) {
      if (entry.userId && !userNames.value[entry.userId]) {
        try {
          const u = await getUserById(entry.userId)
          userNames.value[entry.userId] = u.name_full
        } catch { /* ignore */ }
      }
      if (entry.companyId && !companyNames.value[entry.companyId]) {
        try {
          const c = await getCompanyById(entry.companyId)
          companyNames.value[entry.companyId] = c.social_reason
        } catch { /* ignore */ }
      }
    }
  }
  expandedIds.value = s
}

const actionColors: Record<string, string> = {
  CREATE: 'from-emerald-400 to-emerald-600 shadow-emerald-500/30',
  UPDATE: 'from-blue-400 to-indigo-600 shadow-blue-500/30',
  DELETE: 'from-red-400 to-rose-600 shadow-red-500/30',
  APPROVE: 'from-teal-400 to-teal-600 shadow-teal-500/30',
  DEDUCT: 'from-orange-400 to-amber-600 shadow-orange-500/30',
  LOGIN: 'from-indigo-400 to-indigo-600 shadow-indigo-500/30',
  LOGOUT: 'from-gray-400 to-gray-600 shadow-gray-500/30',
  REGISTER: 'from-purple-400 to-purple-600 shadow-purple-500/30',
  SHIPMENT_CREATED: 'from-cyan-400 to-teal-600 shadow-cyan-500/30',
  ORDER_CREATED: 'from-amber-400 to-yellow-600 shadow-amber-500/30',
  ENTRY_CREATED: 'from-green-400 to-emerald-600 shadow-green-500/30',
  RELATION_CREATED: 'from-pink-400 to-rose-600 shadow-pink-500/30',
}

const actionIcons: Record<string, string> = {
  CREATE: '+',
  UPDATE: '\u21BB',
  DELETE: '\u2716',
  APPROVE: '\u2714',
  DEDUCT: '\u2212',
  LOGIN: '\u2192',
  LOGOUT: '\u2190',
  REGISTER: '+',
  SHIPMENT_CREATED: '\u2197',
  ORDER_CREATED: '\u2630',
  ENTRY_CREATED: '\u2191',
  RELATION_CREATED: '\u2194',
}

const actionLabels: Record<string, string> = {
  CREATE: 'Creación',
  UPDATE: 'Actualización',
  DELETE: 'Eliminación',
  APPROVE: 'Aprobación',
  DEDUCT: 'Deducción',
  LOGIN: 'Inicio de sesión',
  LOGOUT: 'Cierre de sesión',
  REGISTER: 'Registro',
  SHIPMENT_CREATED: 'Despacho creado',
  ORDER_CREATED: 'Orden creada',
  ENTRY_CREATED: 'Entrada creada',
  RELATION_CREATED: 'Relación creada',
}

const entityLabels: Record<string, string> = {
  shipment: 'Despacho',
  order: 'Orden',
  product_entry: 'Entrada',
  product: 'Producto',
  user: 'Usuario',
  company: 'Empresa',
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('es-CO', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return iso
  }
}

function entityLabel(type: string | undefined | null): string {
  return type ? entityLabels[type.toLowerCase()] ?? type : ''
}

function actionLabel(action: string): string {
  return actionLabels[action] ?? action
}

function actionColor(action: string): string {
  return actionColors[action] ?? 'from-gray-400 to-gray-600 shadow-gray-500/30'
}

function userIdShort(id: string): string {
  return id ? '@' + id.slice(0, 11) + '\u2026' : '—'
}

function resultLabel(result: string | undefined): string {
  if (!result) return ''
  const labels: Record<string, string> = {
    SUCCESS: 'Éxito',
    FAILURE: 'Falló',
    FAIL: 'Falló',
    ERROR: 'Error',
    PENDING: 'Pendiente',
  }
  return labels[result.toUpperCase()] ?? result
}
</script>

<template>
  <div class="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0a071e]/95 dark:backdrop-blur-md dark:shadow-[0_0_40px_rgba(139,92,246,0.15)]">
    <!-- Gradient orbs (dark only) -->
    <div class="pointer-events-none absolute -top-20 -right-20 h-60 w-60 rounded-full bg-purple-600/20 blur-[100px] hidden dark:block" />
    <div class="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-indigo-600/15 blur-[100px] hidden dark:block" />

    <!-- Header -->
    <div class="relative flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-white/10">
      <div class="flex items-center gap-3">
        <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 shadow-[0_0_12px_rgba(139,92,246,0.4)]">
          <svg class="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
            {{ title ?? 'Historial de Actividad' }}
          </h3>
          <p class="text-xs text-slate-500 dark:text-purple-300/60">Cada orden y salida deja una huella. Explora el flujo completo de tu inventario.</p>
        </div>
      </div>
    </div>

    <!-- Search -->
    <div class="relative border-b border-slate-200 px-6 py-3 dark:border-white/10">
      <div class="relative">
        <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-purple-300/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por descripción, producto, usuario..."
          class="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-9 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 dark:border-white/10 dark:bg-white/[0.04] dark:text-purple-100 dark:placeholder:text-purple-300/40 dark:focus:border-purple-500"
        />
        <button
          v-if="searchQuery"
          type="button"
          class="absolute right-2 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-200 hover:text-slate-600 dark:text-purple-300/40 dark:hover:bg-white/10 dark:hover:text-purple-200"
          @click="searchQuery = ''"
        >
          <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="relative flex justify-center py-16">
      <div class="flex flex-col items-center gap-3">
        <div class="h-10 w-10 rounded-full border-2 border-slate-300 border-t-purple-500 animate-spin dark:border-purple-500/30 dark:border-t-purple-400 dark:shadow-[0_0_20px_rgba(168,85,247,0.3)]" />
        <p class="text-sm text-slate-400 dark:text-purple-300/50">Cargando actividad...</p>
      </div>
    </div>

    <!-- Empty (no entries at all) -->
    <div
      v-else-if="entries.length === 0"
      class="relative flex flex-col items-center justify-center py-16"
    >
      <div class="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-3xl text-slate-400 dark:bg-white/5 dark:text-purple-400/40">
        <svg class="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
      </div>
      <p class="text-sm text-slate-400 dark:text-purple-300/50">No hay actividad registrada aún.</p>
    </div>

    <!-- No search results -->
    <div
      v-else-if="searchQuery && filteredEntries.length === 0"
      class="relative flex flex-col items-center justify-center py-16"
    >
      <div class="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-3xl text-slate-400 dark:bg-white/5 dark:text-purple-400/40">
        <svg class="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      </div>
      <p class="text-sm text-slate-400 dark:text-purple-300/50">Sin resultados para "<span class="font-medium text-slate-600 dark:text-purple-200/70">{{ searchQuery }}</span>"</p>
      <button
        type="button"
        class="mt-2 text-xs text-purple-500 underline underline-offset-2 transition hover:text-purple-400 dark:text-purple-400 dark:hover:text-purple-300"
        @click="searchQuery = ''"
      >Limpiar búsqueda</button>
    </div>

    <!-- Timeline -->
    <div v-else class="relative px-6 py-5">
      <div class="absolute left-11 top-0 bottom-0 w-px bg-gradient-to-b from-purple-400/60 via-purple-300/30 to-transparent dark:from-purple-500/50 dark:via-indigo-500/30" />

      <div class="relative space-y-0">
        <div
          v-for="entry in filteredEntries"
          :key="entry.id"
          class="group relative flex gap-5 py-3 transition-all duration-300 hover:bg-slate-50 rounded-xl -mx-2 px-2 dark:hover:bg-white/[0.02]"
        >
          <!-- Glowing dot -->
          <div class="relative z-10 mt-1">
            <div
              class="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br text-white text-xs font-bold shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl"
              :class="actionColor(entry.action)"
            >
              {{ actionIcons[entry.action] ?? '*' }}
            </div>
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0 pb-4 border-b border-slate-100 group-last:border-b-0 dark:border-white/5">
            <!-- Header row -->
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0 flex-1">
                <!-- Movement name / description -->
                <p class="text-sm font-medium text-slate-800 leading-snug dark:text-white/90">
                  {{ entry.details }}
                </p>

                <!-- User + Event type row -->
                <div class="mt-2 flex items-center gap-3 flex-wrap">
                  <span class="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-purple-300/60">
                    <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    {{ entry.userId ? userIdShort(entry.userId) : 'Sistema' }}
                  </span>

                  <span class="inline-flex items-center gap-1 text-xs text-slate-400 dark:text-purple-300/50">
                    <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                    {{ entityLabel(entry.entityType) }} #{{ entry.entityId?.slice(0, 8) ?? '' }}
                  </span>

                  <span
                    class="inline-flex items-center rounded-full bg-gradient-to-r px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-sm"
                    :class="actionColor(entry.action).replace('shadow-', 'shadow-sm ') + ' opacity-90'"
                  >
                    {{ actionLabel(entry.action) }}
                  </span>
                </div>

                <p class="mt-2 text-[11px] text-slate-400 dark:text-purple-300/40">
                  {{ formatDate(entry.timestamp) }}
                </p>
              </div>

              <!-- Expand / collapse button -->
              <button
                type="button"
                class="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-slate-50 text-slate-400 transition-all duration-300 hover:bg-slate-100 hover:text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-purple-300/50 dark:hover:bg-white/10 dark:hover:text-purple-200"
                @click="toggleExpand(entry.id)"
              >
                <svg
                  class="h-4 w-4 transition-transform duration-300"
                  :class="expandedIds.has(entry.id) ? 'rotate-180' : ''"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
            </div>

            <!-- Expanded detail panel -->
            <Transition name="fade">
              <div
                v-if="expandedIds.has(entry.id)"
                class="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2.5 dark:border-white/10 dark:bg-white/[0.03]"
              >
                <div class="prose prose-sm max-w-none text-slate-700 dark:text-purple-200/80 dark:prose-invert mb-3">
                  {{ entry.details }}
                </div>
                <div class="grid grid-cols-2 gap-2 text-xs">
                  <div class="text-slate-400 dark:text-purple-300/40">ID</div>
                  <div class="text-slate-700 font-mono truncate dark:text-purple-200/80">{{ entry.id }}</div>

                  <div class="text-slate-400 dark:text-purple-300/40">Usuario</div>
                  <div class="text-slate-700 dark:text-purple-200/80">
                    <span v-if="entry.userId && userNames[entry.userId]" class="font-medium">{{ userNames[entry.userId] }}</span>
                    <span v-else-if="entry.userId" class="font-mono text-slate-400 dark:text-purple-300/60">{{ entry.userId }}</span>
                    <span v-else class="text-slate-400 dark:text-purple-300/50">—</span>
                    <span v-if="entry.userId" class="ml-1.5 text-slate-400 dark:text-purple-300/40 font-mono text-[10px]">({{ userIdShort(entry.userId) }})</span>
                  </div>

                  <div class="text-slate-400 dark:text-purple-300/40">Documento</div>
                  <div class="text-slate-700 dark:text-purple-200/80" v-if="entry.documentName">
                    <span class="font-medium">{{ entry.documentName }}</span>
                    <span class="ml-1.5 text-slate-400 dark:text-purple-300/40 font-mono text-[10px]">({{ entry.entityId?.slice(0, 8) ?? '' }})</span>
                  </div>
                  <div class="text-slate-700 font-mono dark:text-purple-200/80" v-else>{{ entry.entityId || '—' }}</div>

                  <div v-if="entry.result" class="text-slate-400 dark:text-purple-300/40">Resultado</div>
                  <div v-if="entry.result" class="text-slate-700 dark:text-purple-200/80">
                    <span
                      class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                      :class="entry.result === 'SUCCESS'
                        ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300'"
                    >
                      {{ resultLabel(entry.result) }}
                    </span>
                  </div>

                  <div v-if="entry.ipAddress" class="text-slate-400 dark:text-purple-300/40">IP</div>
                  <div v-if="entry.ipAddress" class="text-slate-700 font-mono dark:text-purple-200/80">{{ entry.ipAddress }}</div>

                  <div v-if="entry.companyId" class="text-slate-400 dark:text-purple-300/40">Compañía</div>
                  <div v-if="entry.companyId" class="text-slate-700 dark:text-purple-200/80">
                    <span v-if="companyNames[entry.companyId]" class="font-medium">{{ companyNames[entry.companyId] }}</span>
                    <span v-else class="font-mono text-slate-400 dark:text-purple-300/60">{{ entry.companyId }}</span>
                  </div>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active {
  transition: opacity 0.25s ease-out, transform 0.25s ease-out;
}
.fade-leave-active {
  transition: opacity 0.15s ease-in, transform 0.15s ease-in;
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(-6px);
}
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
