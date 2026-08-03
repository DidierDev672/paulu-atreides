/**
 * Shared @vueuse/motion presets — pure config, no Vue deps (SRP / OCP).
 * Reusable across modals, tables, and other surfaces.
 */

export type MotionVariant = Record<string, unknown>

export interface ModalMotionPreset {
  initial: MotionVariant
  enter: MotionVariant
  leave: MotionVariant
}

export interface StaggerMotionOptions {
  /** Base delay before the first item (ms). */
  baseDelayMs?: number
  /** Extra delay between consecutive items (ms). */
  stepMs?: number
  /** Per-item enter duration (ms). */
  durationMs?: number
  /** Vertical offset on enter (px). */
  y?: number
}

/** Soft fade + zoom for dialog panels. */
export const MODAL_ZOOM_FADE: ModalMotionPreset = {
  initial: { opacity: 0, scale: 0.94, y: 16 },
  enter: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 280, ease: 'easeOut' },
  },
  leave: {
    opacity: 0,
    scale: 0.96,
    y: 10,
    transition: { duration: 180, ease: 'easeIn' },
  },
}

/** Backdrop opacity transition class helpers for Vue <Transition>. */
export const MODAL_BACKDROP_TRANSITION = {
  enterActiveClass: 'transition-opacity duration-200 ease-out',
  leaveActiveClass: 'transition-opacity duration-150 ease-in',
  enterFromClass: 'opacity-0',
  leaveToClass: 'opacity-0',
} as const

const DEFAULT_STAGGER: Required<StaggerMotionOptions> = {
  baseDelayMs: 40,
  stepMs: 55,
  durationMs: 320,
  y: 8,
}

/**
 * Builds staggered enter bindings for list/table rows.
 */
export function createStaggerEnter(
  index: number,
  options: StaggerMotionOptions = {},
): { initial: MotionVariant; enter: MotionVariant } {
  const cfg = { ...DEFAULT_STAGGER, ...options }
  const delay = cfg.baseDelayMs + index * cfg.stepMs

  return {
    initial: { opacity: 0, y: cfg.y },
    enter: {
      opacity: 1,
      y: 0,
      transition: { duration: cfg.durationMs, delay, ease: 'easeOut' },
    },
  }
}
