# 🚀 Guia de Deploy - WhatsApp Davi

## Pré-requisitos

- Node.js 18+ instalado
- PostgreSQL database configurado
- Git instalado
- (Opcional) PM2 para gerenciar processo em produção
- (Opcional) Docker para containerização

## Deploy Local (Desenvolvimento)

```bash
# 1. Clone o repositório
git clone https://github.com/jfsimon-pro/davizap.git
cd whatsappdavi

# 2. Instale dependências
npm install

# 3. Configure variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com seus valores reais

# 4. Configure Prisma
npm run prisma:generate
npm run prisma:migrate

# 5. Inicie em desenvolvimento
npm run dev
```

Acesse: http://localhost:3000

## Deploy na Digital Ocean (Recomendado)

### Opção 1: Com Docker (Mais Simples)

```bash
# 1. Build a imagem Docker
docker build -t whatsappdavi:latest .

# 2. Execute com docker-compose ou comando direto
docker run \
  -e DATABASE_URL="postgresql://..." \
  -e WHATSAPP_ACCESS_TOKEN="..." \
  -p 3000:3000 \
  whatsappdavi:latest
```

### Opção 2: Deploy Manual com PM2 (Comum na Digital Ocean)

#### Setup Inicial (Uma vez)

```bash
# 1. SSH na Digital Ocean
ssh root@your_droplet_ip

# 2. Instale Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Instale PM2 globalmente
sudo npm install -g pm2

# 4. Clone o repositório
cd ~
git clone https://github.com/jfsimon-pro/davizap.git
cd whatsappdavi

# 5. Instale dependências
npm install

# 6. Configure variáveis de ambiente
nano .env.production
# Adicione todas as variáveis necessárias

# 7. Build a aplicação
npm run build

# 8. Inicie com PM2
pm2 start ecosystem.config.js --env production

# 9. Configure PM2 para iniciar no boot
pm2 startup
pm2 save

# 10. Configurar Nginx (reverseproxy)
sudo nano /etc/nginx/sites-available/default
```

#### Configuração Nginx

```nginx
upstream whatsappdavi {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name your_domain.com;

    location / {
        proxy_pass http://whatsappdavi;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Deploy Contínuo (Git Push)

```bash
# Após configuração inicial, updates automáticos:
cd ~/whatsappdavi
git pull origin main
npm install
npm run build
pm2 restart whatsappdavi
```

### Opção 3: GitHub Actions (Recomendado)

1. Configure secrets no GitHub (Settings → Secrets):
   - `DO_HOST`: IP da sua Digital Ocean
   - `DO_USER`: usuário SSH (root ou outro)
   - `DO_SSH_KEY`: sua chave SSH privada

2. Push para main automaticamente deployan:

```bash
git add .
git commit -m "fix: update config"
git push origin main
```

O workflow `.github/workflows/deploy.yml` vai executar automaticamente.

## Troubleshooting Digital Ocean

### ❌ Build falha com erro de variaveis de ambiente

**Sintoma:** `Error: DATABASE_URL is required`

**Solução:**
```bash
# 1. Verifique se .env.production está preenchido
cat .env.production

# 2. Verifique variáveis no Digital Ocean
echo $DATABASE_URL
echo $NEXTAUTH_SECRET

# 3. Se vazio, configure manualmente
export DATABASE_URL="postgresql://..."
export NEXTAUTH_SECRET="seu_secret"
export OPENAI_API_KEY="sua_key"

# 4. Tente build novamente
npm run build
```

### ❌ Build falha com erro de Prisma

**Sintoma:** `Error: Prisma Client is missing`

**Solução:**
```bash
# 1. Limpe dependências
rm -rf node_modules .next
npm install

# 2. Generate Prisma Client
npm run prisma:generate

# 3. Build novamente
npm run build
```

### ❌ Build falha com "Cannot find module"

**Sintoma:** `Module not found: Cannot find module '@/...'`

**Solução:**
```bash
# 1. Verifique tsconfig.json
cat tsconfig.json

# 2. Regenere client
npm run prisma:generate

# 3. Limpe cache
rm -rf .next node_modules
npm install --prefer-offline --no-audit

# 4. Build
npm run build
```

### ❌ Erro de banco de dados na Digital Ocean

**Sintoma:** `Error: Can't reach database server`

```bash
# 1. Verifique se DATABASE_URL está correto
echo $DATABASE_URL

# 2. Teste conexão
npm install -g psql
psql $DATABASE_URL -c "SELECT 1"

# 3. Se não conectar, verifique:
# - IP do droplet está autorizado no banco
# - Credenciais estão corretas
# - Porta 5432 está aberta

# 4. Execute migrations após conectar
npm run prisma:migrate
```

### Troubleshooting Rápido

**Execute o script de diagnóstico:**
```bash
bash DIAGNOSE.sh
```

Este script verifica:
- ✅ Versão do Node.js
- ✅ Variáveis de ambiente
- ✅ Arquivos essenciais
- ✅ Tamanho do projeto
- ✅ Problemas comuns
- ✅ Validação de build

### Aplicação não inicia no PM2

```bash
# Ver logs
pm2 logs whatsappdavi

# Reiniciar
pm2 restart whatsappdavi

# Deletar e recriar
pm2 delete whatsappdavi
pm2 start ecosystem.config.js --env production
```

### Porta 3000 em uso

```bash
# Ver processos
lsof -i :3000

# Matar processo
kill -9 <PID>
```

## Variáveis de Ambiente Necessárias

```env
# Essencial para produção
DATABASE_URL=postgresql://user:password@host:5432/whatsappdavi
NODE_ENV=production

# WhatsApp Integration
WHATSAPP_ACCESS_TOKEN=sua_token
WHATSAPP_PHONE_NUMBER_ID=seu_phone_id
WHATSAPP_WABA_ID=seu_waba_id

# OpenAI (opcional)
OPENAI_API_KEY=sua_key
```

## Monitoramento

```bash
# Status do PM2
pm2 status

# Logs em tempo real
pm2 logs whatsappdavi --follow

# Monitoramento
pm2 monit
```

## Backup do Banco de Dados

```bash
# Backup
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

## Próximos Passos

- [ ] Configurar SSL/HTTPS (Let's Encrypt)
- [ ] Configurar backups automáticos
- [ ] Monitorar performance
- [ ] Configurar alertas

---

**Status**: ✅ Build validado em Next.js 14.0.4
**Último update**: November 3, 2024
