/**
 * Export utilities for questions
 */

import type { ExportFormat } from "@/lib/types"

export interface ExportQuestion {
  id: string
  text: string
  answer?: string | null
  level: string
  difficulty: string
  purpose?: string | null
  evidence?: string[]
  createdAt: Date
  documentName?: string
}

const levelLabels: Record<string, string> = {
  REMEMBER: "Lembrar",
  UNDERSTAND: "Entender",
  APPLY: "Aplicar",
  ANALYZE: "Analisar",
  EVALUATE: "Avaliar",
  CREATE: "Criar",
}

const difficultyLabels: Record<string, string> = {
  EASY: "Fácil",
  MEDIUM: "Médio",
  HARD: "Difícil",
}

const purposeLabels: Record<string, string> = {
  EVALUATION: "Avaliação",
  CREATION: "Criação",
}

/**
 * Export questions to JSON format
 */
export function exportToJSON(questions: ExportQuestion[]): string {
  const data = {
    exportedAt: new Date().toISOString(),
    totalQuestions: questions.length,
    questions: questions.map((q) => ({
      id: q.id,
      text: q.text,
      answer: q.answer,
      level: q.level,
      levelLabel: levelLabels[q.level] || q.level,
      difficulty: q.difficulty,
      difficultyLabel: difficultyLabels[q.difficulty] || q.difficulty,
      purpose: q.purpose,
      purposeLabel: q.purpose ? purposeLabels[q.purpose] : null,
      evidence: q.evidence,
      documentName: q.documentName,
      createdAt: q.createdAt.toISOString(),
    })),
  }

  return JSON.stringify(data, null, 2)
}

/**
 * Export questions to CSV format
 */
export function exportToCSV(questions: ExportQuestion[]): string {
  const headers = [
    "ID",
    "Questão",
    "Resposta",
    "Nível",
    "Dificuldade",
    "Propósito",
    "Documento",
    "Data de Criação",
  ]

  const rows = questions.map((q) => [
    q.id,
    escapeCsvField(q.text),
    escapeCsvField(q.answer || ""),
    levelLabels[q.level] || q.level,
    difficultyLabels[q.difficulty] || q.difficulty,
    q.purpose ? purposeLabels[q.purpose] : "",
    escapeCsvField(q.documentName || ""),
    q.createdAt.toISOString(),
  ])

  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")
}

/**
 * Export questions to Markdown format
 */
export function exportToMarkdown(questions: ExportQuestion[]): string {
  const lines: string[] = []

  lines.push("# Questões Geradas")
  lines.push("")
  lines.push(`**Total de Questões:** ${questions.length}`)
  lines.push(`**Exportado em:** ${new Date().toLocaleString("pt-BR")}`)
  lines.push("")
  lines.push("---")
  lines.push("")

  questions.forEach((q, index) => {
    lines.push(`## Questão ${index + 1}`)
    lines.push("")
    
    // Metadata
    const metadata: string[] = []
    metadata.push(`**Nível:** ${levelLabels[q.level] || q.level}`)
    metadata.push(`**Dificuldade:** ${difficultyLabels[q.difficulty] || q.difficulty}`)
    if (q.purpose) {
      metadata.push(`**Propósito:** ${purposeLabels[q.purpose]}`)
    }
    if (q.documentName) {
      metadata.push(`**Documento:** ${q.documentName}`)
    }
    lines.push(metadata.join(" | "))
    lines.push("")

    // Question text
    lines.push(q.text)
    lines.push("")

    // Answer
    if (q.answer) {
      lines.push("### Resposta")
      lines.push("")
      lines.push(q.answer)
      lines.push("")
    }

    // Evidence
    if (q.evidence && q.evidence.length > 0) {
      lines.push("### Evidências")
      lines.push("")
      q.evidence.forEach((evidence, idx) => {
        lines.push(`${idx + 1}. ${evidence}`)
      })
      lines.push("")
    }

    lines.push("---")
    lines.push("")
  })

  return lines.join("\n")
}

/**
 * Export questions to Plain Text format
 */
export function exportToPlainText(questions: ExportQuestion[]): string {
  const lines: string[] = []

  lines.push("═".repeat(80))
  lines.push("QUESTÕES GERADAS")
  lines.push("═".repeat(80))
  lines.push("")
  lines.push(`Total de Questões: ${questions.length}`)
  lines.push(`Exportado em: ${new Date().toLocaleString("pt-BR")}`)
  lines.push("")
  lines.push("═".repeat(80))
  lines.push("")

  questions.forEach((q, index) => {
    lines.push(`QUESTÃO ${index + 1}`)
    lines.push("")
    
    // Metadata
    lines.push(`Nível: ${levelLabels[q.level] || q.level}`)
    lines.push(`Dificuldade: ${difficultyLabels[q.difficulty] || q.difficulty}`)
    if (q.purpose) {
      lines.push(`Propósito: ${purposeLabels[q.purpose]}`)
    }
    if (q.documentName) {
      lines.push(`Documento: ${q.documentName}`)
    }
    lines.push("")

    // Question text
    lines.push(q.text)
    lines.push("")

    // Answer
    if (q.answer) {
      lines.push("RESPOSTA:")
      lines.push(q.answer)
      lines.push("")
    }

    // Evidence
    if (q.evidence && q.evidence.length > 0) {
      lines.push("EVIDÊNCIAS:")
      q.evidence.forEach((evidence, idx) => {
        lines.push(`  ${idx + 1}. ${evidence}`)
      })
      lines.push("")
    }

    lines.push("─".repeat(80))
    lines.push("")
  })

  return lines.join("\n")
}

/**
 * Export questions to specified format
 */
export function exportQuestions(
  questions: ExportQuestion[],
  format: ExportFormat
): string {
  switch (format) {
    case "json":
      return exportToJSON(questions)
    case "csv":
      return exportToCSV(questions)
    case "markdown":
      return exportToMarkdown(questions)
    case "txt":
      return exportToPlainText(questions)
    default:
      throw new Error(`Unsupported export format: ${format}`)
  }
}

/**
 * Download exported data as file
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Get MIME type for export format
 */
export function getMimeType(format: ExportFormat): string {
  switch (format) {
    case "json":
      return "application/json"
    case "csv":
      return "text/csv"
    case "markdown":
      return "text/markdown"
    case "txt":
      return "text/plain"
    default:
      return "text/plain"
  }
}

/**
 * Get file extension for export format
 */
export function getFileExtension(format: ExportFormat): string {
  switch (format) {
    case "json":
      return ".json"
    case "csv":
      return ".csv"
    case "markdown":
      return ".md"
    case "txt":
      return ".txt"
    default:
      return ".txt"
  }
}

/**
 * Escape CSV field if it contains special characters
 */
function escapeCsvField(field: string): string {
  if (field.includes(",") || field.includes('"') || field.includes("\n")) {
    return `"${field.replace(/"/g, '""')}"`
  }
  return field
}
