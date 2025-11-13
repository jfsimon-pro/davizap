# Guia do Usuário - WhatsApp Davi

Um guia completo para usar todas as funcionalidades do sistema.

## 🔐 Autenticação

### Login Inicial

1. Acesse: `http://localhost:3000/login`
2. Credenciais padrão:
   - **Email**: `admin@gmail.com`
   - **Senha**: `Jesus`
3. Clique em **Entrar**

## 📊 Dashboard

O dashboard é sua central de controle. Aqui você vê:

- **Conversas Abertas**: Número de conversas ativas
- **Mensagens Hoje**: Total de mensagens recebidas
- **Campanhas Ativas**: Campanhas em progresso
- **Taxa de Entrega**: Percentual de mensagens entregues

### Navegação Principal

Acesse diferentes seções pelo menu:

- **📥 Inbox**: Gerenciar conversas e responder
- **📨 Templates**: Criar e gerenciar templates
- **📊 Campanhas**: Executar disparos em massa
- **🔧 Configurações**: Setup do WhatsApp
- **🧠 Base de Conhecimento**: Treinar a IA
- **📈 Relatórios**: Ver métricas (em desenvolvimento)

## ⚙️ Configurações do WhatsApp

### Setup Inicial

1. Vá para **Configurações**
2. Preencha os campos:

   - **WABA ID**: Seu WhatsApp Business Account ID
   - **Phone Number ID**: ID do número cadastrado
   - **Display Phone**: Número para exibição (opcional)
   - **Verify Token**: Token para validar webhook
   - **Access Token**: Token de acesso da Meta API

3. Clique em **Salvar**

### Obter Credenciais do WhatsApp

