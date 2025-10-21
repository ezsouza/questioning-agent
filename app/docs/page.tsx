import type { Metadata } from 'next'
import { DocsLayout } from '@/components/docs/docs-layout'
import { DocsContent } from '@/components/docs/docs-content'

export const metadata: Metadata = {
  title: 'Documentação - Questioning Agent',
  description: 'Documentação completa do Questioning Agent - Sistema de geração de questões com IA',
}

export default function DocsPage() {
  return (
    <DocsLayout>
      <DocsContent />
    </DocsLayout>
  )
}
