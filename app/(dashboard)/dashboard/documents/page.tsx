import { requireUser } from "@/lib/auth/session"
import { getDocumentsByUserId } from "@/lib/db/queries"
import prisma from "@/lib/db/prisma"
import { DocumentUpload } from "@/components/documents/document-upload"
import { DocumentList } from "@/components/documents/document-list"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { 
  FileText, 
  HardDrive, 
  Award,
  AlertTriangle,
  Clock,
  Sparkles,
  TrendingUp,
  ArrowRight,
  Eye
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"

export default async function DocumentsPage() {
  const user = await requireUser()
  const documents = await getDocumentsByUserId(user.id)

  // Get user storage info
  const userInfo = await prisma.user.findUnique({
    where: { id: user.id },
    select: { storageUsed: true, storageLimit: true }
  })

  const storageUsed = Number(userInfo?.storageUsed || 0)
  const storageLimit = Number(userInfo?.storageLimit || 314572800) // 300MB default
  const storagePercentage = (storageUsed / storageLimit) * 100

  // Calculate statistics
  const totalDocuments = documents.length
  const processedDocuments = documents.filter(d => (d._count?.chunks || 0) > 0).length
  const unprocessedDocuments = totalDocuments - processedDocuments
  const documentsWithQuestions = documents.filter(d => (d._count?.questions || 0) > 0).length
  
  // Quality statistics
  const highQualityDocs = documents.filter(d => (d.quality_score || 0) >= 80).length
  const mediumQualityDocs = documents.filter(d => {
    const score = d.quality_score || 0
    return score >= 60 && score < 80
  }).length
  const lowQualityDocs = documents.filter(d => (d.quality_score || 0) < 60 && d.quality_score !== null).length

  // Find stale documents (uploaded more than 7 days ago, not processed)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  const staleDocuments = documents.filter(d => {
    const createdAt = new Date(d.createdAt)
    return createdAt < sevenDaysAgo && (d._count?.chunks || 0) === 0
  })

  // Find unused documents (processed but no questions generated)
  const unusedDocuments = documents.filter(d => {
    return (d._count?.chunks || 0) > 0 && (d._count?.questions || 0) === 0
  })

  // Map documents to format expected by DocumentList component
  const mappedDocuments = documents.map(doc => ({
    id: doc.id,
    name: doc.name,
    type: doc.type,
    size: doc.size,
    status: doc.status,
    qualityScore: doc.quality_score,
    badges: doc.badges,
    createdAt: doc.createdAt,
    blobUrl: doc.blob_url,
    _count: doc._count || { chunks: 0, questions: 0 }
  }))

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Meus Documentos</h1>
        <p className="text-muted-foreground">
          Gerencie seus documentos e monitore a qualidade e armazenamento
        </p>
      </div>

      {/* Statistics Grid - Simplified */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <span className="text-2xl font-bold">{totalDocuments}</span>
            </div>
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-xs text-muted-foreground mt-1">
              {processedDocuments} processados
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-bold">{documentsWithQuestions}</span>
            </div>
            <p className="text-sm text-muted-foreground">Com Questões</p>
            <p className="text-xs text-muted-foreground mt-1">
              {totalDocuments - documentsWithQuestions} pendentes
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Award className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">{highQualityDocs}</span>
            </div>
            <p className="text-sm text-muted-foreground">Alta Qualidade</p>
            <p className="text-xs text-muted-foreground mt-1">
              Score ≥ 80
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <HardDrive className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">
                {storagePercentage.toFixed(0)}%
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Armazenamento</p>
            <p className="text-xs text-muted-foreground mt-1">
              {(storageUsed / 1024 / 1024).toFixed(1)} MB usado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quality Distribution */}
      {processedDocuments > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5" />
              Distribuição de Qualidade
            </CardTitle>
            <CardDescription>
              Análise dos {processedDocuments} documentos processados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  Alta Qualidade (≥80)
                </span>
                <span className="font-medium">{highQualityDocs} documentos</span>
              </div>
              <Progress 
                value={(highQualityDocs / processedDocuments) * 100} 
                className="h-1.5"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  Média Qualidade (60-79)
                </span>
                <span className="font-medium">{mediumQualityDocs} documentos</span>
              </div>
              <Progress 
                value={(mediumQualityDocs / processedDocuments) * 100}
                className="h-1.5"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  Baixa Qualidade (&lt;60)
                </span>
                <span className="font-medium">{lowQualityDocs} documentos</span>
              </div>
              <Progress 
                value={(lowQualityDocs / processedDocuments) * 100}
                className="h-1.5"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Cards - Interactive */}
      {(staleDocuments.length > 0 || unusedDocuments.length > 0) && (
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {staleDocuments.length > 0 && (
            <Card className="border-l-4 border-l-orange-500">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-500" />
                    <CardTitle className="text-lg">Não Processados</CardTitle>
                  </div>
                  <Badge variant="outline" className="text-orange-500">
                    {staleDocuments.length}
                  </Badge>
                </div>
                <CardDescription>
                  Documentos aguardando processamento há mais de 7 dias
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {staleDocuments.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors group">
                      <div className="flex-1 min-w-0 mr-3">
                        <p className="font-medium text-sm truncate">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(doc.createdAt), { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                        </p>
                      </div>
                      <Button asChild variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/dashboard/documents/${doc.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {unusedDocuments.length > 0 && (
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-blue-500" />
                    <CardTitle className="text-lg">Prontos para Questões</CardTitle>
                  </div>
                  <Badge variant="outline" className="text-blue-500">
                    {unusedDocuments.length}
                  </Badge>
                </div>
                <CardDescription>
                  Documentos processados aguardando geração de questões
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {unusedDocuments.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors group">
                      <div className="flex-1 min-w-0 mr-3">
                        <p className="font-medium text-sm truncate">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc._count?.chunks || 0} blocos processados
                        </p>
                      </div>
                      <Button asChild variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/dashboard/documents/${doc.id}`}>
                          <Sparkles className="h-4 w-4 mr-1" />
                          Gerar
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Upload Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5" />
            Novo Documento
          </CardTitle>
          <CardDescription>
            PDF, DOCX, TXT ou Markdown (máx. 10MB)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DocumentUpload />
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Todos os Documentos</CardTitle>
          <CardDescription>
            {totalDocuments === 0 
              ? "Nenhum documento enviado ainda" 
              : `${totalDocuments} ${totalDocuments === 1 ? 'documento' : 'documentos'} • Clique em um documento para gerenciar`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DocumentList documents={mappedDocuments} />
        </CardContent>
      </Card>
    </div>
  )
}
