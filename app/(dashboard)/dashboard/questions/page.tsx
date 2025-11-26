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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Minhas Questões</h1>
            <p className="text-muted-foreground">
              Todas as questões geradas a partir dos seus documentos
            </p>
          </div>
          {totalQuestions > 0 && <ExportButton />}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Questões
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuestions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Documentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDocuments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avaliação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{evaluationQuestions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Criação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{creationQuestions}</div>
          </CardContent>
        </Card>
      </div>

      {/* Questions grouped by document */}
      {totalQuestions === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Brain className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Nenhuma questão gerada ainda</p>
            <p className="text-sm text-muted-foreground mb-4">
              Faça upload de um documento e gere questões
            </p>
            <Button asChild>
              <Link href="/dashboard">Ir para Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(questionsByDocument).map(([documentName, docQuestions]) => (
            <Card key={documentName}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      {documentName}
                    </CardTitle>
                    <CardDescription>
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
