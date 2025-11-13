import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface AssistantContext {
  messageBody: string;
  conversationHistory: string[];
  contactName?: string;
  productKnowledge?: string;
  systemPrompt?: string;
}

export async function generateAIResponse(context: AssistantContext): Promise<{
  response: string;
  confidence: number;
  shouldAutoReply: boolean;
}> {
  try {
    const systemPrompt =
      context.systemPrompt ||
      `Você é um atendente de suporte ao cliente amigável e profissional.
Responda em português brasileiro de forma clara e concisa.
Seja útil mas sempre respeitoso com o cliente.
Se não souber algo, diga honestamente.`;

    const userMessage = `
Mensagem do cliente: "${context.messageBody}"

${context.productKnowledge ? `Base de conhecimento: ${context.productKnowledge}` : ''}

Histórico da conversa:
${context.conversationHistory.join('\n')}

Por favor, gere uma resposta adequada. Se a mensagem exigir intervenção humana, retorne "HANDOFF_REQUIRED".
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    const content = response.choices[0]?.message?.content || '';

    const shouldAutoReply = !content.includes('HANDOFF_REQUIRED');
    const confidence = response.choices[0]?.finish_reason === 'stop' ? 0.9 : 0.6;

    return {
      response: content.replace('HANDOFF_REQUIRED', '').trim(),
      confidence,
      shouldAutoReply,
    };
  } catch (error) {
    console.error('Error generating AI response:', error);
    return {
      response: 'Desculpe, não consegui processar sua mensagem no momento.',
      confidence: 0,
      shouldAutoReply: false,
    };
  }
}

export async function generateProductSummary(
  productInfo: string
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'Você é um especialista em resumir informações de produtos. Crie um resumo conciso e útil.',
        },
        {
          role: 'user',
          content: `Por favor, resuma as seguintes informações do produto de forma concisa:\n\n${productInfo}`,
        },
      ],
      temperature: 0.5,
      max_tokens: 500,
    });

    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error generating product summary:', error);
    return productInfo;
  }
}
