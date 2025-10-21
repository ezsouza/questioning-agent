"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Loader2, AlertCircle, FileText } from "lucide-react"
import type { DocumentStatus } from "@prisma/client"

interface ProcessingStatusProps {
  documentId: string
  initialStatus: DocumentStatus
  onComplete?: () => void
}

export function ProcessingStatus({ documentId, initialStatus, onComplete }: ProcessingStatusProps) {
  const [status, setStatus] = useState<DocumentStatus>(initialStatus)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (status === "INDEXED" || status === "FAILED") {
      if (status === "INDEXED" && onComplete) {
        onComplete()
      }
      return
    }

    // Poll for status updates
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/documents/${documentId}`)
        const data = await response.json()

        if (data.success && data.document) {
          setStatus(data.document.status)

          // Simulate progress
          if (data.document.status === "PROCESSING") {
            setProgress((prev) => Math.min(prev + 10, 90))
          } else if (data.document.status === "INDEXED") {
            setProgress(100)
          }
        }
      } catch (error) {
        console.error("[POLLING_ERROR]", error)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [documentId, status, onComplete])

  const statusConfig = {
    UPLOADING: {
      label: "Uploading",
      icon: Loader2,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      description: "Uploading file to storage...",
    },
    PROCESSING: {
      label: "Processing",
      icon: Loader2,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      description: "Extracting text, chunking, and generating embeddings...",
    },
    INDEXED: {
      label: "Ready",
      icon: CheckCircle2,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      description: "Document is ready for question generation",
    },
    FAILED: {
      label: "Failed",
      icon: AlertCircle,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      description: "Processing failed. Please try again.",
    },
  }

  const config = statusConfig[status]
  const StatusIcon = config.icon

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Processing Status
          </CardTitle>
          <Badge variant="outline" className={`${config.bgColor} ${config.color} border-0`}>
            <StatusIcon className={`h-3 w-3 mr-1 ${status === "PROCESSING" ? "animate-spin" : ""}`} />
            {config.label}
          </Badge>
        </div>
        <CardDescription>{config.description}</CardDescription>
      </CardHeader>
      {(status === "UPLOADING" || status === "PROCESSING") && (
        <CardContent>
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2 text-center">{progress}%</p>
        </CardContent>
      )}
    </Card>
  )
}
