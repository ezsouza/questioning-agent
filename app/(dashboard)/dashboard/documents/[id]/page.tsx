import { notFound } from "next/navigation"
import { requireUser } from "@/lib/auth/session"
import { getDocumentById, getQuestionsByDocumentId } from "@/lib/db/queries"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProcessingStatus } from "@/components/documents/processing-status"
import { ProcessDocumentButton } from "@/components/documents/process-document-button"
import { QueryTester } from "@/components/rag/query-tester"
import { QuestionGenerator } from "@/components/questions/question-generator"
import { QuestionList } from "@/components/questions/question-list"
import { QualityBadges } from "@/components/documents/quality-badges"
import { DocumentHeader } from "@/components/documents/document-header"
import { FileText, Hash, Clock, Sparkles } from "lucide-react"
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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <DocumentHeader 
        documentId={document.id}
        documentName={document.name}
        documentType={documentType}
        documentSize={document.size}
        status={document.status}
      />

      <div className="grid gap-6">
        {/* Document Not Processed - Show Call to Action */}
        {(document._count?.chunks ?? 0) === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-primary/10 p-4 mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Documento Não Processado</h3>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                Este documento ainda não foi processado. Clique no botão abaixo para iniciar o processamento e começar a gerar questões.
              </p>
              <ProcessDocumentButton documentId={document.id} documentName={document.name} />
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Document Info Card */}
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
                    <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                      <Hash className="h-3 w-3" />
                      Blocos Processados
                    </p>
                    <p className="text-2xl font-bold">{document._count?.chunks ?? 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      Questões Geradas
                    </p>
                    <p className="text-2xl font-bold">{document._count?.questions ?? 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Qualidade</p>
                    <p className="text-2xl font-bold">
                      {document.quality_score ? `${document.quality_score}/100` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Enviado
                    </p>
                    <p className="font-medium text-sm">
                      {formatDistanceToNow(new Date(document.createdAt), { addSuffix: true, locale: ptBR })}
                    </p>
                  </div>
                </div>

                {/* Quality Badges */}
                {document.status === "INDEXED" && document.badges && document.badges.length > 0 && (
                  <div className="pt-4 border-t">
                    <QualityBadges badges={document.badges} qualityScore={document.quality_score} />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Processing Status */}
            {document.status !== "INDEXED" && (
              <ProcessingStatus documentId={document.id} initialStatus={document.status} />
            )}

            {/* Question Generation and List */}
            {document.status === "INDEXED" && (
              <>
                <QuestionGenerator documentId={document.id} />

                <Card>
                  <CardHeader>
                    <CardTitle>Questões Geradas ({questions.length})</CardTitle>
                    <CardDescription>Revise, edite e exporte suas questões geradas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <QuestionList questions={questions} enableSelection={true} />
                  </CardContent>
                </Card>

                {/* Temporarily disabled  */}
                {/* <QueryTester documentId={document.id} /> */}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
