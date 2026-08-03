/**
 * Parses assistant replies into text + HTML/CSS table segments (SRP).
 * Supports:
 * - HTML <table>...</table> blocks
 * - Markdown pipe tables (converted to structured HTML tables in the UI)
 */

export type AssistantContentSegment =
  | { type: 'text'; text: string }
  | { type: 'table'; headers: string[]; rows: string[][] }

export function parseAssistantContent(source: string): AssistantContentSegment[] {
  const raw = source?.trim() ?? ''
  if (!raw) return [{ type: 'text', text: '' }]

  const segments: AssistantContentSegment[] = []
  const htmlTableRegex = /<table[\s\S]*?<\/table>/gi
  let cursor = 0
  let htmlMatch: RegExpExecArray | null

  const htmlMatches: Array<{ start: number; end: number; html: string }> = []
  while ((htmlMatch = htmlTableRegex.exec(raw)) !== null) {
    htmlMatches.push({
      start: htmlMatch.index,
      end: htmlMatch.index + htmlMatch[0].length,
      html: htmlMatch[0],
    })
  }

  if (htmlMatches.length > 0) {
    for (const match of htmlMatches) {
      const before = raw.slice(cursor, match.start).trim()
      if (before) segments.push(...splitMarkdownTables(before))
      const table = parseHtmlTable(match.html)
      if (table) segments.push(table)
      else segments.push({ type: 'text', text: match.html })
      cursor = match.end
    }
    const after = raw.slice(cursor).trim()
    if (after) segments.push(...splitMarkdownTables(after))
    return segments.length ? segments : [{ type: 'text', text: raw }]
  }

  return splitMarkdownTables(raw)
}

function splitMarkdownTables(text: string): AssistantContentSegment[] {
  const lines = text.split(/\r?\n/)
  const segments: AssistantContentSegment[] = []
  let buffer: string[] = []

  const flushText = () => {
    const joined = buffer.join('\n').trim()
    if (joined) segments.push({ type: 'text', text: joined })
    buffer = []
  }

  let i = 0
  while (i < lines.length) {
    if (isMarkdownTableStart(lines, i)) {
      flushText()
      const { table, nextIndex } = readMarkdownTable(lines, i)
      if (table) segments.push(table)
      i = nextIndex
      continue
    }
    buffer.push(lines[i])
    i += 1
  }
  flushText()
  return segments.length ? segments : [{ type: 'text', text }]
}

function isMarkdownTableStart(lines: string[], index: number): boolean {
  const header = lines[index]?.trim() ?? ''
  const separator = lines[index + 1]?.trim() ?? ''
  return (
    header.includes('|') &&
    /^\|?[\s:|-]+\|[\s:|-]+/.test(separator) &&
    separator.replace(/[\s|:-]/g, '').length === 0
  )
}

function readMarkdownTable(
  lines: string[],
  start: number,
): { table: AssistantContentSegment | null; nextIndex: number } {
  const headerCells = splitMarkdownRow(lines[start] ?? '')
  const rows: string[][] = []
  let i = start + 2
  while (i < lines.length) {
    const line = lines[i]?.trim() ?? ''
    if (!line.includes('|') || /^```/.test(line)) break
    rows.push(splitMarkdownRow(line))
    i += 1
  }
  if (!headerCells.length) return { table: null, nextIndex: start + 1 }
  return {
    table: { type: 'table', headers: headerCells, rows },
    nextIndex: i,
  }
}

function splitMarkdownRow(line: string): string[] {
  const trimmed = line.trim().replace(/^\|/, '').replace(/\|$/, '')
  return trimmed.split('|').map((cell) => cell.trim())
}

function parseHtmlTable(html: string): AssistantContentSegment | null {
  try {
    if (typeof DOMParser === 'undefined') return null
    const doc = new DOMParser().parseFromString(html, 'text/html')
    const table = doc.querySelector('table')
    if (!table) return null

    const headers = Array.from(table.querySelectorAll('thead th, tr th')).map((el) =>
      (el.textContent ?? '').trim(),
    )

    const bodyRows = table.querySelectorAll('tbody tr')
    const rowNodes =
      bodyRows.length > 0
        ? Array.from(bodyRows)
        : Array.from(table.querySelectorAll('tr')).filter((tr) => !tr.querySelector('th'))

    const rows = rowNodes.map((tr) =>
      Array.from(tr.querySelectorAll('td')).map((td) => (td.textContent ?? '').trim()),
    )

    const finalHeaders =
      headers.length > 0
        ? headers
        : rows[0]?.map((_, idx) => `Columna ${idx + 1}`) ?? []

    if (!finalHeaders.length && !rows.length) return null
    return { type: 'table', headers: finalHeaders, rows }
  } catch (err) {
    console.error('[stock-assistant] No se pudo parsear tabla HTML:', err)
    return null
  }
}

export function hasRenderableTable(text: string): boolean {
  return parseAssistantContent(text).some((s) => s.type === 'table')
}
