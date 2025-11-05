"use client"

import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CheckCircle2, AlertCircle, Sparkles, FileText, Award } from "lucide-react"

interface QualityBadgesProps {
  badges: string[]
  qualityScore?: number | null
  className?: string
}

const badgeConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon?: React.ComponentType<{ className?: string }> }> = {
  "Excelente Qualidade": { variant: "default", icon: Award },
  "Boa Qualidade": { variant: "default", icon: CheckCircle2 },
  "Pronto para IA": { variant: "default", icon: Sparkles },
  "Qualidade Limitada": { variant: "destructive", icon: AlertCircle },
  "Conteúdo Extenso": { variant: "secondary", icon: FileText },
  "Conteúdo Completo": { variant: "secondary", icon: FileText },
  "Bem Estruturado": { variant: "default", icon: CheckCircle2 },
  "Altamente Técnico": { variant: "secondary" },
  "Conteúdo Técnico": { variant: "secondary" },
  "Narrativo": { variant: "outline" },
  "Técnico": { variant: "outline" },
  "Instrucional": { variant: "outline" },
  "Conteúdo Misto": { variant: "outline" },
}

export function QualityBadges({ badges, qualityScore, className = "" }: QualityBadgesProps) {
  if (!badges || badges.length === 0) {
    return null
  }

  return (
    <TooltipProvider>
      <div className={`flex flex-wrap gap-1.5 ${className}`}>
        {qualityScore !== null && qualityScore !== undefined && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant={qualityScore >= 80 ? "default" : qualityScore >= 60 ? "secondary" : "destructive"}
                className="text-xs"
              >
                Score: {qualityScore}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">Pontuação de qualidade do conteúdo (0-100)</p>
            </TooltipContent>
          </Tooltip>
        )}

        {badges.map((badge, index) => {
          const config = badgeConfig[badge] || { variant: "default" as const }
          const Icon = config.icon

          return (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <Badge variant={config.variant} className="text-xs flex items-center gap-1">
                  {Icon && <Icon className="h-3 w-3" />}
                  {badge}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm">{getBadgeDescription(badge)}</p>
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>
    </TooltipProvider>
  )
}

function getBadgeDescription(badge: string): string {
  const descriptions: Record<string, string> = {
    "Excelente Qualidade": "Conteúdo de alta qualidade, ideal para geração de questões",
    "Boa Qualidade": "Conteúdo adequado para geração de questões",
    "Pronto para IA": "Documento otimizado para processamento por IA",
    "Qualidade Limitada": "Conteúdo pode não gerar questões de qualidade",
    "Conteúdo Extenso": "Documento grande com muito conteúdo",
    "Conteúdo Completo": "Documento com tamanho adequado",
    "Bem Estruturado": "Conteúdo organizado com títulos e listas",
    "Altamente Técnico": "Conteúdo com alto nível técnico",
    "Conteúdo Técnico": "Conteúdo com termos técnicos",
    "Narrativo": "Estilo narrativo ou histórico",
    "Técnico": "Foco em aspectos técnicos",
    "Instrucional": "Conteúdo de ensino ou tutorial",
    "Conteúdo Misto": "Combina diferentes estilos",
  }

  return descriptions[badge] || badge
}
