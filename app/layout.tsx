import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { getCurrentUser } from "@/lib/auth/session"
import { CookieConsentBanner } from "@/components/cookie-consent"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Questioning Agent - Geração de Questões com IA",
  description: "Gere questões educacionais em múltiplos níveis cognitivos a partir dos seus documentos usando IA",
  generator: "v0.app",
}

// Disable caching to always fetch fresh user data
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const user = await getCurrentUser()
  
  return (
    <html lang="pt-BR">
      <body className={`font-sans antialiased flex flex-col min-h-screen`}>
        <Navbar user={user} />
        <main className="flex-1">{children}</main>
        <Footer />
        <CookieConsentBanner />
        <Analytics />
      </body>
    </html>
  )
}
