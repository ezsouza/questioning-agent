import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield } from "lucide-react"

export const metadata: Metadata = {
  title: "Política de Privacidade - Questioning Agent",
  description: "Política de Privacidade e Proteção de Dados conforme LGPD",
}

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Política de Privacidade</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Última atualização: 22 de outubro de 2025
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>1. Introdução</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              O Questioning Agent está comprometido com a proteção da privacidade e dos dados 
              pessoais de seus usuários. Esta Política de Privacidade descreve como coletamos, 
              usamos, armazenamos e protegemos suas informações pessoais em conformidade com a 
              Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Dados Coletados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-2">2.1. Dados de Cadastro</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Nome completo</li>
                <li>Endereço de e-mail</li>
                <li>Foto de perfil (quando fornecida via autenticação social)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">2.2. Dados de Uso</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Documentos enviados para processamento</li>
                <li>Questões geradas</li>
                <li>Histórico de atividades na plataforma</li>
                <li>Logs de acesso e uso do sistema</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">2.3. Dados Técnicos</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Endereço IP</li>
                <li>Tipo de navegador</li>
                <li>Sistema operacional</li>
                <li>Cookies e tecnologias similares</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Finalidade do Tratamento de Dados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>Utilizamos seus dados pessoais para:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Criar e gerenciar sua conta de usuário</li>
              <li>Processar documentos e gerar questões educacionais</li>
              <li>Melhorar nossos serviços e desenvolver novas funcionalidades</li>
              <li>Enviar notificações sobre o processamento de documentos</li>
              <li>Garantir a segurança e prevenir fraudes</li>
              <li>Cumprir obrigações legais e regulatórias</li>
              <li>Realizar análises estatísticas sobre o uso da plataforma</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Base Legal para o Tratamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>O tratamento de seus dados pessoais é fundamentado nas seguintes bases legais:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Consentimento do titular (Art. 7º, I da LGPD)</li>
              <li>Execução de contrato (Art. 7º, V da LGPD)</li>
              <li>Exercício regular de direitos (Art. 7º, VI da LGPD)</li>
              <li>Legítimo interesse (Art. 7º, IX da LGPD)</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Compartilhamento de Dados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros para 
              fins de marketing. Seus dados podem ser compartilhados apenas com:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Provedores de serviços essenciais (hospedagem, banco de dados, processamento de IA)</li>
              <li>Autoridades judiciais ou governamentais, quando exigido por lei</li>
              <li>Parceiros de autenticação (Google) para login social</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Armazenamento e Segurança</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Implementamos medidas técnicas e organizacionais adequadas para proteger seus dados 
              pessoais contra acesso não autorizado, alteração, divulgação ou destruição:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Criptografia de dados em trânsito e em repouso</li>
              <li>Controles de acesso baseados em função</li>
              <li>Monitoramento contínuo de segurança</li>
              <li>Backups regulares</li>
              <li>Servidores seguros em data centers certificados</li>
            </ul>
            <p className="mt-4">
              Seus dados são armazenados em servidores localizados em conformidade com a 
              legislação brasileira.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Retenção de Dados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Mantemos seus dados pessoais apenas pelo tempo necessário para cumprir as 
              finalidades descritas nesta política, salvo se um período de retenção maior for 
              exigido ou permitido por lei.
            </p>
            <p>
              Após o término do prazo de retenção, seus dados serão excluídos ou anonimizados 
              de forma segura.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>8. Seus Direitos como Titular de Dados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>De acordo com a LGPD, você tem os seguintes direitos:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Confirmação da existência de tratamento de dados</li>
              <li>Acesso aos seus dados pessoais</li>
              <li>Correção de dados incompletos, inexatos ou desatualizados</li>
              <li>Anonimização, bloqueio ou eliminação de dados desnecessários</li>
              <li>Portabilidade dos dados a outro fornecedor</li>
              <li>Eliminação dos dados tratados com seu consentimento</li>
              <li>Informação sobre compartilhamento de dados</li>
              <li>Revogação do consentimento</li>
              <li>Oposição ao tratamento de dados</li>
            </ul>
            <p className="mt-4">
              Para exercer qualquer um desses direitos, entre em contato através da página de{" "}
              <a href="/contact" className="text-primary hover:underline">
                Contato
              </a>
              .
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>9. Cookies e Tecnologias Similares</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Utilizamos cookies e tecnologias similares para melhorar sua experiência. 
              Você pode gerenciar suas preferências de cookies através do banner de consentimento 
              que aparece ao acessar o site.
            </p>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Tipos de Cookies:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Essenciais:</strong> Necessários para o funcionamento do site</li>
                <li><strong>Funcionais:</strong> Melhoram a funcionalidade e personalização</li>
                <li><strong>Analíticos:</strong> Ajudam a entender como os visitantes usam o site</li>
                <li><strong>Marketing:</strong> Usados para exibir anúncios relevantes</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>10. Alterações nesta Política</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você 
              sobre alterações significativas através do e-mail cadastrado ou por meio de um aviso 
              em nosso site.
            </p>
            <p>
              A data da última atualização está indicada no topo desta página.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>11. Encarregado de Proteção de Dados (DPO)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Para questões relacionadas à proteção de dados e exercício dos seus direitos, 
              você pode entrar em contato com nosso Encarregado de Proteção de Dados através de:
            </p>
            <ul className="list-none space-y-1 ml-4">
              <li><strong>E-mail:</strong> dpo@questioningagent.com</li>
              <li><strong>Página de Contato:</strong>{" "}
                <a href="/contact" className="text-primary hover:underline">
                  Formulário de Contato
                </a>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>12. Legislação Aplicável</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Esta Política de Privacidade é regida pela legislação brasileira, especialmente 
              pela Lei Geral de Proteção de Dados (Lei nº 13.709/2018) e pelo Marco Civil da 
              Internet (Lei nº 12.965/2014).
            </p>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground mt-8 pt-8 border-t">
          <p>
            Se você tiver dúvidas sobre esta Política de Privacidade, entre em contato através 
            da nossa{" "}
            <a href="/contact" className="text-primary hover:underline">
              página de contato
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
