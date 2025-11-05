"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Lightbulb, GraduationCap, Info } from "lucide-react"

export type QuestionPurpose = "CREATION" | "EVALUATION"

interface QuestionPurposeSelectorProps {
  value: QuestionPurpose
  onChange: (value: QuestionPurpose) => void
}

export function QuestionPurposeSelector({ value, onChange }: QuestionPurposeSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Info className="h-5 w-5" />
          Propósito das Questões
        </CardTitle>
        <CardDescription>Escolha o objetivo das questões a serem geradas</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup value={value} onValueChange={(v) => onChange(v as QuestionPurpose)}>
          <div className="space-y-3">
            <div
              className={`flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                value === "CREATION"
                  ? "border-primary bg-primary/5"
                  : "border-muted hover:border-primary/50"
              }`}
              onClick={() => onChange("CREATION")}
            >
              <RadioGroupItem value="CREATION" id="creation" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="creation" className="cursor-pointer flex items-center gap-2 font-semibold">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  Criação / Brainstorm
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Gere questões para ajudar a desenvolver e evoluir o documento. Foco em ideias criativas,
                  expansão de conceitos e brainstorming.
                </p>
                <div className="mt-2 text-xs text-muted-foreground">
                  <strong>Níveis de profundidade:</strong> Exploratório, Expandido, Avançado
                </div>
              </div>
            </div>

            <div
              className={`flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                value === "EVALUATION"
                  ? "border-primary bg-primary/5"
                  : "border-muted hover:border-primary/50"
              }`}
              onClick={() => onChange("EVALUATION")}
            >
              <RadioGroupItem value="EVALUATION" id="evaluation" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="evaluation" className="cursor-pointer flex items-center gap-2 font-semibold">
                  <GraduationCap className="h-4 w-4 text-blue-500" />
                  Avaliação / Teste
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Gere questões para criar uma prova, teste ou avaliação sobre o conteúdo. Inclui gabarito
                  opcional (pode ser ocultado).
                </p>
                <div className="mt-2 text-xs text-muted-foreground">
                  <strong>Níveis de dificuldade (Bloom):</strong> Fácil, Médio, Difícil
                </div>
              </div>
            </div>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  )
}
