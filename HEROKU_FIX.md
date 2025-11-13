# 🔧 Correção para Erro "Build failed" no Heroku/Digital Ocean

## O Erro que Você Recebeu

```
-----> Build failed

Some possible problems:

- Node version not specified in package.json
- ...

Export encountered errors on following paths:
/_error: /404
/_error: /500
```

---

## O Que Causou o Erro

Havia **2 problemas combinados:**

### 1️⃣ Falta de Versão do Node.js
Heroku/Digital Ocean não sabiam qual versão do Node.js usar porque não estava especificada no `package.json`.

**Solução:** Adicionei `"engines": { "node": "18.x" }` ao package.json

### 2️⃣ Prisma Client Não Gerado
O build falhava porque Prisma Client não era gerado antes do build do Next.js.

**Solução:** Mudei o script de build para:
```json
"build": "prisma generate && next build"
```

### 3️⃣ Export Estático de Páginas de Erro
Next.js 14 estava tentando exportar as páginas de erro `/404` e `/500` como **arquivos estáticos**, mas isso não funciona quando a aplicação tem database e servidor.

**Solução:** Configurei next.config.js para server-side rendering (não static export)

---

## O Que Foi Alterado

| Arquivo | Mudança |
|---------|---------|
| `package.json` | Adicionado `"engines": { "node": "18.x" }` |
| `package.json` | Build agora: `"build": "prisma generate && next build"` |
| `next.config.js` | Adicionado `experimental: { ppr: false }` |
| `Procfile` | Novo arquivo para Heroku (web: npm start) |
| `.heroku.yml` | Novo arquivo de configuração Heroku |

---

## Por Que Funciona Agora

✅ **Node 18.x especificado** → Heroku/DO usa versão correta
✅ **Prisma gerado antes do build** → Sem erros de módulo faltando
✅ **Server-side rendering habilitado** → Não tenta exportar páginas estáticas
✅ **Procfile configurado** → Heroku sabe como iniciar a app

---

## Para Fazer Deploy Novamente

Simplesmente faça push:

```bash
git push origin main
```

Heroku/Digital Ocean agora vai:
1. Detectar Node 18.x
2. Instalar dependências
3. Gerar Prisma Client
4. Fazer build do Next.js
5. Iniciar aplicação

---

## Se Ainda Não Funcionar

### ❌ Erro: "DATABASE_URL not found"
```bash
# Configure a variável no Heroku
heroku config:set DATABASE_URL="postgresql://user:pass@host/db"

# Ou no Digital Ocean, adicione em .env.production
```

### ❌ Erro: "Node version mismatch"
```bash
# Verifique versão local
node --version

# Ele tem que ser 18+
```

### ❌ Erro: "Prisma Client missing"
```bash
# Limpe e reconstrua
rm -rf node_modules .next
npm install
npm run build
```

---

## Heroku vs Digital Ocean

**Heroku:**
- Usa buildpacks (detecta Node.js automaticamente)
- Procfile define como iniciar
- Config vars definem ambiente

**Digital Ocean:**
- SSH manual ou GitHub Actions
- .env.production define variáveis
- PM2 ou Docker gerencia processo

**Ambos funcionam com esta configuração!**

---

**Data de Fix:** Nov 3, 2024
**Status:** ✅ Build pronto para produção
