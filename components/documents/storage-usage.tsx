"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, HardDrive } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface StorageInfo {
  used: number
  limit: number
  available: number
  usagePercent: number
  usageFormatted: string
  limitFormatted: string
  availableFormatted: string
  isNearLimit: boolean
  isFull: boolean
  documentCount: number
}

export function StorageUsage() {
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStorageInfo()
  }, [])

  const fetchStorageInfo = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch("/api/documents/storage")
      
      if (!response.ok) {
        throw new Error("Failed to fetch storage information")
      }

      const data = await response.json()
      setStorageInfo(data.storage)
    } catch (err) {
      console.error("Error fetching storage info:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Uso de Armazenamento
          </CardTitle>
          <CardDescription>
            Carregando informações de armazenamento...
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Uso de Armazenamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (!storageInfo) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HardDrive className="h-5 w-5" />
          Uso de Armazenamento
        </CardTitle>
        <CardDescription>
          {storageInfo.documentCount} {storageInfo.documentCount === 1 ? "documento" : "documentos"} • {storageInfo.usageFormatted} de {storageInfo.limitFormatted} usado
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress bar */}
        <div className="space-y-2">
          <Progress 
            value={storageInfo.usagePercent} 
            className={`h-2 ${
              storageInfo.isFull 
                ? "bg-destructive" 
                : storageInfo.isNearLimit 
                ? "bg-warning" 
                : "bg-muted"
            }`}
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{storageInfo.usagePercent.toFixed(1)}% usado</span>
            <span>{storageInfo.availableFormatted} disponível</span>
          </div>
        </div>

        {/* Warnings */}
        {storageInfo.isFull && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Armazenamento Cheio:</strong> Você atingiu o limite de armazenamento. 
              Por favor, delete alguns documentos para liberar espaço antes de fazer upload de mais arquivos.
            </AlertDescription>
          </Alert>
        )}

        {storageInfo.isNearLimit && !storageInfo.isFull && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Armazenamento Quase Cheio:</strong> Você está usando mais de 90% do seu armazenamento. 
              Considere deletar documentos não utilizados para liberar espaço.
            </AlertDescription>
          </Alert>
        )}

        {!storageInfo.isNearLimit && !storageInfo.isFull && storageInfo.usagePercent > 0 && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Armazenamento saudável. Você tem {storageInfo.availableFormatted} disponível.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
