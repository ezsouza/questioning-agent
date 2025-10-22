"use client"

import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import type { DocumentStatus } from "@prisma/client"

interface Document {
  id: string
  name: string
  type: string
  size: number
  status: DocumentStatus
  createdAt: Date
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
    <div className="space-y-3">
      {documents.map((doc) => {
        const status = statusConfig[doc.status]
        const StatusIcon = status.icon

        return (
          <div
            key={doc.id}
            className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <FileText className="h-8 w-8 text-primary flex-shrink-0" />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium truncate">{doc.name}</p>
                <Badge variant={status.variant} className="flex items-center gap-1">
                  <StatusIcon className={`h-3 w-3 ${status.className}`} />
                  {status.label}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{(doc.size / 1024 / 1024).toFixed(2)} MB</span>
                {doc.status === "INDEXED" && (
                  <>
                    <span>{doc._count.chunks} blocos</span>
                    <span>{doc._count.questions} questões</span>
                  </>
                )}
                <span>{formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true })}</span>
              </div>
            </div>

            {doc.status === "INDEXED" && (
              <Button asChild>
                <Link href={`/dashboard/documents/${doc.id}`}>Visualizar</Link>
              </Button>
            )}
          </div>
        )
      })}
    </div>
  )
}
