usando next, postgres, prisma

o banco de dados ta criado em localhost, se chama whatsappdavi, senha do banco de dados é 2456

quero fazer um sistema que pra acessar tenho que logar admin@gmail.com, senha é Jesus

Requisitos:
1 - o sistema vai ser pra conectar meu whatspap na api oficial cloud, puxar as conversas e responder
2 - Poder subir uma planilha de numeros pra fazer disparo em massa
3 - Ter modelos de mensagens pro meta aprovar e fazer essa parte funcionar, sabe do que to falando?
4 - Permitir que o chatgpt da open ai responda meu whatsapp
5 - Poder treinar o chatgpt em cima do meu produto como do que se trata, preços, exemplos de conversas pra ele se basear etc


Conecta o WhatsApp na Meta WhatsApp Cloud API para ler e responder conversas;
Faz disparo em massa a partir de planilha (opt‑in, taxas/limites, conformidade);
Gerencia modelos de mensagens (Message Templates) para aprovação e uso;
Permite o ChatGPT (OpenAI) responder no WhatsApp com handoff humano;
Treina o ChatGPT sobre o produto (preços, políticas, FAQs, exemplos de conversas).

Fluxos Principais
1) Onboarding e Conexão com WhatsApp Cloud

Admin cria Account e insere credenciais (App ID/Secret, Access Token, Phone Number ID, Verify Token).

Sistema expõe Webhook URL + Verify Token → configuração no app da Meta.

Validação do webhook (GET do hub.challenge). Persistir status WhatsAppIntegration.enabled=true.

Teste de envio/recebimento: mandar mensagem para o número; receber evento; confirmar mapeamento (wa_id ↔ Contact).

Erros/Edge Cases: token expirado, troca de phone_number_id, webhook inválido, IPs bloqueados.

2) Inbox (recebimento e resposta)

Webhook recebe eventos: messages, statuses (delivered/read), message_template_status_update.

Normalização → criação de Contact, Conversation, Message.

Regras de roteamento: dentro da janela de 24h → texto livre; fora da janela → template obrigatório.

Assistente IA faz triagem (classificação de intenção) e sugere resposta; operador pode aprovar/editar; ou resposta automática se política permitir.

Handoff humano quando: confiança baixa, intenção sensível (jurídico/financeiro), palavras‑chave de risco, ou pedido explícito do cliente.

3) Disparo em Massa (campanhas)

Upload de planilha (CSV/XLSX) → pré‑validação (número, país, opt‑in, DND, duplicados, formato E.164).

Seleção de Template aprovado + idioma/variações + variáveis de personalização (nome, produto, link trackeado).

Definição de janela de envio (rate limit por segundo/minuto) e prioridade.

Enfileirar QueueJobs por lote com backoff e throttling por Phone Number ID e por destino.

Receber statuses (sent/delivered/read/failed). Métricas: entregas, leituras, respostas, opt‑outs.

Conformidade: somente contatos com opt‑in válido; categoria "marketing" em horários permitidos; honrar opt‑out (parar/envio suspenso).

4) Gestão de Templates (Message Templates)

Ciclo de vida: Draft → Submitted → Approved/Rejected → Deprecated.

Componentes: header (text/media), body (placeholders), footer, botões (CTA/Quick Reply).

Histórico de submissões, justificativas de rejeição, testes com preview/simulações.

Governança: quem pode criar/editar/enviar; versionamento e rollback.

5) Resposta com ChatGPT (OpenAI)

Orquestrador de IA recebe contexto (mensagem, contato, histórico curto, janela 24h, estado de campanha).

RAG (Retrieval‑Augmented Generation):

Consulta KnowledgeBase (pgvector) por trechos relevantes de produto/políticas.

Injeta PromptConfig/Policy (tom, limites, disclaimers, idioma pt‑BR, persona da marca).

Decisor: responde automaticamente ou pede aprovação humana (threshold de confiança + regras de risco).

Ferramentas (opcional): calculadoras, estoque, status de pedido (via functions internas) — com logs de uso.

Contenção: nunca afirmar preços/prazos fora da base; sugerir handoff quando houver ambiguidade.

6) “Treino” do ChatGPT sobre o Produto

Ingestão: PDFs, links, planilhas de preços, políticas, scripts de vendas, exemplos de conversas boas/ruins.

Chunking: segmentação por tópicos; normalização (limpar html, remover PII).

Embeddings: gerar e armazenar em pgvector; guardar metadados (versão, fonte, validade).

Avaliação: conjunto de perguntas canônicas + respostas esperadas; teste A/B de prompts.

Atualização: pipeline de re‑indexação quando preço/política muda; controle de versão da base.

Regras de Negócio & Políticas

Janela 24h: fora da janela, usar template aprovado.

