# 🚀 Deploy no Digital Ocean - Passo a Passo

## ✅ Status do Build
- ✓ Next.js 14.0.4 compilado com sucesso
- ✓ Todas as 22 páginas geradas
- ✓ Pronto para produção

## 📋 Antes de começar

Você precisa:
1. **IP/Hostname da Digital Ocean** (ex: 123.45.67.89)
2. **Acesso SSH** configurado
3. **PostgreSQL URL** (banco de dados)
4. **Credenciais da API** (WhatsApp, OpenAI, etc)

## 🔧 Opção 1: Deploy Automático (Recomendado)

### Passo 1: Configurar SSH

```bash
# No seu computador, gere uma chave SSH se não tiver:
ssh-keygen -t rsa -b 4096 -f ~/.ssh/do-deploy

# Copie a chave pública para Digital Ocean
cat ~/.ssh/do-deploy.pub
# No painel Digital Ocean: Settings → Security → SSH Keys → Add Key
```

### Passo 2: Configurar GitHub Secrets

1. Vá para: https://github.com/jfsimon-pro/davizap
2. Settings → Secrets and variables → Actions
3. Clique "New repository secret"
4. Adicione 3 secrets:

```
Nome: DO_HOST
Valor: 123.45.67.89

Nome: DO_USER
Valor: root

Nome: DO_SSH_KEY
Valor: (conteúdo de ~/.ssh/do-deploy)
```

### Passo 3: Fazer Deploy

Agora todo push para `main` faz deploy automático:

```bash
# Faça qualquer mudança e push
git add .
git commit -m "chore: update config"
git push origin main

# GitHub Actions vai:
# 1. Fazer build localmente
# 2. SSH para Digital Ocean
# 3. Pull do código
# 4. Fazer build lá
# 5. Reiniciar aplicação
```

Monitor em: https://github.com/jfsimon-pro/davizap/actions

## 🐳 Opção 2: Deploy com Docker

### Setup Inicial (Uma vez na Digital Ocean)

```bash
# 1. Connect via SSH
ssh root@123.45.67.89

# 2. Instale Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker root

# 3. Instale Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 4. Clone o projeto
git clone https://github.com/jfsimon-pro/davizap.git
cd davizap
```

### Criar docker-compose.yml

```bash
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - WHATSAPP_ACCESS_TOKEN=${WHATSAPP_ACCESS_TOKEN}
      - WHATSAPP_PHONE_NUMBER_ID=${WHATSAPP_PHONE_NUMBER_ID}
      - WHATSAPP_WABA_ID=${WHATSAPP_WABA_ID}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - NODE_ENV=production
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
EOF
```

### Criar .env.production

```bash
nano .env.production
```

Adicione:
```
DATABASE_URL=postgresql://user:pass@host:5432/whatsappdavi
WHATSAPP_ACCESS_TOKEN=seu_token
WHATSAPP_PHONE_NUMBER_ID=seu_phone_id
WHATSAPP_WABA_ID=seu_waba_id
OPENAI_API_KEY=sua_key
NODE_ENV=production
```

### Iniciar Container

```bash
# Build e inicie
docker-compose up -d

# Verifique logs
docker-compose logs -f

# Parar
docker-compose down
```

### Nginx Reverseproxy (Opcional)

```bash
# Instale Nginx
sudo apt update
sudo apt install nginx

# Configure
sudo nano /etc/nginx/sites-available/default
```

Adicione no bloco `server`:

```nginx
server {
    listen 80;
    server_name seu_dominio.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Reinicie:
```bash
sudo systemctl restart nginx
```

## 🛠️ Opção 3: Deploy Manual (PM2)

```bash
# 1. SSH para Digital Ocean
ssh root@123.45.67.89

# 2. Instale Node 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Instale PM2
sudo npm install -g pm2

# 4. Clone e configure
git clone https://github.com/jfsimon-pro/davizap.git
cd davizap

# 5. Instale dependências
npm install

# 6. Configure variáveis
nano .env.production
# (Adicione todas as variáveis necessárias)

# 7. Build
npm run build

# 8. Inicie com PM2
pm2 start ecosystem.config.js --env production
pm2 startup
pm2 save

# 9. Veja logs
pm2 logs whatsappdavi
```

## 🔄 Atualizar Código (Depois de Push)

### Com Docker Compose:
```bash
docker-compose pull
docker-compose up -d
```

### Com PM2:
```bash
git pull origin main
npm install
npm run build
pm2 restart whatsappdavi
```

### Com GitHub Actions:
- Só faça git push, ele atualiza automaticamente!

## 🐛 Troubleshooting

### Erro "Cannot find database"
```bash
# Verifique DATABASE_URL está correto
echo $DATABASE_URL

# Teste conexão
npm install -g psql
psql $DATABASE_URL -c "SELECT 1"
```

### Aplicação não inicia
```bash
# Ver logs
pm2 logs whatsappdavi

# Deletar e recriar
pm2 delete whatsappdavi
pm2 start ecosystem.config.js --env production
```

### Porta 3000 em uso
```bash
lsof -i :3000
kill -9 <PID>
```

### Build falha na Digital Ocean

```bash
# Limpe cache
rm -rf node_modules .next
npm install
npm run prisma:generate
npm run build
```

## 📊 Monitorar Aplicação

```bash
# Status
pm2 status

# Logs em tempo real
pm2 logs whatsappdavi --follow

# Dashboard
pm2 monit

# Restart
pm2 restart whatsappdavi
```

## 🔐 HTTPS (Let's Encrypt)

```bash
# Instale Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Obtenha certificado (requer domínio válido)
sudo certbot --nginx -d seu_dominio.com

# Auto-renew
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

## 📞 Próximos Passos

- [ ] Teste aplicação em produção
- [ ] Configure backups do banco
- [ ] Monitore performance
- [ ] Configure alertas
- [ ] Setup SSL com Let's Encrypt
- [ ] Configure domínio customizado

## 🎯 Verificação Final

```bash
# Testar aplicação
curl http://seu_ip:3000

# Testar API
curl http://seu_ip:3000/api/health

# Ver status completo
pm2 status
```

---

**Precisa de ajuda?** Verifique o arquivo `DEPLOY.md` para mais detalhes.
