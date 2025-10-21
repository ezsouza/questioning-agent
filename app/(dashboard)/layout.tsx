import type React from "react"
import { requireUser } from "@/lib/auth/session"
import { DashboardNav } from "@/components/layout/dashboard-nav"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser()

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav user={user} />
      <main>{children}</main>
    </div>
  )
}
