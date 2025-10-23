# Questioning Agent 🎓

Sistema de geração de questões educacionais com IA usando RAG (Retrieval-Augmented Generation) que cria questões em múltiplos níveis cognitivos baseados na Taxonomia de Bloom a partir de documentos enviados.

## 📚 Projeto Acadêmico

Este projeto foi desenvolvido como **Trabalho de Conclusão de Curso (TCC)** para o curso de **Sistemas de Informação** da **Universidade Paulista (UNIP)**.

**Objetivo:** Desenvolver uma aplicação web que utiliza Inteligência Artificial para automatizar a geração de questões educacionais de alta qualidade, auxiliando professores e criadores de conteúdo na elaboração de avaliações pedagógicas.

## ✨ Funcionalidades

- **Upload e Processamento de Documentos**: Suporte para PDF, DOCX, TXT e Markdown
- **Chunking Inteligente**: Segmentação de texto com overlap configurável
- **Embeddings Vetoriais**: PostgreSQL + pgvector para busca semântica
- **Recuperação RAG**: Retrieval com top-k e re-ranking
- **Geração Multi-Nível**: Questões em todos os níveis da Taxonomia de Bloom
- **Múltiplos Provedores**: Alternância entre OpenAI GPT e Google Gemini
- **Estimativa de Dificuldade**: Classificação automática de complexidade
- **Revisão e Exportação**: Edite questões e exporte para JSON/CSV
- **Autenticação**: Sistema seguro com Better Auth + Google OAuth

## 🛠️ Stack Tecnológica

- **Framework**: Next.js 15 (App Router) + TypeScript
- **Estilização**: Tailwind CSS v4 + shadcn/ui
- **Banco de Dados**: PostgreSQL + pgvector (Neon)
- **ORM**: Prisma
- **IA**: Vercel AI SDK com OpenAI e Google
- **Armazenamento**: Vercel Blob
- **Autenticação**: Better Auth
- **Gerenciador de Pacotes**: pnpm

## 🚀 Começando

### Pré-requisitos

- Node.js 18+ e pnpm
- PostgreSQL com extensão pgvector
- Chave de API OpenAI e/ou Google AI

### Instalação Local

1. Clone o repositório e instale as dependências:

