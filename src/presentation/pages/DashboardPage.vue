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
import ProviderRegistrationForm from '@/presentation/components/providers/ProviderRegistrationForm.vue'
import ProductEntryForm from '@/presentation/components/productEntries/ProductEntryForm.vue'
import ProductEntryList from '@/presentation/components/productEntries/ProductEntryList.vue'
import ProductList from '@/presentation/components/products/ProductList.vue'
import WineryRegistrationForm from '@/presentation/components/wineries/WineryRegistrationForm.vue'
import OrderForm from '@/presentation/components/orders/OrderForm.vue'
import OrderList from '@/presentation/components/orders/OrderList.vue'
import ShipmentForm from '@/presentation/components/shipments/ShipmentForm.vue'
import ShipmentList from '@/presentation/components/shipments/ShipmentList.vue'

// ─── Theme ───────────────────────────────────────────────────────────────────
const isDark = ref(false)

function applyTheme(dark: boolean): void {
  document.documentElement.classList.toggle('dark', dark)
  localStorage.setItem('dashboard-theme', dark ? 'dark' : 'light')
}

function toggleTheme(): void {
  isDark.value = !isDark.value
}

watch(isDark, applyTheme)

onMounted(() => {
  const stored = localStorage.getItem('dashboard-theme')
  isDark.value = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches
})

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

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'grid' },
  { id: 'analytics', label: 'Analytics', icon: 'chart' },
  { id: 'users', label: 'Users', icon: 'users' },
  { id: 'transactions', label: 'Transactions', icon: 'wallet' },
  { id: 'profile', label: 'Profile', icon: 'profile' },
  { id: 'products', label: 'Productos', icon: 'list' },
  { id: 'register-product', label: 'Registrar productos', icon: 'package' },
  { id: 'register-provider', label: 'Registrar proveedores', icon: 'truck' },
  { id: 'register-product-entry', label: 'Registrar entradas', icon: 'inbox' },
  { id: 'register-winery', label: 'Registrar bodega', icon: 'warehouse' },
  { id: 'product-entries', label: 'Entradas', icon: 'clipboard' },
  { id: 'register-order', label: 'Registrar orden', icon: 'inbox' },
  { id: 'orders', label: 'Órdenes', icon: 'clipboard' },
  { id: 'shipments', label: 'Salidas', icon: 'export' },
  { id: 'register-shipment', label: 'Registrar salida', icon: 'plus' },
]

// ─── Stat cards ──────────────────────────────────────────────────────────────
const statCards = [
  {
    title: 'Revenue',
    value: '$48,352',
    change: '+12.5%',
    positive: true,
    icon: 'dollar',
    color: 'from-stellar-500 to-cosmic-600',
  },
  {
    title: 'Users',
    value: '2,847',
    change: '+8.2%',
    positive: true,
    icon: 'users',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    title: 'Conversion Rate',
    value: '3.24%',
    change: '-1.4%',
    positive: false,
    icon: 'target',
    color: 'from-amber-500 to-orange-600',
  },
  {
    title: 'Tasks',
    value: '156',
    change: '+24',
    positive: true,
    icon: 'check',
    color: 'from-nebula-pink to-rose-600',
  },
]

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

// ─── Activity feed ───────────────────────────────────────────────────────────
const activities = [
  { id: 1, type: 'success', message: 'New user registration: Ana López', time: '2 min ago' },
  { id: 2, type: 'warning', message: 'Server load above 80% threshold', time: '15 min ago' },
  { id: 3, type: 'info', message: 'Monthly report generated successfully', time: '1 hour ago' },
  { id: 4, type: 'success', message: 'Payment of $2,150.00 received', time: '2 hours ago' },
  { id: 5, type: 'error', message: 'Failed transaction TXN-004 flagged', time: '3 hours ago' },
]

