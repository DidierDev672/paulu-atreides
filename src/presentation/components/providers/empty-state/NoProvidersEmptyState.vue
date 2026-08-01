<script setup lang="ts">
/**
 * Feature organism: empty state when the system has zero registered providers.
 * Composes the shared EmptyState atoms/molecules (Atomic Design) and owns only
 * the persuasive copy + CTA contract for this vertical slice.
 *
 * Psychology applied:
 *  - Opportunity framing  → absence presented as a starting point, not a failure.
 *  - Loss aversion        → subtly shows what is missing without a supplier network.
 *  - Clear next step      → one primary CTA reduces decision friction.
 */
import { EmptyState } from '@/presentation/components/ui/empty-state'

const emit = defineEmits<{
  register: []
}>()

const TITLE = 'Tu red de proveedores empieza aquí'
const DESCRIPTION =
  'Aún no hay proveedores registrados. Crear el primero te permite asociar productos a su origen, llevar un inventario más claro y negociar con más control.'

const CAUSES = [
  'Sin proveedores, tus productos quedan sin origen trazable.',
  'Registrarlos hoy te ahorra tiempo cuando armes pedidos o entradas.',
  'Solo toma un momento: ve a Registrar proveedor y completa los datos básicos.',
]
</script>

<template>
  <EmptyState
    variant="empty"
    size="md"
    :title="TITLE"
    :description="DESCRIPTION"
    :causes="CAUSES"
    action-label="Registrar mi primer proveedor"
    @action="emit('register')"
  />
</template>
