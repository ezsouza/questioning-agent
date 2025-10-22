export const dynamic = "force-dynamic"

import type React from "react"
import { requireUser } from "@/lib/auth/session"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Ensure user is authenticated before rendering dashboard
  await requireUser()

  return (
    <div className="min-h-screen bg-background">
      <main>{children}</main>
    </div>
  )
}
