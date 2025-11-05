/**
 * Document Quality Analysis for RAG
 * 
 * Analyzes document content to determine suitability for AI question generation
 * Generates quality scores and badges based on content characteristics
 */

import prisma from "@/lib/db/prisma"

export interface QualityAnalysis {
  qualityScore: number
  badges: string[]
  analysis: {
    textLength: number
    chunkCount: number
    averageChunkLength: number
    hasStructuredContent: boolean
    vocabularyRichness: number
    readabilityScore: number
    technicalDepth: "low" | "medium" | "high"
    contentType: "narrative" | "technical" | "mixed" | "instructional"
    suitableForQuestions: boolean
    warnings: string[]
    recommendations: string[]
  }
}

/**
 * Analyze document quality after processing
 */
export async function analyzeDocumentQuality(documentId: string): Promise<QualityAnalysis> {
  // Fetch document with chunks and version
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      chunks: {
        select: {
          content: true,
          position: true,
        },
        orderBy: { position: "asc" },
      },
      versions: {
        select: {
          content: true,
        },
        orderBy: { version: "desc" },
        take: 1,
      },
    },
  })

  if (!document || !document.versions[0]) {
    throw new Error("Document or content not found")
  }

  const fullText = document.versions[0].content
  const chunks = document.chunks

  // Analyze text characteristics
  const textLength = fullText.length
  const chunkCount = chunks.length
  const averageChunkLength = chunkCount > 0 ? textLength / chunkCount : 0

  // Calculate vocabulary richness (unique words / total words)
  const words = fullText.toLowerCase().match(/\b\w+\b/g) || []
  const uniqueWords = new Set(words)
  const vocabularyRichness = words.length > 0 ? uniqueWords.size / words.length : 0

  // Detect structured content (headings, lists, code blocks)
  const hasStructuredContent = detectStructuredContent(fullText)

  // Estimate readability (simplified Flesch reading ease)
  const readabilityScore = calculateReadability(fullText)

  // Determine technical depth
  const technicalDepth = determineTechnicalDepth(fullText)

  // Classify content type
  const contentType = classifyContentType(fullText)

  // Generate warnings and recommendations
  const warnings: string[] = []
  const recommendations: string[] = []

  if (textLength < 500) {
    warnings.push("Documento muito curto - pode gerar poucas questões")
  }

  if (chunkCount < 3) {
    warnings.push("Poucos blocos de texto - considere documentos mais extensos")
  }

  if (vocabularyRichness < 0.3) {
    warnings.push("Vocabulário limitado - pode afetar a variedade de questões")
  }

  if (readabilityScore < 30) {
    warnings.push("Texto muito complexo - questões podem ser difíceis de formular")
    recommendations.push("Considere simplificar o conteúdo para melhor geração de questões")
  }

  if (!hasStructuredContent) {
    recommendations.push("Adicionar estrutura (títulos, listas) pode melhorar a qualidade das questões")
  }

  // Determine if suitable for question generation
  const suitableForQuestions = 
    textLength >= 300 && 
    chunkCount >= 2 && 
    vocabularyRichness >= 0.25

  // Calculate overall quality score (0-100)
  const qualityScore = calculateQualityScore({
    textLength,
    chunkCount,
    vocabularyRichness,
    readabilityScore,
    hasStructuredContent,
    suitableForQuestions,
  })

  // Generate badges
  const badges = generateBadges({
    qualityScore,
    textLength,
    technicalDepth,
    contentType,
    hasStructuredContent,
    suitableForQuestions,
  })

  return {
    qualityScore,
    badges,
    analysis: {
      textLength,
      chunkCount,
      averageChunkLength: Math.round(averageChunkLength),
      hasStructuredContent,
      vocabularyRichness: Math.round(vocabularyRichness * 100) / 100,
      readabilityScore: Math.round(readabilityScore),
      technicalDepth,
      contentType,
      suitableForQuestions,
      warnings,
      recommendations,
    },
  }
}

/**
 * Detect if content has structured elements
 */
function detectStructuredContent(text: string): boolean {
  const patterns = [
    /^#{1,6}\s+/m, // Markdown headings
    /^\d+\.\s+/m, // Numbered lists
    /^[-*+]\s+/m, // Bullet lists
    /```[\s\S]*?```/m, // Code blocks
    /<h[1-6]>/i, // HTML headings
  ]

  return patterns.some(pattern => pattern.test(text))
}

/**
 * Calculate readability score (simplified)
 */
function calculateReadability(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const words = text.match(/\b\w+\b/g) || []
  const syllables = words.reduce((sum, word) => sum + countSyllables(word), 0)

  if (sentences.length === 0 || words.length === 0) return 0

  const avgWordsPerSentence = words.length / sentences.length
  const avgSyllablesPerWord = syllables / words.length

  // Simplified Flesch Reading Ease
  const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord)
  
  return Math.max(0, Math.min(100, score))
}

