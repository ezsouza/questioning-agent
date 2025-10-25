"use client"

import Link from "next/link"
import { logout } from "@/lib/auth/actions"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, LogOut, Settings } from "lucide-react"
import { useAvatarUrl } from "@/hooks/use-avatar-url"

interface UserNavProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
    imageKey?: string | null
  }
}

export function UserNav({ user }: UserNavProps) {
  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U"

  // Use avatar URL hook for automatic renewal
  const { url: avatarUrl, isRenewing } = useAvatarUrl(user.image, user.imageKey)

  async function handleLogout() {
    await logout()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full cursor-pointer hover:border hover:border-muted">
          <Avatar className="h-10 w-10">
            {isRenewing && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-full">
                <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <AvatarImage 
              src={avatarUrl} 
              alt={user.name || "User"}
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
            />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/profile" className="cursor-pointer">Perfil</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={async () => {
              await logout()
              window.location.href = "/login"
            }}
            className="cursor-pointer"
          >
            Sair
          </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
