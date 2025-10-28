"use client"

import { useEffect, useState } from "react"
import { Progress } from "@/components/ui/progress"
import { formatBytes } from "@/lib/storage/quota"

interface StorageUsageBarProps {}

export default function StorageUsageBar({}: StorageUsageBarProps) {
  const [usage, setUsage] = useState<{ used: number; quota: number } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUsage() {
      setLoading(true)
      const res = await fetch("/api/storage/usage")
      if (res.ok) {
        const data = await res.json()
        setUsage({ used: data.used, quota: data.quota })
      }
      setLoading(false)
    }
    fetchUsage()
  }, [])

  if (loading || !usage) {
    return (
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Uso de armazenamento</span>
          <span className="text-xs text-muted-foreground">&nbsp;</span>
        </div>
        <Progress className="h-3 animate-pulse bg-muted-foreground" />
        <div className="text-xs text-muted-foreground mt-1">
          <span className="animate-pulse">Carregando...</span>
        </div>
      </div>
    )
  }

  const percent = Math.min(100, (usage.used / usage.quota) * 100)

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium">Uso de armazenamento</span>
        <span className="text-xs text-muted-foreground">
          {formatBytes(usage.used)} / {formatBytes(usage.quota)}
        </span>
      </div>
      <Progress value={percent} className="h-3" />
      <div className="text-xs text-muted-foreground mt-1">
        {percent.toFixed(1)}% utilizado
      </div>
    </div>
  )
}
