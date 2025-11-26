"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { 
  FileText, 
  BookOpen, 
  Brain, 
  Lightbulb, 
  Search,
  Award,
  CheckCircle2,
  Trash2,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { QuestionFeedback } from "./question-feedback"
import { ExportButton } from "./export-button"
import { toast } from "@/hooks/use-toast"

const levelIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  REMEMBER: FileText,
  UNDERSTAND: BookOpen,
  APPLY: Brain,
  ANALYZE: Search,
  EVALUATE: Award,
  CREATE: Lightbulb,
}

const levelLabels: Record<string, string> = {
  REMEMBER: "Lembrar",
  UNDERSTAND: "Entender",
  APPLY: "Aplicar",
  ANALYZE: "Analisar",
  EVALUATE: "Avaliar",
  CREATE: "Criar",
}

const difficultyColors: Record<string, string> = {
  EASY: "bg-green-500/10 text-green-700 dark:text-green-400",
  MEDIUM: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  HARD: "bg-red-500/10 text-red-700 dark:text-red-400",
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

interface Question {
  id: string
  text: string
  answer?: string | null
  level: string
  difficulty: string
  purpose: string | null
  created_at: Date
  evidence: string[]
}

interface QuestionListWithSelectionProps {
  questions: Question[]
}

export function QuestionListWithSelection({ questions }: QuestionListWithSelectionProps) {
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

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

  return (
    <>
      {/* Selection controls */}
      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg mb-4">
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

      {/* Questions list */}
      <div className="space-y-4">
        {questions.map((question, index) => {
          const LevelIcon = levelIcons[question.level] || Brain
          const difficultyColor = difficultyColors[question.difficulty] || difficultyColors.MEDIUM

          return (
            <div
              key={question.id}
              className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={selectedIds.has(question.id)}
                  onCheckedChange={() => toggleSelection(question.id)}
                  className="mt-1"
                />
                
                <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                  {index + 1}
                </div>
                
                <div className="flex-1 space-y-2">
                  <p className="font-medium leading-relaxed">{question.text}</p>
                  
                  {question.answer && (
                    <div className="p-3 bg-muted/50 rounded-md">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">Resposta:</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{question.answer}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <LevelIcon className="h-3 w-3" />
                      {levelLabels[question.level]}
                    </Badge>
                    
                    <Badge className={difficultyColor}>
                      {difficultyLabels[question.difficulty]}
                    </Badge>

                    {question.purpose && (
                      <Badge variant="secondary">
                        {purposeLabels[question.purpose]}
                      </Badge>
                    )}

                    <span className="text-xs text-muted-foreground ml-auto">
                      {formatDistanceToNow(new Date(question.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  </div>

                  {question.evidence && question.evidence.length > 0 && (
                    <details className="text-sm">
                      <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                        Ver evidências ({question.evidence.length})
                      </summary>
                      <div className="mt-2 space-y-2">
                        {question.evidence.map((evidence, idx) => (
                          <div
                            key={idx}
                            className="p-2 bg-muted/30 rounded text-xs border-l-2 border-primary/50"
                          >
                            {evidence}
                          </div>
                        ))}
                      </div>
                    </details>
                  )}

                  {/* Feedback Section */}
                  <div className="pt-3 mt-3 border-t">
                    <QuestionFeedback questionId={question.id} />
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

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
    </>
  )
}
