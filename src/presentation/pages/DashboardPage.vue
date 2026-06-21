<script setup lang="ts">
/**
 * DashboardPage.vue
 * Complete responsive admin dashboard with navbar, collapsible sidebar,
 * stat cards, chart placeholders, data table, and activity feed.
 * Uses Tailwind CSS v4 + @vueuse/motion for entrance animations.
 */
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useAuthStore } from '@/presentation/stores/authStore'
import { useCompanyStore } from '@/presentation/stores/companyStore'
import { getCompanyByUser } from '@/application/services/companyService'
import type { CompanyResponse } from '@/application/services/companyService'
import OnboardingModal from '@/presentation/components/company/OnboardingModal.vue'
import CompanyRegistrationForm from '@/presentation/components/company/CompanyRegistrationForm.vue'
import CompanySelectionModal from '@/presentation/components/company/CompanySelectionModal.vue'
import UserProfile from '@/presentation/components/profile/UserProfile.vue'
import ProductRegistrationForm from '@/presentation/components/products/ProductRegistrationForm.vue'
import ProviderList from '@/presentation/components/providers/ProviderList.vue'
import ProviderRegistrationForm from '@/presentation/components/providers/ProviderRegistrationForm.vue'
import ProductEntryForm from '@/presentation/components/productEntries/ProductEntryForm.vue'
import ProductEntryList from '@/presentation/components/productEntries/ProductEntryList.vue'
import ProductList from '@/presentation/components/products/ProductList.vue'
import WineryRegistrationForm from '@/presentation/components/wineries/WineryRegistrationForm.vue'
import OrderForm from '@/presentation/components/orders/OrderForm.vue'
import OrderList from '@/presentation/components/orders/OrderList.vue'
import ShipmentForm from '@/presentation/components/shipments/ShipmentForm.vue'
import ShipmentList from '@/presentation/components/shipments/ShipmentList.vue'
import { useHistoryStore } from '@/presentation/stores/historyStore'
import HistoryTimeline from '@/presentation/components/history/HistoryTimeline.vue'
import { useProductEntryStore } from '@/presentation/stores/productEntryStore'
import { useShipmentStore } from '@/presentation/stores/shipmentStore'
import SalesPage from '@/presentation/components/sales/SalesPage.vue'
import AIModelsPanel from '@/presentation/components/ai/AIModelsPanel.vue'

// ─── Theme ───────────────────────────────────────────────────────────────────
import { useTheme } from '@/presentation/composables/useTheme'
const { isDark, toggleTheme, initTheme } = useTheme()
onMounted(initTheme)

// ─── Sidebar ─────────────────────────────────────────────────────────────────
const sidebarCollapsed = ref(false)
const mobileSidebarOpen = ref(false)

function toggleSidebar(): void {
  if (window.innerWidth < 1024) {
    mobileSidebarOpen.value = !mobileSidebarOpen.value
  } else {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }
}

function closeMobileSidebar(): void {
  mobileSidebarOpen.value = false
}

// ─── Profile & notifications menus ───────────────────────────────────────────
const profileOpen = ref(false)
const notificationsOpen = ref(false)
const profileRef = ref<HTMLElement | null>(null)
const notificationsRef = ref<HTMLElement | null>(null)

function handleClickOutside(event: MouseEvent): void {
  const target = event.target as Node
  if (profileRef.value && !profileRef.value.contains(target)) profileOpen.value = false
  if (notificationsRef.value && !notificationsRef.value.contains(target)) notificationsOpen.value = false
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))

const authStore = useAuthStore()
const companyStore = useCompanyStore()
const historyStore = useHistoryStore()
const productEntryStore = useProductEntryStore()
const shipmentStore = useShipmentStore()
const userId = computed(() => authStore.session?.user.id ?? '')
const userName = computed(() => authStore.session?.user.fullName ?? 'Admin User')
const userInitials = computed(() =>
  userName.value
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase(),
)

// ─── Company onboarding & selection ──────────────────────────────────────────
const showOnboarding = ref(false)
const showRegistrationForm = ref(false)
const showCompanySelection = ref(false)
const loadingCompany = ref(true)

onMounted(async () => {
  if (!userId.value) {
    loadingCompany.value = false
    return
  }
  try {
    const companies = await getCompanyByUser(userId.value)
    companyStore.setCompanies(companies)
    if (companies.length === 0) {
      showOnboarding.value = true
    } else if (companies.length === 1) {
      companyStore.selectCompany(companies[0])
    } else {
      showCompanySelection.value = true
    }
  } catch {
    showOnboarding.value = true
  } finally {
    loadingCompany.value = false
  }
  // Fetch recent history
  historyStore.fetchEntries({ limit: 10 })
  // Fetch product entries for frequency analysis
  productEntryStore.fetchEntries()
  // Fetch shipments for exit analysis
  shipmentStore.fetchShipments()
})

function handleCompanySelect(company: CompanyResponse): void {
  companyStore.selectCompany(company)
  showCompanySelection.value = false
}

function handleSelectionRegister(): void {
  showCompanySelection.value = false
  showRegistrationForm.value = true
}

function handleOnboardingProceed(): void {
  showOnboarding.value = false
  showRegistrationForm.value = true
}

function handleOnboardingDismiss(): void {
  showOnboarding.value = false
}

async function handleCompanyCreated(): Promise<void> {
  showRegistrationForm.value = false
  const companies = await getCompanyByUser(userId.value)
  companyStore.setCompanies(companies)
  if (companies.length === 1) {
    companyStore.selectCompany(companies[0])
  } else if (companies.length > 1) {
    showCompanySelection.value = true
  }
}

function goToProfile(): void {
  activeNav.value = 'profile'
}

// ─── Navigation ──────────────────────────────────────────────────────────────
const activeNav = ref('dashboard')
const expandedGroups = ref<Set<string>>(new Set())

const inventoryHistoryEntries = computed(() =>
  historyStore.entries.filter((e) =>
    ['product', 'product_entry', 'movement'].includes(e.entityType)
  )
)

