#!/bin/bash

# Script de diagnóstico para troubleshooting de build no Digital Ocean
# Executar: bash DIAGNOSE.sh

echo "🔍 Diagnóstico de Build - WhatsApp Davi"
echo "========================================"
echo ""

# Verificar Node.js
echo "📦 Versão do Node.js:"
node --version
npm --version
echo ""

# Verificar variáveis de ambiente
echo "🔐 Variáveis de ambiente necessárias:"
if [ -z "$DATABASE_URL" ]; then
  echo "  ❌ DATABASE_URL: NÃO CONFIGURADO"
else
  echo "  ✅ DATABASE_URL: Configurado"
fi

if [ -z "$NEXTAUTH_SECRET" ]; then
  echo "  ⚠️  NEXTAUTH_SECRET: Não definido (vai usar padrão)"
else
  echo "  ✅ NEXTAUTH_SECRET: Configurado"
fi

if [ -z "$OPENAI_API_KEY" ]; then
  echo "  ⚠️  OPENAI_API_KEY: Não definido (recurso vai falhar)"
else
  echo "  ✅ OPENAI_API_KEY: Configurado"
fi
echo ""

# Verificar arquivos críticos
echo "📄 Arquivos essenciais:"
[ -f "package.json" ] && echo "  ✅ package.json" || echo "  ❌ package.json"
[ -f "next.config.js" ] && echo "  ✅ next.config.js" || echo "  ❌ next.config.js"
[ -f "tsconfig.json" ] && echo "  ✅ tsconfig.json" || echo "  ❌ tsconfig.json"
[ -f "prisma/schema.prisma" ] && echo "  ✅ prisma/schema.prisma" || echo "  ❌ prisma/schema.prisma"
echo ""

# Verificar tamanho dos arquivos
echo "💾 Tamanho do projeto:"
du -sh . 2>/dev/null || echo "  Não foi possível calcular"
echo ""

# Tentar build com output verboso
echo "🔨 Tentando build..."
echo "---"
npm run build 2>&1 | head -50
echo "---"
echo ""

# Verificar erros comuns
echo "🐛 Verificando erros comuns:"

if grep -q "NEXT_PRIVATE_SKIP_MIDDLEWARE_VALIDATION" .env.production 2>/dev/null; then
  echo "  ⚠️  .env.production tem variável experimental"
fi

if [ -d "intermittenty" ]; then
  echo "  ❌ CRÍTICO: Pasta 'intermittenty' ainda existe!"
  echo "     Remova com: rm -rf intermittenty"
fi

if [ ! -d "node_modules" ]; then
  echo "  ⚠️  node_modules não encontrado"
  echo "     Execute: npm install"
fi

if [ ! -f ".next/required-server-files.json" ]; then
  echo "  ⚠️  .next/required-server-files.json não existe após build"
else
  echo "  ✅ Build output válido"
fi

echo ""
echo "✅ Diagnóstico completo!"
