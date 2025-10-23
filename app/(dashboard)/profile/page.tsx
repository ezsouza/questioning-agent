import { Metadata } from "next"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth/session"
import { ProfileForm } from "@/components/profile/profile-form"
import { DeleteAccountSection } from "@/components/profile/delete-account-section"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { User } from "lucide-react"

export const metadata: Metadata = {
  title: "Perfil - Questioning Agent",
  description: "Gerencie suas informações pessoais e configurações de conta",
}

export default async function ProfilePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <User className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Perfil</h1>
        </div>
        <p className="text-muted-foreground">
          Gerencie suas informações pessoais e configurações de conta
        </p>
      </div>

      <div className="space-y-6">
        {/* Informações Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
            <CardDescription>
              Atualize suas informações de perfil e foto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm user={user} />
          </CardContent>
        </Card>

        <Separator />

        {/* Segurança da Conta */}
        <Card>
          <CardHeader>
            <CardTitle>Segurança da Conta</CardTitle>
            <CardDescription>
              Gerencie a segurança e privacidade da sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DeleteAccountSection userId={user.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
