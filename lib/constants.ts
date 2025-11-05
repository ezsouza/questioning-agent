/**
 * Application constants
 */

export const COGNITIVE_LEVELS = ["remember", "understand", "apply", "analyze", "evaluate", "create"] as const

export const COGNITIVE_LEVEL_DESCRIPTIONS = {
  remember: "Recall facts and basic concepts",
  understand: "Explain ideas or concepts",
  apply: "Use information in new situations",
  analyze: "Draw connections among ideas",
  evaluate: "Justify a stand or decision",
  create: "Produce new or original work",
} as const

export const COGNITIVE_LEVEL_DESCRIPTIONS_PT = {
  remember: "Recordar fatos e conceitos básicos",
  understand: "Explicar ideias ou conceitos",
  apply: "Usar informação em novas situações",
  analyze: "Estabelecer conexões entre ideias",
  evaluate: "Justificar uma posição ou decisão",
  create: "Produzir trabalho novo ou original",
} as const

// Purpose-specific cognitive levels for question generation
export const EVALUATION_COGNITIVE_LEVELS = ["REMEMBER", "UNDERSTAND", "APPLY", "ANALYZE", "EVALUATE", "CREATE"] as const

export const CREATION_COGNITIVE_LEVELS = ["EXPLORE", "IDEATE", "PROTOTYPE", "REFINE", "INTEGRATE", "INNOVATE"] as const

export const EVALUATION_LEVEL_NAMES_PT = {
  REMEMBER: "Recordar",
  UNDERSTAND: "Compreender",
  APPLY: "Aplicar",
  ANALYZE: "Analisar",
  EVALUATE: "Avaliar",
  CREATE: "Criar",
  remember: "Recordar",
  understand: "Compreender",
  apply: "Aplicar",
  analyze: "Analisar",
  evaluate: "Avaliar",
  create: "Criar",
} as const

export const CREATION_LEVEL_NAMES_PT = {
  EXPLORE: "Explorar",
  IDEATE: "Idear",
  PROTOTYPE: "Prototipar",
  REFINE: "Refinar",
  INTEGRATE: "Integrar",
  INNOVATE: "Inovar",
  explore: "Explorar",
  ideate: "Idear",
  prototype: "Prototipar",
  refine: "Refinar",
  integrate: "Integrar",
  innovate: "Inovar",
} as const

export const EVALUATION_LEVEL_DESCRIPTIONS_PT = {
  REMEMBER: "Recordar fatos e conceitos básicos do conteúdo",
  UNDERSTAND: "Explicar ideias e conceitos principais",
  APPLY: "Usar informação em novas situações práticas",
  ANALYZE: "Estabelecer conexões e relações entre ideias",
  EVALUATE: "Justificar decisões e fazer julgamentos críticos",
  CREATE: "Produzir trabalho novo sintetizando conhecimentos",
  remember: "Recordar fatos e conceitos básicos do conteúdo",
  understand: "Explicar ideias e conceitos principais",
  apply: "Usar informação em novas situações práticas",
  analyze: "Estabelecer conexões e relações entre ideias",
  evaluate: "Justificar decisões e fazer julgamentos críticos",
  create: "Produzir trabalho novo sintetizando conhecimentos",
} as const

export const CREATION_LEVEL_DESCRIPTIONS_PT = {
  EXPLORE: "Descobrir possibilidades e questionar suposições",
  IDEATE: "Gerar múltiplas ideias e soluções criativas",
  PROTOTYPE: "Desenvolver conceitos iniciais e experimentações",
  REFINE: "Aprimorar e iterar sobre ideias existentes",
  INTEGRATE: "Combinar conceitos para criar soluções completas",
  INNOVATE: "Transformar ideias em inovações revolucionárias",
  explore: "Descobrir possibilidades e questionar suposições",
  ideate: "Gerar múltiplas ideias e soluções criativas",
  prototype: "Desenvolver conceitos iniciais e experimentações",
  refine: "Aprimorar e iterar sobre ideias existentes",
  integrate: "Combinar conceitos para criar soluções completas",
  innovate: "Transformar ideias em inovações revolucionárias",
} as const

export const DIFFICULTY_LEVELS = ["easy", "medium", "hard"] as const

export const DOCUMENT_STATUS = ["uploading", "processing", "indexed", "failed"] as const

export const SUPPORTED_FILE_TYPES = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "text/plain": [".txt"],
  "text/markdown": [".md"],
} as const

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export const API_ROUTES = {
  upload: "/api/upload",
  ingest: "/api/ingest",
  embed: "/api/embed",
  index: "/api/index",
  query: "/api/query",
  generate: "/api/generate",
  export: "/api/export",
  documents: "/api/documents",
  questions: "/api/questions",
} as const
