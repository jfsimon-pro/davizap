#!/usr/bin/env bash

set -e

echo "🔨 WhatsApp Davi Build - Heroku"
echo "==============================="

# 1. Generate Prisma Client
echo "📦 Step 1: Generate Prisma Client..."
npm run prisma:generate

# 2. Build Next.js (ignore warnings about /404 and /500)
echo "🏗️ Step 2: Build Next.js..."
npm run build

# 3. Check if build directory exists
if [ ! -d ".next" ]; then
  echo "❌ ERROR: .next directory not created!"
  exit 1
fi

if [ ! -f ".next/required-server-files.json" ]; then
  echo "❌ ERROR: required-server-files.json not found!"
  exit 1
fi

echo "✅ Build successful!"
echo "   - Prisma Client generated"
echo "   - Next.js compiled"
echo "   - Server files ready"
echo ""
echo "Ready to start with: npm start"
