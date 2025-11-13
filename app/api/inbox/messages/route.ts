import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendMessage } from '@/lib/whatsapp';

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

export async function GET(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const conversationId = request.nextUrl.searchParams.get('conversationId');
  if (!conversationId) {
    return NextResponse.json({ error: 'conversationId is required' }, { status: 400 });
  }

  try {
    const messages = await prisma.message.findMany({
      where: {
        tenantId: user.tenantId,
        conversationId,
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { conversationId, body: messageBody } = body;

    if (!conversationId || !messageBody) {
      return NextResponse.json(
        { error: 'conversationId and body are required' },
        { status: 400 }
      );
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { contact: true },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Get WhatsApp config
    const config = await prisma.whatsAppIntegration.findFirst({
      where: { tenantId: user.tenantId },
    });

    if (!config) {
      return NextResponse.json(
        { error: 'WhatsApp not configured' },
        { status: 400 }
      );
    }

    // Send message via WhatsApp API
    try {
      const whatsappResponse = await sendMessage(
        {
          accessToken: config.accessToken,
          phoneNumberId: config.phoneNumberId,
          wabaId: config.wabaId,
        },
        conversation.contact.phoneE164,
        messageBody
      );

      // Save message to database
      const message = await prisma.message.create({
        data: {
          tenantId: user.tenantId,
          conversationId,
          direction: 'OUTBOUND',
          type: 'TEXT',
          waMessageId: whatsappResponse.messages?.[0]?.id,
          body: messageBody,
          status: 'SENT',
        },
      });

      // Update conversation
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { lastOutboundAt: new Date() },
      });

      return NextResponse.json(message);
    } catch (whatsappError) {
      console.error('WhatsApp API error:', whatsappError);
      return NextResponse.json(
        { error: 'Failed to send message via WhatsApp' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
