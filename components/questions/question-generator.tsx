"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Sparkles } from "lucide-react"
import { QuestionPurposeSelector, type QuestionPurpose } from "@/components/questions/question-purpose-selector"
import { COGNITIVE_LEVEL_DESCRIPTIONS } from "@/lib/constants"

interface QuestionGeneratorProps {
  documentId: string
}

export function QuestionGenerator({ documentId }: QuestionGeneratorProps) {
  const router = useRouter()
  const [purpose, setPurpose] = useState<QuestionPurpose>("EVALUATION")
  const [selectedLevels, setSelectedLevels] = useState<string[]>(["REMEMBER", "UNDERSTAND", "APPLY"])
  const [questionsPerLevel, setQuestionsPerLevel] = useState(3)
  const [includeAnswers, setIncludeAnswers] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const levels = ["REMEMBER", "UNDERSTAND", "APPLY", "ANALYZE", "EVALUATE", "CREATE"]

  function toggleLevel(level: string) {
    setSelectedLevels((prev) => (prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]))
  }

  async function handleGenerate() {
    if (selectedLevels.length === 0) {
      setError("Por favor, selecione pelo menos um nível cognitivo")
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId,
          levels: selectedLevels,
          questionsPerLevel,
          purpose,
          includeAnswers: purpose === "EVALUATION" ? includeAnswers : false,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Falha na geração")
      }

      const _result = await response.json()

      // Refresh the page to show new questions
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha na geração")
    } finally {
      setIsGenerating(false)
    }
  }

  const processingMessage = isGenerating
    ? "Processando documento e gerando questões..."
    : null

  return (
    <div className="space-y-6">
      <QuestionPurposeSelector value={purpose} onChange={setPurpose} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Gerar Questões
          </CardTitle>
          <CardDescription>
            Selecione níveis cognitivos e gere questões com IA
            {purpose === "CREATION" && " focadas em brainstorming e desenvolvimento"}
            {purpose === "EVALUATION" && " para avaliação e testes"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <Label>
              {purpose === "CREATION" 
                ? "Níveis de Profundidade (Criação)" 
                : "Níveis Cognitivos (Taxonomia de Bloom)"}
            </Label>
            <div className="space-y-3">
              {levels.map((level) => (
                <div key={level} className="flex items-start gap-3 p-3 border rounded-lg">
                  <Checkbox
                    id={level}
                    checked={selectedLevels.includes(level)}
                    onCheckedChange={() => toggleLevel(level)}
                    disabled={isGenerating}
                  />
                  <div className="flex-1">
                    <Label htmlFor={level} className="font-medium cursor-pointer">
                      {level.charAt(0) + level.slice(1).toLowerCase()}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {COGNITIVE_LEVEL_DESCRIPTIONS[level.toLowerCase() as keyof typeof COGNITIVE_LEVEL_DESCRIPTIONS]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="count">Questões por Nível</Label>
            <Input
              id="count"
              type="number"
              min={1}
              max={10}
              value={questionsPerLevel}
              onChange={(e) => setQuestionsPerLevel(Number.parseInt(e.target.value) || 3)}
              disabled={isGenerating}
            />
            <p className="text-sm text-muted-foreground">
              Total: {selectedLevels.length * questionsPerLevel} questões serão geradas
            </p>
          </div>

          {purpose === "EVALUATION" && (
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <Label htmlFor="answers" className="font-medium">
                  Incluir Gabarito
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Gerar respostas para as questões (pode ser ocultado posteriormente)
                </p>
              </div>
              <Switch
                id="answers"
                checked={includeAnswers}
                onCheckedChange={setIncludeAnswers}
                disabled={isGenerating}
              />
            </div>
          )}

          <Button onClick={handleGenerate} disabled={isGenerating || selectedLevels.length === 0} className="w-full">
            {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isGenerating ? processingMessage : "Gerar Questões"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