\`\`\`bash
git clone https://github.com/ezsouza/questioning-agent.git
cd questioning-agent
pnpm install
\`\`\`

**Nota**: O script `postinstall` executará automaticamente o `prisma generate` para criar o cliente Prisma (se aplicável).

2. Copie o arquivo de exemplo e configure suas credenciais:

\`\`\`bash
cp .env.example .env
\`\`\`

3. Configure o PostgreSQL com pgvector:

\`\`\`bash
# Instale a extensão pgvector no seu banco PostgreSQL
# Conecte ao banco e execute:
CREATE EXTENSION IF NOT EXISTS vector;
\`\`\`

4. Configure o schema do banco de dados:

\`\`\`bash
# Execute o script SQL de inicialização
psql postgresql://sua-connection-string -f scripts/init-database.sql
\`\`\`

5. Inicie o servidor de desenvolvimento:

\`\`\`bash
pnpm dev
\`\`\`

Acesse [http://localhost:3000](http://localhost:3000) para ver a aplicação.

## 📝 Scripts Disponíveis

- `pnpm dev` - Inicia servidor de desenvolvimento
- `pnpm build` - Build para produção
- `pnpm start` - Inicia servidor de produção
- `pnpm lint` - Executa ESLint
- `pnpm type-check` - Verificação de tipos TypeScript
- `pnpm format` - Formata código com Prettier

## 📁 Estrutura do Projeto

```
questioning-agent/
├── app/                   # Next.js App Router
│   ├── (auth)/            # Páginas de autenticação
│   │   ├── login/         # Página de login
│   │   └── register/      # Página de registro
│   ├── (dashboard)/       # Páginas do dashboard (protegidas)
│   │   ├── dashboard/     # Dashboard principal
│   │   └── profile/       # Perfil do usuário
│   ├── api/               # Rotas de API
│   │   ├── auth/          # Autenticação (Better Auth)
│   │   ├── documents/     # Gestão de documentos
│   │   ├── generate/      # Geração de questões
│   │   ├── ingest/        # Processamento de documentos
│   │   ├── query/         # Consultas RAG
│   │   ├── questions/     # CRUD de questões
│   │   ├── upload/        # Upload de arquivos
│   │   └── ...            # Outras rotas
│   ├── contact/           # Página de contato
│   ├── docs/              # Documentação pública
│   ├── privacy/           # Política de privacidade
│   └── terms/             # Termos de uso
├── components/            # Componentes React
│   ├── ui/                # Componentes shadcn/ui
│   ├── auth/              # Componentes de autenticação
│   ├── contact/           # Componentes de contato
│   ├── docs/              # Componentes da documentação
│   ├── documents/         # Componentes de documentos
│   ├── questions/         # Componentes de questões
│   ├── profile/           # Componentes de perfil
│   ├── rag/               # Componentes RAG
│   └── layout/            # Componentes de layout
├── lib/                   # Utilitários e configurações
│   ├── ai/                # Integrações com provedores de IA
│   ├── auth/              # Lógica de autenticação (Better Auth)
│   ├── db/                # Utilitários do banco de dados
│   ├── processing/        # Pipeline de processamento
│   ├── rag/               # Lógica do pipeline RAG
│   └── utils/             # Utilitários gerais
├── hooks/                 # Custom React hooks
├── prisma/                # Schema e migrations do Prisma
│   ├── schema.prisma      # Definição do schema
│   └── migrations/        # Migrations do banco de dados
├── public/                # Arquivos estáticos
├── scripts/               # Scripts do banco de dados
├── styles/                # Estilos globais
└── types/                 # Definições de tipos TypeScript
```

## 🏗️ Decisões de Arquitetura

### Abstração de Provedores de IA
O sistema suporta tanto OpenAI quanto Google Gemini através de uma interface unificada, permitindo alternância em tempo de execução via variáveis de ambiente.

### Pipeline RAG
Documentos são divididos em chunks com overlap, embeddings são gerados usando modelos específicos de cada provedor, e armazenados no PostgreSQL com pgvector para busca semântica eficiente.

### Geração de Questões
Questões são geradas com direcionamento explícito de nível cognitivo, citação de evidências e estimativa de dificuldade baseada em complexidade linguística.

### Logging e Telemetria
Todas as consultas e gerações são registradas com métricas de latência, custo e qualidade para monitoramento e otimização.

## 🌐 Deploy na Vercel

### Variáveis de Ambiente Necessárias

Configure as seguintes variáveis no painel da Vercel (**Settings → Environment Variables**):

```env
# Banco de Dados
DATABASE_URL=postgresql://user:password@host.neon.tech/database?sslmode=require

# Better Auth
BETTER_AUTH_SECRET=seu-secret-better-auth-aqui-min-32-chars
BETTER_AUTH_URL=https://seu-dominio.vercel.app

# Application
NEXT_PUBLIC_URL=https://seu-dominio.vercel.app

# IA
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxx
GOOGLE_API_KEY=sua-chave-google-ai

# Storage
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxx

# Google OAuth (Login Social)
GOOGLE_CLIENT_ID=seu-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu-google-client-secret

# Serviço de email
RESEND_API_KEY=re_xxxxxxxxxx
```

### Passos para Deploy

1. Conecte seu repositório GitHub à Vercel
2. Configure as variáveis de ambiente
3. Crie um banco de dados PostgreSQL no [Neon](https://neon.tech)
4. Execute o script SQL de inicialização no banco
5. Configure o Vercel Blob Storage
6. Deploy! 🚀

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

Projeto acadêmico | UNIP 2025
