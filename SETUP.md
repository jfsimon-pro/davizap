# Guia de Setup - WhatsApp Davi

Este documento fornece instruções passo a passo para configurar o sistema completo.

## 📋 Pré-requisitos

- Node.js 18+ instalado
- PostgreSQL 12+ em execução
- Uma conta Meta Business com acesso ao WhatsApp Cloud API
- Chave de API do OpenAI

## 🔧 Instalação Local

### 1. Instalar Dependências

```bash
npm install
```

### 2. Gerar Cliente Prisma

```bash
npm run prisma:generate
```

### 3. Configurar Banco de Dados

Certifique-se de que PostgreSQL está rodando. Por padrão, conecte com:

```
Host: localhost
Porta: 5432
Usuário: postgres
Senha: 2456
Banco: whatsappdavi
```

Se precisar alterar, edite o arquivo `.env.local`:

```bash
DATABASE_URL="postgresql://postgres:2456@localhost:5432/whatsappdavi"
```

### 4. Executar Migrações

```bash
npm run prisma:migrate
```

Isso criará todas as tabelas necessárias.

### 5. Inicializar Admin Padrão

```bash
npm run dev
```

Acesse `http://localhost:3000/api/init` no navegador ou use:

```bash
curl -X POST http://localhost:3000/api/init
```

Isso criará o usuário admin padrão:
- **Email**: `admin@gmail.com`
- **Senha**: `Jesus`

## 🚀 Começar a Usar

### 1. Fazer Login

```
http://localhost:3000/login
```

Credenciais padrão:
- Email: `admin@gmail.com`
- Senha: `Jesus`

### 2. Configurar WhatsApp

1. Vá para a página de **Onboarding** ou **Configurações**
2. Preencha as seguintes informações (obtenha no [Meta Business Manager](https://business.facebook.com)):
   - **WABA ID**: Seu WhatsApp Business Account ID
   - **Phone Number ID**: ID do número de telefone
   - **Verify Token**: Token para validar webhooks (crie um aleatório)
   - **Access Token**: Token de acesso da API

3. Copie a **Webhook URL** fornecida
4. Configure no Meta Business Manager:
   - Vá para Configurações > Webhook
   - Adicione a URL: `https://seu-dominio.com/api/webhooks/whatsapp`
   - Adicione o Verify Token
   - Inscreva-se em `messages` e `message_template_status_update`

### 3. Adicionar Base de Conhecimento

1. Vá para **Base de Conhecimento**
2. Clique em **+ Adicionar Conteúdo**
3. Adicione informações sobre seus produtos:
   - Catálogo de produtos
   - Preços
   - Políticas de devolução
   - Exemplos de conversas

### 4. Criar Templates

1. Vá para **Templates**
2. Clique em **+ Novo Template**
3. Preencha:
   - **Nome**: Nome do template
   - **Idioma**: Idioma da mensagem
   - **Categoria**: UTILITY, MARKETING ou AUTHENTICATION
   - **Corpo**: Texto da mensagem

4. Clique em **Enviar para Aprovação**
5. Aguarde aprovação do WhatsApp (geralmente 24-48 horas)

### 5. Testar Integração

1. Envie uma mensagem para seu número de WhatsApp
2. Verifique se aparece no **Inbox**
3. Responda manualmente para testar

### 6. Executar Campanhas

1. Vá para **Campanhas**
2. Clique em **+ Nova Campanha**
3. Preencha:
   - **Nome**: Nome da campanha
   - **Template**: Selecione um template aprovado
   - **Números**: Cole números no formato E.164 (ex: 5511999999999)

4. Clique em **Criar Campanha**
5. Clique em **Iniciar Campanha** para enviar

## 📊 Estrutura do Banco de Dados

O sistema utiliza as seguintes tabelas principais:

- `User` - Usuários do sistema
- `Tenant` - Organizações/Espaços de trabalho
- `WhatsAppIntegration` - Configurações do WhatsApp
- `Contact` - Contatos/Clientes
- `Conversation` - Conversas
- `Message` - Mensagens individuais
- `Template` - Templates de mensagem
- `BroadcastCampaign` - Campanhas
- `BroadcastItem` - Itens de campanha
- `KnowledgeSource` - Base de conhecimento
- `PromptProfile` - Perfis de prompt para IA

Para visualizar o banco:

```bash
npm run prisma:studio
```

## 🔒 Variáveis de Ambiente Importantes

Certifique-se de configurar no `.env.local`:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/whatsappdavi"

# OpenAI
OPENAI_API_KEY="sk-..."

# NextAuth
NEXTAUTH_SECRET="seu-secret-aleatorio-seguro"
NEXTAUTH_URL="http://localhost:3000"

# WhatsApp
WHATSAPP_API_VERSION="v19.0"
WHATSAPP_GRAPH_API_URL="https://graph.instagram.com"

# Node
NODE_ENV="development"
```

⚠️ **Nunca** commitar o `.env.local` com credenciais reais!

## 🐛 Troubleshooting

### Erro: "Could not connect to database"

1. Certifique-se que PostgreSQL está rodando
2. Verifique as credenciais no `.env.local`
3. Verifique se o banco existe (crie com `createdb whatsappdavi` se necessário)

### Erro: "Webhook verification failed"

1. Certifique-se que o Verify Token está correto
2. Verifique se a URL está acessível
3. Confirme que está usando HTTPS em produção

### Erro: "OPENAI_API_KEY not provided"

1. Adicione sua chave de API do OpenAI no `.env.local`
2. Gere uma nova chave em https://platform.openai.com/api-keys

### Mensagens não chegando

1. Verifique se o WhatsApp está configurado corretamente
2. Confirme se o número está no formato E.164
3. Verifique os logs do webhook

## 📈 Monitoramento

### Ver Logs

```bash
# Terminal mostra logs em tempo real durante desenvolvimento
npm run dev
```

### Ver Dados do Banco

```bash
npm run prisma:studio
```

Isso abre uma interface web para visualizar/editar dados.

## 🚀 Deploy em Produção

### Preparação

1. Configure variáveis de ambiente em produção
2. Use banco de dados gerenciado (RDS, Supabase, etc)
3. Configure HTTPS obrigatoriamente
4. Mude `NEXTAUTH_URL` para seu domínio
5. Gere novo `NEXTAUTH_SECRET` seguro

### Build

```bash
npm run build
npm start
```

### Hospedagem Recomendada

- **Vercel** (simples, integrado com Next.js)
- **Railway** (ótimo suporte a PostgreSQL)
- **Render** (alternativa econômica)
- **AWS/Google Cloud** (mais controle)

## 📞 Recursos Úteis

- [WhatsApp Cloud API Docs](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Meta Business Manager](https://business.facebook.com)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Next.js Docs](https://nextjs.org/docs)

## 💡 Dicas

1. **Sempre comece pela Base de Conhecimento** - melhor contexto = melhores respostas da IA
2. **Teste templates manualmente primeiro** - evita rejeições do WhatsApp
3. **Use o Inbox** para entender padrões de conversa antes de automatizar
4. **Monitore a confiança da IA** - a IA sugerirá quando precisa de intervenção humana
5. **Mantenha a base de conhecimento atualizada** - preços e políticas mudam

## 📝 Notas Importantes

- Respeite a política de privacidade do WhatsApp
- Não use para SPAM (violação de termos)
- Mantenha consentimento explícito dos clientes
- Cumpra regulamentações como LGPD/GDPR
- Teste bem antes de ativar automação completa

---

Pronto? 🎉 Comece em `http://localhost:3000/login`!
