# 🔐 Configuração de Variáveis de Ambiente

## Problemas no Seu `.env.production`

### ❌ Problemas Encontrados

| Variável | Seu Valor | Problema | Solução |
|----------|-----------|----------|---------|
| `NODE_ENV` | `development` | ❌ Está em DEV em produção | ✅ Mude para `production` |
| `NEXTAUTH_URL` | `http://localhost:3000` | ❌ URL local em produção | ✅ Use seu domínio real |
| `NEXTAUTH_SECRET` | `your-secret-key...` | ❌ Valor padrão inseguro | ✅ Gere um novo secret |
| `OPENAI_API_KEY` | `your-openai-key...` | ❌ Placeholder | ✅ Adicione sua chave real |
| `WHATSAPP_*` | Todos placeholders | ❌ Não vai funcionar | ✅ Adicione credenciais reais |
| `DATABASE_URL` | `${dev-db-280607...}` | ⚠️ Sintaxe estranha | ✅ Verifique a URL correta |

---

## Como Configurar Corretamente na Digital Ocean

### Opção 1: Via Dashboard Digital Ocean (Recomendado)

1. Abra [Digital Ocean App Platform](https://cloud.digitalocean.com/apps)
2. Selecione sua aplicação
3. Vá em **Settings > Environment Variables**
4. Configure cada variável:

```
DATABASE_URL=postgresql://user:password@host:5432/whatsappdavi
NEXTAUTH_SECRET=<gere um novo secret>
NEXTAUTH_URL=https://seu-dominio.com
OPENAI_API_KEY=sk-...
WHATSAPP_ACCESS_TOKEN=seu-token
WHATSAPP_PHONE_NUMBER_ID=seu-id
WHATSAPP_WABA_ID=seu-waba
NODE_ENV=production
```

### Opção 2: Via SSH (Se usar VM)

```bash
ssh root@seu-ip

# Edite .env.production
nano .env.production

# Adicione:
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=gerar_novo_secret
NEXTAUTH_URL=https://seu-dominio.com
NODE_ENV=production
# ... etc

# Salve e saia (Ctrl+X, Y, Enter)

# Reinicie aplicação
pm2 restart whatsappdavi
```

---

## Variáveis Obrigatórias vs Opcionais

### 🔴 OBRIGATÓRIAS (Build vai falhar sem essas)

```
DATABASE_URL              # Conexão com PostgreSQL
NEXTAUTH_SECRET          # Chave de segurança NextAuth
NEXTAUTH_URL             # URL da aplicação em produção
NODE_ENV=production      # Habilita otimizações
```

### 🟡 RECOMENDADAS (Funcionalidade principal)

```
WHATSAPP_ACCESS_TOKEN       # Para enviar mensagens WhatsApp
WHATSAPP_PHONE_NUMBER_ID    # ID do número WhatsApp
WHATSAPP_WABA_ID            # ID da conta WhatsApp Business
WHATSAPP_WEBHOOK_VERIFY_TOKEN
```

### 🟢 OPCIONAIS (Apenas se usar AI)

```
OPENAI_API_KEY          # Apenas se usar features de IA
```

---

## Como Gerar NEXTAUTH_SECRET

```bash
# No seu computador, execute:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Resultado será algo como:
# 3f5c8e1a2b9d4e7c6f1a3b5c8e9d2f4a

# Copie esse valor e adicione em Digital Ocean:
NEXTAUTH_SECRET=3f5c8e1a2b9d4e7c6f1a3b5c8e9d2f4a
```

---

## Verificar DATABASE_URL Corretamente

Você tem:
```
DATABASE_URL = ${dev-db-280607.DATABASE_URL}
```

Isso **parece estar referenciando uma variável do Digital Ocean**, o que é bom se está configurado lá.

**Verifique:**
1. No painel Digital Ocean, existe uma variável `dev-db-280607.DATABASE_URL`?
2. Ou é um typo/placeholder que precisa ser preenchido?

**Formato correto deve ser:**
```
DATABASE_URL=postgresql://username:password@hostname:5432/database_name
```

Exemplo:
```
DATABASE_URL=postgresql://postgres:mySuperSecurePassword@db.ondigitalocean.com:25060/whatsappdavi
```

---

## NEXTAUTH_URL

Você tem:
```
NEXTAUTH_URL = http://localhost:3000
```

❌ **ERRADO** - Essa é URL local!

✅ **CORRETO** - Use seu domínio:
```
NEXTAUTH_URL=https://seu-dominio-real.com
```

ou se não tem domínio:
```
NEXTAUTH_URL=https://123.45.67.89
```

---

## NODE_ENV

Você tem:
```
NODE_ENV = development
```

❌ **ERRADO** - Em produção deve ser `production`!

✅ **CORRETO**:
```
NODE_ENV=production
```

Isso habilita:
- Compressão gzip
- Otimizações de cache
- Minificação
- Melhor performance

---

## Checklist de Configuração

```
✅ DATABASE_URL → Tem URL real do PostgreSQL?
✅ NEXTAUTH_SECRET → Tem um secret seguro gerado?
✅ NEXTAUTH_URL → Tem domínio real (não localhost)?
✅ NODE_ENV → Está como 'production'?
✅ WHATSAPP_ACCESS_TOKEN → Tem valor real?
✅ WHATSAPP_PHONE_NUMBER_ID → Tem valor real?
✅ WHATSAPP_WABA_ID → Tem valor real?
```

---

## Como Testar Configuração

Após configurar todas as variáveis:

```bash
# 1. Verifique as variáveis no Digital Ocean
echo $DATABASE_URL
echo $NEXTAUTH_SECRET
echo $NODE_ENV

# 2. Teste conexão com banco
psql $DATABASE_URL -c "SELECT 1"

# 3. Verifique logs
pm2 logs whatsappdavi

# 4. Acesse a aplicação
curl https://seu-dominio.com
```

---

## Se Ainda Tiver Erro

### Erro: "DATABASE_URL is required"
```
❌ DATABASE_URL não foi configurado
✅ Configure via Digital Ocean Dashboard ou SSH
```

### Erro: "NEXTAUTH_SECRET is not set"
```
❌ NEXTAUTH_SECRET está vazio
✅ Gere um novo: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Erro: "Unable to connect to database"
```
❌ DATABASE_URL está incorreta ou banco inacessível
✅ Teste: psql $DATABASE_URL -c "SELECT 1"
✅ Verifique se IP do droplet está autorizado no banco
```

### Erro: "CORS error from WhatsApp"
```
❌ NEXTAUTH_URL não está correto
✅ WhatsApp precisa que NEXTAUTH_URL seja o domínio real
✅ NÃO pode ser http://localhost
```

---

## Resumo

| Status | Ação |
|--------|------|
| 🔴 DATABASE_URL vazio | Configure com URL real do PostgreSQL |
| 🔴 NODE_ENV=development | Mude para `NODE_ENV=production` |
| 🔴 NEXTAUTH_URL=localhost | Mude para seu domínio real |
| 🔴 NEXTAUTH_SECRET=placeholder | Gere um novo secret seguro |
| 🟡 OPENAI_API_KEY vazio | Configure se usar IA, senão deixa placeholder |
| 🟡 WHATSAPP_* vazio | Configure com valores reais |

---

**Data:** Nov 3, 2024
**Status:** 🔧 Pronto para correção
