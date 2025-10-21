'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

type FormStatus = 'idle' | 'loading' | 'success' | 'error'

export function ContactForm() {
  const [status, setStatus] = useState<FormStatus>('idle')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    try {
      // Simular envio (substituir por API real)
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Aqui você implementaria a chamada para sua API
      // const response = await fetch('/api/contact', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // })

      setStatus('success')
      setFormData({
        name: '',
        email: '',
        subject: '',
        category: '',
        message: '',
      })

      // Reset após 5 segundos
      setTimeout(() => setStatus('idle'), 5000)
    } catch (error) {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 5000)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      category: value,
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Success Alert */}
      {status === 'success' && (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            Mensagem enviada com sucesso! Entraremos em contato em breve.
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {status === 'error' && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Ocorreu um erro ao enviar sua mensagem. Por favor, tente novamente.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">
            Nome Completo <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="João Silva"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={status === 'loading'}
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">
            E-mail <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="seu@email.com"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={status === 'loading'}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Subject */}
        <div className="space-y-2">
          <Label htmlFor="subject">
            Assunto <span className="text-destructive">*</span>
          </Label>
          <Input
            id="subject"
            name="subject"
            type="text"
            placeholder="Como posso ajudar você?"
            value={formData.subject}
            onChange={handleChange}
            required
            disabled={status === 'loading'}
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category">
            Categoria <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.category}
            onValueChange={handleSelectChange}
            disabled={status === 'loading'}
            required
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="duvida">Dúvida Técnica</SelectItem>
              <SelectItem value="bug">Reportar Bug</SelectItem>
              <SelectItem value="feature">Sugestão de Recurso</SelectItem>
              <SelectItem value="suporte">Suporte</SelectItem>
              <SelectItem value="comercial">Comercial/Vendas</SelectItem>
              <SelectItem value="outro">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Message */}
      <div className="space-y-2">
        <Label htmlFor="message">
          Mensagem <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="message"
          name="message"
          placeholder="Descreva sua dúvida ou mensagem em detalhes..."
          value={formData.message}
          onChange={handleChange}
          required
          disabled={status === 'loading'}
          rows={6}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground">
          Mínimo de 10 caracteres. Seja o mais específico possível.
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-between pt-4">
        <p className="text-xs text-muted-foreground">
          <span className="text-destructive">*</span> Campos obrigatórios
        </p>
        <Button type="submit" disabled={status === 'loading'} size="lg">
          {status === 'loading' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {status === 'loading' ? 'Enviando...' : 'Enviar Mensagem'}
        </Button>
      </div>

      {/* Privacy Notice */}
      <p className="text-xs text-muted-foreground text-center pt-4 border-t">
        Ao enviar este formulário, você concorda com nossa{' '}
        <Link href="/privacy" className="text-primary hover:underline">
          Política de Privacidade
        </Link>
        . Seus dados serão utilizados apenas para responder sua solicitação.
      </p>
    </form>
  )
}

// Quick fix for Link import
import Link from 'next/link'
