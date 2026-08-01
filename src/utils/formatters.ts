export function formatCOP(value: number): string {
  return value.toLocaleString('es-CO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return '—'
  return (
    '$' +
    Number(value).toLocaleString('es-CO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  )
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso))
}

export function parseCOPCurrency(raw: string): number {
  const cleaned = raw.replace(/[^0-9.]/g, '')
  const n = parseFloat(cleaned)
  return isNaN(n) ? 0 : n
}
