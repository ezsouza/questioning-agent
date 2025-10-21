import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Brain, Sparkles, Download } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-primary/10 rounded-full">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Powered by RAG & IA</span>
          </div>
          <h1 className="text-5xl font-bold mb-4 text-balance">Questioning Agent</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            Gere questões educacionais em múltiplos níveis cognitivos a partir dos seus documentos usando IA avançada
          </p>
          <div className="flex gap-4 justify-center mt-8">
            <Button asChild size="lg">
              <Link href="/dashboard">Começar</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/docs">Saiba Mais</Link>
            </Button>
          </div>
        </header>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardHeader>
              <FileText className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Upload de Documentos</CardTitle>
              <CardDescription>Suporte para arquivos PDF, DOCX, TXT e Markdown</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Brain className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Pipeline RAG</CardTitle>
              <CardDescription>Embeddings vetoriais com busca semântica e recuperação</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Sparkles className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Geração com IA</CardTitle>
              <CardDescription>Questões em todos os níveis da Taxonomia de Bloom</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Download className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Exportar e Revisar</CardTitle>
              <CardDescription>Edite questões e exporte para JSON ou CSV</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* How it Works */}
        <section className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Como Funciona</h2>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>1. Envie Seu Documento</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Envie arquivos PDF, DOCX, TXT ou Markdown. O sistema irá processar e dividir automaticamente seu
                  conteúdo.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. Gere Embeddings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Seu documento é convertido em embeddings vetoriais e indexado para busca semântica usando PostgreSQL
                  com pgvector.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. Gere Questões</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Selecione níveis cognitivos e deixe a IA gerar questões direcionadas com citações de evidências e
                  níveis de dificuldade.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>4. Revise e Exporte</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Revise as questões geradas, faça edições se necessário e exporte para JSON ou CSV para uso em seu
                  sistema de gerenciamento de aprendizagem.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
}
