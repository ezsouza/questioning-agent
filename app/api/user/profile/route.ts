import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/session"
import { prisma } from "@/lib/db/prisma"
import { deleteFromR2 } from "@/lib/storage/r2-client"
import { z } from "zod"

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  image: z.string().url().nullable().optional(),
})

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateProfileSchema.parse(body)

    // If the image is being removed (null), fetch the current imageKey to delete from R2
    if (validatedData.image === null) {
      const currentUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { imageKey: true },
      })

      // Delete old image from R2 if it exists
      if (currentUser?.imageKey) {
        try {
          await deleteFromR2(currentUser.imageKey)
          console.log(`[PROFILE_UPDATE] Deleted old avatar from R2: ${currentUser.imageKey}`)
        } catch (error) {
          console.warn("[PROFILE_UPDATE] Failed to delete old avatar from R2:", error)
          // Do not block the update if R2 deletion fails
        }
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(validatedData.name !== undefined && { name: validatedData.name }),
        ...(validatedData.image !== undefined && { 
          image: validatedData.image,
          // If image is null, also clear imageKey
          ...(validatedData.image === null && { imageKey: null })
        }),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        imageKey: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error updating profile:", error)
    return NextResponse.json(
      { error: "Erro ao atualizar perfil" },
      { status: 500 }
    )
  }
}
