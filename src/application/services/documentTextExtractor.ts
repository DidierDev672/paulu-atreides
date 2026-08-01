import mammoth from 'mammoth'
import * as XLSX from 'xlsx'
import type {
  ExtractedDocumentText,
  SupportedProviderDocumentKind,
} from '@/domain/provider-document/providerDocument.types'

const EXT_MAP: Record<string, SupportedProviderDocumentKind> = {
  docx: 'docx',
  xlsx: 'xlsx',
  xls: 'xls',
}

export function resolveDocumentKind(fileName: string): SupportedProviderDocumentKind | null {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? ''
  return EXT_MAP[ext] ?? null
}

function fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
  return file.arrayBuffer()
}

async function extractDocx(buffer: ArrayBuffer): Promise<string> {
  const result = await mammoth.extractRawText({ arrayBuffer: buffer })
  return result.value.trim()
}

function extractSpreadsheet(buffer: ArrayBuffer): string {
  const workbook = XLSX.read(buffer, { type: 'array' })
  const chunks: string[] = []

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName]
    if (!sheet) continue
    const rows = XLSX.utils.sheet_to_json<(string | number | boolean | null)[]>(sheet, {
      header: 1,
      defval: '',
      raw: false,
    })
    chunks.push(`## Hoja: ${sheetName}`)
    for (const row of rows) {
      const cells = row
        .map((cell) => String(cell ?? '').trim())
        .filter((cell) => cell.length > 0)
      if (cells.length) chunks.push(cells.join(' | '))
    }
  }

  return chunks.join('\n').trim()
}

export async function extractTextFromDocument(file: File): Promise<ExtractedDocumentText> {
  const kind = resolveDocumentKind(file.name)
  if (!kind) {
    throw new Error('Formato no soportado. Usa un archivo Word (.docx) o Excel (.xlsx / .xls).')
  }

  const buffer = await fileToArrayBuffer(file)
  const text =
    kind === 'docx' ? await extractDocx(buffer) : extractSpreadsheet(buffer)

  if (!text) {
    throw new Error('El documento no contiene texto legible para analizar.')
  }

  return { fileName: file.name, kind, text }
}

/** @deprecated Prefer extractTextFromDocument */
export const extractTextFromProviderDocument = extractTextFromDocument
