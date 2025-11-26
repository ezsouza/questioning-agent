"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"

interface DocumentHeaderProps {
  documentId: string
  documentName: string
  documentType: string
  documentSize: number
  status: "UPLOADING" | "PROCESSING" | "INDEXED" | "FAILED"
}

const statusConfig = {
  UPLOADING: { label: "Enviando", variant: "secondary" as const },
  PROCESSING: { label: "Processando", variant: "secondary" as const },
  INDEXED: { label: "Pronto", variant: "default" as const },
  FAILED: { label: "Falhou", variant: "destructive" as const },
}

export function DocumentHeader({ 
  documentId, 
  documentName, 
  documentType, 
  documentSize,
  status 
}: DocumentHeaderProps) {
  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/documents/${documentId}/download`)
      if (!response.ok) throw new Error('Download failed')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = documentName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast({
        title: "Download concluído",
        description: `${documentName} foi baixado com sucesso.`,
      })
    } catch (error) {
      console.error('[DOWNLOAD_ERROR]', error)
      toast({
        title: "Erro no download",
        description: "Não foi possível baixar o documento. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="mb-8">
      <Button asChild variant="ghost" size="sm" className="mb-4">
        <Link href="/dashboard/documents">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Documentos
        </Link>
      </Button>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{documentName}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={statusConfig[status].variant}>
              {statusConfig[status].label}
            </Badge>
            <span className="text-sm text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground">{documentType}</span>
            <span className="text-sm text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground">
              {(documentSize / 1024 / 1024).toFixed(2)} MB
            </span>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          Baixar
        </Button>
      </div>
    </div>
  )
}
