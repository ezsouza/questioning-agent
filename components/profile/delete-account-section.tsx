"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { AlertTriangle, Loader2, UserX } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

interface DeleteAccountSectionProps {
  userId: string
}

export function DeleteAccountSection({ userId }: DeleteAccountSectionProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeactivating, setIsDeactivating] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [understood, setUnderstood] = useState(false)

  const handleDeactivateAccount = async () => {
    setIsDeactivating(true)

    try {
      const response = await fetch("/api/user/deactivate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Falha ao desativar conta")
      }

      toast({
        title: "Conta Desativada",
        description: "Sua conta foi desativada com sucesso. Você será redirecionado...",
      })

      // Aguardar 2 segundos e redirecionar
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível desativar a conta. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsDeactivating(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (confirmText !== "EXCLUIR MINHA CONTA") {
      toast({
        title: "Erro de Confirmação",
        description: "Digite exatamente 'EXCLUIR MINHA CONTA' para confirmar",
        variant: "destructive",
      })
      return
    }

    if (!understood) {
      toast({
        title: "Confirmação Necessária",
        description: "Você deve confirmar que entende que esta ação é irreversível",
        variant: "destructive",
      })
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch("/api/user/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Falha ao excluir conta")
      }

      toast({
        title: "Conta Excluída",
        description: "Sua conta e todos os dados foram excluídos permanentemente.",
      })

      // Aguardar 2 segundos e redirecionar
      setTimeout(() => {
        router.push("/")
      }, 2000)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a conta. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Desativar Conta */}
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <UserX className="h-5 w-5 text-orange-500 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold">Desativar Conta</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Desative temporariamente sua conta. Você poderá reativá-la fazendo login novamente.
              Seus dados serão preservados.
            </p>
          </div>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" disabled={isDeactivating}>
              {isDeactivating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Desativar Conta
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Desativar Conta</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja desativar sua conta? Você poderá reativá-la a qualquer
                momento fazendo login novamente. Seus documentos e questões serão preservados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeactivateAccount}>
                Desativar Conta
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Excluir Conta Permanentemente */}
      <div className="space-y-3 pt-6 border-t border-destructive/20">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-destructive">Excluir Conta Permanentemente</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Esta ação é <strong>irreversível</strong>. Todos os seus dados, incluindo
              documentos, questões e histórico serão permanentemente excluídos de acordo com a
              LGPD.
            </p>
          </div>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={isDeleting}>
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir Conta Permanentemente
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Excluir Conta Permanentemente
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-4">
                  <p>
                    Esta ação é <strong>irreversível</strong> e resultará na exclusão permanente
                    de:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Sua conta e informações pessoais</li>
                    <li>Todos os documentos enviados</li>
                    <li>Todas as questões geradas</li>
                    <li>Todo o histórico de atividades</li>
                    <li>Embeddings e dados de processamento</li>
                  </ul>
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="understand"
                        checked={understood}
                        onCheckedChange={(checked) => setUnderstood(checked as boolean)}
                      />
                      <Label
                        htmlFor="understand"
                        className="text-sm font-normal cursor-pointer"
                      >
                        Eu entendo que esta ação é irreversível
                      </Label>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm" className="text-sm">
                        Digite <strong>EXCLUIR MINHA CONTA</strong> para confirmar:
                      </Label>
                      <Input
                        id="confirm"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder="EXCLUIR MINHA CONTA"
                        className="font-mono"
                      />
                    </div>
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setConfirmText("")
                setUnderstood(false)
              }}>
                Cancelar
              </AlertDialogCancel>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={isDeleting || confirmText !== "EXCLUIR MINHA CONTA" || !understood}
              >
                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Excluir Permanentemente
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
