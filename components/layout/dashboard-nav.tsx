import Link from "next/link"
import { UserNav } from "@/components/auth/user-nav"
import { Button } from "@/components/ui/button"
import { Brain } from "lucide-react"

interface DashboardNavProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export function DashboardNav({ user }: DashboardNavProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <Brain className="h-6 w-6 text-primary" />
            <span>Questioning Agent</span>
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/dashboard">Documents</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/dashboard/questions">Questions</Link>
            </Button>
          </nav>
        </div>
        <UserNav user={user} />
      </div>
    </header>
  )
}
