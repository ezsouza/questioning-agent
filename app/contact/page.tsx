import type { Metadata } from 'next'
import { ContactForm } from '@/components/contact/contact-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, MessageSquare, Github, Linkedin } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Contato - Questioning Agent',
  description: 'Entre em contato conosco. Estamos aqui para ajudar com suas dúvidas sobre o Questioning Agent.',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Entre em Contato</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tem alguma dúvida ou sugestão? Estamos aqui para ajudar. Preencha o formulário abaixo ou use um dos
              nossos canais de contato.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Envie uma Mensagem</CardTitle>
                  <CardDescription>
                    Responderemos o mais breve possível, geralmente em até 24 horas.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ContactForm />
                </CardContent>
              </Card>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" />
                    E-mail
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Link
                    href="mailto:contato@questioningagent.com"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    contato@questioningagent.com
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Chat ao Vivo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Segunda a Sexta<br />
                    9h às 18h (horário de Brasília)
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Redes Sociais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link
                    href="https://github.com/ezsouza/questioning-agent"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Github className="h-4 w-4" />
                    GitHub
                  </Link>
                  <Link
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </Link>
                </CardContent>
              </Card>

              <Card className="bg-muted">
                <CardHeader>
                  <CardTitle className="text-base">Dúvidas Frequentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Antes de entrar em contato, confira nossa{' '}
                    <Link href="/docs" className="text-primary hover:underline">
                      documentação
                    </Link>
                    . Muitas dúvidas podem ser respondidas por lá!
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* FAQ Quick Links */}
          <div className="pt-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Tópicos Populares</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="hover:bg-accent transition-colors cursor-pointer">
                <CardContent className="pt-6">
                  <Link href="/docs#inicio-rapido" className="block space-y-2">
                    <h3 className="font-semibold">Como Começar</h3>
                    <p className="text-sm text-muted-foreground">
                      Aprenda a usar o sistema em 3 passos simples
                    </p>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:bg-accent transition-colors cursor-pointer">
                <CardContent className="pt-6">
                  <Link href="/docs#upload" className="block space-y-2">
                    <h3 className="font-semibold">Upload de Documentos</h3>
                    <p className="text-sm text-muted-foreground">
                      Formatos suportados e melhores práticas
                    </p>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:bg-accent transition-colors cursor-pointer">
                <CardContent className="pt-6">
                  <Link href="/docs#geracao" className="block space-y-2">
                    <h3 className="font-semibold">Geração de Questões</h3>
                    <p className="text-sm text-muted-foreground">
                      Entenda os níveis cognitivos e opções
                    </p>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
