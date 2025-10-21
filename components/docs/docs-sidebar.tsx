'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  BookOpen,
  Rocket,
  FileText,
  Brain,
  Sparkles,
  Database,
  Code,
  Settings,
  Shield,
  Download,
} from 'lucide-react'

interface NavItem {
  title: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
}

interface NavSection {
  title: string
  items: NavItem[]
}

const navigation: NavSection[] = [
  {
    title: 'Primeiros Passos',
    items: [
      { title: 'Introdução', href: '#introducao', icon: BookOpen },
      { title: 'Início Rápido', href: '#inicio-rapido', icon: Rocket },
      { title: 'Instalação', href: '#instalacao', icon: Settings },
    ],
  },
  {
    title: 'Recursos',
    items: [
      { title: 'Upload de Documentos', href: '#upload', icon: FileText },
      { title: 'Pipeline RAG', href: '#rag', icon: Brain },
      { title: 'Geração de Questões', href: '#geracao', icon: Sparkles },
      { title: 'Exportação', href: '#exportacao', icon: Download },
    ],
  },
  {
    title: 'Técnico',
    items: [
      { title: 'Arquitetura', href: '#arquitetura', icon: Code },
      { title: 'Banco de Dados', href: '#database', icon: Database },
      { title: 'Segurança', href: '#seguranca', icon: Shield },
    ],
  },
]

interface DocsSidebarProps {
  onLinkClick?: () => void
}

export function DocsSidebar({ onLinkClick }: DocsSidebarProps) {
  const pathname = usePathname()

  return (
    <nav className="space-y-6 py-6 px-4 sm:px-6">
      {navigation.map((section) => (
        <div key={section.title} className="space-y-3">
          <h4 className="font-semibold text-sm text-foreground px-1">{section.title}</h4>
          <ul className="space-y-1">
            {section.items.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || `#${pathname.split('#')[1]}` === item.href
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onLinkClick}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 sm:py-2 rounded-md text-sm transition-colors',
                      'hover:bg-accent hover:text-accent-foreground active:scale-95',
                      isActive
                        ? 'bg-accent text-accent-foreground font-medium'
                        : 'text-muted-foreground'
                    )}
                  >
                    {Icon && <Icon className="h-4 w-4 shrink-0" />}
                    <span className="text-sm sm:text-sm">{item.title}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}
