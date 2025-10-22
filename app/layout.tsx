import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Navbar } from "@/components/layout/navbar"
import { getCurrentUser } from "@/lib/auth/session"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Questioning Agent - Geração de Questões com IA",
  description: "Gere questões educacionais em múltiplos níveis cognitivos a partir dos seus documentos usando IA",
  generator: "v0.app",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const user = await getCurrentUser()
  
  return (
    <html lang="pt-BR">
      <body className={`font-sans antialiased`}>
        <Navbar user={user} />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
