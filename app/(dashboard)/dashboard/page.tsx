import { requireUser } from "@/lib/auth/session"
import { getDocumentsByUserId } from "@/lib/db/queries"
import { DocumentUpload } from "@/components/documents/document-upload"
import { DocumentList } from "@/components/documents/document-list"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText } from "lucide-react"

export default async function DashboardPage() {
  const user = await requireUser()
  const documents = await getDocumentsByUserId(user.id)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Upload documents and generate questions</p>
      </div>

      <div className="grid gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Upload Document
            </CardTitle>
            <CardDescription>Upload PDF, DOCX, TXT, or Markdown files to generate questions (max 10MB)</CardDescription>
          </CardHeader>
          <CardContent>
            <DocumentUpload />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Documents</CardTitle>
            <CardDescription>Manage and generate questions from your uploaded documents</CardDescription>
          </CardHeader>
          <CardContent>
            <DocumentList documents={documents} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
