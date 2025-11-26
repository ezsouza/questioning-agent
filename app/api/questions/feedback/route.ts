import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/session'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'

const feedbackSchema = z.object({
  questionId: z.string(),
  rating: z.enum(['LIKE', 'DISLIKE']).nullable(),
  reasons: z.array(z.enum([
    'OUT_OF_CONTEXT',
    'INCORRECT_ANSWER',
    'POORLY_FORMULATED',
    'WRONG_COGNITIVE_LEVEL',
    'DUPLICATE',
    'OTHER'
  ])).optional(),
  comment: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser()
    const body = await request.json()
    
    const validation = feedbackSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { questionId, rating, reasons, comment } = validation.data

    // Verify that the question exists and belongs to the user
    const question = await prisma.question.findFirst({
      where: {
        id: questionId,
        userId: user.id,
      },
    })

    if (!question) {
      return NextResponse.json(
        { error: 'Questão não encontrada' },
        { status: 404 }
      )
    }

    // If rating is null, delete existing feedback
    if (rating === null) {
      await prisma.questionFeedback.deleteMany({
        where: {
          questionId,
          userId: user.id,
        },
      })

      return NextResponse.json({ success: true, action: 'deleted' })
    }

    // Upsert feedback
    const feedback = await prisma.questionFeedback.upsert({
      where: {
        questionId_userId: {
          questionId,
          userId: user.id,
        },
      },
      update: {
        rating,
        reasons: reasons || [],
        comment: comment || null,
        updatedAt: new Date(),
      },
      create: {
        questionId,
        userId: user.id,
        rating,
        reasons: reasons || [],
        comment: comment || null,
      },
    })

    return NextResponse.json({ 
      success: true, 
      feedback,
      action: 'saved'
    })
  } catch (error) {
    console.error('Error saving feedback:', error)
    return NextResponse.json(
      { error: 'Erro ao salvar feedback' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser()
    const { searchParams } = new URL(request.url)
    const questionId = searchParams.get('questionId')

    if (!questionId) {
      return NextResponse.json(
        { error: 'questionId é obrigatório' },
        { status: 400 }
      )
    }

    const feedback = await prisma.questionFeedback.findUnique({
      where: {
        questionId_userId: {
          questionId,
          userId: user.id,
        },
      },
    })

    return NextResponse.json({ feedback })
  } catch (error) {
    console.error('Error fetching feedback:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar feedback' },
      { status: 500 }
    )
  }
}
