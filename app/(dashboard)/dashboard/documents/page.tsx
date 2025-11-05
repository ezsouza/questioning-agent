import { requireUser } from "@/lib/auth/session"
import { getDocumentsByUserId } from "@/lib/db/queries"
import prisma from "@/lib/db/prisma"
import { DocumentUpload } from "@/components/documents/document-upload"
import { DocumentList } from "@/components/documents/document-list"
import StorageUsageBar from "@/components/settings/storage-usage-bar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  FileText, 
  HardDrive, 
  Award,
  AlertTriangle,
  Clock,
  Sparkles,
  TrendingUp
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

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
    const createdAt = new Date(d.created_at)
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
    createdAt: doc.created_at,
    blobUrl: doc.blob_url,
    _count: doc._count || { chunks: 0, questions: 0 }
  }))

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Meus Documentos</h1>
        <p className="text-muted-foreground">
          Gerencie seus documentos e monitore o uso de armazenamento
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Total de Documentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDocuments}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {processedDocuments} processados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Com Questões
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documentsWithQuestions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalDocuments - documentsWithQuestions} aguardando
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Award className="h-4 w-4" />
              Alta Qualidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highQualityDocs}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Score ≥ 80
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              Armazenamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {storagePercentage.toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {(storageUsed / 1024 / 1024).toFixed(1)} MB de {(storageLimit / 1024 / 1024).toFixed(0)} MB
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Storage Usage */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Uso de Armazenamento
          </CardTitle>
          <CardDescription>
            Monitore seu espaço disponível para upload de documentos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StorageUsageBar />
        </CardContent>
      </Card>

      {/* Quality Distribution */}
      {processedDocuments > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Distribuição de Qualidade
            </CardTitle>
            <CardDescription>
              Análise de qualidade dos documentos processados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  Alta Qualidade (≥80)
                </span>
                <span className="font-medium">{highQualityDocs} documentos</span>
              </div>
              <Progress 
                value={(highQualityDocs / processedDocuments) * 100} 
                className="h-2 bg-green-500/20"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  Média Qualidade (60-79)
                </span>
                <span className="font-medium">{mediumQualityDocs} documentos</span>
              </div>
              <Progress 
                value={(mediumQualityDocs / processedDocuments) * 100}
                className="h-2 bg-yellow-500/20"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  Baixa Qualidade (&lt;60)
                </span>
                <span className="font-medium">{lowQualityDocs} documentos</span>
              </div>
              <Progress 
                value={(lowQualityDocs / processedDocuments) * 100}
                className="h-2 bg-red-500/20"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerts for stale and unused documents */}
      {(staleDocuments.length > 0 || unusedDocuments.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {staleDocuments.length > 0 && (
            <Card className="border-orange-500/50">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  Documentos Antigos Não Processados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {staleDocuments.length} {staleDocuments.length === 1 ? 'documento' : 'documentos'} enviado há mais de 7 dias e ainda não processado
                </p>
                <div className="space-y-2">
                  {staleDocuments.slice(0, 3).map(doc => (
                    <div key={doc.id} className="flex items-center justify-between text-xs p-2 bg-muted/50 rounded">
                      <span className="truncate flex-1">{doc.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {formatDistanceToNow(new Date(doc.created_at), { 
                          addSuffix: true, 
                          locale: ptBR 
                        })}
                      </Badge>
                    </div>
                  ))}
                  {staleDocuments.length > 3 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{staleDocuments.length - 3} mais
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {unusedDocuments.length > 0 && (
            <Card className="border-blue-500/50">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-blue-500" />
                  Documentos Processados Sem Questões
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {unusedDocuments.length} {unusedDocuments.length === 1 ? 'documento processado' : 'documentos processados'} sem questões geradas
                </p>
                <div className="space-y-2">
                  {unusedDocuments.slice(0, 3).map(doc => (
                    <div key={doc.id} className="flex items-center justify-between text-xs p-2 bg-muted/50 rounded">
                      <span className="truncate flex-1">{doc.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {doc._count?.chunks || 0} chunks
                      </Badge>
                    </div>
                  ))}
                  {unusedDocuments.length > 3 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{unusedDocuments.length - 3} mais
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Upload Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Enviar Novo Documento
          </CardTitle>
          <CardDescription>
            Envie arquivos PDF, DOCX, TXT ou Markdown para gerar questões (máx. 10MB)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DocumentUpload />
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>Todos os Documentos ({totalDocuments})</CardTitle>
          <CardDescription>
            Gerencie e gere questões a partir dos seus documentos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DocumentList documents={mappedDocuments} />
        </CardContent>
      </Card>
    </div>
  )
}
