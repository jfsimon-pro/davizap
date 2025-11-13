#!/bin/bash

echo "🔨 Building WhatsApp Davi..."

# 1. Generate Prisma Client
echo "📦 Generating Prisma Client..."
npm run prisma:generate

# 2. Build Next.js
echo "🏗️ Building Next.js..."
npm run build

# Check if build succeeded
if [ $? -eq 0 ]; then
  echo "✅ Build successful!"
  exit 0
else
  echo "❌ Build failed!"
  exit 1
fi
