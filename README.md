# 🚀 WhatsApp Davi - Cloud API Integration System

Um sistema completo de automação e integração com WhatsApp Cloud API, construído com Next.js, Prisma e PostgreSQL.

> **✅ Status:** Build funcionando | Pronto para produção | Documentado completamente
>
> **⚡ Próximos Passos:** Configure variáveis de ambiente e faça deploy!

## 🚀 Funcionalidades Principais

### 1. **Autenticação e Controle de Acesso**
- Login com credenciais padrão: `admin@gmail.com` / `Jesus`
- Sistema de roles (Admin, Manager, Agent, Viewer)
- Multi-tenant support

### 2. **Integração WhatsApp Cloud API**
- Webhook para receber mensagens em tempo real
- Envio de mensagens de texto
- Envio de templates aprovados
- Rastreamento de status de entrega

### 3. **Inbox (Gerenciamento de Conversas)**
- Visualizar todas as conversas ativas
- Responder mensagens manualmente
- Histórico completo de mensagens
- Atualizações em tempo real

### 4. **Templates de Mensagem**
- Criar templates em rascunho
- Submeter para aprovação do WhatsApp
- Gerenciar diferentes idiomas e categorias
- Rastrear histórico de submissões

### 5. **Campanhas de Disparo em Massa**
- Upload de lista de telefones
- Usar templates aprovados
- Monitorar progresso em tempo real
- Métricas de entrega

### 6. **Integração ChatGPT (OpenAI)**
- Gerar respostas automáticas inteligentes
- Análise de confiança da resposta
- Sugestões para intervenção humana
- Rastreamento de tokens e custos

### 7. **Base de Conhecimento (RAG)**
- Adicionar documentos e conteúdo
- Embeddings automáticos
- Busca semântica
- Integração com ChatGPT para respostas contextualizadas

## 📚 Documentação Importante

Se você quer entender por que o build não funcionava e como foi resolvido:

- **[CONTEXT.md](CONTEXT.md)** - 📋 Documentação completa do problema e solução (LEIA ISSO PRIMEIRO!)
- **[SETUP_DO.md](SETUP_DO.md)** - 🚀 Guia passo-a-passo de deploy
- **[ENV_SETUP.md](ENV_SETUP.md)** - 🔐 Configuração de variáveis de ambiente
- **[WARNINGS_ARE_NORMAL.md](WARNINGS_ARE_NORMAL.md)** - ⚠️ Por que certos warnings não são erro
- **[COMMON_ERRORS.md](COMMON_ERRORS.md)** - 🐛 Troubleshooting de 10 erros comuns
- **[DEPLOY.md](DEPLOY.md)** - 📖 Documentação técnica completa

## 📋 Requisitos

- Node.js 18+
- PostgreSQL 12+
- OpenAI API Key (opcional)
- WhatsApp Meta Business Account

## 🔧 Instalação

### 1. Clonar o Repositório
```bash
git clone <seu-repositorio>
cd whatsappdavi
```

### 2. Instalar Dependências
```bash
npm install
```

### 3. Configurar Variáveis de Ambiente
Copie o arquivo `.env.local` e configure suas credenciais:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/whatsappdavi"

# OpenAI
OPENAI_API_KEY="sk-..."

# NextAuth
NEXTAUTH_SECRET="seu-secret-aleatorio"
NEXTAUTH_URL="http://localhost:3000"

# WhatsApp
WHATSAPP_API_VERSION="v19.0"
WHATSAPP_GRAPH_API_URL="https://graph.instagram.com"
```

### 4. Configurar Banco de Dados
```bash
# Gerar cliente Prisma
npm run prisma:generate

# Executar migrações
npm run prisma:migrate

# (Opcional) Abrir Prisma Studio
npm run prisma:studio
```

### 5. Inicializar Dados Padrão
```bash
curl -X POST http://localhost:3000/api/init
```

## 🚀 Executar em Desenvolvimento

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## 📖 Fluxo de Uso

### 1. **Login**
- Acesse `http://localhost:3000/login`
- Use credenciais padrão: `admin@gmail.com` / `Jesus`

### 2. **Configurar WhatsApp**
- Vá para Configurações
- Adicione suas credenciais do WhatsApp Cloud API
- Configure o Webhook URL: `https://seu-dominio.com/api/webhooks/whatsapp`

### 3. **Criar Templates**
- Vá para Templates
- Crie novos templates
- Submeta para aprovação do WhatsApp
- Aguarde aprovação

### 4. **Gerenciar Conversas**
- Vá para Inbox
- Receba mensagens dos clientes
- Responda manualmente ou use sugestões de IA

### 5. **Adicionar Base de Conhecimento**
- Vá para Base de Conhecimento
- Adicione informações sobre seus produtos
- O sistema usará isso para melhorar respostas do ChatGPT

### 6. **Executar Campanhas**
- Vá para Campanhas
- Crie nova campanha
- Faça upload de lista de telefones
- Inicie o disparo em massa

## 🏗️ Arquitetura

```
app/
├── api/              # API Routes
│   ├── auth/         # Autenticação
│   ├── webhooks/     # Webhooks do WhatsApp
│   ├── inbox/        # Conversas e mensagens
│   ├── templates/    # Gerenciamento de templates
│   ├── campaigns/    # Campanhas de disparo
│   ├── knowledge/    # Base de conhecimento
│   └── ai/          # Endpoints de IA
├── login/            # Página de login
├── dashboard/        # Dashboard principal
├── inbox/            # Interface de conversas
├── templates/        # Gerenciador de templates
├── campaigns/        # Gerenciador de campanhas
├── knowledge/        # Base de conhecimento
└── settings/         # Configurações

lib/
├── prisma.ts         # Cliente Prisma
├── auth.ts           # Autenticação
├── whatsapp.ts       # API WhatsApp
├── openai.ts         # API OpenAI
└── rag.ts            # Sistema RAG

prisma/
└── schema.prisma     # Schema do banco de dados
```

## 📊 Schema do Banco de Dados

O sistema utiliza as seguintes entidades principais:

- **Tenant**: Organização/Espaço de trabalho
- **User**: Usuários do sistema
- **WhatsAppIntegration**: Configuração do WhatsApp
- **Contact**: Contatos/Clientes
- **Conversation**: Conversas com clientes
- **Message**: Mensagens individuais
- **Template**: Templates de mensagem
- **BroadcastCampaign**: Campanhas de disparo em massa
- **KnowledgeSource**: Fontes de conhecimento
- **PromptProfile**: Perfis de prompt para IA

## 🔐 Segurança

- Tokens JWT para autenticação
- Senhas criptografadas com bcrypt
- Validação de webhooks
- Isolamento de dados por tenant
- Proteção contra injeção SQL (Prisma)

## 📝 Próximas Etapas

- [ ] Implementar testes automatizados
- [ ] Adicionar autenticação OAuth2
- [ ] Melhorar UI com componentes customizados
- [ ] Adicionar analytics avançados
- [ ] Implementar fila de processamento (Bull/Redis)
- [ ] Adicionar suporte a múltiplos canais
- [ ] Implementar sistema de avaliação de IA
- [ ] Adicionar controle de acesso granular (RBAC)

## 📞 Suporte

Para dúvidas ou problemas, consulte a documentação do WhatsApp Cloud API:
- https://developers.facebook.com/docs/whatsapp/cloud-api/

## 📄 Licença

MIT

## 👤 Autor

Desenvolvido por Claude Code
