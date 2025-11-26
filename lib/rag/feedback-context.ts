import { prisma } from '@/lib/db/prisma'

interface NegativeFeedback {
  questionId: string
  text: string
  level: string
  difficulty: string
  reasons: string[]
  comment: string | null
}

/**
 * Get questions with negative feedback from this document
 * Used to avoid generating similar bad questions
 */
export async function getNegativeFeedbackForDocument(
  documentId: string,
  userId: string
): Promise<NegativeFeedback[]> {
  const negativeFeedback = await prisma.questionFeedback.findMany({
    where: {
      rating: 'DISLIKE',
      userId,
      question: {
        documentId,
      },
    },
    include: {
      question: {
        select: {
          id: true,
          text: true,
          level: true,
          difficulty: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 20, // Limit to most recent 20 negative feedbacks
  })

  return negativeFeedback.map((fb) => ({
    questionId: fb.question.id,
    text: fb.question.text,
    level: fb.question.level,
    difficulty: fb.question.difficulty,
    reasons: fb.reasons,
    comment: fb.comment,
  }))
}

/**
 * Format negative feedback into a prompt instruction
 * to help AI avoid similar mistakes
 */
export function formatNegativeFeedbackForPrompt(
  feedbacks: NegativeFeedback[]
): string {
  if (feedbacks.length === 0) {
    return ''
  }

  const reasonDescriptions: Record<string, string> = {
    OUT_OF_CONTEXT: 'fora de contexto',
    INCORRECT_ANSWER: 'gabarito incorreto',
    POORLY_FORMULATED: 'mal formulada',
    WRONG_COGNITIVE_LEVEL: 'nível cognitivo errado',
    DUPLICATE: 'duplicada',
    OTHER: 'outros problemas',
  }

  let prompt = '\n\n⚠️ QUESTÕES ANTERIORES COM FEEDBACK NEGATIVO (EVITE PADRÕES SIMILARES):\n\n'

  feedbacks.forEach((fb, index) => {
    const reasons = fb.reasons
      .map((r) => reasonDescriptions[r] || r)
      .join(', ')

    prompt += `${index + 1}. [${fb.level} - ${fb.difficulty}] "${fb.text}"\n`
    prompt += `   Motivos: ${reasons}\n`
    
    if (fb.comment) {
      prompt += `   Comentário: ${fb.comment}\n`
    }
    
    prompt += '\n'
  })

  prompt += 'INSTRUÇÕES:\n'
  prompt += '- Analise os padrões nas questões com feedback negativo acima\n'
  prompt += '- NÃO repita os mesmos erros ou gere questões similares\n'
  prompt += '- Se uma questão foi marcada como "fora de contexto", garanta que suas questões estejam fortemente baseadas no conteúdo fornecido\n'
  prompt += '- Se uma questão foi marcada como "gabarito incorreto", revise cuidadosamente suas respostas\n'
  prompt += '- Se uma questão foi marcada como "mal formulada", seja mais claro e objetivo\n'
  prompt += '- Se uma questão foi marcada como "duplicada", gere questões mais diversas e únicas\n\n'

  return prompt
}

/**
 * Analyze feedback patterns to identify common issues
 */
export function analyzeFeedbackPatterns(feedbacks: NegativeFeedback[]): {
  mostCommonReasons: Array<{ reason: string; count: number }>
  levelIssues: Record<string, number>
  difficultyIssues: Record<string, number>
} {
  const reasonCounts: Record<string, number> = {}
  const levelIssues: Record<string, number> = {}
  const difficultyIssues: Record<string, number> = {}

  feedbacks.forEach((fb) => {
    // Count reasons
    fb.reasons.forEach((reason) => {
      reasonCounts[reason] = (reasonCounts[reason] || 0) + 1
    })

    // Count level issues
    levelIssues[fb.level] = (levelIssues[fb.level] || 0) + 1

    // Count difficulty issues
    difficultyIssues[fb.difficulty] = (difficultyIssues[fb.difficulty] || 0) + 1
  })

  const mostCommonReasons = Object.entries(reasonCounts)
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count)

  return {
    mostCommonReasons,
    levelIssues,
    difficultyIssues,
  }
}