watch(activeNav, (nav) => {
  if (nav === 'history-project' || nav === 'history-inventory') {
    historyStore.fetchEntries({ limit: 200 })
  }
  if (nav === 'dashboard') {
    productEntryStore.fetchEntries()
    shipmentStore.fetchShipments()
  }
})

// ─── Product frequency (entries) ──────────────────────────────────────────────
const productFrequency = computed(() => {
  const freq: Record<string, { count: number; price: number }> = {}
  for (const entry of productEntryStore.entries) {
    for (const detail of entry.details) {
      if (!freq[detail.product]) {
        freq[detail.product] = { count: 0, price: 0 }
      }
      freq[detail.product].count++
      freq[detail.product].price = Math.max(freq[detail.product].price, detail.suggested_selling_price)
    }
  }
  return freq
})

const sortedProducts = computed(() => {
  return Object.entries(productFrequency.value)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.count - a.count)
})

const mostRepeatedProduct = computed(() => sortedProducts.value[0] ?? null)

const topProducts = computed(() => sortedProducts.value.slice(0, 5))

// ─── Shipment/Exit analysis ───────────────────────────────────────────────────
const exitProductFreq = computed(() => {
  const freq: Record<string, { count: number; prices: number[] }> = {}
  for (const shipment of shipmentStore.shipments) {
    for (const detail of shipment.details) {
      if (!freq[detail.product]) {
        freq[detail.product] = { count: 0, prices: [] }
      }
      freq[detail.product].count++
      freq[detail.product].prices.push(detail.unit_cost)
    }
  }
  return freq
})

const sortedExitProducts = computed(() => {
  return Object.entries(exitProductFreq.value)
    .map(([name, data]) => ({
      name,
      count: data.count,
      highestPrice: Math.max(...data.prices),
      lowestPrice: Math.min(...data.prices),
    }))
    .sort((a, b) => b.count - a.count)
})

const mostExitedProduct = computed(() => sortedExitProducts.value[0] ?? null)

const leastExitedProduct = computed(() => {
  const withEntries = sortedExitProducts.value.filter((p) => p.count > 0)
  return withEntries[withEntries.length - 1] ?? null
})

const highestExitPrice = computed(() => {
  let max = 0
  for (const shipment of shipmentStore.shipments) {
    for (const detail of shipment.details) {
      if (detail.unit_cost > max) max = detail.unit_cost
    }
  }
  return max
})

const lowestExitPrice = computed(() => {
  let min = Infinity
  for (const shipment of shipmentStore.shipments) {
    for (const detail of shipment.details) {
      if (detail.unit_cost < min) min = detail.unit_cost
    }
  }
  return min === Infinity ? 0 : min
})

const exitDates = computed(() => {
  const dateCount: Record<string, number> = {}
  for (const shipment of shipmentStore.shipments) {
    const day = shipment.record_date.split('T')[0]
    if (!dateCount[day]) dateCount[day] = 0
    dateCount[day]++
  }
  return Object.entries(dateCount)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => b.count - a.count)
})

const topExitDate = computed(() => exitDates.value[0] ?? null)

const totalExits = computed(() => {
  let count = 0
  for (const p of Object.values(exitProductFreq.value)) {
    count += p.count
  }
  return count
})

const averageExitPrice = computed(() => {
  let sum = 0
  let count = 0
  for (const shipment of shipmentStore.shipments) {
    for (const detail of shipment.details) {
      sum += detail.unit_cost
      count++
    }
  }
  return count === 0 ? 0 : Math.round(sum / count)
})

const topExitProducts = computed(() => {
  const total = totalExits.value
  return sortedExitProducts.value.slice(0, 5).map((p) => ({
    ...p,
    averagePrice: Math.round(
      exitProductFreq.value[p.name].prices.reduce((a, b) => a + b, 0) /
        exitProductFreq.value[p.name].prices.length
    ),
    percentage: total > 0 ? Math.round((p.count / total) * 100) : 0,
  }))
})

const sidebarSearch = ref('')

const filteredNavGroups = computed(() => {
  const q = sidebarSearch.value.toLowerCase().trim()
  if (!q) return navGroups
  return navGroups
    .map((g) => {
      const matchGroup = g.label.toLowerCase().includes(q)
      if (g.children) {
        const filteredChildren = g.children
          .map((c) => {
            const matchChild = c.label.toLowerCase().includes(q)
            if (c.children) {
              const filteredSub = c.children.filter((s) =>
                s.label.toLowerCase().includes(q)
              )
              if (filteredSub.length) return { ...c, children: filteredSub }
            }
            return matchChild ? c : null
          })
          .filter(Boolean) as NavChild[]
        if (matchGroup || filteredChildren.length) {
          return { ...g, children: filteredChildren }
        }
      }
      return matchGroup ? g : null
    })
    .filter(Boolean) as NavGroup[]
})

function toggleGroup(id: string): void {
  const s = expandedGroups.value
  if (s.has(id)) s.delete(id)
  else s.add(id)
  expandedGroups.value = new Set(s)
}

interface NavChild {
  id: string
  label: string
  children?: NavChild[]
}

interface NavGroup {
  id: string
  label: string
  icon: string
  children?: NavChild[]
}

const navGroups: NavGroup[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'grid' },
  {
    id: 'providers', label: 'Proveedores', icon: 'truck',
    children: [
      { id: 'providers', label: 'Lista de Proveedores' },
      { id: 'register-provider', label: 'Registrar proveedores' },
    ],
  },
  {
    id: 'products', label: 'Productos', icon: 'package',
    children: [
      { id: 'products', label: 'Productos' },
      { id: 'register-product', label: 'Registrar productos' },
      {
        id: 'entries', label: 'Entradas',
        children: [
          { id: 'product-entries', label: 'Entradas' },
          { id: 'register-product-entry', label: 'Registrar entradas' },
        ],
      },
      {
        id: 'exits', label: 'Salida',
        children: [
          { id: 'shipments', label: 'Salidas' },
          { id: 'register-shipment', label: 'Registrar salida' },
        ],
      },
    ],
  },
  {
    id: 'orders', label: 'Órdenes (Compra/Venta)', icon: 'clipboard',
    children: [
      { id: 'orders', label: 'Órdenes' },
      { id: 'register-order', label: 'Registrar Orden' },
    ],
  },
  {
    id: 'sales', label: 'Ventas', icon: 'wallet',
    children: [
      { id: 'sales', label: 'Ventas' },
    ],
  },
  {
    id: 'history', label: 'Historial', icon: 'clock',
    children: [
      { id: 'history-project', label: 'Historial Paulu' },
      { id: 'history-inventory', label: 'Historial inventarios' },
    ],
  },
  { id: 'profile', label: 'Profile', icon: 'profile' },
  { id: 'ai-models', label: 'Modelos de IA', icon: 'ai' },
]

