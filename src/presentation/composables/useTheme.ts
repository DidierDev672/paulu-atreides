import { ref, watch } from 'vue'

const STORAGE_KEY = 'dashboard-theme'

const isDark = ref(false)

function applyTheme(dark: boolean): void {
  document.documentElement.classList.toggle('dark', dark)
  localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light')
}

function initTheme(): void {
  const stored = localStorage.getItem(STORAGE_KEY)
  isDark.value = stored
    ? stored === 'dark'
    : window.matchMedia('(prefers-color-scheme: dark)').matches
}

function toggleTheme(): void {
  isDark.value = !isDark.value
}

watch(isDark, applyTheme, { immediate: false })

export function useTheme() {
  return { isDark, toggleTheme, initTheme }
}
