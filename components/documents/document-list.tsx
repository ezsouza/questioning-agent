"use client"

import { useState } from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { QualityBadges } from "@/components/documents/quality-badges"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { FileText, Loader2, CheckCircle2, AlertCircle, Trash2, Download, Sparkles } from "lucide-react"
import { formatBytes } from "@/lib/storage/quota"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

type DocumentStatus = "UPLOADING" | "PROCESSING" | "INDEXED" | "FAILED"

interface Document {
  id: string
  name: string
  type: string
  size: number
  status: DocumentStatus
  qualityScore?: number | null
  badges?: string[]
  createdAt: Date | string
  blobUrl?: string | null
  _count: {
    chunks: number
    questions: number
  }
}

interface DocumentListProps {
  documents: Document[]
}

const statusConfig = {
  UPLOADING: { label: "Enviando", icon: Loader2, variant: "secondary" as const, className: "animate-spin" },
  PROCESSING: { label: "Processando", icon: Loader2, variant: "secondary" as const, className: "animate-spin" },
  INDEXED: { label: "Pronto", icon: CheckCircle2, variant: "default" as const, className: "" },
  FAILED: { label: "Falhou", icon: AlertCircle, variant: "destructive" as const, className: "" },
}

export function DocumentList({ documents }: DocumentListProps) {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(null)
  const [processingDocumentId, setProcessingDocumentId] = useState<string | null>(null)

  const handleDeleteClick = (doc: Document) => {
    setDocumentToDelete(doc)
    setDeleteDialogOpen(true)
  }

  const handleProcessDocument = async (documentId: string) => {
    setProcessingDocumentId(documentId)
    
    try {
      const response = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId })
      })

      if (!response.ok) {
        throw new Error('Failed to process document')
      }

      const data = await response.json()

      toast({
        title: "Documento processado",
        description: `${data.data.chunkCount} blocos criados. Quality Score: ${data.data.qualityScore}/100`,
      })

      // Refresh to show updated status and badges
      setTimeout(() => {
        router.refresh()
        setProcessingDocumentId(null)
      }, 1000)
    } catch (error) {
      console.error('[PROCESS_ERROR]', error)
      toast({
        title: "Erro ao processar",
        description: "Não foi possível processar o documento. Tente novamente.",
        variant: "destructive",
      })
      setProcessingDocumentId(null)
    }
  }

  const handleDownload = async (doc: Document) => {
    try {
      // Fetch the document blob URL and trigger download
      if (doc.blobUrl) {
        const link = document.createElement('a')
        link.href = doc.blobUrl
        link.download = doc.name
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        toast({
          title: "Download iniciado",
          description: `Baixando ${doc.name}...`,
        })
      }
    } catch (error) {
      console.error('[DOWNLOAD_ERROR]', error)
      toast({
        title: "Erro no download",
        description: "Não foi possível baixar o documento.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteConfirm = async () => {
    if (!documentToDelete) return

    setIsDeleting(true)
    setDeletingDocumentId(documentToDelete.id)
    
    try {
      const response = await fetch(`/api/documents/${documentToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete document")
      }

      toast({
        title: "Documento deletado",
        description: `O documento "${documentToDelete.name}" foi removido com sucesso.`,
      })

      // Close dialog after successful deletion
      setDeleteDialogOpen(false)
      
      // Wait a moment for the toast to show, then refresh
      setTimeout(() => {
        router.refresh()
        setDeletingDocumentId(null)
      }, 500)
    } catch (error) {
      console.error("[DELETE_ERROR]", error)
      toast({
        title: "Erro ao deletar",
        description: "Não foi possível deletar o documento. Tente novamente.",
        variant: "destructive",
      })
      setDeletingDocumentId(null)
    } finally {
      setIsDeleting(false)
      setDocumentToDelete(null)
    }
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-lg font-medium mb-2">Nenhum documento ainda</p>
        <p className="text-sm text-muted-foreground">Envie seu primeiro documento para começar</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {documents.map((doc) => {
          const status = statusConfig[doc.status]
          const StatusIcon = status.icon
          const isBeingDeleted = deletingDocumentId === doc.id

          return (
            <div
              key={doc.id}
              className={`flex items-center gap-4 p-4 border rounded-lg transition-all duration-300 ${
                isBeingDeleted 
                  ? "opacity-50 pointer-events-none bg-destructive/5 border-destructive/20" 
                  : "hover:bg-muted/50"
              }`}
            >
              <FileText className="h-8 w-8 text-primary shrink-0" />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium truncate">{doc.name}</p>
                  {isBeingDeleted ? (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Deletando...
                    </Badge>
                  ) : (
                    <Badge variant={status.variant} className="flex items-center gap-1">
                      <StatusIcon className={`h-3 w-3 ${status.className}`} />
                      {status.label}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                  <span>{formatBytes(doc.size)}</span>
                  {doc.status === "INDEXED" && doc._count.chunks > 0 && (
                    <>
                      <span>{doc._count.chunks} blocos</span>
                      <span>{doc._count.questions} questões</span>
                    </>
                  )}
                  <span>
                    {doc.createdAt 
                      ? (() => {
                          const dateStr = typeof doc.createdAt === 'string' 
                            ? doc.createdAt 
                            : doc.createdAt.toISOString()
                          
                          const date = new Date(dateStr)
                          
                          return formatDistanceToNow(date, { 
                            addSuffix: true, 
                            locale: ptBR,
                            includeSeconds: true
                          })
                        })()
                      : "Data desconhecida"}
                  </span>
                </div>

                {/* Quality badges for indexed documents */}
                {doc.status === "INDEXED" && doc.badges && doc.badges.length > 0 && (
                  <QualityBadges badges={doc.badges} qualityScore={doc.qualityScore} />
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Process/Generate button */}
                {doc.status === "INDEXED" && !isBeingDeleted && (
                  <>
                    {doc._count.chunks === 0 ? (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleProcessDocument(doc.id)}
                        disabled={processingDocumentId === doc.id}
                      >
                        {processingDocumentId === doc.id ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processando...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Processar
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button asChild size="sm">
                        <Link href={`/dashboard/documents/${doc.id}`}>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Gerar Questões
                        </Link>
                      </Button>
                    )}
                  </>
                )}

                {/* Download button */}
                {doc.status === "INDEXED" && !isBeingDeleted && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDownload(doc)}
                    title="Baixar documento"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                )}
                
                {/* Delete button */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleDeleteClick(doc)}
                  disabled={isDeleting || isBeingDeleted}
                  title="Deletar documento"
                  className={isBeingDeleted ? "opacity-50" : ""}
                >
                  {isBeingDeleted ? (
                    <Loader2 className="h-4 w-4 animate-spin text-destructive" />
                  ) : (
                    <Trash2 className="h-4 w-4 text-destructive" />
                  )}
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={(open) => {
        // Prevent closing dialog while deleting
        if (!isDeleting) {
          setDeleteDialogOpen(open)
          if (!open) {
            setDocumentToDelete(null)
          }
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isDeleting ? "Deletando documento..." : "Confirmar exclusão"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isDeleting ? (
                <span className="flex items-center gap-2 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <span>
                    Removendo <span className="font-medium text-foreground">{documentToDelete?.name}</span>...
                  </span>
                </span>
              ) : (
                <>
                  Tem certeza que deseja deletar o documento{" "}
                  <span className="font-medium text-foreground">
                    {documentToDelete?.name}
                  </span>
                  ? Esta ação não pode ser desfeita e todas as questões geradas a partir deste documento também serão removidas.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deletando...
                </>
              ) : (
                "Deletar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