function handleNavClick(id: string): void {
  activeNav.value = id
  closeMobileSidebar()
}

// ─── Table data & pagination ─────────────────────────────────────────────────
type TransactionStatus = 'completed' | 'pending' | 'failed'

interface Transaction {
  id: string
  customer: string
  email: string
  amount: string
  status: TransactionStatus
  date: string
}

const transactions: Transaction[] = [
  { id: 'TXN-001', customer: 'María García', email: 'maria@email.com', amount: '$1,240.00', status: 'completed', date: 'Jun 12, 2026' },
  { id: 'TXN-002', customer: 'Carlos Ruiz', email: 'carlos@email.com', amount: '$890.50', status: 'pending', date: 'Jun 12, 2026' },
  { id: 'TXN-003', customer: 'Ana López', email: 'ana@email.com', amount: '$2,150.00', status: 'completed', date: 'Jun 11, 2026' },
  { id: 'TXN-004', customer: 'Pedro Sánchez', email: 'pedro@email.com', amount: '$420.00', status: 'failed', date: 'Jun 11, 2026' },
  { id: 'TXN-005', customer: 'Laura Martín', email: 'laura@email.com', amount: '$3,680.00', status: 'completed', date: 'Jun 10, 2026' },
  { id: 'TXN-006', customer: 'Diego Torres', email: 'diego@email.com', amount: '$975.25', status: 'pending', date: 'Jun 10, 2026' },
  { id: 'TXN-007', customer: 'Sofia Herrera', email: 'sofia@email.com', amount: '$1,520.00', status: 'completed', date: 'Jun 9, 2026' },
  { id: 'TXN-008', customer: 'Miguel Vega', email: 'miguel@email.com', amount: '$310.00', status: 'failed', date: 'Jun 9, 2026' },
]

const statusStyles: Record<TransactionStatus, string> = {
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
  failed: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400',
}

const currentPage = ref(1)
const perPage = 5
const totalPages = computed(() => Math.ceil(transactions.length / perPage))
const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return transactions.slice(start, start + perPage)
})

function goToPage(page: number): void {
  if (page >= 1 && page <= totalPages.value) currentPage.value = page
}