Opt‑in/Opt‑out: só enviar marketing para opt‑in ativo; atalhos de opt‑out em todas campanhas.

LGPD: finalidade específica, minimização de dados, retenção controlada, direito de exclusão; registro de consentimento.

Auditoria: toda ação do agente/IA registrada; explicabilidade das respostas da IA (fontes recuperadas no RAG).

Taxas/Limites: obedecer throughput recomendado pela Meta; backpressure quando 429/5xx.

Painéis & Operação

Inbox Omnicanal (foco WhatsApp): filtros por intenções, SLAs, filas (IA, Humano, Pendente).

Campanhas: criação, agendamento, progressão em tempo real, mapa de erros, export de métricas.

Templates: status por idioma/categoria, taxa de aprovação, motivos de rejeição, sugestões de melhoria.

Conhecimento: saúde do índice (itens, versões), cobertura de tópicos, lacunas detectadas.

Observabilidade: latências, taxas de erro, tokens OpenAI, custos por conversa/campanha.

Estratégia de Prompts (conceitual)

System Prompt: persona da marca, linguagem pt‑BR clara e educada, limites (não criar preços), preferir evidências.

Context Window: histórico curto (últimas N mensagens) + trechos RAG + dados do contato (nome, cidade).

Políticas: gatilhos de handoff (palavras‑chave sensíveis), formatos de resposta (bullets curtos, CTA claro), guarda‑chuvas legais.

Memória de Conversa: resumo persistente por contato (temas, preferências) respeitando LGPD.


Roadmap por Fases (MVP → V2)

MVP (Operacional):

Onboarding Meta + Webhook funcional

Inbox com leitura/resposta manual

RAG básico com base de conhecimento inicial

Disparo em massa com template único, fila e métricas essenciais

Painel simples de templates

V1 (Produtizável):

Handoff humano automatizado + filas de atendimento

Editor de templates com validações e simulação

Segmentação de campanhas + janelas inteligentes

Métricas detalhadas e export

V2 (Escala & IA):

Avaliação contínua do assistente (testes canônicos + feedback loop)

Ferramentas de IA (estoque, pedidos) via function calling

Multi‑tenant completo com limites por plano

Assistente treinável via UI (upload/URLs) com versionamento

Riscos & Mitigações

Reprovação de templates: biblioteca de boas práticas e pré‑checagens antes da submissão.

Bloqueios/limites Meta: envio escalonado, monitor de 429/5xx, failover e reprocesso.

Alucinação da IA: RAG obrigatório + citações internas + thresholds de confiança + handoff.

Custos de tokens: limiares por conversa, compressão de contexto, resumos incrementalizados.

Contratos de API (conceito)

/webhooks/whatsapp: recebe eventos (validação, mensagens, status, templates).

/campaigns: criar, agendar, pausar, métricas.

/templates: listar, criar (draft), submeter, status, preview.

/inbox: listar conversas, enviar resposta (livre ou template), atribuir agente, handoff.

/knowledge: upload/URL, indexar, versões, busca interna.

/ai/assist: gerar resposta sugerida com fontes; registrar decisão (auto/humano).



// prisma/schema.prisma (conceitual — Postgres + pgvector)
// Observações:
// - Usa Postgres; para embeddings, habilitar extensão pgvector. Em Prisma, tipar como Unsupported("vector").
// - Multi-tenant: quase todos os modelos têm tenantId.
// - Guarda conversas completas (mensagens), resumos incrementais e embeddings por mensagem.
// - Governa templates, campanhas, handoff humano e trilhas de IA.

// -------------------------
// GENERATOR & DATASOURCE
// -------------------------

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// -------------------------
// ENUMS
// -------------------------

enum UserRole {
  ADMIN
  MANAGER
  AGENT
  VIEWER
}

enum MessageDirection {
  INBOUND
  OUTBOUND
}

enum MessageType {
  TEXT
  TEMPLATE
  IMAGE
  DOCUMENT
  AUDIO
  VIDEO
  STICKER
  LOCATION
  CONTACTS
  INTERACTIVE // botões/quick replies/list messages
}

enum DeliveryStatus {
  QUEUED
  SENT
  DELIVERED
  READ
  FAILED
}

enum ConversationStatus {
  OPEN
  PENDING_HUMAN
  IN_ASSISTANT
  RESOLVED
  ARCHIVED
}

enum TemplateCategory {
  UTILITY
  MARKETING
  AUTHENTICATION
}

enum TemplateStatus {
  DRAFT
  SUBMITTED
  APPROVED
  REJECTED
  DEPRECATED
}

enum HandoffReason {
  LOW_CONFIDENCE
  SENSITIVE_TOPIC
  USER_REQUESTED
  POLICY_BLOCK
}

// -------------------------
// CORE — TENANCY & USERS
// -------------------------

