# Migração para Better Auth

Este guia explica como migrar de JWT customizado para Better Auth com Google e Microsoft OAuth.

## 📋 O que mudou

### Antes (JWT Customizado)
- Autenticação manual com JWT via `jose`
- Hash de senha com `bcryptjs`
- Sessões em cookies HTTP-only
- Apenas email/senha

### Depois (Better Auth)
- Sistema de autenticação completo e moderno
- Suporte a OAuth (Google e Microsoft)
- Gerenciamento automático de sessões
- Segurança aprimorada
- Email/senha + Social login

## 🚀 Passo a Passo

### 1. Atualizar Variáveis de Ambiente

Adicione ao seu `.env`:

```bash
# Better Auth Secret
BETTER_AUTH_SECRET="your-super-secret-key-min-32-characters"

# Google OAuth
GOOGLE_CLIENT_ID="your-app-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"

# Microsoft OAuth
MICROSOFT_CLIENT_ID="your-application-client-id"
MICROSOFT_CLIENT_SECRET="your-client-secret"
MICROSOFT_TENANT_ID="common"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 2. Configurar Google OAuth

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione existente
3. Vá em "APIs & Services" > "Credentials"
4. Clique em "Create Credentials" > "OAuth 2.0 Client ID"
5. Configure:
   - Application type: **Web application**
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (dev)
     - `https://seu-dominio.com/api/auth/callback/google` (prod)
6. Copie Client ID e Client Secret para o `.env`

### 3. Configurar Microsoft OAuth

1. Acesse [Azure Portal](https://portal.azure.com/)
2. Vá em "Azure Active Directory" > "App registrations"
3. Clique em "New registration"
4. Configure:
   - Name: Questioning Agent
   - Supported account types: **Accounts in any organizational directory and personal Microsoft accounts**
   - Redirect URI: `http://localhost:3000/api/auth/callback/microsoft`
5. Após criar:
   - Copie o "Application (client) ID" para `MICROSOFT_CLIENT_ID`
   - Vá em "Certificates & secrets" > "New client secret"
   - Copie o valor para `MICROSOFT_CLIENT_SECRET`
   - Copie o "Directory (tenant) ID" para `MICROSOFT_TENANT_ID` (ou use "common")

### 4. Executar Migração do Banco

Execute o script de migração:

```bash
psql $DATABASE_URL -f scripts/better-auth-migration.sql
```

Ou via interface do Neon/Supabase/etc, copie e execute o conteúdo do arquivo.

### 5. Testar

1. Inicie o servidor: `pnpm dev`
2. Acesse `http://localhost:3000/login`
3. Teste:
   - ✅ Login com email/senha
   - ✅ Cadastro com email/senha
   - ✅ Login com Google
   - ✅ Login com Microsoft
   - ✅ Logout

## 📦 Novos Endpoints

Better Auth cria automaticamente:

- `POST /api/auth/sign-in/email` - Login com email
- `POST /api/auth/sign-up/email` - Cadastro com email
- `GET /api/auth/sign-in/google` - Login com Google
- `GET /api/auth/sign-in/microsoft` - Login com Microsoft
- `GET /api/auth/callback/google` - Callback do Google
- `GET /api/auth/callback/microsoft` - Callback da Microsoft
- `POST /api/auth/sign-out` - Logout
- `GET /api/auth/session` - Obter sessão atual

## 🔄 Compatibilidade

As funções antigas foram mantidas para compatibilidade:

```typescript
// Ainda funciona
import { getCurrentUser, requireUser } from "@/lib/auth/session"

const user = await getCurrentUser()
const user = await requireUser() // Throw error se não autenticado
```

## 🗑️ Remover Código Antigo (Opcional)

Após confirmar que tudo funciona, você pode remover:

- `bcryptjs` do package.json
- `jose` do package.json (se não usado em outro lugar)
- Funções antigas de `createUser`, `getUserByEmail` em `lib/db/queries.ts`

## 🔒 Segurança

Better Auth fornece:
- ✅ CSRF Protection
- ✅ XSS Protection
- ✅ Secure cookies (httpOnly, secure, sameSite)
- ✅ Session management
- ✅ OAuth state validation
- ✅ Token rotation

## 📚 Documentação

- [Better Auth Docs](https://www.better-auth.com/)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
- [Microsoft OAuth Setup](https://learn.microsoft.com/azure/active-directory/develop/quickstart-register-app)

## ❓ Troubleshooting

### Erro: "redirect_uri_mismatch"
- Verifique se a URL de callback está configurada corretamente no Google/Microsoft
- URLs devem ser exatas, incluindo protocolo (http/https)

### Erro: "Invalid client"
- Verifique se Client ID e Client Secret estão corretos
- Certifique-se de que não há espaços extras

### Sessão não persiste
- Verifique se `BETTER_AUTH_SECRET` está definido
- Em produção, certifique-se de usar HTTPS

### Banco de dados
- Execute a migração SQL primeiro
- Verifique se todas as tabelas foram criadas corretamente
