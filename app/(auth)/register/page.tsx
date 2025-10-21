import type { Metadata } from "next"
import { RegisterForm } from "@/components/auth/register-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Cadastro - Questioning Agent",
  description: "Crie uma nova conta",
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Criar Conta</CardTitle>
          <CardDescription>Cadastre-se para começar a gerar questões a partir dos seus documentos</CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
      </Card>
    </div>
  )
}
