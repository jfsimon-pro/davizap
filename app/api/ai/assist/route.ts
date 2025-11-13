import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateAIResponse } from '@/lib/openai';

function getAuthUser(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;

  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    return decoded;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { conversationId } = body;

    if (!conversationId) {
      return NextResponse.json(
        { error: 'conversationId is required' },
        { status: 400 }
      );
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        contact: true,
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 10,
        },
      },
    });

    if (!conversation || conversation.tenantId !== user.tenantId) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Get the latest message
    const latestMessage = conversation.messages[conversation.messages.length - 1];
    if (!latestMessage || latestMessage.direction !== 'INBOUND') {
      return NextResponse.json({ error: 'No inbound message to assist' }, { status: 400 });
    }

    // Get knowledge base
    const knowledgeSources = await prisma.knowledgeSource.findMany({
      where: { tenantId: user.tenantId },
      include: {
        chunks: { take: 5 },
      },
    });

    const productKnowledge = knowledgeSources
      .flatMap((source) => source.chunks.map((chunk) => chunk.text))
      .join('\n');

    // Build conversation history
    const conversationHistory = conversation.messages.map(
      (msg) => `${msg.direction === 'INBOUND' ? 'Cliente' : 'Você'}: ${msg.body}`
    );

    // Get prompt profile
    const promptProfile = await prisma.promptProfile.findFirst({
      where: { tenantId: user.tenantId, active: true },
    });

    // Generate AI response
    const startTime = Date.now();
    const aiResponse = await generateAIResponse({
      messageBody: latestMessage.body || '',
      conversationHistory,
      contactName: conversation.contact.name || undefined,
      productKnowledge,
      systemPrompt: promptProfile?.systemPrompt,
    });
    const latencyMs = Date.now() - startTime;

    // Create AI trace
    const aiTrace = await prisma.aITrace.create({
      data: {
        tenantId: user.tenantId,
        conversationId,
        messageId: latestMessage.id,
        model: 'gpt-4o-mini',
        promptProfileId: promptProfile?.id,
        confidence: aiResponse.confidence,
        latencyMs,
        decision: aiResponse.shouldAutoReply ? 'AUTO_REPLY' : 'REQUIRE_APPROVAL',
      },
    });

    return NextResponse.json({
      response: aiResponse.response,
      confidence: aiResponse.confidence,
      shouldAutoReply: aiResponse.shouldAutoReply,
      traceId: aiTrace.id,
    });
  } catch (error) {
    console.error('Error in AI assist:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
