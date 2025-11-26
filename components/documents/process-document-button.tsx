"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

interface ProcessDocumentButtonProps {
  documentId: string
  documentName: string
}

export function ProcessDocumentButton({ documentId, documentName }: ProcessDocumentButtonProps) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleProcess = async () => {
    setIsProcessing(true)
    
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
        title: "Processamento iniciado",
        description: `O documento "${documentName}" está sendo processado. Isso pode levar alguns minutos.`,
      })

      // Refresh the page to show processing status
      setTimeout(() => {
        router.refresh()
        setIsProcessing(false)
      }, 1000)
    } catch (error) {
      console.error('[PROCESS_ERROR]', error)
      toast({
        title: "Erro ao processar",
        description: "Não foi possível processar o documento. Tente novamente.",
        variant: "destructive",
      })
      setIsProcessing(false)
    }
  }

  return (
    <Button onClick={handleProcess} disabled={isProcessing} size="lg">
      {isProcessing ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Processando...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-5 w-5" />
          Processar Documento
        </>
      )}
    </Button>
  )
}
