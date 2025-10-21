# Questioning Agent

A RAG-powered question generation system that creates educational questions at multiple cognitive levels (Bloom's Taxonomy) from uploaded documents.

## Features

- **Document Upload & Processing**: Support for PDF, DOCX, TXT, and Markdown files
- **Intelligent Chunking**: Text segmentation with configurable overlap
- **Vector Embeddings**: PostgreSQL + pgvector for semantic search
- **RAG Retrieval**: Top-k retrieval with re-ranking
- **Multi-Level Question Generation**: Questions across all Bloom's Taxonomy levels
- **Provider Switching**: Toggle between OpenAI GPT and Google Gemini
- **Difficulty Estimation**: Automatic difficulty classification
- **Review & Export**: Edit questions and export to JSON/CSV
- **Authentication**: Secure user authentication with NextAuth.js

## Tech Stack

- **Framework**: Next.js 15 (App Router) + TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Database**: PostgreSQL + pgvector
- **ORM**: Prisma
- **AI**: Vercel AI SDK with OpenAI & Google providers
- **Storage**: Vercel Blob
- **Auth**: NextAuth.js v5
- **Package Manager**: pnpm

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL with pgvector extension
- OpenAI API key and/or Google AI API key

### Installation

1. Clone the repository and install dependencies:

\`\`\`bash
pnpm install
\`\`\`

**Note**: The `postinstall` script will automatically run `prisma generate` to create the Prisma client.

2. Copy `.env.example` to `.env.local` and fill in your credentials:

\`\`\`bash
cp .env.example .env.local
\`\`\`

3. Setup PostgreSQL with pgvector:

\`\`\`bash
# Install pgvector extension in your PostgreSQL database
# Connect to your database and run:
CREATE EXTENSION IF NOT EXISTS vector;
\`\`\`

4. Setup the database schema:

\`\`\`bash
# Generate Prisma client (if not already done by postinstall)
pnpm db:generate

# Push schema to database or run migrations
pnpm db:push
# OR
pnpm db:migrate

# (Optional) Seed with sample data
pnpm db:seed
\`\`\`

5. Start the development server:

\`\`\`bash
pnpm dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm type-check` - Run TypeScript type checking
- `pnpm format` - Format code with Prettier
- `pnpm db:generate` - Generate Prisma client
- `pnpm db:push` - Push schema changes to database
- `pnpm db:migrate` - Run database migrations
- `pnpm db:studio` - Open Prisma Studio
- `pnpm db:seed` - Seed database with sample data

## Project Structure

\`\`\`
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── (auth)/            # Authentication pages
│   └── (dashboard)/       # Main application pages
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── features/         # Feature-specific components
├── lib/                   # Utilities and configurations
│   ├── ai/               # AI provider integrations
│   ├── db/               # Database utilities
│   └── rag/              # RAG pipeline logic
└── hooks/                 # Custom React hooks

prisma/
├── schema.prisma         # Database schema
├── migrations/           # Database migrations
└── seed.ts              # Database seeding script
\`\`\`

## Architecture Decisions

### AI Provider Abstraction
The system supports both OpenAI and Google Gemini through a unified interface, allowing runtime switching via environment variables.

### RAG Pipeline
Documents are chunked with overlap, embedded using provider-specific models, and stored in PostgreSQL with pgvector for efficient similarity search.

### Question Generation
Questions are generated with explicit cognitive level targeting, evidence citation, and difficulty estimation based on linguistic complexity.

### Logging & Telemetry
All queries and generations are logged with latency, cost, and quality metrics for monitoring and optimization.

## License

MIT
