'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Brain, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { UserNav } from '@/components/auth/user-nav'

interface NavbarProps {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
  } | null
}

export function Navbar({ user }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Brain className="h-6 w-6 text-primary" />
            <span className="text-xl">Questioning Agent</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-primary',
                    isActive('/dashboard') ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard"
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-primary',
                    isActive('/dashboard') ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  Documentos
                </Link>
                <Link
                  href="/dashboard/questions"
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-primary',
                    isActive('/dashboard/questions') ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  Questões
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/"
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-primary',
                    isActive('/') ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  Início
                </Link>
                <Link
                  href="/docs"
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-primary',
                    isActive('/docs') ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  Documentação
                </Link>
              </>
            )}
          </div>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <UserNav user={user} />
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/login">Entrar</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/register">Começar</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className={cn(
                    'block py-2 text-sm font-medium transition-colors hover:text-primary',
                    isActive('/dashboard') ? 'text-primary' : 'text-muted-foreground'
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard"
                  className={cn(
                    'block py-2 text-sm font-medium transition-colors hover:text-primary',
                    isActive('/dashboard') ? 'text-primary' : 'text-muted-foreground'
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Documentos
                </Link>
                <Link
                  href="/dashboard/questions"
                  className={cn(
                    'block py-2 text-sm font-medium transition-colors hover:text-primary',
                    isActive('/dashboard/questions') ? 'text-primary' : 'text-muted-foreground'
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Questões
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/"
                  className={cn(
                    'block py-2 text-sm font-medium transition-colors hover:text-primary',
                    isActive('/') ? 'text-primary' : 'text-muted-foreground'
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Início
                </Link>
                <Link
                  href="/docs"
                  className={cn(
                    'block py-2 text-sm font-medium transition-colors hover:text-primary',
                    isActive('/docs') ? 'text-primary' : 'text-muted-foreground'
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Documentação
                </Link>
                <div className="pt-4 border-t space-y-2">
                  <Button asChild variant="ghost" size="sm" className="w-full">
                    <Link href="/login">Entrar</Link>
                  </Button>
                  <Button asChild size="sm" className="w-full">
                    <Link href="/register">Começar</Link>
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