model Tenant {
  id                 String                 @id @default(cuid())
  name               String
  createdAt          DateTime               @default(now())
  updatedAt          DateTime               @updatedAt

  users              User[]
  whatsappConfigs    WhatsAppIntegration[]
  contacts           Contact[]
  conversations      Conversation[]
  templates          Template[]
  campaigns          BroadcastCampaign[]
  knowledgeSources   KnowledgeSource[]
  promptProfiles     PromptProfile[]
  auditLogs          AuditLog[]
}

model User {
  id         String   @id @default(cuid())
  tenantId   String
  tenant     Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  name       String
  email      String   @unique
  role       UserRole
  active     Boolean  @default(true)

  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  conversationsOwned Conversation[] @relation("ConversationOwner")
}

// -------------------------
// WHATSAPP CLOUD INTEGRATION
// -------------------------

model WhatsAppIntegration {
  id              String   @id @default(cuid())
  tenantId        String
  tenant          Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  wabaId          String
  phoneNumberId   String   @unique
  displayPhone    String?

  verifyToken     String
  accessToken     String   // armazenar cifrado via camada de app/KMS
  webhookEnabled  Boolean  @default(false)

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([tenantId, phoneNumberId])
}

// -------------------------
// CONTACTS & CONSENT
// -------------------------

model Contact {
  id             String   @id @default(cuid())
  tenantId       String
  tenant         Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  waId           String?  // wa_id fornecido pela Meta
  phoneE164      String
  name           String?
  tags           String[]

  optIn          Boolean  @default(false)
  optOut         Boolean  @default(false)
  consentSource  String?  // formulário, chat, import
  consentAt      DateTime?

  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  conversations  Conversation[]

  @@unique([tenantId, phoneE164])
}

// -------------------------
// CONVERSATIONS, MESSAGES & INDEXAÇÃO
// -------------------------

model Conversation {
  id                 String            @id @default(cuid())
  tenantId           String
  tenant             Tenant            @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  contactId          String
  contact            Contact           @relation(fields: [contactId], references: [id], onDelete: Cascade)

  status             ConversationStatus @default(OPEN)
  lastAgentId        String?
  lastAgent          User?             @relation("ConversationOwner", fields: [lastAgentId], references: [id])

  // janela 24h
  lastInboundAt      DateTime?
  lastOutboundAt     DateTime?

  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  messages           Message[]
  summaries          ConversationSummary[]
  handoffs           HumanHandoff[]

  @@index([tenantId, contactId])
}

model Message {
  id               String           @id @default(cuid())
  tenantId         String
  tenant           Tenant           @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  conversationId   String
  conversation     Conversation     @relation(fields: [conversationId], references: [id], onDelete: Cascade)

  direction        MessageDirection
  type             MessageType
  status           DeliveryStatus   @default(QUEUED)

  waMessageId      String?          @unique
  body             String?          // texto normalizado (sem PII sensível nos logs)
  data             Json?            // payload bruto/estruturado (botões, mídia, coords)

  mediaUrl         String?
  mediaMime        String?
  mediaSha256      String?

  // Metadados IA
  generatedByAI    Boolean          @default(false)
  aiTraceId        String?

  createdAt        DateTime         @default(now())

  // embeddings por mensagem (1:N chunking)
  embeddings       MessageEmbedding[]

  @@index([tenantId, conversationId])
  @@index([createdAt])
}

model ConversationSummary {
  id               String     @id @default(cuid())
  tenantId         String
  tenant           Tenant     @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  conversationId   String
  conversation     Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)

  version          Int        @default(1) // rolling summaries (ex.: por 100 mensagens)
  content          String     // resumo gerado pela IA
  createdAt        DateTime   @default(now())

  @@unique([conversationId, version])
}

model MessageEmbedding {
  id             String   @id @default(cuid())
  tenantId       String
  tenant         Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  messageId      String
  message        Message  @relation(fields: [messageId], references: [id], onDelete: Cascade)

  chunkIndex     Int      @default(0)
  text           String
  embedding      Unsupported("vector") // pgvector; dimension definida na migração (ex.: 1536)

  createdAt      DateTime @default(now())

  @@unique([messageId, chunkIndex])
  @@index([tenantId])
}

// -------------------------
// IA — PERFIS, CONHECIMENTO E TRILHAS
// -------------------------