1. Acesse [Meta Business Manager](https://business.facebook.com)
2. Vá para **WhatsApp** > **Getting Started**
3. Copie:
   - **WABA ID**: Em "Your Business Account ID"
   - **Phone Number ID**: Em "Phone Number ID"
4. Gere um **Access Token** em **Settings** > **System User**
5. Crie um **Verify Token** (qualquer string segura)

### Configurar Webhook

1. Copie a **Webhook URL** da página de Configurações
2. No Meta Business Manager:
   - **Configurações** > **Webhook**
   - Adicione a URL
   - Cole o Verify Token
   - Inscreva-se em: `messages`, `message_template_status_update`
3. Clique em **Verificar e Salvar**

## 📨 Templates de Mensagem

### Por que usar Templates?

- **Obrigatório fora da janela de 24h**: Se o cliente não te enviou mensagem nos últimos 24h, você precisa usar template
- **Reusável**: Crie uma vez, use múltiplas vezes
- **Aprovado**: Meta valida antes de usar
- **Profissional**: Consistência nas mensagens

### Criar um Template

1. Vá para **Templates**
2. Clique em **+ Novo Template**
3. Preencha:
   - **Nome**: Identificador único (ex: `welcome_new_customer`)
   - **Idioma**: Português (BR), English, etc
   - **Categoria**:
     - `UTILITY` - Confirmações, avisos
     - `MARKETING` - Promoções, ofertas
     - `AUTHENTICATION` - Códigos OTP, confirmações
   - **Corpo da Mensagem**: Seu texto (até 1024 caracteres)
   - **Rodapé**: Texto opcional no final

4. Clique em **Criar Template**

### Usar Placeholders

Adicione variáveis dinâmicas com `{{1}}`, `{{2}}`, etc:

```
Olá {{1}}!

Sua compra de R$ {{2}} foi confirmada.
Código de rastreamento: {{3}}

Obrigado por comprar conosco!
```

Ao enviar, você substitui {{1}} por "João", {{2}} por "150,00", etc.

### Submeter para Aprovação

1. Clique no template
2. Clique em **Enviar para Aprovação**
3. Meta revisa (geralmente 24-48 horas)
4. Verifique o status na lista de templates

### Status do Template

- **DRAFT**: Rascunho, não pode enviar
- **SUBMITTED**: Aguardando aprovação
- **APPROVED**: Pronto para usar
- **REJECTED**: Não aprovado (veja o motivo e tente novamente)
- **DEPRECATED**: Descontinuado

## 📥 Inbox (Conversas)

### Receber Mensagens

Quando um cliente envia mensagem:
1. Aparece em **Inbox** em tempo real
2. Você vê o histórico completo da conversa
3. Pode responder diretamente

### Responder uma Mensagem

1. Vá para **Inbox**
2. Selecione a conversa na lista esquerda
3. As mensagens aparecem no centro
4. Na caixa inferior, digite sua resposta
5. Clique em **Enviar**

### Usar Sugestões de IA (em breve)

- O sistema sugerirá respostas automáticas
- Você pode aceitar, editar ou rejeitar
- Cada decisão treina o sistema

### Janela de 24h

**Importante**: Fora de 24h desde a última mensagem do cliente:
- ❌ Não pode enviar mensagem de texto livre
- ✅ Deve usar um template aprovado
- ✅ O sistema avisará quando usar template

### Atribuir para Agente

Em breve: Poder atribuir conversas para membros da equipe.

## 📊 Campanhas (Disparo em Massa)

### Quando Usar

- Anúncios de promoções
- Avisos de stock
- Atualizações de serviço
- Pesquisas de satisfação

### Criar uma Campanha

1. Vá para **Campanhas**
2. Clique em **+ Nova Campanha**
3. Preencha:
   - **Nome**: Identificação da campanha
   - **Template**: Escolha um template aprovado
   - **Números de Telefone**: Cole uma lista:
     ```
     5511999999999
     5521987654321
     5531988776655
     ```
     Aceita formatos:
     - Com `+`: `+5511999999999`
     - Sem `+`: `5511999999999`
     - Será padronizado para E.164

4. Clique em **Criar Campanha**

### Monitorar Campanha

Após criar, você vê:

- **Planejado**: Total de números
- **Enviado**: Mensagens entregues ✓
- **Falha**: Problemas de entrega ✗
- **% Processado**: Progresso geral

Clique em **Iniciar Campanha** para começar.

### Limites e Rate Limiting

O sistema respeita:
- Limite de requisições da Meta
- Prioridades por destinatário
- Backoff automático em erros

## 🧠 Base de Conhecimento

### Por que é Importante?

Quanto mais o ChatGPT sabe sobre você:
- ✓ Respostas mais precisas
- ✓ Menos erros e mentiras
- ✓ Melhor experiência do cliente

### Adicionar Conteúdo

1. Vá para **Base de Conhecimento**
2. Clique em **+ Adicionar Conteúdo**
3. Escolha o **Tipo**:
   - **Texto Manual**: Cole texto direto
   - **PDF**: (converter para texto antes)
   - **URL**: Link de página web
   - **FAQ**: Perguntas e respostas
   - **Planilha CSV**: Dados estruturados

4. Adicione o conteúdo
5. Clique em **Adicionar à Base de Conhecimento**

### O que Adicionar?

📋 **Informações de Produto**:
- Nome, descrição, funcionalidades
- Preços, promoções
- Cores, tamanhos, modelos
- Links de compra

📋 **Políticas**:
- Devolução e reembolso
- Frete e prazo
- Garantia
- Cancelamento

📋 **FAQs**:
- Perguntas frequentes
- Soluções de problemas
- Guias de uso

📋 **Exemplos de Conversas**:
- Boas respostas (para o sistema aprender)
- Más respostas (para o sistema evitar)

### Atualizar Conteúdo

1. Vá para **Base de Conhecimento**
2. Quando algo mudar (preço, política):
   - Adicione a versão nova
   - O sistema será re-indexado automaticamente

## 🤖 ChatGPT / IA (em desenvolvimento)

### Como Funciona

1. **Cliente envia mensagem** → Inbox
2. **Sistema analisa** mensagem + contexto
3. **IA busca** na Base de Conhecimento
4. **IA gera** resposta sugerida
5. **Sistema calcula** confiança
6. **Você aprova** ou edita

### Confiança da IA

- **Verde (>80%)**: Resposta pode ser automática
- **Amarelo (50-80%)**: Revisar antes de enviar
- **Vermelho (<50%)**: Requer intervenção humana

### Quando a IA Pede Handoff

A IA pede intervenção humana quando:
- Confiança muito baixa
- Assunto sensível (jurídico, reclamação séria)
- Palavras-chave detectadas
- Cliente pede para falar com humano

## 📈 Métricas e Relatórios (em breve)

Em breve você poderá ver:

- **Taxa de Entrega**: % de mensagens entregues
- **Taxa de Leitura**: % de mensagens lidas
- **Taxa de Resposta**: % que responderam
- **Tempo de Resposta**: Quanto leva para responder
- **Satisfação**: Feedback dos clientes
- **Custos**: Gasto com tokens OpenAI
- **Tendências**: Horários, assuntos populares

## 🆘 Dúvidas Frequentes

### Q: Por que minha mensagem não foi entregue?

A: Possíveis causas:
- Número inválido (não é E.164)
- Fora da janela de 24h (use template)
- Contato bloqueou você
- Limite de requisições atingido
- Token expirado

Verifique os logs em Prisma Studio.

### Q: Quanto tempo leva para template ser aprovado?

A: Meta aprova em 24-48 horas, às vezes mais rápido.

### Q: Posso enviar imagens ou arquivos?

A: Sim! Em desenvolvimento. Por enquanto apenas texto.

### Q: Como treinar melhor o ChatGPT?

A:
1. Adicione exemplos reais de conversas boas
2. Seja específico (preços exatos, políticas claras)
3. Atualize quando algo muda
4. Monitore as sugestões que não acertou

### Q: Onde vejo os logs de erro?

A: Use Prisma Studio:
```bash
npm run prisma:studio
```

Veja tabelas: `AuditLog`, `AITrace`

### Q: Posso ter múltiplas contas?

A: Em breve! Sistema multi-tenant já está pronto.

## ✅ Checklist de Boas Práticas

- [ ] Adicione conteúdo à Base de Conhecimento
- [ ] Crie pelo menos 3 templates
- [ ] Teste templates manualmente
- [ ] Configure webhook corretamente
- [ ] Revise as respostas da IA
- [ ] Mantenha dados atualizados
- [ ] Faça backup do banco regularmente
- [ ] Monitore falhas de entrega
- [ ] Respeite privacidade dos clientes
- [ ] Cumpra regulamentações (LGPD/GDPR)

## 📱 Acesso Móvel

O sistema é responsivo e funciona bem em:
- ✓ Desktop (melhor experiência)
- ✓ Tablet
- ✓ Mobile (leitura do Inbox)

## 🔒 Segurança

- Nunca compartilhe suas credenciais
- Altere a senha padrão
- Mantenha o Access Token seguro
- Use HTTPS em produção
- Faça backup regularmente

## 🆘 Precisa de Ajuda?

- Leia [SETUP.md](./SETUP.md) para instalação
- Veja [README.md](./README.md) para overview técnico
- Consulte [Docs do WhatsApp Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api)

---

**Pronto para começar?** Login em `http://localhost:3000/login` 🚀
