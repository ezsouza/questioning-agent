import { notFound } from "next/navigation"
import { requireUser } from "@/lib/auth/session"
import { getDocumentById, getQuestionsByDocumentId } from "@/lib/db/queries"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProcessingStatus } from "@/components/documents/processing-status"
import { QueryTester } from "@/components/rag/query-tester"
import { QuestionGenerator } from "@/components/questions/question-generator"
import { QuestionList } from "@/components/questions/question-list"
import { FileText, Hash, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export default async function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser()
  const { id } = await params

  const document = await getDocumentById(id)

  if (!document || document.userId !== user.id) {
    notFound()
  }

  const questions = await getQuestionsByDocumentId(id)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{document.name}</h1>
        <p className="text-muted-foreground">Document details and question generation</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Document Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Size</p>
                <p className="font-medium">{(document.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Type</p>
                <p className="font-medium">{document.type.split("/")[1]?.toUpperCase()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  Chunks
                </p>
                <p className="font-medium">{document._count.chunks}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Uploaded
                </p>
                <p className="font-medium">{formatDistanceToNow(new Date(document.createdAt), { addSuffix: true })}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {document.status !== "INDEXED" && <ProcessingStatus documentId={document.id} initialStatus={document.status} />}

        {document.status === "INDEXED" && (
          <>
            <QuestionGenerator documentId={document.id} />

            <Card>
              <CardHeader>
                <CardTitle>Generated Questions ({questions.length})</CardTitle>
                <CardDescription>Review, edit, and export your generated questions</CardDescription>
              </CardHeader>
              <CardContent>
                <QuestionList questions={questions} />
              </CardContent>
            </Card>

            <QueryTester documentId={document.id} />
          </>
        )}
      </div>
    </div>
  )
}
