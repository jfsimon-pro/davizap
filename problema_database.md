# Prisma no DigitalOcean App Platform – Erro P3014 (shadow database) e correção

Este documento explica o problema visto no console do App Platform, por que ele acontece e como corrigir de forma **recomendada para produção**.

---

## 1) Sintoma

No console do App Platform ao rodar `npm run prisma:migrate` aparece:

```
Error: P3014
Prisma Migrate could not create the shadow database. Original error:
ERROR: permission denied to create database
```

---

## 2) Causa raiz (o que está acontecendo)

* O comando **`prisma migrate dev`** tenta criar uma **shadow database** (um banco temporário) para comparar o schema e gerar/aplicar migrations.
* Em bancos gerenciados (como o Postgres da DigitalOcean), o usuário padrão **não possui permissão** de `CREATE DATABASE`.
* Resultado: o Prisma falha com **P3014** (sem permissão para criar a shadow DB).

> Em produção não se usa `migrate dev`. O comando correto é **`prisma migrate deploy`** (aplica apenas as migrations já existentes, sem shadow DB).

---

## 3) Correção recomendada (produção)

### Passo A — Gerar migrations **localmente**

1. Localmente (na sua máquina), aponte o `DATABASE_URL` para **seu banco de desenvolvimento local** (não o da DO).
2. Gere as migrations e commit no repositório:

   ```bash
   npx prisma migrate dev --name init
   git add prisma/migrations
   git commit -m "chore(prisma): initial migrations"
   git push
   ```

> Se já existem migrations em `prisma/migrations`, este passo já está ok.

### Passo B — Ajustar scripts no `package.json` (no projeto)

Substitua o script de migrate para usar `deploy`:

```json
{
  "scripts": {
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate deploy",
    "prisma:studio": "prisma studio"
  }
}
```

### Passo C — Rodar no App Platform

No Console da DigitalOcean (ou no processo de build/release):

```bash
npm run prisma:generate
npm run prisma:migrate   # agora roda 'prisma migrate deploy'
```

Se não houver migrations commitadas, nada será aplicado (por isso o Passo A é essencial).

---

## 4) Prisma Studio em produção

`prisma studio` abre uma UI local. No App Platform ele não fica exposto/publicado.

Use o Studio **na sua máquina**, apontando para o banco da DO:

```bash
export DATABASE_URL="postgresql://<user>:<password>@<host>:25060/<db>?sslmode=require"
npx prisma studio
```

> Se necessário, adicione seu IP em **Trusted Sources** do cluster na DO para conseguir conectar externamente.

---

## 5) Checklist de variáveis de ambiente

* `DATABASE_URL` → string completa do Postgres **com** `sslmode=require`.
* `NEXTAUTH_URL` → **URL pública HTTPS** do app (não `http://localhost:3000`).
* `NEXTAUTH_SECRET` → segredo forte real.
* `OPENAI_API_KEY` → chave real.

> Se ativar **Connection Pooling** depois, considere usar `directUrl` no Prisma para DDL/migrations (ver Passo Avançado abaixo).

---

## 6) Passo avançado (opcional) – Pooler + `directUrl`

Quando você usa pooler, é boa prática o Prisma aplicar migrations via conexão **direta** (sem pool) para evitar erros de DDL.

**schema.prisma**

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")   // pode apontar para o pooler
  directUrl = env("DIRECT_URL")     // host/porta direct do cluster
}
```

**.env no App Platform**

```
DATABASE_URL=postgresql://<user>:<pass>@<POOL_HOST>:<port>/<db>?sslmode=require
DIRECT_URL=postgresql://<user>:<pass>@<DIRECT_HOST>:<port>/<db>?sslmode=require
```

O comando de produção continua sendo:

```bash
prisma generate
prisma migrate deploy
```

---

## 7) Alternativa (não recomendada para produção)

Se insistir em `migrate dev` em ambiente gerenciado, crie manualmente um banco vazio (shadow) e forneça `shadowDatabaseUrl`:

**schema.prisma**

```prisma
datasource db {
  provider          = "postgresql"
  url               = env("DATABASE_URL")
  shadowDatabaseUrl = env("SHADOW_DATABASE_URL")
}
```

**.env**

```
SHADOW_DATABASE_URL=postgresql://<user>:<pass>@<host>:25060/<shadow_db>?sslmode=require
```

> Exige criar `<shadow_db>` antes via painel/SQL e, ainda assim, não é o fluxo recomendado em produção.

---

## 8) Como validar que deu certo

1. Rode `npm run prisma:migrate` no App Platform e verifique a mensagem **"All migrations have been successfully applied"**.
2. Conecte via psql ou Prisma Studio (local) e veja se as tabelas foram criadas.
3. Faça um deploy do app e execute um fluxo que lê/escreve no banco.

---

## 9) Erros comuns e como evitar

* **P3014**: usando `migrate dev` em produção → troque para `migrate deploy`.
* **Sem migrations**: `deploy` não faz nada → gere/commite migrations localmente e dê push.
* **`NEXTAUTH_URL` errado**: deixado como `localhost` → use a URL pública.
* **Studio no App Platform**: não abre → use localmente com `DATABASE_URL` do cluster.
* **Pooler + DDL**: conflitos ao aplicar migrations → configure `directUrl`.

---

## 10) Resumo rápido (cola)

```bash
# Local
npx prisma migrate dev --name init
git add prisma/migrations && git commit -m "feat(db): migrations" && git push

# App Platform
npm run prisma:generate
npm run prisma:migrate   # (usa migrate deploy)
```

Pronto — seu app aplica migrations em produção sem precisar de shadow database e sem erro P3014.
