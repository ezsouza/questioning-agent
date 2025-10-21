import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
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
  AlertCircle,
  CheckCircle2,
  Terminal,
} from 'lucide-react'
import Link from 'next/link'

export function DocsContent() {
  return (
    <div className="space-y-8 sm:space-y-12 pb-12 px-4 sm:px-0">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="text-xs">v1.0.0</Badge>
          <Badge variant="outline" className="text-xs">Beta</Badge>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Documentação</h1>
        <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
          Aprenda a usar o Questioning Agent para gerar questões educacionais de alta qualidade usando IA.
        </p>
      </div>

      <Separator />

      {/* Introdução */}
      <section id="introducao" className="scroll-mt-20 space-y-4">
        <div className="flex items-center gap-3">
          <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-primary shrink-0" />
          <h2 className="text-2xl sm:text-3xl font-bold">Introdução</h2>
        </div>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          O Questioning Agent é uma plataforma avançada que utiliza tecnologia RAG (Retrieval-Augmented Generation)
          para gerar questões educacionais a partir de documentos. O sistema analisa seu conteúdo, cria embeddings
          vetoriais e gera questões em diferentes níveis cognitivos baseados na Taxonomia de Bloom.
        </p>

        <Alert>
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <AlertTitle className="text-sm sm:text-base">Principais Benefícios</AlertTitle>
          <AlertDescription className="text-sm">
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>Geração automática de questões em múltiplos níveis cognitivos</li>
              <li>Suporte para PDF, DOCX, TXT e Markdown</li>
              <li>Busca semântica com embeddings vetoriais</li>
              <li>Exportação flexível (JSON, CSV)</li>
            </ul>
          </AlertDescription>
        </Alert>
      </section>

      <Separator />

      {/* Início Rápido */}
      <section id="inicio-rapido" className="scroll-mt-20 space-y-4">
        <div className="flex items-center gap-3">
          <Rocket className="h-5 w-5 sm:h-6 sm:w-6 text-primary shrink-0" />
          <h2 className="text-2xl sm:text-3xl font-bold">Início Rápido</h2>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  1
                </span>
                Crie uma Conta
              </CardTitle>
              <CardDescription className="text-sm">Registre-se para começar a usar o sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full sm:w-auto">
                <Link href="/register">Criar Conta Gratuita</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  2
                </span>
                Envie um Documento
              </CardTitle>
              <CardDescription className="text-sm">Faça upload do seu material de estudo</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Acesse o dashboard e faça upload de arquivos PDF, DOCX, TXT ou Markdown. O sistema processará
                automaticamente o conteúdo.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  3
                </span>
                Gere Questões
              </CardTitle>
              <CardDescription className="text-sm">Selecione os níveis cognitivos e gere questões</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Escolha os níveis da Taxonomia de Bloom e deixe a IA gerar questões personalizadas com base no seu
                documento.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      {/* Instalação */}
      <section id="instalacao" className="scroll-mt-20 space-y-4">
        <div className="flex items-center gap-3">
          <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-primary shrink-0" />
          <h2 className="text-2xl sm:text-3xl font-bold">Instalação</h2>
        </div>

        <Alert>
          <Terminal className="h-4 w-4 shrink-0" />
          <AlertTitle className="text-sm sm:text-base">Configuração de Desenvolvimento</AlertTitle>
          <AlertDescription className="mt-2">
            <pre className="rounded-lg bg-muted p-3 sm:p-4 overflow-x-auto">
              <code className="text-xs sm:text-sm">
                {`# Clone o repositório
git clone https://github.com/ezsouza/questioning-agent.git

# Instale as dependências
pnpm install

# Configure as variáveis de ambiente
cp .env.example .env

# Execute o servidor de desenvolvimento
pnpm dev`}
              </code>
            </pre>
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Variáveis de Ambiente</CardTitle>
            <CardDescription className="text-sm">Configure as seguintes variáveis no arquivo .env</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="rounded-lg bg-muted p-3 sm:p-4 overflow-x-auto text-xs sm:text-sm">
              <code>
                {`# Database
DATABASE_URL="postgresql://..."

# OpenAI
OPENAI_API_KEY="sk-..."

# NextAuth
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"`}
              </code>
            </pre>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* Upload de Documentos */}
      <section id="upload" className="scroll-mt-20 space-y-4">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-primary shrink-0" />
          <h2 className="text-2xl sm:text-3xl font-bold">Upload de Documentos</h2>
        </div>

        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          O sistema suporta diversos formatos de documentos e processa automaticamente o conteúdo para geração de
          questões.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Formatos Suportados</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                  <span className="text-sm">PDF (.pdf)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                  <span className="text-sm">Word (.docx)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                  <span className="text-sm">Texto (.txt)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                  <span className="text-sm">Markdown (.md)</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Limites</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Tamanho máximo: 10 MB</li>
                <li>Páginas: Até 100 páginas</li>
                <li>Processamento: ~30 segundos</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Alert variant="default">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <AlertTitle className="text-sm sm:text-base">Dica</AlertTitle>
          <AlertDescription className="text-sm">
            Para melhores resultados, use documentos bem estruturados com títulos e seções claras.
          </AlertDescription>
        </Alert>
      </section>

      <Separator />

      {/* Pipeline RAG */}
      <section id="rag" className="scroll-mt-20 space-y-4">
        <div className="flex items-center gap-3">
          <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-primary shrink-0" />
          <h2 className="text-2xl sm:text-3xl font-bold">Pipeline RAG</h2>
        </div>

        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          O sistema utiliza Retrieval-Augmented Generation (RAG) para garantir que as questões geradas sejam precisas
          e baseadas no conteúdo do documento.
        </p>

        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Como Funciona</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm sm:text-base">1. Chunking</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                O documento é dividido em chunks semânticos de tamanho otimizado (512-1024 tokens).
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm sm:text-base">2. Embeddings</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Cada chunk é convertido em um vetor de embeddings usando modelos de última geração (text-embedding-3).
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm sm:text-base">3. Indexação</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Os vetores são armazenados no PostgreSQL com pgvector para busca eficiente.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm sm:text-base">4. Retrieval</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Durante a geração, o sistema recupera os chunks mais relevantes usando busca por similaridade.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* Geração de Questões */}
      <section id="geracao" className="scroll-mt-20 space-y-4">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary shrink-0" />
          <h2 className="text-2xl sm:text-3xl font-bold">Geração de Questões</h2>
        </div>

        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Gere questões em diferentes níveis cognitivos baseados na Taxonomia de Bloom.
        </p>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Níveis da Taxonomia de Bloom</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { level: 'Conhecimento', description: 'Recordar fatos e conceitos básicos' },
                { level: 'Compreensão', description: 'Explicar ideias ou conceitos' },
                { level: 'Aplicação', description: 'Usar informação em novas situações' },
                { level: 'Análise', description: 'Estabelecer conexões entre ideias' },
                { level: 'Síntese', description: 'Criar ou gerar algo novo' },
                { level: 'Avaliação', description: 'Justificar uma posição ou decisão' },
              ].map((item) => (
                <div key={item.level} className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-0.5 shrink-0 text-xs">
                    {item.level}
                  </Badge>
                  <p className="text-sm text-muted-foreground flex-1 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      {/* Exportação */}
      <section id="exportacao" className="scroll-mt-20 space-y-4">
        <div className="flex items-center gap-3">
          <Download className="h-5 w-5 sm:h-6 sm:w-6 text-primary shrink-0" />
          <h2 className="text-2xl sm:text-3xl font-bold">Exportação</h2>
        </div>

        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Exporte suas questões em diferentes formatos para integração com sistemas de aprendizagem.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">JSON</CardTitle>
              <CardDescription className="text-sm">Formato estruturado para APIs e integrações</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="rounded-lg bg-muted p-3 sm:p-4 overflow-x-auto text-xs">
                <code>
                  {`{
  "questions": [
    {
      "id": "q1",
      "text": "...",
      "level": "aplicacao",
      "difficulty": "medium"
    }
  ]
}`}
                </code>
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">CSV</CardTitle>
              <CardDescription className="text-sm">Para importação em planilhas e LMS</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="rounded-lg bg-muted p-3 sm:p-4 overflow-x-auto text-xs">
                <code>
                  {`id,text,level,difficulty
q1,"...",aplicacao,medium
q2,"...",analise,hard`}
                </code>
              </pre>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      {/* Arquitetura */}
      <section id="arquitetura" className="scroll-mt-20 space-y-4">
        <div className="flex items-center gap-3">
          <Code className="h-5 w-5 sm:h-6 sm:w-6 text-primary shrink-0" />
          <h2 className="text-2xl sm:text-3xl font-bold">Arquitetura</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Stack Tecnológica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2 text-sm sm:text-base">Frontend</h4>
              <div className="flex flex-wrap gap-2">
                <Badge className="text-xs">Next.js 15</Badge>
                <Badge className="text-xs">React 19</Badge>
                <Badge className="text-xs">TypeScript</Badge>
                <Badge className="text-xs">Tailwind CSS</Badge>
                <Badge className="text-xs">shadcn/ui</Badge>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2 text-sm sm:text-base">Backend</h4>
              <div className="flex flex-wrap gap-2">
                <Badge className="text-xs">Next.js API Routes</Badge>
                <Badge className="text-xs">PostgreSQL</Badge>
                <Badge className="text-xs">Prisma</Badge>
                <Badge className="text-xs">pgvector</Badge>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2 text-sm sm:text-base">IA & ML</h4>
              <div className="flex flex-wrap gap-2">
                <Badge className="text-xs">OpenAI GPT-4</Badge>
                <Badge className="text-xs">LangChain</Badge>
                <Badge className="text-xs">text-embedding-3</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* Banco de Dados */}
      <section id="database" className="scroll-mt-20 space-y-4">
        <div className="flex items-center gap-3">
          <Database className="h-5 w-5 sm:h-6 sm:w-6 text-primary shrink-0" />
          <h2 className="text-2xl sm:text-3xl font-bold">Banco de Dados</h2>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4 shrink-0" />
          <AlertTitle className="text-sm sm:text-base">PostgreSQL com pgvector</AlertTitle>
          <AlertDescription className="text-sm">
            O sistema utiliza PostgreSQL com a extensão pgvector para armazenamento e busca eficiente de embeddings
            vetoriais.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Principais Tabelas</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>
                <code className="bg-muted px-2 py-1 rounded text-xs">users</code> - Dados dos usuários
              </li>
              <li>
                <code className="bg-muted px-2 py-1 rounded text-xs">documents</code> - Metadados dos documentos
              </li>
              <li>
                <code className="bg-muted px-2 py-1 rounded text-xs">chunks</code> - Chunks de texto com embeddings
              </li>
              <li>
                <code className="bg-muted px-2 py-1 rounded text-xs">questions</code> - Questões geradas
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* Segurança */}
      <section id="seguranca" className="scroll-mt-20 space-y-4">
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary shrink-0" />
          <h2 className="text-2xl sm:text-3xl font-bold">Segurança</h2>
        </div>

        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Levamos a segurança dos seus dados muito a sério e implementamos as melhores práticas do setor.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Autenticação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>✓ JWT com tokens seguros</p>
              <p>✓ Hashing de senhas com bcrypt</p>
              <p>✓ Sessões protegidas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Dados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>✓ Criptografia em trânsito (HTTPS)</p>
              <p>✓ Isolamento de dados por usuário</p>
              <p>✓ Backups regulares</p>
            </CardContent>
          </Card>
        </div>

        <Alert variant="default">
          <Shield className="h-4 w-4 shrink-0" />
          <AlertTitle className="text-sm sm:text-base">Privacidade</AlertTitle>
          <AlertDescription className="text-sm">
            Seus documentos e questões são privados e nunca são compartilhados com terceiros ou usados para
            treinamento de modelos.
          </AlertDescription>
        </Alert>
      </section>

      {/* Footer */}
      <div className="pt-8 border-t">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
            Precisa de ajuda? <Link href="/contact" className="text-primary hover:underline">Entre em contato</Link>
          </p>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/dashboard">Começar Agora</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
