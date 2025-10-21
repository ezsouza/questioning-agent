'use client'

import { useState } from 'react'
import { DocsSidebar } from './docs-sidebar'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'

export function DocsLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 lg:py-8">
        <div className="flex gap-0 lg:gap-8">
          {/* Mobile Sidebar Toggle */}
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg bg-background hover:bg-accent"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>

          {/* Sidebar */}
          <aside
            className={`
              fixed lg:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)] w-72 sm:w-80 lg:w-64
              transform transition-transform duration-300 ease-in-out
              lg:translate-x-0 bg-background
              ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
              overflow-y-auto border-r
            `}
          >
            <DocsSidebar onLinkClick={() => setIsSidebarOpen(false)} />
          </aside>

          {/* Overlay for mobile */}
          {isSidebarOpen && (
            <div
              className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* Main Content */}
          <main className="flex-1 min-w-0 w-full lg:max-w-4xl mx-auto lg:ml-0 px-0 sm:px-4">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