/**
 * Count syllables in a word (simplified)
 */
function countSyllables(word: string): number {
  word = word.toLowerCase()
  if (word.length <= 3) return 1
  
  const vowels = word.match(/[aeiouy]+/g)
  let count = vowels ? vowels.length : 1
  
  // Adjust for silent e
  if (word.endsWith('e')) count--
  
  return Math.max(1, count)
}

/**
 * Determine technical depth of content
 */
function determineTechnicalDepth(text: string): "low" | "medium" | "high" {
  const technicalPatterns = [
    /\b(algorithm|function|variable|database|server|API|protocol)\b/gi,
    /\b(implement|configure|architecture|framework|library)\b/gi,
    /```[\s\S]*?```/g, // Code blocks
    /\b[A-Z]{2,}\b/g, // Acronyms
  ]

  const matches = technicalPatterns.reduce(
    (sum, pattern) => sum + (text.match(pattern)?.length || 0),
    0
  )

  const density = matches / (text.length / 1000) // matches per 1000 chars

  if (density > 20) return "high"
  if (density > 10) return "medium"
  return "low"
}

/**
 * Classify content type
 */
function classifyContentType(
  text: string
): "narrative" | "technical" | "mixed" | "instructional" {
  const narrativeKeywords = ["history", "story", "narrative", "once", "began"]
  const technicalKeywords = ["function", "implement", "code", "algorithm", "system"]
  const instructionalKeywords = ["how to", "step", "first", "next", "then", "finally"]

  const narrativeScore = narrativeKeywords.filter(kw => 
    text.toLowerCase().includes(kw)
  ).length

  const technicalScore = technicalKeywords.filter(kw =>
    text.toLowerCase().includes(kw)
  ).length

  const instructionalScore = instructionalKeywords.filter(kw =>
    text.toLowerCase().includes(kw)
  ).length

  const scores = { narrativeScore, technicalScore, instructionalScore }
  const maxScore = Math.max(...Object.values(scores))

  if (maxScore === 0) return "mixed"

  const highScores = Object.entries(scores).filter(([_, score]) => score === maxScore)
  
  if (highScores.length > 1) return "mixed"

  if (narrativeScore === maxScore) return "narrative"
  if (instructionalScore === maxScore) return "instructional"
  return "technical"
}

/**
 * Calculate overall quality score
 */
function calculateQualityScore(params: {
  textLength: number
  chunkCount: number
  vocabularyRichness: number
  readabilityScore: number
  hasStructuredContent: boolean
  suitableForQuestions: boolean
}): number {
  let score = 0

  // Text length score (0-25 points)
  if (params.textLength >= 2000) score += 25
  else if (params.textLength >= 1000) score += 20
  else if (params.textLength >= 500) score += 15
  else score += 10

  // Chunk count score (0-20 points)
  if (params.chunkCount >= 10) score += 20
  else if (params.chunkCount >= 5) score += 15
  else score += 10

  // Vocabulary richness score (0-20 points)
  score += Math.min(20, params.vocabularyRichness * 50)

  // Readability score (0-20 points)
  score += Math.min(20, params.readabilityScore / 5)

  // Structure bonus (0-10 points)
  if (params.hasStructuredContent) score += 10

  // Suitability bonus (0-5 points)
  if (params.suitableForQuestions) score += 5

  return Math.round(Math.min(100, score))
}

/**
 * Generate badges based on analysis
 */
function generateBadges(params: {
  qualityScore: number
  textLength: number
  technicalDepth: string
  contentType: string
  hasStructuredContent: boolean
  suitableForQuestions: boolean
}): string[] {
  const badges: string[] = []

  // Quality badges
  if (params.qualityScore >= 80) badges.push("Excelente Qualidade")
  else if (params.qualityScore >= 60) badges.push("Boa Qualidade")

  // Suitability badge
  if (params.suitableForQuestions) {
    badges.push("Pronto para IA")
  } else {
    badges.push("Qualidade Limitada")
  }

  // Content length badges
  if (params.textLength >= 5000) badges.push("Conteúdo Extenso")
  else if (params.textLength >= 2000) badges.push("Conteúdo Completo")

  // Structure badge
  if (params.hasStructuredContent) badges.push("Bem Estruturado")

  // Technical depth badge
  if (params.technicalDepth === "high") badges.push("Altamente Técnico")
  else if (params.technicalDepth === "medium") badges.push("Conteúdo Técnico")

  // Content type badge
  const contentTypeBadges: Record<string, string> = {
    narrative: "Narrativo",
    technical: "Técnico",
    instructional: "Instrucional",
    mixed: "Conteúdo Misto",
  }
  if (contentTypeBadges[params.contentType]) {
    badges.push(contentTypeBadges[params.contentType])
  }

  return badges
}