// --- Activity feed -----------------------------------------------------------
const actionDot: Record<string, string> = {
  CREATE: 'bg-emerald-500',
  UPDATE: 'bg-blue-500',
  DELETE: 'bg-red-500',
  APPROVE: 'bg-teal-500',
  DEDUCT: 'bg-amber-500',
  LOGIN: 'bg-indigo-500',
  LOGOUT: 'bg-gray-500',
  REGISTER: 'bg-purple-500',
  SHIPMENT_CREATED: 'bg-cyan-500',
  ORDER_CREATED: 'bg-amber-500',
  ENTRY_CREATED: 'bg-green-500',
  RELATION_CREATED: 'bg-pink-500',
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

function formatTimeAgo(iso: string): string {
  const now = Date.now()
  const then = new Date(iso).getTime()
  const diff = now - then
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Ahora'
  if (minutes < 60) return `Hace ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Hace ${hours} h`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Ayer'
  return `Hace ${days} días`
}

const activities = computed(() =>
  historyStore.entries.slice(0, 10).map((entry) => ({
    id: entry.id,
    type: actionDot[entry.action] ? entry.action.toLowerCase() : 'info',
    message: entry.details,
    time: formatTimeAgo(entry.timestamp),
  }))
)

const notifications = [
  { id: 1, title: 'New order received', body: 'Order #4821 from María García', time: '5m' },
  { id: 2, title: 'System update', body: 'Scheduled maintenance tonight at 2 AM', time: '1h' },
  { id: 3, title: 'New comment', body: 'Carlos left feedback on dashboard', time: '3h' },
]

const searchQuery = ref('')
</script>

<template>
  <div class="min-h-dvh bg-slate-50 text-slate-800 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
    <!-- Mobile sidebar overlay -->
    <Transition
      enter-active-class="transition-opacity duration-300"
      leave-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="mobileSidebarOpen"
        class="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
        @click="closeMobileSidebar"
      />
    </Transition>

    <!-- ═══ SIDEBAR ═══ -->
    <aside
      v-motion
      :initial="{ x: -20, opacity: 0 }"
      :enter="{ x: 0, opacity: 1, transition: { duration: 400 } }"
      class="fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200/80 bg-white shadow-md transition-all duration-300 dark:border-slate-800 dark:bg-slate-900"
      :class="[
        sidebarCollapsed ? 'w-[72px]' : 'w-64',
        mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ]"
    >
      <!-- Logo -->
      <div class="flex h-16 items-center gap-3 border-b border-slate-200/80 px-4 dark:border-slate-800" :class="sidebarCollapsed ? 'justify-center' : ''">
        <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-stellar-500 to-cosmic-600 shadow-md">
          <svg class="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
          </svg>
        </div>
        <span v-if="!sidebarCollapsed" class="font-display text-lg font-bold tracking-tight">Paulu</span>
      </div>

      <!-- Sidebar search -->
      <div v-if="!sidebarCollapsed" class="px-3 pt-2">
        <div class="relative">
          <svg class="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="sidebarSearch"
            type="text"
            placeholder="Buscar..."
            class="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-sm text-slate-700 placeholder-slate-400 transition focus:border-stellar-400 focus:outline-none focus:ring-2 focus:ring-stellar-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500 dark:focus:border-stellar-500"
          />
        </div>
      </div>

      <!-- Nav links -->
      <nav class="flex-1 space-y-1 overflow-y-auto p-3">
        <div v-for="group in filteredNavGroups" :key="group.id" v-motion :initial="{ opacity: 0, y: 6 }" :enter="{ opacity: 1, y: 0, transition: { duration: 250 } }">
          <!-- ── Dropdown group ── -->
          <div v-if="group.children">
            <!-- Group header -->
            <button
              type="button"
              class="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200"
              :class="[
                'text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100',
                sidebarCollapsed ? 'justify-center' : '',
              ]"
              :title="sidebarCollapsed ? group.label : undefined"
              @click="toggleGroup(group.id)"
            >
              <!-- Truck icon -->
              <svg v-if="group.icon === 'truck'" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                <circle cx="9" cy="16" r="2" />
                <circle cx="15" cy="16" r="2" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 12v-2a2 2 0 00-2-2H9a2 2 0 00-2 2v2" />
              </svg>
              <!-- Package icon -->
              <svg v-else-if="group.icon === 'package'" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <!-- Clipboard icon -->
              <svg v-else-if="group.icon === 'clipboard'" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <!-- Clock icon -->
              <svg v-else-if="group.icon === 'clock'" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 7v5l3 3" />
              </svg>
              <span v-if="!sidebarCollapsed" class="flex-1 text-left">{{ group.label }}</span>
              <svg
                v-if="!sidebarCollapsed"
                class="h-4 w-4 transition-transform duration-200"
                :class="expandedGroups.has(group.id) ? 'rotate-180' : ''"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <!-- Group children -->
            <Transition
              enter-active-class="transition-opacity duration-200 ease-out"
              leave-active-class="transition-opacity duration-150 ease-in"
              enter-from-class="opacity-0"
              leave-to-class="opacity-0"
            >
              <div v-if="!sidebarCollapsed && expandedGroups.has(group.id)" class="ml-3 mt-1 space-y-0.5 border-l-2 border-slate-200 pl-2 dark:border-slate-700">
              <template v-for="child in group.children" :key="child.id">
                <!-- Sub-dropdown -->
                <div v-if="child.children" class="space-y-0.5">
                  <button
                    type="button"
                    class="group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                    @click="toggleGroup(child.id)"
                  >
                    <span class="flex-1 text-left">{{ child.label }}</span>
                    <svg
                      class="h-3.5 w-3.5 transition-transform duration-200"
                      :class="expandedGroups.has(child.id) ? 'rotate-180' : ''"
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <Transition
                    enter-active-class="transition-opacity duration-200 ease-out"
                    leave-active-class="transition-opacity duration-150 ease-in"
                    enter-from-class="opacity-0"
                    leave-to-class="opacity-0"
                  >
                    <div v-if="expandedGroups.has(child.id)" class="ml-3 space-y-0.5">
                      <button
                        v-for="sub in child.children"
                        :key="sub.id"
                        type="button"
                        v-motion
                        :initial="{ opacity: 0, x: -4 }"
                        :enter="{ opacity: 1, x: 0, transition: { duration: 200 } }"
                        class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200"
                        :class="[
                          activeNav === sub.id
                            ? 'bg-stellar-500/10 text-stellar-600 dark:bg-stellar-500/20 dark:text-stellar-300'
                            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100',
                        ]"
                        @click="handleNavClick(sub.id)"
                      >
                        <span>{{ sub.label }}</span>
                      </button>
                    </div>
                  </Transition>
                </div>
                <!-- Regular child -->
                <button
                  v-else
                  type="button"
                  v-motion
                  :initial="{ opacity: 0, x: -4 }"
                  :enter="{ opacity: 1, x: 0, transition: { duration: 200 } }"
                  class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200"
                  :class="[
                    activeNav === child.id
                      ? 'bg-stellar-500/10 text-stellar-600 dark:bg-stellar-500/20 dark:text-stellar-300'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100',
                  ]"
                  @click="handleNavClick(child.id)"
                >
                  <span>{{ child.label }}</span>
                </button>
              </template>
            </div>
            </Transition>
          </div>
          <!-- ── Flat item ── -->
          <button
            v-else
            type="button"
            class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200"
            :class="[
              activeNav === group.id
                ? 'bg-stellar-500/10 text-stellar-600 shadow-sm dark:bg-stellar-500/20 dark:text-stellar-300'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100',
              sidebarCollapsed ? 'justify-center' : '',
            ]"
            :title="sidebarCollapsed ? group.label : undefined"
            @click="handleNavClick(group.id)"
          >
            <!-- Grid icon -->
            <svg v-if="group.icon === 'grid'" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <!-- Wallet icon -->
            <svg v-else-if="group.icon === 'wallet'" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <!-- Profile icon -->
            <svg v-else-if="group.icon === 'profile'" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <!-- AI icon -->
            <svg v-else-if="group.icon === 'ai'" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4a4 4 0 0 1 3.5 2.1 7 7 0 0 1 2.5-.6 7 7 0 0 1 4.8 2 7 7 0 0 1-2.8 11.5 4 4 0 0 1-7.5.8 4 4 0 0 1-7.5-.8A7 7 0 0 1 1.2 7.5a7 7 0 0 1 4.8-2 7 7 0 0 1 2.5.6A4 4 0 0 1 12 4z" />
              <circle cx="9" cy="12" r="1" fill="currentColor" />
              <circle cx="15" cy="12" r="1" fill="currentColor" />
              <path d="M9 15.5a3.5 3.5 0 0 0 6 0" />
            </svg>
            <span v-if="!sidebarCollapsed">{{ group.label }}</span>
          </button>
        </div>
      </nav>

      <!-- Collapse toggle (desktop) -->
      <div class="hidden border-t border-slate-200/80 p-3 dark:border-slate-800 lg:block">
        <button
          type="button"
          class="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          @click="sidebarCollapsed = !sidebarCollapsed"
        >
          <svg class="h-5 w-5 transition-transform duration-300" :class="sidebarCollapsed ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
          <span v-if="!sidebarCollapsed">Collapse</span>
        </button>
      </div>
    </aside>

    <!-- ═══ MAIN WRAPPER ═══ -->
    <div
      class="flex min-h-dvh flex-col transition-all duration-300"
      :class="sidebarCollapsed ? 'lg:pl-[72px]' : 'lg:pl-64'"
    >
      <!-- ═══ TOP NAVBAR ═══ -->
      <header
        v-motion
        :initial="{ y: -16, opacity: 0 }"
        :enter="{ y: 0, opacity: 1, transition: { duration: 400, delay: 100 } }"
        class="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200/80 bg-white/80 px-4 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80 sm:px-6"
      >
        <!-- Mobile menu button -->
        <button
          type="button"
          class="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 lg:hidden dark:hover:bg-slate-800 dark:hover:text-slate-100"
          aria-label="Toggle sidebar"
          @click="toggleSidebar"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <!-- Search bar -->
        <div class="relative flex-1 max-w-xl">
          <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Search transactions, users..."
            class="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm outline-none transition focus:border-stellar-400 focus:ring-2 focus:ring-stellar-400/20 dark:border-slate-700 dark:bg-slate-800 dark:focus:border-stellar-500"
          />
        </div>

        <!-- Right actions -->
        <div class="flex items-center gap-2 sm:gap-3">
          <!-- Theme toggle -->
          <button
            type="button"
            class="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-stellar-600 dark:hover:bg-slate-800 dark:hover:text-stellar-300"
            :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
            @click="toggleTheme"
          >
            <svg v-if="isDark" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>

          <!-- Notifications -->
          <div ref="notificationsRef" class="relative">
            <button
              type="button"
              class="relative rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              aria-label="Notifications"
              @click.stop="notificationsOpen = !notificationsOpen"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span class="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
            </button>

            <Transition
              enter-active-class="transition duration-200 ease-out"
              leave-active-class="transition duration-150 ease-in"
              enter-from-class="opacity-0 scale-95 -translate-y-1"
              leave-to-class="opacity-0 scale-95 -translate-y-1"
            >
              <div
                v-if="notificationsOpen"
                class="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-800"
              >
                <p class="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Notifications</p>
                <div
                  v-for="n in notifications"
                  :key="n.id"
                  class="cursor-pointer rounded-xl px-3 py-2.5 transition hover:bg-slate-50 dark:hover:bg-slate-700/50"
                >
                  <p class="text-sm font-medium">{{ n.title }}</p>
                  <p class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{{ n.body }}</p>
                  <p class="mt-1 text-xs text-slate-400">{{ n.time }} ago</p>
                </div>
              </div>
            </Transition>
          </div>

          <!-- Profile menu -->
          <div ref="profileRef" class="relative">
            <button
              type="button"
              class="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-slate-100 dark:hover:bg-slate-800"
              @click.stop="profileOpen = !profileOpen"
            >
              <div class="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-stellar-500 to-cosmic-600 text-xs font-bold text-white shadow-sm">
                {{ userInitials }}
              </div>
              <span class="hidden text-sm font-medium sm:block">{{ userName }}</span>
              <svg class="hidden h-4 w-4 text-slate-400 sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <Transition
              enter-active-class="transition duration-200 ease-out"
              leave-active-class="transition duration-150 ease-in"
              enter-from-class="opacity-0 scale-95 -translate-y-1"
              leave-to-class="opacity-0 scale-95 -translate-y-1"
            >
              <div
                v-if="profileOpen"
                class="absolute right-0 mt-2 w-52 rounded-2xl border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800"
              >
                <div class="border-b border-slate-100 px-4 py-3 dark:border-slate-700">
                  <p class="text-sm font-semibold">{{ userName }}</p>
                  <p class="text-xs text-slate-500">admin@estelar.com</p>
                </div>
                <button type="button" class="w-full px-4 py-2 text-left text-sm transition hover:bg-slate-50 dark:hover:bg-slate-700/50" @click="goToProfile">Profile</button>
                <button type="button" class="w-full px-4 py-2 text-left text-sm transition hover:bg-slate-50 dark:hover:bg-slate-700/50">Settings</button>
                <button
                  type="button"
                  class="w-full px-4 py-2 text-left text-sm text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                  @click="authStore.logout()"
                >
                  Sign out
                </button>
              </div>
            </Transition>
          </div>
        </div>
      </header>

      <!-- ═══ DASHBOARD CONTENT ═══ -->
      <main class="flex-1 p-4 sm:p-6">
        <div v-if="activeNav === 'dashboard'" v-motion :initial="{ opacity: 0, y: 8 }" :enter="{ opacity: 1, y: 0, transition: { duration: 350 } }">
          <!-- Page heading -->
          <div
            v-motion
            :initial="{ opacity: 0, y: 12 }"
            :enter="{ opacity: 1, y: 0, transition: { duration: 400, delay: 150 } }"
            class="mb-6"
          >
            <h1 class="font-display text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h1>
            <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Tu negocio avanza con cada decisión que tomas. Esto es lo que importa hoy.</p>
          </div>





          <!-- Top Products card -->
          <div
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { duration: 400, delay: 500 } }"
            class="mb-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div class="mb-5 flex items-center justify-between">
              <div>
                <h2 class="font-display text-lg font-semibold">Productos más registrados</h2>
                <p class="text-sm text-slate-500 dark:text-slate-400">
                  Los productos que más aparecen en tus movimientos
                </p>
              </div>
              <div v-if="mostRepeatedProduct" class="rounded-xl bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
                {{ mostRepeatedProduct.count }} registros
              </div>
            </div>

            <div v-if="productEntryStore.isLoading" class="flex items-center justify-center py-8">
              <svg class="h-6 w-6 animate-spin text-slate-400" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>

            <div v-else-if="topProducts.length === 0" class="py-8 text-center text-sm text-slate-400">
              Aún no hay movimientos registrados.
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="(p, i) in topProducts"
                :key="p.name"
                class="flex items-center gap-4 rounded-xl bg-slate-50 px-4 py-3 transition hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800"
              >
                <div
                  class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold"
                  :class="i === 0
                    ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'
                    : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'"
                >
                  {{ i + 1 }}
                </div>
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                    {{ p.name }}
                  </p>
                  <p class="text-xs text-slate-400">
                    {{ p.count }} registro{{ p.count !== 1 ? 's' : '' }}
                    <span v-if="p.price > 0" class="ml-2">
                      · Precio sugerido: ${{ p.price.toLocaleString('es-CO') }}
                    </span>
                  </p>
                </div>
                <div class="shrink-0 text-right">
                  <div class="h-2 w-24 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <div
                      class="h-full rounded-full bg-gradient-to-r from-stellar-500 to-cosmic-500"
                      :style="{ width: (p.count / mostRepeatedProduct.count) * 100 + '%' }"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div v-if="mostRepeatedProduct" class="mt-4 rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 dark:border-violet-500/20 dark:bg-violet-500/10">
              <p class="text-xs font-medium text-violet-600 dark:text-violet-400">
                Más repetido:
                <span class="font-semibold">{{ mostRepeatedProduct.name }}</span>
                · Precio más alto: ${{ mostRepeatedProduct.price.toLocaleString('es-CO') }}
              </p>
            </div>
          </div>

          <!-- Shipment/Exit analysis card -->
          <div
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { duration: 400, delay: 550 } }"
            class="mb-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div class="mb-5">
              <h2 class="font-display text-lg font-semibold">Salidas de productos</h2>
              <p class="text-sm text-slate-500 dark:text-slate-400">
                {{ totalExits }} producto{{ totalExits !== 1 ? 's' : '' }} despachado{{ totalExits !== 1 ? 's' : '' }}
              </p>
            </div>

            <div v-if="shipmentStore.isLoading" class="flex items-center justify-center py-8">
              <svg class="h-6 w-6 animate-spin text-slate-400" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>

            <div v-else-if="topExitProducts.length === 0" class="py-8 text-center text-sm text-slate-400">
              Aún no hay salidas registradas.
            </div>

            <template v-else>
              <!-- Level 1: Executive Summary + Product Leader side by side -->
              <div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div class="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
                  <p class="text-xs font-medium text-slate-400">Despachos</p>
                  <p class="mt-1 text-2xl font-bold text-slate-800 dark:text-slate-200">{{ totalExits }}</p>
                </div>
                <div class="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
                  <p class="text-xs font-medium text-slate-400">Valor promedio</p>
                  <p class="mt-1 text-2xl font-bold text-slate-800 dark:text-slate-200">
                    ${{ averageExitPrice.toLocaleString('es-CO') }}
                  </p>
                </div>
                <div class="rounded-xl bg-amber-50 p-4 dark:bg-amber-500/10">
                  <p class="flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                    <span>Más sale</span>
                    <span class="text-xs">🏆</span>
                  </p>
                  <p class="mt-1 truncate text-lg font-bold text-slate-800 dark:text-slate-200">
                    {{ mostExitedProduct?.name ?? '—' }}
                  </p>
                  <p class="text-xs text-amber-600 dark:text-amber-400">
                    {{ mostExitedProduct?.count ?? 0 }} salida{{ mostExitedProduct?.count !== 1 ? 's' : '' }}
                    · {{ topExitProducts[0]?.percentage ?? 0 }}%
                  </p>
                </div>
              </div>

              <!-- Level 2: Compact ranking (Spotify-style) -->
              <div class="mb-6">
                <p class="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Ranking de productos</p>
                <div class="space-y-1">
                  <div
                    v-for="(p, i) in topExitProducts"
                    :key="p.name"
                    class="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <span class="w-5 text-right text-xs font-bold" :class="i === 0 ? 'text-amber-500' : 'text-slate-400'">{{ i + 1 }}</span>
                    <div class="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                      <div
                        class="h-full rounded-full transition-all"
                        :class="i === 0
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                          : 'bg-gradient-to-r from-rose-400 to-pink-400'"
                        :style="{ width: p.percentage + '%' }"
                      />
                    </div>
                    <span class="w-28 truncate text-sm font-medium text-slate-700 dark:text-slate-300 sm:w-48">{{ p.name }}</span>
                    <span class="hidden text-xs text-slate-400 sm:inline">{{ p.averagePrice.toLocaleString('es-CO') }}</span>
                    <span class="w-12 text-right text-xs font-semibold text-slate-500">{{ p.percentage }}%</span>
                  </div>
                </div>
              </div>

              <!-- Level 3: Activity by date -->
              <div v-if="exitDates.length > 0">
                <p class="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  Actividad reciente
                </p>
                <div class="space-y-1.5">
                  <div
                    v-for="d in exitDates.slice(0, 5)"
                    :key="d.date"
                    class="flex items-center gap-3 rounded-xl px-3 py-2"
                  >
                    <span class="w-24 text-xs font-medium text-slate-600 dark:text-slate-400">
                      {{ new Date(d.date).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }) }}
                    </span>
                    <div class="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                      <div
                        class="h-full rounded-full bg-gradient-to-r from-rose-400 to-rose-500"
                        :style="{ width: (d.count / exitDates[0].count) * 100 + '%' }"
                      />
                    </div>
                    <span class="w-8 text-right text-xs font-medium text-slate-500">{{ d.count }}</span>
                  </div>
                </div>
              </div>
            </template>
          </div>

          <!-- Pie chart placeholder -->
          <div
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { duration: 400, delay: 600 } }"
            class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <h2 class="font-display text-lg font-semibold">Distribution</h2>
            <p class="mb-6 text-sm text-slate-500 dark:text-slate-400">Revenue by category</p>
            <div class="flex flex-col items-center gap-6">
              <svg viewBox="0 0 120 120" class="h-40 w-40" aria-hidden="true">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#e2e8f0" stroke-width="20" class="dark:stroke-slate-700" />
                <circle cx="60" cy="60" r="50" fill="none" stroke="#8b5cf6" stroke-width="20" stroke-dasharray="94.25 220" stroke-dashoffset="0" transform="rotate(-90 60 60)" />
                <circle cx="60" cy="60" r="50" fill="none" stroke="#6366f1" stroke-width="20" stroke-dasharray="62.83 220" stroke-dashoffset="-94.25" transform="rotate(-90 60 60)" />
                <circle cx="60" cy="60" r="50" fill="none" stroke="#ec4899" stroke-width="20" stroke-dasharray="47.12 220" stroke-dashoffset="-157.08" transform="rotate(-90 60 60)" />
                <circle cx="60" cy="60" r="50" fill="none" stroke="#38bdf8" stroke-width="20" stroke-dasharray="31.42 220" stroke-dashoffset="-204.2" transform="rotate(-90 60 60)" />
              </svg>
              <div class="w-full space-y-2">
                <div class="flex items-center justify-between text-sm">
                  <span class="flex items-center gap-2"><span class="h-2.5 w-2.5 rounded-full bg-stellar-500" /> Products</span>
                  <span class="font-medium">42%</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="flex items-center gap-2"><span class="h-2.5 w-2.5 rounded-full bg-cosmic-500" /> Services</span>
                  <span class="font-medium">28%</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="flex items-center gap-2"><span class="h-2.5 w-2.5 rounded-full bg-nebula-pink" /> Subscriptions</span>
                  <span class="font-medium">18%</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="flex items-center gap-2"><span class="h-2.5 w-2.5 rounded-full bg-nebula-blue" /> Other</span>
                  <span class="font-medium">12%</span>
                </div>
              </div>
            </div>
          </div>

        <!-- Table + Activity row -->
        <div class="grid grid-cols-1 gap-4 xl:grid-cols-3 sm:gap-6">
          <!-- Recent transactions table -->
          <div
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { duration: 400, delay: 700 } }"
            class="rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 xl:col-span-2"
          >
            <div class="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800">
              <div>
                <h2 class="font-display text-lg font-semibold">Recent Transactions</h2>
                <p class="text-sm text-slate-500 dark:text-slate-400">Latest payment activity</p>
              </div>
              <button type="button" class="rounded-xl bg-stellar-500/10 px-4 py-2 text-sm font-medium text-stellar-600 transition hover:bg-stellar-500/20 dark:text-stellar-300">
                View all
              </button>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left text-sm">
                <thead>
                  <tr class="border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:border-slate-800">
                    <th class="px-6 py-3">ID</th>
                    <th class="px-6 py-3">Customer</th>
                    <th class="px-6 py-3 hidden md:table-cell">Amount</th>
                    <th class="px-6 py-3">Status</th>
                    <th class="px-6 py-3 hidden sm:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="tx in paginatedTransactions"
                    :key="tx.id"
                    class="border-b border-slate-50 transition hover:bg-slate-50/80 dark:border-slate-800/50 dark:hover:bg-slate-800/30"
                  >
                    <td class="px-6 py-4 font-mono text-xs text-slate-500">{{ tx.id }}</td>
                    <td class="px-6 py-4">
                      <p class="font-medium">{{ tx.customer }}</p>
                      <p class="text-xs text-slate-400">{{ tx.email }}</p>
                    </td>
                    <td class="hidden px-6 py-4 font-medium md:table-cell">{{ tx.amount }}</td>
                    <td class="px-6 py-4">
                      <span class="inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold capitalize" :class="statusStyles[tx.status]">
                        {{ tx.status }}
                      </span>
                    </td>
                    <td class="hidden px-6 py-4 text-slate-500 sm:table-cell">{{ tx.date }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <div class="flex items-center justify-between border-t border-slate-100 px-6 py-4 dark:border-slate-800">
              <p class="text-sm text-slate-500">
                Page {{ currentPage }} of {{ totalPages }}
              </p>
              <div class="flex gap-2">
                <button
                  type="button"
                  class="rounded-xl border border-slate-200 px-3 py-1.5 text-sm transition hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
                  :disabled="currentPage === 1"
                  @click="goToPage(currentPage - 1)"
                >
                  Previous
                </button>
                <button
                  v-for="page in totalPages"
                  :key="page"
                  type="button"
                  class="rounded-xl px-3 py-1.5 text-sm font-medium transition"
                  :class="currentPage === page
                    ? 'bg-stellar-500 text-white shadow-sm'
                    : 'border border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800'"
                  @click="goToPage(page)"
                >
                  {{ page }}
                </button>
                <button
                  type="button"
                  class="rounded-xl border border-slate-200 px-3 py-1.5 text-sm transition hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
                  :disabled="currentPage === totalPages"
                  @click="goToPage(currentPage + 1)"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          <!-- Activity feed -->
          <div
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { duration: 400, delay: 800 } }"
            class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div class="mb-6 flex items-center justify-between">
              <div>
                <h2 class="font-display text-lg font-semibold">Recent Activity</h2>
                <p class="text-sm text-slate-500 dark:text-slate-400">System events & alerts</p>
              </div>
              <span class="rounded-lg bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600 dark:bg-red-500/15 dark:text-red-400">Live</span>
            </div>

            <div class="space-y-4">
              <div
                v-for="(activity, index) in activities"
                :key="activity.id"
                v-motion
                :initial="{ opacity: 0, x: 12 }"
                :enter="{ opacity: 1, x: 0, transition: { duration: 300, delay: 900 + index * 60 } }"
                class="flex gap-3"
              >
                <div class="relative flex flex-col items-center">
                  <span class="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" :class="actionDot[activity.type.toUpperCase()] || 'bg-slate-400'" />
                  <span v-if="index < activities.length - 1" class="mt-1 w-px flex-1 bg-slate-200 dark:bg-slate-700" />
                </div>
                <div class="pb-4">
                  <p class="text-sm leading-snug">{{ activity.message }}</p>
                  <p class="mt-1 text-xs text-slate-400">{{ activity.time }}</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              class="mt-2 w-full rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              View all activity
            </button>
          </div>
        </div>
      </div> <!-- end dashboard view -->

      <!-- Profile view -->
      <div
        v-else-if="activeNav === 'profile'"
        v-motion
        :initial="{ opacity: 0, y: 8 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 350 } }"
      >
        <UserProfile />
      </div>

      <!-- Register product view -->
      <div
        v-else-if="activeNav === 'register-product'"
        v-motion
        :initial="{ opacity: 0, y: 8 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 350 } }"
      >
        <ProductRegistrationForm @saved="activeNav = 'register-product'" @go-to-product-list="activeNav = 'products'" @go-to-register-winery="activeNav = 'register-winery'" />
      </div>

      <!-- Providers list view -->
      <div v-else-if="activeNav === 'providers'">
        <ProviderList @go-to-register-provider="activeNav = 'register-provider'" />
      </div>

      <!-- Register provider view -->
      <div
        v-else-if="activeNav === 'register-provider'"
        v-motion
        :initial="{ opacity: 0, y: 8 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 350 } }"
      >
        <ProviderRegistrationForm @saved="activeNav = 'register-provider'" />
      </div>

      <!-- Register winery view -->
      <div
        v-else-if="activeNav === 'register-winery'"
        v-motion
        :initial="{ opacity: 0, y: 8 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 350 } }"
      >
        <WineryRegistrationForm @saved="activeNav = 'register-winery'" />
      </div>

      <!-- Register product entry view -->
      <div
        v-else-if="activeNav === 'register-product-entry'"
        v-motion
        :initial="{ opacity: 0, y: 8 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 350 } }"
      >
        <ProductEntryForm @saved="activeNav = 'register-product-entry'" @go-to-company="showRegistrationForm = true" @go-to-product-registration="activeNav = 'register-product'" />
      </div>

      <!-- Product entries list view -->
      <div v-else-if="activeNav === 'product-entries'">
        <ProductEntryList />
      </div>

      <!-- Products list view -->
      <div v-else-if="activeNav === 'products'">
        <ProductList @go-to-register-product="activeNav = 'register-product'" />
      </div>

      <!-- Register order view -->
      <div
        v-else-if="activeNav === 'register-order'"
        v-motion
        :initial="{ opacity: 0, y: 8 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 350 } }"
      >
        <OrderForm @saved="activeNav = 'register-order'" @go-to-provider-registration="activeNav = 'register-provider'" />
      </div>

      <!-- Orders list view -->
      <div v-else-if="activeNav === 'orders'">
        <OrderList />
      </div>

      <!-- Shipments list view -->
      <div v-else-if="activeNav === 'shipments'">
        <ShipmentList />
      </div>

      <!-- Register shipment view -->
      <div
        v-else-if="activeNav === 'register-shipment'"
        v-motion
        :initial="{ opacity: 0, y: 8 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 350 } }"
      >
        <ShipmentForm @saved="activeNav = 'register-shipment'" @go-to-product-registration="activeNav = 'register-product'" @go-to-provider-registration="activeNav = 'register-provider'" />
      </div>

      <!-- Sales view -->
      <div
        v-else-if="activeNav === 'sales'"
        v-motion
        :initial="{ opacity: 0, y: 8 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 350 } }"
      >
        <SalesPage />
      </div>

      <!-- Historial Paulu view -->
      <div
        v-else-if="activeNav === 'history-project'"
        v-motion
        :initial="{ opacity: 0, y: 8 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 350 } }"
      >
        <div class="mb-6">
          <h1 class="font-display text-2xl font-bold tracking-tight sm:text-3xl">Historial Paulu</h1>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Explora el historial completo de todas las actividades del proyecto.</p>
        </div>
        <HistoryTimeline
          :entries="historyStore.entries"
          :is-loading="historyStore.isLoading"
          title="Historial del Proyecto"
        />
      </div>

      <!-- Historial inventarios view -->
      <div
        v-else-if="activeNav === 'history-inventory'"
        v-motion
        :initial="{ opacity: 0, y: 8 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 350 } }"
      >
        <div class="mb-6">
          <h1 class="font-display text-2xl font-bold tracking-tight sm:text-3xl">Historial de Inventario</h1>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Cada orden y salida deja una huella. Explora el flujo completo de tu inventario.</p>
        </div>
        <HistoryTimeline
          :entries="inventoryHistoryEntries"
          :is-loading="historyStore.isLoading"
          title="Historial de Actividad"
        />
      </div>

      <!-- AI Models view -->
      <div
        v-else-if="activeNav === 'ai-models'"
        v-motion
        :initial="{ opacity: 0, y: 8 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 350 } }"
      >
        <AIModelsPanel />
      </div>
      </main>
    </div>
  </div>

  <!-- Company onboarding modal -->
  <OnboardingModal
    v-if="showOnboarding && !loadingCompany"
    :user-name="userName"
    @proceed="handleOnboardingProceed"
    @dismiss="handleOnboardingDismiss"
  />

  <!-- Company selection modal -->
  <CompanySelectionModal
    v-if="showCompanySelection && !loadingCompany"
    :companies="companyStore.companies"
    :user-name="userName"
    @select="handleCompanySelect"
    @register="handleSelectionRegister"
  />

  <!-- Company registration form overlay -->
  <Teleport v-if="showRegistrationForm" to="body">
    <div
      v-motion
      :initial="{ opacity: 0 }"
      :enter="{ opacity: 1 }"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
    >
      <div
        v-motion
        :initial="{ opacity: 0, scale: 0.95, y: 16 }"
        :enter="{ opacity: 1, scale: 1, y: 0, transition: { duration: 350 } }"
        class="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-[#0d0a28] p-6 shadow-2xl"
      >
        <button
          type="button"
          class="absolute right-4 top-4 rounded-lg p-1 text-white/40 transition hover:bg-white/10 hover:text-white/80"
          @click="showRegistrationForm = false"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <CompanyRegistrationForm @created="handleCompanyCreated" @cancel="showRegistrationForm = false" />
      </div>
    </div>
  </Teleport>
</template>
