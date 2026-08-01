// ─── Domain Layer ────────────────────────────────────────────────────────────
// Pure types with zero dependencies — Onion Architecture inner ring.

export type EmptyStateVariant =
  | 'empty'          // No data yet in this section
  | 'search-empty'   // Search / filter returned zero results
  | 'error'          // Generic server / application error
  | 'network-error'  // Connectivity / timeout failure
  | 'forbidden'      // Insufficient permissions

export type EmptyStateSize = 'sm' | 'md' | 'lg'

export type EmptyStateIconType =
  | 'inbox'
  | 'search'
  | 'alert-circle'
  | 'wifi-off'
  | 'lock'

export interface EmptyStateContent {
  title: string
  description: string
  /** Psychology-driven list of probable causes, written in a neutral, empathetic tone. */
  causes: string[]
  iconType: EmptyStateIconType
}

export interface EmptyStateColorScheme {
  icon: string
  iconBg: string
  title: string
  causeBullet: string
}

export interface EmptyStateAction {
  label: string
}
