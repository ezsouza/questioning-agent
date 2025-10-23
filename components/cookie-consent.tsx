"use client"

import { useState, useEffect } from "react"
import CookieConsent from "react-cookie-consent"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Cookie } from "lucide-react"

export function CookieConsentBanner() {
  const [showSettings, setShowSettings] = useState(false)
  const [hideBanner, setHideBanner] = useState(false)
  const [preferences, setPreferences] = useState({
    necessary: true, // Sempre ativo
    functional: true,
    analytics: true,
    marketing: false,
  })

  // Carregar preferências salvas
  useEffect(() => {
    const saved = localStorage.getItem("cookiePreferences")
    if (saved) {
      setPreferences(JSON.parse(saved))
    }
  }, [])

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    }
    setPreferences(allAccepted)
    localStorage.setItem("cookiePreferences", JSON.stringify(allAccepted))
    setShowSettings(false)
  }

  const handleSavePreferences = () => {
    localStorage.setItem("cookiePreferences", JSON.stringify(preferences))
    setShowSettings(false)
    setHideBanner(false)
  }

  const handleRejectNonEssential = () => {
    const minimal = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    }
    setPreferences(minimal)
    localStorage.setItem("cookiePreferences", JSON.stringify(minimal))
    setShowSettings(false)
    setHideBanner(false)
  }

  const handleOpenSettings = () => {
    setShowSettings(true)
    setHideBanner(true)
  }

  const handleCloseSettings = (open: boolean) => {
    setShowSettings(open)
    if (!open) {
      setHideBanner(false)
    }
  }

  return (
    <>
      <CookieConsent
        location="bottom"
        buttonText="Aceitar Todos"
        declineButtonText="Apenas Essenciais"
        enableDeclineButton
        onAccept={handleAcceptAll}
        onDecline={handleRejectNonEssential}
        cookieName="userCookieConsent"
        expires={365}
        overlay={false}
        style={{
          background: "rgba(255, 255, 255, 0.98)",
          borderTop: "1px solid rgba(0, 0, 0, 0.1)",
          padding: "1.25rem 1.5rem",
          alignItems: "center",
          boxShadow: "0 -8px 32px rgba(0, 0, 0, 0.12), 0 -2px 8px rgba(0, 0, 0, 0.08)",
          backdropFilter: "blur(12px)",
          zIndex: 9999,
          display: hideBanner ? "none" : "flex",
        }}
        buttonStyle={{
          background: "#000000",
          color: "#ffffff",
          fontSize: "14px",
          padding: "0.625rem 1.25rem",
          borderRadius: "0.5rem",
          fontWeight: "600",
          cursor: "pointer",
          border: "none",
          transition: "all 0.2s ease",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
        }}
        declineButtonStyle={{
          background: "#ffffff",
          color: "#000000",
          fontSize: "14px",
          padding: "0.625rem 1.25rem",
          borderRadius: "0.5rem",
          fontWeight: "600",
          cursor: "pointer",
          border: "1px solid #e5e7eb",
          transition: "all 0.2s ease",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
        }}
        contentStyle={{
          flex: "1 0 300px",
          margin: "0 1rem",
          color: "#1f2937",
        }}
      >
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-black rounded-xl shrink-0">
            <Cookie className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-base mb-2 text-gray-900">
              Nós usamos cookies
            </h3>
            <p className="text-sm text-gray-600 mb-3 leading-relaxed">
              Este site utiliza cookies para melhorar sua experiência de navegação, 
              personalizar conteúdo e analisar nosso tráfego. De acordo com a LGPD 
              (Lei Geral de Proteção de Dados), você tem o direito de consentir ou 
              recusar o uso de cookies não essenciais.
            </p>
            <div className="flex items-center gap-2">
              <Dialog open={showSettings} onOpenChange={handleCloseSettings}>
                <DialogTrigger asChild>
                  <button 
                    onClick={handleOpenSettings}
                    className="text-sm font-semibold text-black hover:text-gray-700 underline underline-offset-4 transition-colors cursor-pointer"
                  >
                    Gerenciar Preferências
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[540px] md:max-h-[90vh] bg-white border-gray-200 shadow-2xl z-9999">
                  <DialogHeader className="border-b border-gray-200 pb-4">
                    <DialogTitle className="flex items-center gap-2.5 text-xl">
                      <div className="p-2 bg-black rounded-lg">
                        <Cookie className="h-5 w-5 text-white" />
                      </div>
                      Configurações de Cookies
                    </DialogTitle>
                    <DialogDescription className="text-gray-600">
                      Personalize suas preferências de cookies. Os cookies essenciais 
                      são necessários para o funcionamento básico do site e não podem 
                      ser desativados.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-5 py-2 pr-2 overflow-y-auto max-h-[350px]">
                    {/* Cookies Necessários */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <Label className="text-base font-bold text-gray-900 cursor-pointer">
                            🔒 Cookies Essenciais
                          </Label>
                          <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">
                            Necessários para o funcionamento básico do site, incluindo 
                            autenticação e segurança.
                          </p>
                        </div>
                        <Checkbox
                          checked={true}
                          disabled
                          className="mt-1 border-gray-300 data-[state=checked]:bg-black data-[state=checked]:border-black"
                        />
                      </div>
                    </div>

                    {/* Cookies Funcionais */}
                    <div className="p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <Label className="text-base font-bold text-gray-900 cursor-pointer">
                            ⚙️ Cookies Funcionais
                          </Label>
                          <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">
                            Permitem funcionalidades aprimoradas e personalização, 
                            como preferências de idioma e tema.
                          </p>
                        </div>
                        <Checkbox
                          checked={preferences.functional}
                          onCheckedChange={(checked) =>
                            setPreferences({ ...preferences, functional: !!checked })
                          }
                          className="mt-1 border-gray-300 data-[state=checked]:bg-black data-[state=checked]:border-black"
                        />
                      </div>
                    </div>

                    {/* Cookies Analíticos */}
                    <div className="p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <Label className="text-base font-bold text-gray-900 cursor-pointer">
                            📊 Cookies Analíticos
                          </Label>
                          <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">
                            Ajudam a entender como os visitantes interagem com o site, 
                            fornecendo informações sobre métricas como número de visitantes.
                          </p>
                        </div>
                        <Checkbox
                          checked={preferences.analytics}
                          onCheckedChange={(checked) =>
                            setPreferences({ ...preferences, analytics: !!checked })
                          }
                          className="mt-1 border-gray-300 data-[state=checked]:bg-black data-[state=checked]:border-black"
                        />
                      </div>
                    </div>

                    {/* Cookies de Marketing */}
                    <div className="p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <Label className="text-base font-bold text-gray-900 cursor-pointer">
                            📢 Cookies de Marketing
                          </Label>
                          <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">
                            Usados para rastrear visitantes em sites e exibir anúncios 
                            relevantes e atraentes.
                          </p>
                        </div>
                        <Checkbox
                          checked={preferences.marketing}
                          onCheckedChange={(checked) =>
                            setPreferences({ ...preferences, marketing: !!checked })
                          }
                          className="mt-1 border-gray-300 data-[state=checked]:bg-black data-[state=checked]:border-black"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex w-full flex-col md:flex-row gap-3 justify-end pt-4 border-t border-gray-200">
                    <Button
                      variant="outline"
                      onClick={handleRejectNonEssential}
                      className="font-semibold border-gray-300 hover:bg-gray-50"
                    >
                      Rejeitar Não Essenciais
                    </Button>
                    <Button 
                      onClick={handleSavePreferences}
                      className="font-semibold bg-black hover:bg-gray-800 text-white shadow-md"
                    >
                      Salvar Preferências
                    </Button>
                  </div>

                  <p className="text-xs text-gray-500 text-center">
                    Para mais informações sobre como tratamos seus dados, consulte 
                    nossa{" "}
                    <a href="/privacy" className="font-semibold text-black hover:underline">
                      Política de Privacidade
                    </a>
                    .
                  </p>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </CookieConsent>
    </>
  )
}
