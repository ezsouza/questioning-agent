export const dynamic = "force-dynamic"

import { requireUser } from "@/lib/auth/session"
import { getDocumentsByUserId } from "@/lib/db/queries"
import { DocumentUpload } from "@/components/documents/document-upload"
import { DocumentList } from "@/components/documents/document-list"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Sparkles, FolderOpen, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function DashboardPage() {
  const user = await requireUser()
  const documents = await getDocumentsByUserId(user.id)

  // Quick stats
  const totalDocuments = documents.length
  const processedDocs = documents.filter(d => (d._count?.chunks || 0) > 0).length
  const totalQuestions = documents.reduce((sum, d) => sum + (d._count?.questions || 0), 0)

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Central de controle para seus documentos e questões</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Documentos</p>
                <p className="text-3xl font-bold">{totalDocuments}</p>
              </div>
              <FileText className="h-10 w-10 text-primary/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Processados</p>
                <p className="text-3xl font-bold">{processedDocs}</p>
              </div>
              <FolderOpen className="h-10 w-10 text-green-500/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Questões Geradas</p>
                <p className="text-3xl font-bold">{totalQuestions}</p>
              </div>
              <Sparkles className="h-10 w-10 text-yellow-500/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Actions */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Upload Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Novo Documento
                </CardTitle>
                <CardDescription className="mt-1.5">
                  Upload de PDF, DOCX, TXT ou Markdown (máx. 10MB)
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DocumentUpload />
          </CardContent>
        </Card>
      </div>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Documentos Recentes</CardTitle>
              <CardDescription className="mt-1.5">
                {totalDocuments === 0 
                  ? "Nenhum documento enviado ainda" 
                  : `${totalDocuments} ${totalDocuments === 1 ? 'documento' : 'documentos'} no total`
                }
              </CardDescription>
            </div>
            {totalDocuments > 0 && (
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/documents">
                  Ver Todos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <DocumentList documents={documents.slice(0, 5)} />
          {totalDocuments > 5 && (
            <div className="mt-4 text-center">
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard/documents">
                  Ver mais {totalDocuments - 5} documentos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
