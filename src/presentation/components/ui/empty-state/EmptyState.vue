<script setup lang="ts">
import { computed } from 'vue'
import type { EmptyStateVariant, EmptyStateSize } from './emptyState.types'
import { useEmptyState } from './useEmptyState'
import EmptyStateIcon from './atoms/EmptyStateIcon.vue'
import EmptyStateTitle from './atoms/EmptyStateTitle.vue'
import EmptyStateDescription from './atoms/EmptyStateDescription.vue'
import EmptyStateCauses from './atoms/EmptyStateCauses.vue'
import EmptyStateActions from './molecules/EmptyStateActions.vue'

/**
 * EmptyState — reusable feedback component for zero-result and error conditions.
 *
 * Variants
 *   empty          → section has no data yet
 *   search-empty   → filter / search returned 0 results
 *   error          → server / app error occurred
 *   network-error  → connectivity failure
 *   forbidden      → user lacks permission
 *
 * Every text field (title, description, causes) can be overridden via props.
 * Action buttons are opt-in; omit the labels to hide the actions row.
 * An optional default slot allows injecting extra content below the actions.
 *
 * Size        Recommended usage
 *   sm        Inside modals, sidebars, narrow cards
 *   md        Standard page sections, table-body replacements    (default)
 *   lg        Full-page / hero-level empty states
 */
const props = withDefaults(
  defineProps<{
    variant?: EmptyStateVariant
    size?: EmptyStateSize
    /** Override the auto-generated title. */
    title?: string
    /** Override the auto-generated description. */
    description?: string
    /** Override the auto-generated causes list. */
    causes?: string[]
    /** Label for the primary action button. Omit to hide the button. */
    actionLabel?: string
    /** Label for the secondary action button. Omit to hide the button. */
    secondaryActionLabel?: string
    /** Label for the destructive action button (danger styling). Omit to hide. */
    destructiveActionLabel?: string
    /** When true, causes are collapsed behind a disclosure toggle. */
    collapsibleCauses?: boolean
  }>(),
  {
    variant: 'empty',
    size: 'md',
  },
)

const emit = defineEmits<{
  /** Fired when the primary action button is clicked. */
  action: []
  /** Fired when the secondary action button is clicked. */
  'secondary-action': []
  /** Fired when the destructive action button is clicked. */
  'destructive-action': []
}>()

// ─── Presentation Layer — consumes Application composable (DIP) ──────────────
const { content, colors } = useEmptyState(() => props.variant)

const resolvedTitle = computed(() => props.title ?? content.value.title)
const resolvedDescription = computed(() => props.description ?? content.value.description)
const resolvedCauses = computed(() => props.causes ?? content.value.causes)

// ─── Responsive size classes ──────────────────────────────────────────────────
const wrapperGapMap: Record<EmptyStateSize, string> = {
  sm: 'gap-3 py-8 px-4',
  md: 'gap-4 py-12 px-6',
  lg: 'gap-6 py-16 px-8',
}

const maxWidthMap: Record<EmptyStateSize, string> = {
  sm: 'max-w-xs sm:max-w-sm',
  md: 'max-w-sm sm:max-w-md',
  lg: 'max-w-md sm:max-w-lg',
}
</script>

<template>
  <!--
    Outer shell: fills available space and centres the inner card.
    Using role="status" + aria-live so screen readers announce the state change.
  -->
  <div
    role="status"
    aria-live="polite"
    class="flex w-full items-center justify-center"
  >
    <div
      class="flex w-full flex-col items-center text-center"
      :class="[wrapperGapMap[size], maxWidthMap[size]]"
    >
      <!-- Atom: icon -->
      <EmptyStateIcon
        :icon-type="content.iconType"
        :size="size"
        :color-class="colors.icon"
        :bg-class="colors.iconBg"
      />

      <!-- Atom: title -->
      <EmptyStateTitle
        :text="resolvedTitle"
        :size="size"
        :color-class="colors.title"
      />

      <!-- Atom: description -->
      <EmptyStateDescription
        :text="resolvedDescription"
        :size="size"
      />

      <!-- Atom: causes list (hidden when empty array is passed) -->
      <EmptyStateCauses
        :causes="resolvedCauses"
        :size="size"
        :bullet-class="colors.causeBullet"
        :collapsible="collapsibleCauses"
      />

      <!-- Molecule: CTA buttons -->
      <EmptyStateActions
        :action-label="actionLabel"
        :secondary-action-label="secondaryActionLabel"
        :destructive-action-label="destructiveActionLabel"
        :size="size"
        @action="emit('action')"
        @secondary-action="emit('secondary-action')"
        @destructive-action="emit('destructive-action')"
      />

      <!-- Escape hatch: inject any extra content below the actions -->
      <slot />
    </div>
  </div>
</template>
