'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { AlertCircle } from 'lucide-react'

interface FeedbackDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (reasons: string[], comment?: string) => void
}

const feedbackReasons = [
  {
    id: 'OUT_OF_CONTEXT',
    label: 'Fora de contexto do documento',
    description: 'A questão não está relacionada ao conteúdo do documento',
  },
  {
    id: 'INCORRECT_ANSWER',
    label: 'Gabarito incorreto ou impreciso',
    description: 'A resposta fornecida está errada ou incompleta',
  },
  {
    id: 'POORLY_FORMULATED',
    label: 'Questão mal formulada ou confusa',
    description: 'O enunciado é difícil de entender ou ambíguo',
  },
  {
    id: 'WRONG_COGNITIVE_LEVEL',
    label: 'Nível cognitivo inadequado',
    description: 'A questão não corresponde ao nível da Taxonomia de Bloom esperado',
  },
  {
    id: 'DUPLICATE',
    label: 'Duplicada ou muito similar',
    description: 'Já existe uma questão igual ou muito parecida',
  },
  {
    id: 'OTHER',
    label: 'Outros motivos',
    description: 'Especifique no campo de comentário abaixo',
  },
]

export function FeedbackDialog({ open, onOpenChange, onSubmit }: FeedbackDialogProps) {
  const [selectedReasons, setSelectedReasons] = useState<string[]>([])
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = () => {
    if (selectedReasons.length === 0) {
      setError('Selecione pelo menos um motivo')
      return
    }

    if (selectedReasons.includes('OTHER') && !comment.trim()) {
      setError('Por favor, especifique o motivo no campo de comentário')
      return
    }

    onSubmit(selectedReasons, comment.trim() || undefined)
    handleClose()
  }

  const handleClose = () => {
    setSelectedReasons([])
    setComment('')
    setError('')
    onOpenChange(false)
  }

  const toggleReason = (reasonId: string) => {
    setError('')
    setSelectedReasons((prev) =>
      prev.includes(reasonId)
        ? prev.filter((id) => id !== reasonId)
        : [...prev, reasonId]
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>O que há de errado com esta questão?</DialogTitle>
          <DialogDescription>
            Seu feedback nos ajuda a melhorar a qualidade das questões geradas. Selecione um ou mais motivos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 text-red-600 rounded-md text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-3">
            {feedbackReasons.map((reason) => (
              <div key={reason.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <Checkbox
                  id={reason.id}
                  checked={selectedReasons.includes(reason.id)}
                  onCheckedChange={() => toggleReason(reason.id)}
                  className="mt-1"
                />
                <div className="flex-1 space-y-1">
                  <Label
                    htmlFor={reason.id}
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    {reason.label}
                  </Label>
                  <p className="text-sm text-muted-foreground">{reason.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Comentário adicional (opcional)</Label>
            <Textarea
              id="comment"
              placeholder="Descreva com mais detalhes o problema encontrado..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Quanto mais específico, melhor poderemos ajustar o sistema.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>
            Enviar Feedback
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
