export function useFormatters() {
  const formatCurrency = (value: number | null | undefined): string => {
    if (value == null) return '—'
    return '$' + Number(value).toLocaleString('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
  }

  const formatDate = (value: string | null | undefined): string => {
    if (!value) return '—'
    return new Intl.DateTimeFormat('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(value))
  }

  return { formatCurrency, formatDate }
}
