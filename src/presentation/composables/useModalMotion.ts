import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { MODAL_BACKDROP_TRANSITION, MODAL_ZOOM_FADE, type ModalMotionPreset } from '@/presentation/motion/presets'

export interface UseModalMotionOptions {
  /** Override default zoom-fade preset. */
  preset?: MaybeRefOrGetter<ModalMotionPreset>
}

/**
 * Reusable modal motion bindings for @vueuse/motion (DIP: consumers depend on this API).
 * Pair with Vue <Transition> on the overlay so leave animations can finish.
 */
export function useModalMotion(options: UseModalMotionOptions = {}) {
  const preset = computed(() => toValue(options.preset) ?? MODAL_ZOOM_FADE)

  const panelMotion = computed(() => ({
    initial: preset.value.initial,
    enter: preset.value.enter,
    leave: preset.value.leave,
  }))

  const backdropTransition = MODAL_BACKDROP_TRANSITION

  return {
    panelMotion,
    backdropTransition,
  }
}
