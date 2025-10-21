export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { z } from "zod"
import { getCurrentUser } from "@/lib/auth/session"
import { getQuestionsByDocumentId } from "@/lib/db/queries"

const exportSchema = z.object({
  documentId: z.string().uuid(),
  format: z.enum(["json", "csv"]),
  filters: z
    .object({
      levels: z.array(z.enum(["REMEMBER", "UNDERSTAND", "APPLY", "ANALYZE", "EVALUATE", "CREATE"])).optional(),
      difficulty: z.array(z.enum(["EASY", "MEDIUM", "HARD"])).optional(),
    })
    .optional(),
})

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { documentId, format, filters } = exportSchema.parse(body)

    const questions = await getQuestionsByDocumentId(documentId, filters)

    if (format === "json") {
      return NextResponse.json(questions, {
        headers: {
          "Content-Disposition": `attachment; filename="questions-${documentId}.json"`,
        },
      })
    } else {
      // CSV format
      const csv = convertToCSV(questions)
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="questions-${documentId}.csv"`,
        },
      })
    }
  } catch (error) {
    console.error("[EXPORT_ERROR]", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Export failed" }, { status: 500 })
  }
}

function convertToCSV(
  questions: Array<{ text: string; level: string; difficulty: string; evidence: string[] }>,
): string {
  const headers = ["Question", "Level", "Difficulty", "Evidence"]
  const rows = questions.map((q) => [q.text, q.level, q.difficulty, q.evidence.join(" | ")])

  const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

  return csvContent
}