const activityDot: Record<string, string> = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  info: 'bg-blue-500',
  error: 'bg-red-500',
}

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

      <!-- Nav links -->
      <nav class="flex-1 space-y-1 overflow-y-auto p-3">
        <button
          v-for="item in navItems"
          :key="item.id"
          type="button"
          class="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200"
          :class="[
            activeNav === item.id
              ? 'bg-stellar-500/10 text-stellar-600 shadow-sm dark:bg-stellar-500/20 dark:text-stellar-300'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100',
            sidebarCollapsed ? 'justify-center' : '',
          ]"
          :title="sidebarCollapsed ? item.label : undefined"
          @click="activeNav = item.id; closeMobileSidebar()"
        >
          <!-- Grid icon -->
          <svg v-if="item.icon === 'grid'" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          <!-- Chart icon -->
          <svg v-else-if="item.icon === 'chart'" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <!-- Users icon -->
          <svg v-else-if="item.icon === 'users'" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <!-- Wallet icon -->
          <svg v-else-if="item.icon === 'wallet'" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <!-- Profile icon -->
          <svg v-else-if="item.icon === 'profile'" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <!-- Package icon -->
          <svg v-else-if="item.icon === 'package'" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <svg v-else-if="item.icon === 'truck'" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
            <circle cx="9" cy="16" r="2" />
            <circle cx="15" cy="16" r="2" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 12v-2a2 2 0 00-2-2H9a2 2 0 00-2 2v2" />
          </svg>
          <svg v-else-if="item.icon === 'inbox'" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <svg v-else-if="item.icon === 'clipboard'" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <svg v-else-if="item.icon === 'list'" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <svg v-else-if="item.icon === 'warehouse'" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 21V7l9-4 9 4v14M9 17h6v4H9zm0-6h6" />
          </svg>
          <svg v-else-if="item.icon === 'export'" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
          </svg>
          <svg v-else-if="item.icon === 'plus'" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <svg v-else class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span v-if="!sidebarCollapsed">{{ item.label }}</span>
        </button>
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
            <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Welcome back! Here's what's happening today.</p>
          </div>

          <!-- Stat cards grid -->
          <div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 sm:gap-6">
            <div
              v-for="(card, index) in statCards"
              :key="card.title"
              v-motion
              :initial="{ opacity: 0, y: 20 }"
              :enter="{ opacity: 1, y: 0, transition: { duration: 400, delay: 200 + index * 80 } }"
              class="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <div class="flex items-start justify-between">
                <div>
                  <p class="text-sm font-medium text-slate-500 dark:text-slate-400">{{ card.title }}</p>
                  <p class="mt-2 text-2xl font-bold tracking-tight">{{ card.value }}</p>
                </div>
                <div
                  class="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm transition group-hover:scale-105"
                  :class="card.color"
                >
                  <!-- Dollar -->
                  <svg v-if="card.icon === 'dollar'" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <!-- Users -->
                  <svg v-else-if="card.icon === 'users'" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <!-- Target -->
                  <svg v-else-if="card.icon === 'target'" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <!-- Check -->
                  <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
              </div>
              <div class="mt-4 flex items-center gap-1.5">
                <span
                  class="inline-flex items-center gap-0.5 rounded-lg px-2 py-0.5 text-xs font-semibold"
                  :class="card.positive
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400'"
                >
                  <svg v-if="card.positive" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  <svg v-else class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  {{ card.change }}
                </span>
                <span class="text-xs text-slate-400">vs last month</span>
              </div>
            </div>
          </div>

        <!-- Charts row -->
        <div class="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3 sm:gap-6">
          <!-- Line chart placeholder -->
          <div
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { duration: 400, delay: 500 } }"
            class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2"
          >
            <div class="mb-6 flex items-center justify-between">
              <div>
                <h2 class="font-display text-lg font-semibold">Revenue Trend</h2>
                <p class="text-sm text-slate-500 dark:text-slate-400">Last 12 months performance</p>
              </div>
              <select class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm outline-none dark:border-slate-700 dark:bg-slate-800">
                <option>2026</option>
                <option>2025</option>
              </select>
            </div>
            <!-- SVG line chart -->
            <div class="relative h-56 w-full">
              <svg viewBox="0 0 600 200" class="h-full w-full" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.3" />
                    <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0" />
                  </linearGradient>
                </defs>
                <!-- Grid lines -->
                <line x1="0" y1="40" x2="600" y2="40" stroke="currentColor" class="text-slate-200 dark:text-slate-700" stroke-width="1" />
                <line x1="0" y1="80" x2="600" y2="80" stroke="currentColor" class="text-slate-200 dark:text-slate-700" stroke-width="1" />
                <line x1="0" y1="120" x2="600" y2="120" stroke="currentColor" class="text-slate-200 dark:text-slate-700" stroke-width="1" />
                <line x1="0" y1="160" x2="600" y2="160" stroke="currentColor" class="text-slate-200 dark:text-slate-700" stroke-width="1" />
                <!-- Area fill -->
                <path d="M0,160 L50,140 L100,120 L150,130 L200,90 L250,100 L300,60 L350,70 L400,40 L450,55 L500,30 L550,45 L600,20 L600,200 L0,200 Z" fill="url(#lineGrad)" />
                <!-- Line -->
                <path d="M0,160 L50,140 L100,120 L150,130 L200,90 L250,100 L300,60 L350,70 L400,40 L450,55 L500,30 L550,45 L600,20" fill="none" stroke="#8b5cf6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
                <!-- Dots -->
                <circle cx="300" cy="60" r="5" fill="#8b5cf6" stroke="white" stroke-width="2" class="dark:stroke-slate-900" />
                <circle cx="500" cy="30" r="5" fill="#8b5cf6" stroke="white" stroke-width="2" class="dark:stroke-slate-900" />
              </svg>
              <div class="mt-2 flex justify-between text-xs text-slate-400">
                <span>Jan</span><span>Mar</span><span>May</span><span>Jul</span><span>Sep</span><span>Nov</span>
              </div>
            </div>
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
                  <span class="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" :class="activityDot[activity.type]" />
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
