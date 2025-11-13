# 🐛 Erros Comuns e Soluções Rápidas

## 1. Build falha: "Cannot find module '@/lib/prisma'"

```
Error: Cannot find module '@/lib/prisma'
```

**Causa:** Prisma Client não foi gerado

**Solução Rápida:**
```bash
npm run prisma:generate
npm run build
```

---

## 2. Build falha: "DATABASE_URL is not set"

```
Error: PrismaClientInitializationError: error:
  Can't reach database server at `db-host`:`5432`
```

**Causa:** Variável DATABASE_URL não configurada no Digital Ocean

**Solução Rápida:**
```bash
# SSH na Digital Ocean
ssh root@seu_ip

# Configure a variável
export DATABASE_URL="postgresql://user:pass@host:5432/dbname"

# Verifique
echo $DATABASE_URL

# Tente build
npm run build
```

**Ou adicione no .env.production:**
```
nano .env.production
```

Adicione:
```
DATABASE_URL=postgresql://user:pass@host:5432/whatsappdavi
```

---

## 3. Build falha: "Cannot find module '@/components/ui/toaster'"

```
TypeError: Cannot find module '@/components/ui/toaster'
```

**Causa:** Pasta `intermittenty` ainda existe no projeto

**Solução Rápida:**
```bash
# Remova a pasta
rm -rf intermittenty

# Tente build novamente
npm run build
```

---

## 4. Build falha: "Error: <Html> should not be imported outside of pages/_document"

```
Error: <Html> should not be imported outside of pages/_document
Error occurred prerendering page "/404"
```

**Causa:** Next.js tentando prerender páginas de erro

**Solução:** Isto é **NORMAL e NÃO é erro crítico**. O build continua funcionando.

- ✅ Build continua
- ✅ Todas as 22 páginas são geradas
- ✅ Aplicação funciona em produção

---

## 5. Build falha: "npm ERR! code ENOMEM"

```
FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed - JavaScript heap out of memory
```

**Causa:** Pouca memória disponível no servidor

**Solução Rápida:**
```bash
# Aumente limite de memória Node.js
export NODE_OPTIONS="--max-old-space-size=2048"

# Tente build novamente
npm run build

# Ou customize para seu servidor:
# --max-old-space-size=4096 (para 4GB de RAM)
```

---

## 6. Aplicação não inicia: "EADDRINUSE: address already in use :::3000"

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Causa:** Porta 3000 já está em uso

**Solução Rápida:**
```bash
# Ver o que está usando porta 3000
lsof -i :3000

# Matar processo
kill -9 <PID>

# Ou usar porta diferente
PORT=3001 npm run build && pm2 start ecosystem.config.js
```

---

## 7. Erro: "Unexpected token" durante build

```
SyntaxError: Unexpected token } in JSON at position XXX
```

**Causa:** Arquivo JSON corrompido (package-lock.json, .next)

**Solução Rápida:**
```bash
# Limpe tudo
rm -rf node_modules .next package-lock.json

# Instale novamente
npm install

# Gere Prisma
npm run prisma:generate

# Build
npm run build
```

---

## 8. GitHub Actions falha: "Timeout exceeded"

```
Error: Timeout exceeded - deployment took too long
```

**Causa:** Build leva muito tempo (>10 minutos)

**Solução:**
```bash
# Customize timeout no .github/workflows/deploy.yml
timeout-minutes: 30

# Ou otimize:
# 1. Limpe node_modules antes
# 2. Use npm ci em vez de npm install
# 3. Cache dependências
```

---

## 9. Erro em produção: "Cannot read property 'X' of undefined"

**Causa:** Variável de ambiente não configurada na Digital Ocean

**Solução Rápida:**
```bash
# 1. Verifique quais env vars existem
env | grep -i "DATABASE\|AUTH\|WHATSAPP\|OPENAI"

# 2. Configure as que faltam
export VAR_NAME="valor"

# 3. Adicione em .env.production para persistir

# 4. Reinicie aplicação
pm2 restart whatsappdavi
```

---

## 10. Erro: "NextAuth configuration error"

```
Error: NEXTAUTH_SECRET not found in environment
```

**Causa:** NEXTAUTH_SECRET não configurado

**Solução Rápida:**
```bash
# Gere um secret seguro
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Configure em .env.production
echo "NEXTAUTH_SECRET=seu_secret_aqui" >> .env.production

# Reinicie
pm2 restart whatsappdavi
```

---

## ✅ Checklist Rápido de Deploy

```bash
# 1. Verifique ambiente
echo "Node:" && node -v
echo "Npm:" && npm -v
echo "Git:" && git --version

# 2. Clone/Pull código
git clone ... && cd whatsappdavi
# OU
git pull origin main

# 3. Configure variáveis
nano .env.production
# DATABASE_URL=...
# NEXTAUTH_SECRET=...
# Etc.

# 4. Instale dependências
npm ci

# 5. Gere Prisma
npm run prisma:generate

# 6. Execute migrations
npm run prisma:migrate

# 7. Build
npm run build

# 8. Inicie
pm2 start ecosystem.config.js --env production
pm2 logs whatsappdavi

# 9. Verifique
curl http://localhost:3000
```

---

## 🔍 Se Nada Funcionar

```bash
# Execute diagnóstico
bash DIAGNOSE.sh

# Veja logs do PM2
pm2 logs whatsappdavi

# Veja logs do sistema
journalctl -u whatsappdavi -n 100

# Tente build manualmente com debug
DEBUG=* npm run build 2>&1 | head -100

# Teste database
npx prisma db execute --stdin

# Teste conexão HTTP
curl -v http://localhost:3000
```

---

**Última atualização:** Nov 3, 2024
