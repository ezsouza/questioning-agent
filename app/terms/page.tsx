import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText } from "lucide-react"

export const metadata: Metadata = {
  title: "Termos de Uso - Questioning Agent",
  description: "Termos e Condições de Uso da plataforma Questioning Agent",
}

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Termos de Uso</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Última atualização: 22 de outubro de 2025
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>1. Aceitação dos Termos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Ao acessar e utilizar a plataforma Questioning Agent ("Plataforma", "Serviço" ou "nós"), 
              você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar 
              com qualquer parte destes termos, não deverá utilizar nossos serviços.
            </p>
            <p>
              Estes Termos de Uso constituem um acordo legal entre você ("Usuário" ou "você") e o 
              Questioning Agent. Recomendamos que você leia atentamente todos os termos antes de 
              utilizar a Plataforma.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Descrição do Serviço</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              O Questioning Agent é uma plataforma de geração inteligente de questões educacionais 
              que utiliza Inteligência Artificial para processar documentos e criar questões em 
              diferentes níveis cognitivos baseados na Taxonomia de Bloom.
            </p>
            <div>
              <h4 className="font-semibold text-foreground mb-2">2.1. Funcionalidades</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Upload e processamento de documentos (PDF, DOCX, TXT, Markdown)</li>
                <li>Geração automática de questões baseadas em IA</li>
                <li>Classificação de questões por níveis cognitivos (Bloom)</li>
                <li>Armazenamento e gerenciamento de documentos e questões</li>
                <li>Sistema de busca e recuperação de informações (RAG)</li>
                <li>Exportação de questões geradas</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Cadastro e Conta de Usuário</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-2">3.1. Criação de Conta</h4>
              <p>
                Para utilizar a Plataforma, você deve criar uma conta fornecendo informações 
                precisas e completas. Você pode se cadastrar através de:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>E-mail e senha</li>
                <li>Autenticação social (Google)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">3.2. Responsabilidades do Usuário</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Manter a confidencialidade de suas credenciais de acesso</li>
                <li>Notificar imediatamente sobre qualquer uso não autorizado da sua conta</li>
                <li>Fornecer informações verdadeiras e atualizadas</li>
                <li>Ser responsável por todas as atividades realizadas em sua conta</li>
                <li>Não compartilhar sua conta com terceiros</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">3.3. Suspensão e Encerramento</h4>
              <p>
                Reservamos o direito de suspender ou encerrar sua conta a qualquer momento, 
                caso haja violação destes Termos de Uso ou uso inadequado da Plataforma.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Uso Aceitável</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>Ao utilizar a Plataforma, você concorda em NÃO:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Fazer upload de conteúdo ilegal, difamatório, obsceno ou que viole direitos de terceiros</li>
              <li>Utilizar o serviço para fins fraudulentos ou maliciosos</li>
              <li>Tentar acessar áreas restritas do sistema ou de outros usuários</li>
              <li>Realizar engenharia reversa, descompilar ou modificar o código da Plataforma</li>
              <li>Utilizar bots, scripts ou ferramentas automatizadas sem autorização</li>
              <li>Sobrecarregar ou interferir com a operação da Plataforma</li>
              <li>Violar direitos de propriedade intelectual</li>
              <li>Fazer upload de vírus, malware ou código malicioso</li>
              <li>Coletar dados de outros usuários sem consentimento</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Conteúdo do Usuário</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-2">5.1. Propriedade do Conteúdo</h4>
              <p>
                Você mantém todos os direitos sobre os documentos e conteúdos que faz upload 
                na Plataforma. Ao fazer upload de conteúdo, você nos concede uma licença 
                limitada, não exclusiva e revogável para:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Processar e armazenar seus documentos</li>
                <li>Gerar questões baseadas no conteúdo fornecido</li>
                <li>Utilizar tecnologias de IA para análise e processamento</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">5.2. Responsabilidade pelo Conteúdo</h4>
              <p>
                Você é exclusivamente responsável pelo conteúdo que faz upload e garante que:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Possui todos os direitos necessários sobre o conteúdo</li>
                <li>O conteúdo não viola leis ou direitos de terceiros</li>
                <li>O conteúdo não contém informações confidenciais sem autorização</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">5.3. Limitações de Upload</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Tamanho máximo por arquivo: 10MB</li>
                <li>Formatos aceitos: PDF, DOCX, TXT, Markdown (.md)</li>
                <li>O conteúdo deve estar em texto legível (não apenas imagens)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Propriedade Intelectual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-2">6.1. Direitos da Plataforma</h4>
              <p>
                Todos os direitos de propriedade intelectual relacionados à Plataforma, 
                incluindo mas não se limitando a código-fonte, design, logos, marcas e 
                algoritmos, são de propriedade exclusiva do Questioning Agent.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">6.2. Questões Geradas</h4>
              <p>
                As questões geradas pela IA a partir do seu conteúdo são de sua propriedade. 
                Você pode usar, modificar, exportar e distribuir essas questões livremente.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Privacidade e Proteção de Dados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              O tratamento dos seus dados pessoais é regido pela nossa{" "}
              <a href="/privacy" className="text-primary hover:underline font-semibold">
                Política de Privacidade
              </a>
              , que está em conformidade com a LGPD (Lei nº 13.709/2018).
            </p>
            <p>
              Ao utilizar a Plataforma, você concorda com a coleta, uso e armazenamento 
              de dados conforme descrito na Política de Privacidade.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>8. Disponibilidade do Serviço</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-2">8.1. Garantias</h4>
              <p>
                Embora nos esforcemos para manter a Plataforma disponível 24/7, não garantimos 
                que o serviço será ininterrupto ou livre de erros. Reservamos o direito de:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Realizar manutenções programadas</li>
                <li>Implementar atualizações e melhorias</li>
                <li>Suspender temporariamente o serviço por motivos técnicos</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">8.2. Modificações</h4>
              <p>
                Podemos modificar, suspender ou descontinuar qualquer aspecto da Plataforma 
                a qualquer momento, com ou sem aviso prévio.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>9. Limitação de Responsabilidade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Na extensão máxima permitida por lei, o Questioning Agent não será responsável por:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Danos diretos, indiretos, incidentais ou consequenciais</li>
              <li>Perda de dados, lucros ou oportunidades de negócio</li>
              <li>Imprecisões ou erros nas questões geradas pela IA</li>
              <li>Uso inadequado do conteúdo gerado pela Plataforma</li>
              <li>Interrupções ou falhas técnicas no serviço</li>
              <li>Ações de terceiros ou serviços integrados</li>
            </ul>
            <p className="mt-4">
              A Plataforma é fornecida "no estado em que se encontra" e "conforme disponível", 
              sem garantias de qualquer tipo, expressas ou implícitas.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>10. Indenização</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Você concorda em indenizar, defender e isentar o Questioning Agent, seus 
              funcionários, diretores e parceiros de quaisquer reclamações, danos, 
              obrigações, perdas, responsabilidades, custos ou dívidas resultantes de:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Seu uso da Plataforma</li>
              <li>Violação destes Termos de Uso</li>
              <li>Violação de direitos de terceiros</li>
              <li>Conteúdo que você faz upload na Plataforma</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>11. Tecnologias de IA e Limitações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-2">11.1. Uso de Inteligência Artificial</h4>
              <p>
                A Plataforma utiliza modelos de linguagem avançados (LLMs) e tecnologias de 
                processamento de linguagem natural para gerar questões. Você reconhece que:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>A IA pode ocasionalmente gerar respostas imprecisas ou inadequadas</li>
                <li>As questões geradas devem ser revisadas antes do uso final</li>
                <li>A qualidade das questões depende da qualidade do documento fornecido</li>
                <li>Não garantimos 100% de precisão nas questões geradas</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">11.2. Responsabilidade do Usuário</h4>
              <p>
                É sua responsabilidade revisar, validar e adequar as questões geradas 
                ao seu contexto educacional específico antes de utilizá-las.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>12. Rescisão</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Você pode encerrar sua conta a qualquer momento através das configurações da 
              Plataforma ou entrando em contato conosco.
            </p>
            <p>
              Podemos encerrar ou suspender seu acesso imediatamente, sem aviso prévio, 
              em caso de violação destes Termos de Uso.
            </p>
            <p>
              Após o encerramento da conta, você perderá acesso aos seus dados armazenados 
              na Plataforma, que serão excluídos conforme nossa Política de Privacidade.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>13. Alterações nos Termos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Reservamos o direito de modificar estes Termos de Uso a qualquer momento. 
              Notificaremos você sobre alterações significativas através de:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>E-mail cadastrado</li>
              <li>Aviso na Plataforma</li>
              <li>Atualização da data no topo desta página</li>
            </ul>
            <p className="mt-4">
              O uso continuado da Plataforma após as alterações constitui aceitação 
              dos novos termos.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>14. Lei Aplicável e Jurisdição</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil.
            </p>
            <p>
              Quaisquer disputas decorrentes destes termos serão submetidas à jurisdição 
              exclusiva dos tribunais brasileiros.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>15. Disposições Gerais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-2">15.1. Acordo Integral</h4>
              <p>
                Estes Termos de Uso, juntamente com a Política de Privacidade, constituem 
                o acordo integral entre você e o Questioning Agent.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">15.2. Divisibilidade</h4>
              <p>
                Se qualquer disposição destes termos for considerada inválida ou inexequível, 
                as demais disposições permanecerão em pleno vigor e efeito.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">15.3. Renúncia</h4>
              <p>
                A falha em exercer ou fazer cumprir qualquer direito previsto nestes termos 
                não constitui renúncia de tal direito.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>16. Contato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Se você tiver dúvidas sobre estes Termos de Uso, entre em contato conosco:
            </p>
            <ul className="list-none space-y-1 ml-4">
              <li>
                <strong>Página de Contato:</strong>{" "}
                <a href="/contact" className="text-primary hover:underline">
                  Formulário de Contato
                </a>
              </li>
              <li>
                <strong>E-mail:</strong> suporte@questioningagent.com
              </li>
            </ul>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground mt-8 pt-8 border-t">
          <p className="mb-4">
            Ao utilizar o Questioning Agent, você declara ter lido, compreendido e 
            concordado com estes Termos de Uso.
          </p>
          <p>
            Para mais informações sobre proteção de dados, consulte nossa{" "}
            <a href="/privacy" className="text-primary hover:underline font-semibold">
              Política de Privacidade
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
