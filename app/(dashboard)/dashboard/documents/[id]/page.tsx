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
import { ptBR } from "date-fns/locale"

export default async function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser()
  const { id } = await params

  const document = await getDocumentById(id)

  if (!document || document.userId !== user.id) {
    notFound()
  }

  const questions = await getQuestionsByDocumentId(id)

  // Tradução do tipo de documento
  const documentTypeMap: Record<string, string> = {
    "pdf": "PDF",
    "txt": "Texto",
    "text": "Texto",
    "plain": "Texto",
    "md": "Markdown",
    "markdown": "Markdown",
    "docx": "Word",
    "doc": "Word",
  }

  // MIME type mapping para formatos comuns
  const mimeTypeMap: Record<string, string> = {
    "application/pdf": "PDF",
    "text/plain": "Texto",
    "text/markdown": "Markdown",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "Word",
    "application/msword": "Word",
  }

  // Extrair extensão do nome do arquivo
  const fileNameParts = document.name.split(".")
  const fileExtension = fileNameParts.length > 1 
    ? fileNameParts[fileNameParts.length - 1].toLowerCase() 
    : null

  // Determinar o tipo do documento
  let documentType: string
  if (fileExtension && documentTypeMap[fileExtension]) {
    // Usar mapeamento da extensão do arquivo
    documentType = documentTypeMap[fileExtension]
  } else if (mimeTypeMap[document.type]) {
    // Usar mapeamento do MIME type
    documentType = mimeTypeMap[document.type]
  } else if (fileExtension) {
    // Mostrar extensão do arquivo com ponto
    documentType = `.${fileExtension}`
  } else {
    // Fallback: mostrar apenas a última parte do MIME type
    const mimeTypePart = document.type.split("/")[1]?.split(".").pop()?.toUpperCase()
    documentType = mimeTypePart || "Arquivo"
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{document.name}</h1>
        <p className="text-muted-foreground">Detalhes do documento e geração de questões</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Informações do Documento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Tamanho</p>
                <p className="font-medium">{(document.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Tipo</p>
                <p className="font-medium">{documentType}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  Blocos
                </p>
                <p className="font-medium">{document._count?.chunks ?? 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Enviado
                </p>
                <p className="font-medium">{formatDistanceToNow(new Date(document.createdAt), { addSuffix: true, locale: ptBR })}</p>
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
                <CardTitle>Questões Geradas ({questions.length})</CardTitle>
                <CardDescription>Revise, edite e exporte suas questões geradas</CardDescription>
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
