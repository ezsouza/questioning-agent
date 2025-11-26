"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download, FileJson, FileSpreadsheet, FileText, FileCode } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { ExportFormat } from "@/lib/types"

interface ExportButtonProps {
  questionIds?: string[]
  documentId?: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function ExportButton({
  questionIds,
  documentId,
  variant = "outline",
  size = "default",
  className,
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true)

    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionIds,
          documentId,
          format,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to export questions")
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get("Content-Disposition")
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/)
      const filename = filenameMatch ? filenameMatch[1] : `questoes.${format}`

      // Download file
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "Exportação concluída",
        description: `Questões exportadas em formato ${format.toUpperCase()}.`,
      })
    } catch (error) {
      console.error("[EXPORT_ERROR]", error)
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar as questões. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={className} disabled={isExporting}>
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? "Exportando..." : "Exportar"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Formato de Exportação</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport("json")} disabled={isExporting}>
          <FileJson className="h-4 w-4 mr-2" />
          JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("csv")} disabled={isExporting}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("markdown")} disabled={isExporting}>
          <FileCode className="h-4 w-4 mr-2" />
          Markdown
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("txt")} disabled={isExporting}>
          <FileText className="h-4 w-4 mr-2" />
          Plain Text
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
