"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Edit2, Save, X, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import type { CognitiveLevel, QuestionDifficulty } from "@/lib/generated/prisma"
import { QuestionFeedback } from "./question-feedback"
import { ExportButton } from "./export-button"

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
  enableSelection?: boolean
}

export function QuestionList({ questions, onUpdate, onDelete, enableSelection = false }: QuestionListProps) {
  const router = useRouter()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState("")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null)
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

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

  function toggleSelection(id: string) {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  function toggleSelectAll() {
    if (selectedIds.size === questions.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(questions.map((q) => q.id)))
    }
  }

  function clearSelection() {
    setSelectedIds(new Set())
  }

  function openDeleteDialog(id: string) {
    setQuestionToDelete(id)
    setDeleteDialogOpen(true)
  }

  async function confirmDelete() {
    if (!questionToDelete) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/questions/${questionToDelete}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete question")
      }

      toast({
        title: "Questão deletada",
        description: "A questão foi removida com sucesso.",
      })

      if (onDelete) {
        await onDelete(questionToDelete)
      }
      
      router.refresh()
    } catch (error) {
      toast({
        title: "Erro ao deletar",
        description: "Não foi possível deletar a questão. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setQuestionToDelete(null)
    }
  }

  async function confirmBulkDelete() {
    if (selectedIds.size === 0) return

    setIsDeleting(true)
    try {
      const response = await fetch("/api/questions/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionIds: Array.from(selectedIds) }),
      })

      if (!response.ok) {
        throw new Error("Failed to delete questions")
      }

      const data = await response.json()

      toast({
        title: "Questões deletadas",
        description: data.message || "As questões foram removidas com sucesso.",
      })

      setSelectedIds(new Set())
      router.refresh()
    } catch (error) {
      toast({
        title: "Erro ao deletar",
        description: "Não foi possível deletar as questões. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setBulkDeleteDialogOpen(false)
    }
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
    <div className="space-y-4">
      {/* Selection controls */}
      {enableSelection && (
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={selectedIds.size === questions.length && questions.length > 0}
              onCheckedChange={toggleSelectAll}
            />
            <span className="text-sm font-medium">
              {selectedIds.size > 0
                ? `${selectedIds.size} ${selectedIds.size === 1 ? "questão selecionada" : "questões selecionadas"}`
                : "Selecionar todas"}
            </span>
          </div>
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2">
              <ExportButton questionIds={Array.from(selectedIds)} variant="default" size="sm" />
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => setBulkDeleteDialogOpen(true)}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Deletar ({selectedIds.size})
              </Button>
              <Button variant="ghost" size="sm" onClick={clearSelection}>
                Limpar Seleção
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Questions list */}
      <div className="space-y-3">
        {questions.map((question) => (
          <Card key={question.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {enableSelection && (
                  <Checkbox
                    checked={selectedIds.has(question.id)}
                    onCheckedChange={() => toggleSelection(question.id)}
                    className="mt-1"
                  />
                )}
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
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => openDeleteDialog(question.id)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Feedback Section */}
              {editingId !== question.id && (
                <div className="mt-3 pt-3 border-t">
                  <QuestionFeedback questionId={question.id} />
                </div>
              )}
          </CardContent>
        </Card>
        ))}
      </div>

      {/* Single Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar esta questão? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deletando..." : "Deletar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão em Massa</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar {selectedIds.size} {selectedIds.size === 1 ? 'questão' : 'questões'}? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmBulkDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deletando..." : `Deletar ${selectedIds.size}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
