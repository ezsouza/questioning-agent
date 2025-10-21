"use client"

import type React from "react"

import { useState } from "react"
import { login } from "@/lib/auth/actions"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)

    try {
      const result = await login(formData)

      if (result?.error) {
        setError(result.error)
      }
      // If successful, the server action will redirect
    } catch {
      setError("Ocorreu um erro. Por favor, tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" name="email" type="email" placeholder="seu@email.com" required disabled={isLoading} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input id="password" name="password" type="password" required disabled={isLoading} />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Entrar
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Não tem uma conta?{" "}
        <Link href="/register" className="text-primary hover:underline">
          Cadastre-se
        </Link>
      </p>
    </form>
  )
}
