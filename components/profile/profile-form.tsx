"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useAvatarUrl } from "@/hooks/use-avatar-url"
import { Upload, Loader2, X } from "lucide-react"

interface ProfileFormProps {
  user: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    imageKey?: string | null
  }
}

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState(user.name || "")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [localImagePreview, setLocalImagePreview] = useState<string | null>(null)

  // Use avatar URL hook for automatic renewal
  const { url: avatarUrl, isRenewing } = useAvatarUrl(user.image, user.imageKey)

  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || user.email?.[0]?.toUpperCase() || "U"

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Erro",
          description: "A imagem deve ter no máximo 5MB",
          variant: "destructive",
        })
        return
      }

      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLocalImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setLocalImagePreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let uploadedImageUrl = user.image

      // Upload da imagem se houver arquivo novo
      if (imageFile) {
        const formData = new FormData()
        formData.append("file", imageFile)

        const uploadResponse = await fetch("/api/upload/avatar", {
          method: "POST",
          body: formData,
        })

        if (!uploadResponse.ok) {
          throw new Error("Falha ao fazer upload da imagem")
        }

        const uploadData = await uploadResponse.json()
        uploadedImageUrl = uploadData.url
      }

      // Atualizar perfil
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          image: uploadedImageUrl || null,
        }),
      })

      if (!response.ok) {
        throw new Error("Falha ao atualizar perfil")
      }

      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso",
      })

      // Force full page reload to update session and navbar with new avatar
      window.location.reload()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o perfil. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Use local preview if available, otherwise use avatar URL from hook
  const displayImageUrl = localImagePreview || avatarUrl

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Foto de Perfil */}
      <div className="flex items-start gap-6">
        <div className="relative">
          <Avatar className="h-24 w-24">
            {isRenewing && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-full z-10">
                <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <AvatarImage 
              src={displayImageUrl || undefined} 
              alt={name || "User"}
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
            />
            <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
          </Avatar>
          {displayImageUrl && (
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90 transition-colors z-20"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <Label htmlFor="avatar" className="text-base">
            Foto de Perfil
          </Label>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => document.getElementById("avatar")?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Carregar Foto
            </Button>
            <Input
              id="avatar"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <span className="text-sm text-muted-foreground">
              JPG, PNG ou GIF. Máximo 5MB
            </span>
          </div>
        </div>
      </div>

      {/* Nome */}
      <div className="space-y-2">
        <Label htmlFor="name">Nome Completo</Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Seu nome completo"
          maxLength={100}
        />
      </div>

      {/* Email (somente leitura) */}
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          value={user.email || ""}
          disabled
          className="bg-muted cursor-not-allowed"
        />
        <p className="text-sm text-muted-foreground">
          O e-mail não pode ser alterado. Entre em contato com o suporte se precisar mudar.
        </p>
      </div>

      {/* Botão de Salvar */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>
    </form>
  )
}
