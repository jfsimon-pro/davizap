# Multi-stage build para otimizar tamanho final
FROM node:18-alpine AS base

# Instalar pnpm (alternativa mais rápida que npm)
RUN npm install -g pnpm

WORKDIR /app

# Stage 1: Install dependencies
FROM base AS deps
COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN npm ci --only=production

# Stage 2: Build
FROM base AS builder
COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN npm ci

COPY prisma ./prisma
RUN npm run prisma:generate

COPY . .
RUN npm run build

# Stage 3: Runtime
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Criar user não-root para segurança
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