model PromptProfile {
  id           String   @id @default(cuid())
  tenantId     String
  tenant       Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  name         String   // ex.: "Atendimento Comercial"
  systemPrompt String
  language     String   @default("pt-BR")
  policyJson   Json?    // regras de segurança, gatilhos de handoff

  active       Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model KnowledgeSource {
  id           String   @id @default(cuid())
  tenantId     String
  tenant       Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  title        String
  type         String   // PDF, URL, CSV, Manual, FAQ
  url          String?  // storage público/privado
  version      String?  // controle de versão semântico
  expiresAt    DateTime?

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  chunks       KnowledgeChunk[]
}

model KnowledgeChunk {
  id             String   @id @default(cuid())
  tenantId       String
  tenant         Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  sourceId       String
  source         KnowledgeSource @relation(fields: [sourceId], references: [id], onDelete: Cascade)

  ordinal        Int
  text           String
  embedding      Unsupported("vector") // pgvector
  meta           Json?

  createdAt      DateTime @default(now())

  @@unique([sourceId, ordinal])
  @@index([tenantId])
}

model AITrace {
  id              String   @id @default(cuid())
  tenantId        String
  tenant          Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  messageId       String?  // resposta que a IA gerou
  conversationId  String?

  model           String   // gpt-4o-mini, etc.
  promptProfileId String?
  retrievedIds    String[] // IDs de KnowledgeChunk/MessageEmbedding usados
  promptTokens    Int?
  completionTokens Int?
  totalTokens     Int?
  latencyMs       Int?
  confidence      Float?   // score agregado
  decision        String?  // AUTO_REPLY, REQUIRE_APPROVAL, HANDOFF
  error           String?

  createdAt       DateTime @default(now())

  @@index([tenantId, conversationId])
}

// -------------------------
// TEMPLATES (Meta Message Templates)
// -------------------------

model Template {
  id            String   @id @default(cuid())
  tenantId      String
  tenant        Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  name          String   // nome canônico na Meta
  language      String   // ex.: pt_BR
  category      TemplateCategory
  status        TemplateStatus @default(DRAFT)

  headerJson    Json?
  bodyText      String?  // com placeholders {{1}}, {{2}}
  footerText    String?
  buttonsJson   Json?

  metaTemplateId String? // ID na Meta
  lastSubmittedAt DateTime?
  lastReviewedAt  DateTime?
  rejectionReason String?

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  submissions   TemplateSubmission[]

  @@unique([tenantId, name, language])
}

model TemplateSubmission {
  id           String   @id @default(cuid())
  tenantId     String
  tenant       Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  templateId   String
  template     Template @relation(fields: [templateId], references: [id], onDelete: Cascade)

  payload      Json     // corpo enviado à Meta
  status       TemplateStatus
  reason       String?
  createdAt    DateTime @default(now())
}

// -------------------------
// CAMPANHAS (Disparo em Massa)
// -------------------------

model BroadcastCampaign {
  id            String   @id @default(cuid())
  tenantId      String
  tenant        Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  name          String
  templateId    String
  template      Template @relation(fields: [templateId], references: [id], onDelete: Restrict)

  fileUrl       String?  // planilha importada
  mappingJson   Json?    // mapeamento de colunas → placeholders
  scheduledAt   DateTime?
  startedAt     DateTime?
  finishedAt    DateTime?
  totalPlanned  Int      @default(0)

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  items         BroadcastItem[]
}

model BroadcastItem {
  id             String   @id @default(cuid())
  tenantId       String
  tenant         Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  campaignId     String
  campaign       BroadcastCampaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)

  contactId      String?
  contact        Contact? @relation(fields: [contactId], references: [id])

  phoneE164      String
  variables      Json?
  status         DeliveryStatus @default(QUEUED)
  error          String?

  waMessageId    String?
  sentAt         DateTime?
  deliveredAt    DateTime?
  readAt         DateTime?

  createdAt      DateTime @default(now())

  @@index([tenantId, campaignId])
}

// -------------------------
// HANDOFF HUMANO & FILAS
// -------------------------

model HumanHandoff {
  id              String   @id @default(cuid())
  tenantId        String
  tenant          Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  conversationId  String
  conversation    Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)

  reason          HandoffReason
  note            String?
  assignedToId    String?
  assignedTo      User?    @relation(fields: [assignedToId], references: [id])
  resolvedAt      DateTime?
  createdAt       DateTime @default(now())

  @@index([tenantId, conversationId])
}

// -------------------------
// AUDITORIA & LOGS
// -------------------------

model AuditLog {
  id          String   @id @default(cuid())
  tenantId    String
  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  actorId     String?
  actor       User?    @relation(fields: [actorId], references: [id])

  action      String   // ex.: TEMPLATE.SUBMIT, MESSAGE.SEND, IA.DECISION
  targetType  String   // Message, Template, Campaign, etc.
  targetId    String?
  metadata    Json?
  createdAt   DateTime @default(now())

  @@index([tenantId, targetType])
}

// -------------------------
// ÍNDICES ÚTEIS PARA BUSCA/RECUPERAÇÃO
// -------------------------
// - Message(createdAt) para paginação cronológica.
// - Conversation(tenantId, contactId) para lookup rápido de threads.
// - MessageEmbedding(embedding vector) — índice HNSW/IVFFLAT criado via SQL na migração.
// - KnowledgeChunk(embedding vector) — idem.
