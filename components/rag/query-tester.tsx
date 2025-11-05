"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Search } from "lucide-react"

interface QueryTesterProps {
  documentId: string
}

interface QueryResult {
  chunks: Array<{
    id: string
    content: string
    similarity: number
    position: number
  }>
  metadata: {
    topK: number
    totalResults: number
    latency: number
    contextTokens: number
  }
}

export function QueryTester({ documentId }: QueryTesterProps) {
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<QueryResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleQuery() {
    if (!query.trim()) return

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId,
          query,
          topK: 5,
          rerank: true,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Query failed")
      }

      const data = await response.json()
      setResult(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Query failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Testar Recuperação RAG
          </CardTitle>
          <CardDescription>Consulte seu documento para testar o sistema de recuperação</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Digite sua consulta aqui..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={3}
            disabled={isLoading}
          />
          <Button onClick={handleQuery} disabled={isLoading || !query.trim()} className="w-full">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Buscar
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados</CardTitle>
            <CardDescription>
              Encontrados {result.metadata.totalResults} blocos relevantes em {result.metadata.latency}ms (
              {result.metadata.contextTokens} tokens)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.chunks.map((chunk, _index) => (
              <div key={chunk.id} className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">Bloco {chunk.position + 1}</Badge>
                  <Badge variant="secondary">{(chunk.similarity * 100).toFixed(1)}% correspondência</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{chunk.content}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
