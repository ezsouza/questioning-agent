import { openai } from "@ai-sdk/openai"
import { google } from "@ai-sdk/google"
import { generateText } from "ai"
import { config } from "@/lib/config"
import "@/lib/ai/init" // Initialize AI providers

/**
 * Question generation utilities
 */

export interface GenerationOptions {
  provider?: "openai" | "google"
  temperature?: number
  maxRetries?: number
  purpose?: "CREATION" | "EVALUATION"
  includeAnswers?: boolean
}

export interface GeneratedQuestion {
  text: string
  level: string
  difficulty: "EASY" | "MEDIUM" | "HARD"
  evidence: string[]
  reasoning?: string
  answer?: string
}

const COGNITIVE_LEVEL_PROMPTS = {
  REMEMBER: "Criar questões que testem a lembrança de fatos, termos, conceitos básicos e respostas.",
  UNDERSTAND: "Criar questões que testem a compreensão, explicação e interpretação de ideias.",
  APPLY: "Criar questões que testem a capacidade de usar informações em novas situações ou resolver problemas.",
  ANALYZE: "Criar questões que testem a capacidade de decompor informações, encontrar padrões e fazer conexões.",
  EVALUATE: "Criar questões que testem a capacidade de justificar decisões, criticar e fazer julgamentos.",
  CREATE: "Criar questões que testem a capacidade de produzir trabalho original, projetar soluções ou gerar novas ideias.",
  EXPLORE: "Criar questões que explorem conceitos-chave que podem ser expandidos, definições que precisam de mais contexto.",
  IDEATE: "Criar questões que estimulem ideias que precisam de explicação mais profunda, conceitos que requerem esclarecimento.",
  PROTOTYPE: "Criar questões sobre aplicações potenciais, cenários onde conceitos podem ser usados de forma diferente.",
  REFINE: "Criar questões sobre relacionamentos inexplorados, perspectivas alternativas, padrões ocultos.",
  INTEGRATE: "Criar questões sobre áreas que precisam validação, suposições a desafiar, melhorias a sugerir.",
  INNOVATE: "Criar questões sobre oportunidades de inovação, lacunas a preencher, novas direções a explorar.",
}

export async function generateQuestions(
  context: string,
  level: string,
  count: number,
  options: GenerationOptions = {},
): Promise<GeneratedQuestion[]> {
  const provider = options.provider || config.ai.provider
  const temperature = options.temperature || config.generation.temperature
  const purpose = options.purpose || "EVALUATION"
  const includeAnswers = options.includeAnswers || false

  const prompt = buildPrompt(context, level, count, purpose, includeAnswers)

  try {
    // Use configured model
    const model = provider === "openai" 
      ? openai(config.ai.openai.model)
      : google(config.ai.google.model)

    const { text } = await generateText({
      model,
      prompt,
      temperature,
      maxRetries: options.maxRetries || config.generation.maxRetries,
    })

    return parseQuestions(text, level)
  } catch (error) {
    console.error("[GENERATION_ERROR]", error)
    throw new Error(`Failed to generate questions with ${provider}`)
  }
}

function buildPrompt(context: string, level: string, count: number, purpose: string = "EVALUATION", includeAnswers: boolean = false): string {
  const levelDescription = COGNITIVE_LEVEL_PROMPTS[level as keyof typeof COGNITIVE_LEVEL_PROMPTS] || COGNITIVE_LEVEL_PROMPTS.UNDERSTAND

  const purposeContext = purpose === "CREATION" 
    ? "Estas questões devem ajudar a desenvolver e expandir o documento, encorajando brainstorming e pensamento criativo."
    : "Estas questões devem testar compreensão e conhecimento, adequadas para uma avaliação ou exame."

  const answerInstruction = includeAnswers
    ? '\n7. Inclua uma resposta concisa para cada questão em um campo "answer"'
    : "\n7. NÃO inclua respostas nas questões"

  return `Você é um especialista em criação de conteúdo educacional, especializado na Taxonomia de Bloom.

Contexto do documento:
${context}

Tarefa: Gerar ${count} questões de alta qualidade no nível cognitivo "${level}".

Descrição do Nível: ${levelDescription}

Propósito: ${purposeContext}

Requisitos:
1. As questões devem ser baseadas APENAS no contexto fornecido
2. As questões devem ser claras, específicas e sem ambiguidade
3. Cada questão deve citar evidências específicas do contexto
4. Variar a dificuldade (fácil, média, difícil) entre as questões
5. As questões devem ser apropriadas para o nível ${level}
6. Considerar o propósito ${purpose} ao criar as questões${answerInstruction}

Formato de Saída (JSON):
[
  {
    "text": "O texto da questão aqui?",
    "difficulty": "EASY|MEDIUM|HARD",
    "evidence": ["Citação do contexto que apoia esta questão", "Outra citação relevante"],
    "reasoning": "Breve explicação de por que esta questão se encaixa no nível ${level}"${includeAnswers ? ',\n    "answer": "A resposta para esta questão"' : ""}
  }
]

Gere exatamente ${count} questões em formato JSON válido:`
}

function parseQuestions(response: string, level: string): GeneratedQuestion[] {
  try {
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = response.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      throw new Error("No JSON array found in response")
    }

    const parsed = JSON.parse(jsonMatch[0])

    if (!Array.isArray(parsed)) {
      throw new Error("Response is not an array")
    }

    return parsed.map((q) => ({
      text: q.text,
      level,
      difficulty: q.difficulty || "MEDIUM",
      evidence: Array.isArray(q.evidence) ? q.evidence : [],
      reasoning: q.reasoning,
      answer: q.answer,
    }))
  } catch (error) {
    console.error("[PARSE_ERROR]", error)
    throw new Error("Failed to parse generated questions")
  }
}

export function estimateDifficulty(question: string): "EASY" | "MEDIUM" | "HARD" {
  const wordCount = question.split(/\s+/).length
  const hasMultipleClauses = (question.match(/,|;/g) || []).length > 2
  const hasComplexWords = /\b\w{12,}\b/.test(question)

  if (wordCount < 10 && !hasMultipleClauses) {
    return "EASY"
  } else if (wordCount > 20 || hasComplexWords || hasMultipleClauses) {
    return "HARD"
  } else {
    return "MEDIUM"
  }
}
