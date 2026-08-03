/**
 * Case-insensitive product search matcher (SRP).
 * Supports: partial coincidence, full-word token match, and exact full name.
 */
export function matchProductSearchQuery(productName: string, rawQuery: string): boolean {
  const haystack = productName.trim().toLowerCase()
  const query = rawQuery.trim().toLowerCase()

  if (!query) return true
  if (!haystack) return false

  // Nombre completo exacto
  if (haystack === query) return true

  // Coincidencia parcial (substring)
  if (haystack.includes(query)) return true

  // Palabra completa (token)
  const tokens = haystack.split(/[\s\-_/.,;:]+/).filter(Boolean)
  return tokens.some((token) => token === query)
}
