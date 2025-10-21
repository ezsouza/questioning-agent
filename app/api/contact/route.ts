import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, subject, category, message } = body

    // Validação básica
    if (!name || !email || !subject || !category || !message) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'E-mail inválido' },
        { status: 400 }
      )
    }

    // Validação de tamanho da mensagem
    if (message.length < 10) {
      return NextResponse.json(
        { error: 'A mensagem deve ter pelo menos 10 caracteres' },
        { status: 400 }
      )
    }

    // Aqui você implementaria a lógica de envio
    // Opções comuns:
    // 1. Enviar e-mail usando Resend, SendGrid, etc.
    // 2. Salvar no banco de dados
    // 3. Enviar para um sistema de tickets
    // 4. Notificar via Slack, Discord, etc.

    console.log('📧 Nova mensagem de contato recebida:', {
      name,
      email,
      subject,
      category,
      messageLength: message.length,
    })

    // Exemplo de integração com Resend (descomente e configure):
    /*
    import { Resend } from 'resend'
    const resend = new Resend(process.env.RESEND_API_KEY)
    
    await resend.emails.send({
      from: 'contato@questioningagent.com',
      to: 'suporte@questioningagent.com',
      subject: `[${category}] ${subject}`,
      html: `
        <h2>Nova mensagem de contato</h2>
        <p><strong>Nome:</strong> ${name}</p>
        <p><strong>E-mail:</strong> ${email}</p>
        <p><strong>Categoria:</strong> ${category}</p>
        <p><strong>Assunto:</strong> ${subject}</p>
        <p><strong>Mensagem:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    })
    */

    // Exemplo de salvamento no banco de dados (descomente e configure):
    /*
    import { db } from '@/lib/db'
    
    await db.contactMessage.create({
      data: {
        name,
        email,
        subject,
        category,
        message,
        status: 'pending',
        createdAt: new Date(),
      },
    })
    */

    return NextResponse.json(
      {
        success: true,
        message: 'Mensagem enviada com sucesso!',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('❌ Erro ao processar mensagem de contato:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
