import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { createStaggerEnter, type StaggerMotionOptions } from '@/presentation/motion/presets'

/**
 * Reusable stagger bindings for cascaded list/table row reveals.
 */
export function useStaggerMotion(
  index: MaybeRefOrGetter<number>,
  options: MaybeRefOrGetter<StaggerMotionOptions> = {},
) {
  const motion = computed(() => createStaggerEnter(toValue(index), toValue(options)))

  return {
    initial: computed(() => motion.value.initial),
    enter: computed(() => motion.value.enter),
  }
}
