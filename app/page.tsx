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
            <span className="text-sm font-medium text-primary">Powered by RAG & AI</span>
          </div>
          <h1 className="text-5xl font-bold mb-4 text-balance">Questioning Agent</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            Generate educational questions at multiple cognitive levels from your documents using advanced AI
          </p>
          <div className="flex gap-4 justify-center mt-8">
            <Button asChild size="lg">
              <Link href="/dashboard">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/docs">Learn More</Link>
            </Button>
          </div>
        </header>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardHeader>
              <FileText className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Document Upload</CardTitle>
              <CardDescription>Support for PDF, DOCX, TXT, and Markdown files</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Brain className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>RAG Pipeline</CardTitle>
              <CardDescription>Vector embeddings with semantic search and retrieval</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Sparkles className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>AI Generation</CardTitle>
              <CardDescription>Questions across all Bloom&apos;s Taxonomy levels</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Download className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Export & Review</CardTitle>
              <CardDescription>Edit questions and export to JSON or CSV</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* How it Works */}
        <section className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>1. Upload Your Document</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Upload PDF, DOCX, TXT, or Markdown files. The system will automatically process and chunk your
                  content.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. Generate Embeddings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Your document is converted into vector embeddings and indexed for semantic search using PostgreSQL
                  with pgvector.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. Generate Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Select cognitive levels and let AI generate targeted questions with evidence citations and difficulty
                  ratings.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>4. Review & Export</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Review generated questions, make edits if needed, and export to JSON or CSV for use in your learning
                  management system.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
}
