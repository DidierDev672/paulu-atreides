// ─── Application Layer ────────────────────────────────────────────────────────
// Composable that maps each variant to psychology-informed content and colors.
// OCP: extend by adding a new variant key — no existing entry needs modification.
// SRP: this composable owns only the variant → content/color resolution concern.

import { computed, toValue } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import type {
  EmptyStateVariant,
  EmptyStateContent,
  EmptyStateColorScheme,
} from './emptyState.types'

// ─── Content Map ─────────────────────────────────────────────────────────────
// Each entry is written following key UX-psychology principles:
//   • Neutral framing  — avoid blame ("you did X wrong").
//   • Empowerment      — give the user at least one actionable step.
//   • Reassurance      — suggest the situation is temporary / fixable.
//   • Specificity      — list probable causes so the user can self-diagnose.

const CONTENT_MAP: Record<EmptyStateVariant, EmptyStateContent> = {
  empty: {
    title: 'Todavía no hay información aquí',
    description: 'Esta sección está lista para recibir sus primeros registros.',
    causes: [
      'Aún no se han creado registros en esta sección.',
      'Los datos nuevos aparecerán aquí tan pronto como los agregues.',
    ],
    iconType: 'inbox',
  },

  'search-empty': {
    title: 'No encontramos resultados',
    description:
      'Tu búsqueda no coincidió con ningún registro existente en este momento.',
    causes: [
      'Revisa que las palabras estén escritas correctamente.',
      'Intenta con términos más cortos o con sinónimos.',
      'El elemento que buscas puede haber sido eliminado o archivado.',
    ],
    iconType: 'search',
  },

  error: {
    title: 'Algo salió mal al cargar',
    description:
      'No pudimos obtener la información solicitada. No es un problema de tu parte.',
    causes: [
      'El servidor puede estar experimentando una dificultad temporal.',
      'Una operación reciente pudo haber generado un conflicto de datos.',
      'Refresca la página; si el problema persiste, contacta al soporte.',
    ],
    iconType: 'alert-circle',
  },

  'network-error': {
    title: 'Sin conexión a internet',
    description:
      'Tu dispositivo no pudo comunicarse con el servidor para obtener los datos.',
    causes: [
      'Verifica que estés conectado a Wi-Fi o a datos móviles.',
      'Tu red puede presentar una interrupción temporal.',
      'Desconéctate y vuelve a conectarte para restablecer la sesión.',
    ],
    iconType: 'wifi-off',
  },

  forbidden: {
    title: 'No tienes acceso a esta sección',
    description:
      'Tu cuenta actual no cuenta con los permisos necesarios para ver este contenido.',
    causes: [
      'Tu rol puede no incluir privilegios para esta vista.',
      'Tu sesión puede haber expirado; intenta iniciar sesión de nuevo.',
      'Contacta al administrador si crees que deberías tener acceso.',
    ],
    iconType: 'lock',
  },
}

// ─── Color Scheme Map ─────────────────────────────────────────────────────────
// Tailwind classes use the project's Dune design token palette from style.css.

const COLOR_MAP: Record<EmptyStateVariant, EmptyStateColorScheme> = {
  empty: {
    icon: 'text-dune-primary',
    iconBg: 'bg-dune-primary/10',
    title: 'text-dune-text-primary',
    causeBullet: 'text-dune-primary',
  },
  'search-empty': {
    icon: 'text-dune-status-info',
    iconBg: 'bg-dune-status-info/10',
    title: 'text-dune-text-primary',
    causeBullet: 'text-dune-status-info',
  },
  error: {
    icon: 'text-dune-status-danger',
    iconBg: 'bg-dune-status-danger/10',
    title: 'text-dune-status-danger',
    causeBullet: 'text-dune-status-danger',
  },
  'network-error': {
    icon: 'text-dune-status-warning',
    iconBg: 'bg-dune-status-warning/10',
    title: 'text-dune-text-primary',
    causeBullet: 'text-dune-status-warning',
  },
  forbidden: {
    icon: 'text-dune-text-secondary',
    iconBg: 'bg-dune-text-secondary/10',
    title: 'text-dune-text-primary',
    causeBullet: 'text-dune-text-secondary',
  },
}

// ─── Composable ───────────────────────────────────────────────────────────────
// Accepts a MaybeRefOrGetter so it works with both reactive refs and plain values.
// ISP: returns only what presentation components actually need.

export function useEmptyState(variant: MaybeRefOrGetter<EmptyStateVariant>) {
  const content = computed(() => CONTENT_MAP[toValue(variant)])
  const colors = computed(() => COLOR_MAP[toValue(variant)])
  return { content, colors }
}
