import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/session"
import { getDocumentsByUserId } from "@/lib/db/queries"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const documents = await getDocumentsByUserId(user.id)

    return NextResponse.json({ success: true, documents })
  } catch (error) {
    console.error("[DOCUMENTS_GET_ERROR]", error)
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 })
  }
}
