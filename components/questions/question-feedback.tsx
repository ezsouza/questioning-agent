'use client'

import { useState, useEffect } from 'react'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { FeedbackDialog } from '@/components/questions/feedback-dialog'
import { toast } from '@/hooks/use-toast'

interface QuestionFeedbackProps {
  questionId: string
  initialRating?: 'LIKE' | 'DISLIKE' | null
  onFeedbackSubmit?: (rating: 'LIKE' | 'DISLIKE') => void
}

export function QuestionFeedback({ 
  questionId, 
  initialRating = null,
  onFeedbackSubmit 
}: QuestionFeedbackProps) {
  const [rating, setRating] = useState<'LIKE' | 'DISLIKE' | null>(initialRating)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load existing feedback on mount
  useEffect(() => {
    const loadFeedback = async () => {
      try {
        const response = await fetch(`/api/questions/feedback?questionId=${questionId}`)
        if (response.ok) {
          const data = await response.json()
          if (data.rating) {
            setRating(data.rating)
          }
        }
      } catch (error) {
        console.error('Error loading feedback:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadFeedback()
  }, [questionId])

  const handleLike = async () => {
    if (rating === 'LIKE') {
      // Remove like
      await submitFeedback(null)
      return
    }

    await submitFeedback('LIKE')
  }

  const handleDislike = () => {
    if (rating === 'DISLIKE') {
      // Remove dislike
      submitFeedback(null)
      return
    }

    // Open dialog for detailed feedback
    setIsDialogOpen(true)
  }

  const handleDislikeFeedback = async (reasons: string[], comment?: string) => {
    await submitFeedback('DISLIKE', reasons, comment)
    setIsDialogOpen(false)
  }

  const submitFeedback = async (
    newRating: 'LIKE' | 'DISLIKE' | null, 
    reasons?: string[], 
    comment?: string
  ) => {
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/questions/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId,
          rating: newRating,
          reasons,
          comment,
        }),
      })

      if (!response.ok) {
        throw new Error('Falha ao enviar feedback')
      }

      setRating(newRating)
      
      if (onFeedbackSubmit && newRating) {
        onFeedbackSubmit(newRating)
      }

      toast({
        title: newRating === 'LIKE' 
          ? '👍 Obrigado pelo feedback positivo!' 
          : newRating === 'DISLIKE'
          ? '👎 Obrigado pelo feedback! Vamos melhorar.'
          : 'Feedback removido',
        description: newRating 
          ? 'Seu feedback nos ajuda a melhorar a qualidade das questões.'
          : '',
      })
    } catch (error) {
      console.error('Error submitting feedback:', error)
      toast({
        title: 'Erro ao enviar feedback',
        description: 'Tente novamente mais tarde.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          disabled={isSubmitting || isLoading}
          className={cn(
            'gap-2',
            rating === 'LIKE' && 'bg-green-500/10 text-green-600 hover:bg-green-500/20 hover:text-green-700'
          )}
        >
          <ThumbsUp className={cn('h-4 w-4', rating === 'LIKE' && 'fill-current')} />
          <span className="text-xs">Útil</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleDislike}
          disabled={isSubmitting || isLoading}
          className={cn(
            'gap-2',
            rating === 'DISLIKE' && 'bg-red-500/10 text-red-600 hover:bg-red-500/20 hover:text-red-700'
          )}
        >
          <ThumbsDown className={cn('h-4 w-4', rating === 'DISLIKE' && 'fill-current')} />
          <span className="text-xs">Não útil</span>
        </Button>
      </div>

      <FeedbackDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleDislikeFeedback}
      />
    </>
  )
}
