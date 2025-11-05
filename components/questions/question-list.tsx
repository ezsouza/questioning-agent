"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Edit2, Save, X, Trash2 } from "lucide-react"
import type { CognitiveLevel, QuestionDifficulty } from "@/lib/generated/prisma"

// Translation mappings for question levels and difficulty
const LEVEL_NAMES_PT: Record<string, string> = {
  // Evaluation levels (Bloom's Taxonomy)
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
  // Creation levels (Creative Process)
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
}

const DIFFICULTY_NAMES_PT: Record<string, string> = {
  EASY: "Fácil",
  MEDIUM: "Médio",
  HARD: "Difícil",
  easy: "Fácil",
  medium: "Médio",
  hard: "Difícil",
}

interface Question {
  id: string
  text: string
  level: CognitiveLevel
  difficulty: QuestionDifficulty
  evidence: string[]
}

interface QuestionListProps {
  questions: Question[]
  onUpdate?: (id: string, text: string) => Promise<void>
  onDelete?: (id: string) => Promise<void>
}

export function QuestionList({ questions, onUpdate, onDelete }: QuestionListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState("")

  // Helper function to get level name in Portuguese
  function getLevelName(level: CognitiveLevel): string {
    return LEVEL_NAMES_PT[level] || level
  }

  function startEdit(question: Question) {
    setEditingId(question.id)
    setEditText(question.text)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditText("")
  }

  async function saveEdit(id: string) {
    if (onUpdate) {
      await onUpdate(id, editText)
    }
    setEditingId(null)
    setEditText("")
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg font-medium mb-2">Nenhuma questão ainda</p>
        <p className="text-sm text-muted-foreground">Gere questões para começar</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {questions.map((question) => (
        <Card key={question.id}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {getLevelName(question.level)}
                  </Badge>
                  <Badge variant="secondary">
                    {DIFFICULTY_NAMES_PT[question.difficulty] || question.difficulty}
                  </Badge>
                </div>

                {editingId === question.id ? (
                  <Textarea value={editText} onChange={(e) => setEditText(e.target.value)} rows={3} />
                ) : (
                  <p className="text-sm">{question.text}</p>
                )}

                {question.evidence.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Evidências:</p>
                    {question.evidence.slice(0, 2).map((ev, idx) => (
                      <p key={idx} className="text-xs text-muted-foreground italic pl-3 border-l-2">
                        {ev}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-1">
                {editingId === question.id ? (
                  <>
                    <Button size="icon" variant="ghost" onClick={() => saveEdit(question.id)}>
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={cancelEdit}>
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button size="icon" variant="ghost" onClick={() => startEdit(question)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    {onDelete && (
                      <Button size="icon" variant="ghost" onClick={() => onDelete(question.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
