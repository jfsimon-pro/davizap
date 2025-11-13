# 📞 Status dos Webhooks do WhatsApp

## ✅ O Que Está Implementado

O webhook do WhatsApp está **completamente implementado** em:
```
/app/api/webhooks/whatsapp/route.ts
```

### Funcionalidades Implementadas

#### 1. **Verificação do Webhook (GET)**
```
GET /api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=XXX&hub.challenge=YYY
```
- ✅ Verifica token do webhook
- ✅ Valida desafio do WhatsApp
- ✅ Retorna challenge para confirmação

#### 2. **Recebimento de Mensagens (POST)**
```
POST /api/webhooks/whatsapp
```
- ✅ Recebe mensagens de entrada
- ✅ Cria/atualiza contatos
- ✅ Cria/atualiza conversas
- ✅ Armazena mensagens no banco
- ✅ Atualiza timestamps

#### 3. **Rastreamento de Status (POST)**
```
POST /api/webhooks/whatsapp
```
- ✅ Recebe atualizações de status
- ✅ Atualiza status: 'sent', 'delivered', 'read', 'failed'
- ✅ Correlaciona com mensagem original

---

## 🔴 Problema Identificado

### Status Atual: **500 Internal Server Error**

Quando você acessa o webhook, ele retorna erro 500.

### Causa Provável

Linha 11 do código:
```typescript
const integration = await prisma.whatsAppIntegration.findFirst();
```

Está falhando porque:
1. **Nenhuma integração configurada** no banco de dados
2. **Erro ao conectar com o banco** (DATABASE_URL pode estar inválida)
3. **Prisma Client não inicializado** corretamente

### Fluxo do Erro

```
GET /api/webhooks/whatsapp
    ↓
Tenta buscar WhatsAppIntegration do banco
    ↓
❌ Falha (banco vazio ou indisponível)
    ↓
500 Internal Server Error
```

---

## ✅ Como Configurar Corretamente

### Passo 1: Verificar Banco de Dados

```bash
# Na Digital Ocean ou local, execute:
psql $DATABASE_URL -c "SELECT * FROM \"WhatsAppIntegration\";"
```

Se retornar vazio, você precisa adicionar uma integração.

### Passo 2: Adicionar Integração WhatsApp via UI

1. Acesse https://simonapps.shop/settings
2. Procure por "WhatsApp Integration"
3. Adicione:
   - **Access Token:** sua token do WhatsApp Business
   - **Phone Number ID:** ID do seu número
   - **WABA ID:** ID da sua conta Business
   - **Verify Token:** qualquer valor (para validação do webhook)

### Passo 3: Configurar Webhook no WhatsApp

1. Vá para [Meta Developer Console](https://developers.facebook.com/)
2. Selecione seu app
3. Em Webhooks, configure:
   - **Callback URL:** `https://simonapps.shop/api/webhooks/whatsapp`
   - **Verify Token:** o mesmo que você colocou acima
   - **Subscribe fields:** `messages`, `statuses`

### Passo 4: Testar Webhook

Após configurar:

```bash
# WhatsApp vai enviar:
GET /api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=SEU_TOKEN&hub.challenge=random

# Seu servidor vai responder:
200 OK
[challenge_value]

# Isto confirma ao WhatsApp que seu webhook está online
```

---

## 🔧 Solução Rápida para Fazer Funcionar

### Se DATABASE_URL estiver errada:

```bash
# Verifique na Digital Ocean:
echo $DATABASE_URL

# Ou SSH e edite:
nano .env.production
# Certifique-se que DATABASE_URL é válido
```

### Se nenhuma integração está configurada:

1. Faça login em https://simonapps.shop/
2. Vá para Settings
3. Adicione sua integração do WhatsApp
4. Salve

### Se quer testar localmente:

```bash
# 1. Configure .env.local
nano .env.local
# DATABASE_URL=postgresql://...
# NODE_ENV=development

# 2. Rode o server
npm run dev

# 3. Teste
curl "http://localhost:3000/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=test&hub.challenge=test123"

# Deve retornar:
# HTTP 403 (porque verify_token não bate)
# ou
# HTTP 200 com "test123" (se tiver integração no banco)
```

---

## 📋 Checklist de Configuração

```
☐ DATABASE_URL está correto e acessível?
☐ Banco de dados está rodando?
☐ Integração WhatsApp foi adicionada no settings da app?
☐ Access Token do WhatsApp está válido?
☐ Verify Token foi definido no settings?
☐ Webhook foi configurado no Meta Developer Console?
☐ Webhook está subscrito aos fields corretos (messages, statuses)?
```

---

## 🔍 Verificação de Logs

Para ver o que está acontecendo:

```bash
# Se usando Digital Ocean com PM2:
pm2 logs whatsappdavi

# Você deve ver:
# "Webhook received: {payload}"
# quando uma mensagem chegar
```

---

## ✅ Quando Está Funcionando Corretamente

Você verá:

1. **No console:**
   ```
   Webhook verified
   ```

2. **No banco de dados:**
   - Novos contatos criados
   - Conversas criadas
   - Mensagens armazenadas

3. **Na UI da app:**
   - Mensagens aparecendo no Inbox
   - Contatos aparecem quando recebem mensagens

---

## 🐛 Troubleshooting

### "500 Internal Server Error"
**Causa:** Integração não configurada ou banco indisponível
**Solução:** Adicionar integração no settings ou verificar DATABASE_URL

### "403 Forbidden"
**Causa:** Verify token não bate
**Solução:** Usar o verify token correto que foi configurado

### Webhook nunca é chamado
**Causa:** URL não configurada no Meta Developer Console
**Solução:** Adicionar URL correta nas configurações de webhook

### Mensagens não aparecem no Inbox
**Causa:** Webhook funciona mas há erro ao salvar no banco
**Solução:** Verificar logs (pm2 logs) para ver erro específico

---

## 📚 Referências

- [WhatsApp Cloud API Docs](https://developers.facebook.com/docs/whatsapp/cloud-api/)
- [Webhook Payload Format](https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-example)
- [Webhook Verification](https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/setup-webhooks)

---

**Status:** 🔴 Problema identificado - Integração não configurada
**Solução:** Siga os passos acima para configurar corretamente
**Prioridade:** Alta - Webhook é essencial para receber mensagens
