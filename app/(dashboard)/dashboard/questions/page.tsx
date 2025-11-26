import { requireUser } from "@/lib/auth/session"
import { getAllQuestionsByUserId } from "@/lib/db/queries"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  FileText, 
  Brain, 
  Lightbulb, 
  Award,
} from "lucide-react"
import Link from "next/link"
import { QuestionListWithSelection } from "@/components/questions/question-list-with-selection"
import { ExportButton } from "@/components/questions/export-button"

export default async function QuestionsPage() {
  const user = await requireUser()
  
  const questions = await getAllQuestionsByUserId(user.id)

  // Group questions by document
  const questionsByDocument = questions.reduce((acc, question) => {
    const docName = question.documentName
    if (!acc[docName]) {
      acc[docName] = []
    }
    acc[docName].push(question)
    return acc
  }, {} as Record<string, typeof questions>)

  // Statistics
  const totalQuestions = questions.length
  const totalDocuments = Object.keys(questionsByDocument).length
  const evaluationQuestions = questions.filter(q => q.purpose === "EVALUATION").length
  const creationQuestions = questions.filter(q => q.purpose === "CREATION").length

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Minhas Questões</h1>
            <p className="text-muted-foreground">
              {totalQuestions === 0 
                ? "Nenhuma questão gerada ainda" 
                : `${totalQuestions} ${totalQuestions === 1 ? 'questão' : 'questões'} em ${totalDocuments} ${totalDocuments === 1 ? 'documento' : 'documentos'}`
              }
            </p>
          </div>
          {totalQuestions > 0 && <ExportButton />}
        </div>
      </div>

      {/* Statistics Cards - Simplified */}
      {totalQuestions > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Brain className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{totalQuestions}</span>
              </div>
              <p className="text-sm text-muted-foreground">Total</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <span className="text-2xl font-bold">{totalDocuments}</span>
              </div>
              <p className="text-sm text-muted-foreground">Documentos</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Award className="h-5 w-5 text-blue-500" />
                <span className="text-2xl font-bold">{evaluationQuestions}</span>
              </div>
              <p className="text-sm text-muted-foreground">Avaliação</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                <span className="text-2xl font-bold">{creationQuestions}</span>
              </div>
              <p className="text-sm text-muted-foreground">Criação</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Questions grouped by document */}
      {totalQuestions === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Brain className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <p className="text-xl font-medium mb-2">Nenhuma questão ainda</p>
            <p className="text-sm text-muted-foreground mb-6 text-center max-w-md">
              Envie documentos e gere questões personalizadas usando IA
            </p>
            <Button asChild size="lg">
              <Link href="/dashboard">
                <FileText className="mr-2 h-4 w-4" />
                Começar Agora
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(questionsByDocument).map(([documentName, docQuestions]) => (
            <Card key={documentName}>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileText className="h-5 w-5 text-primary" />
                      {documentName}
                    </CardTitle>
                    <CardDescription className="mt-1.5">
                      {docQuestions.length} {docQuestions.length === 1 ? "questão" : "questões"}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <ExportButton 
                      documentId={docQuestions[0].document_id}
                      variant="outline"
                      size="sm"
                    />
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/dashboard/documents/${docQuestions[0].document_id}`}>
                        Ver Documento
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <QuestionListWithSelection questions={docQuestions} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
