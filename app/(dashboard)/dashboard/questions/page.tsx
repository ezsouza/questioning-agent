import { requireUser } from "@/lib/auth/session"
import { getAllQuestionsByUserId } from "@/lib/db/queries"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  FileText, 
  BookOpen, 
  Brain, 
  Lightbulb, 
  Search,
  Award,
  CheckCircle2
} from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { QuestionFeedback } from "@/components/questions/question-feedback"
import { ExportButton } from "@/components/questions/export-button"

const levelIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  REMEMBER: FileText,
  UNDERSTAND: BookOpen,
  APPLY: Brain,
  ANALYZE: Search,
  EVALUATE: Award,
  CREATE: Lightbulb,
}

const levelLabels: Record<string, string> = {
  REMEMBER: "Lembrar",
  UNDERSTAND: "Entender",
  APPLY: "Aplicar",
  ANALYZE: "Analisar",
  EVALUATE: "Avaliar",
  CREATE: "Criar",
}

const difficultyColors: Record<string, string> = {
  EASY: "bg-green-500/10 text-green-700 dark:text-green-400",
  MEDIUM: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  HARD: "bg-red-500/10 text-red-700 dark:text-red-400",
}

const difficultyLabels: Record<string, string> = {
  EASY: "Fácil",
  MEDIUM: "Médio",
  HARD: "Difícil",
}

const purposeLabels: Record<string, string> = {
  EVALUATION: "Avaliação",
  CREATION: "Criação",
}

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
                <div className="space-y-4">
                  {docQuestions.map((question, index) => {
                    const LevelIcon = levelIcons[question.level] || Brain
                    const difficultyColor = difficultyColors[question.difficulty] || difficultyColors.MEDIUM

                    return (
                      <div
                        key={question.id}
                        className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                            {index + 1}
                          </div>
                          
                          <div className="flex-1 space-y-2">
                            <p className="font-medium leading-relaxed">{question.text}</p>
                            
                            {question.answer && (
                              <div className="p-3 bg-muted/50 rounded-md">
                                <div className="flex items-center gap-2 mb-1">
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                  <span className="text-sm font-medium">Resposta:</span>
                                </div>
                                <p className="text-sm text-muted-foreground">{question.answer}</p>
                              </div>
                            )}

                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="outline" className="flex items-center gap-1">
                                <LevelIcon className="h-3 w-3" />
                                {levelLabels[question.level]}
                              </Badge>
                              
                              <Badge className={difficultyColor}>
                                {difficultyLabels[question.difficulty]}
                              </Badge>

                              {question.purpose && (
                                <Badge variant="secondary">
                                  {purposeLabels[question.purpose]}
                                </Badge>
                              )}

                              <span className="text-xs text-muted-foreground ml-auto">
                                {formatDistanceToNow(new Date(question.created_at), {
                                  addSuffix: true,
                                  locale: ptBR,
                                })}
                              </span>
                            </div>

                            {question.evidence && question.evidence.length > 0 && (
                              <details className="text-sm">
                                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                                  Ver evidências ({question.evidence.length})
                                </summary>
                                <div className="mt-2 space-y-2">
                                  {question.evidence.map((evidence, idx) => (
                                    <div
                                      key={idx}
                                      className="p-2 bg-muted/30 rounded text-xs border-l-2 border-primary/50"
                                    >
                                      {evidence}
                                    </div>
                                  ))}
                                </div>
                              </details>
                            )}

                            {/* Feedback Section */}
                            <div className="pt-3 mt-3 border-t">
                              <QuestionFeedback questionId={question.id} />
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
