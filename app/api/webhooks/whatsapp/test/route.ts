import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Test endpoint to simulate incoming WhatsApp messages
 * Usage: POST /api/webhooks/whatsapp/test
 * Body: {
 *   "phoneNumber": "5511999999999",
 *   "message": "Test message",
 *   "contactName": "Test User"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, message, contactName = 'Test User' } = body;

    if (!phoneNumber || !message) {
      return NextResponse.json(
        { error: 'phoneNumber and message are required' },
        { status: 400 }
      );
    }

    // Get the integration
    const integration = await prisma.whatsAppIntegration.findFirst();

    if (!integration) {
      return NextResponse.json(
        { error: 'WhatsApp integration not configured' },
        { status: 400 }
      );
    }

    const tenantId = integration.tenantId;
    const waId = phoneNumber.replace(/\D/g, '');
    const phoneE164 = `+${waId}`;

    // Create or update contact
    let contact = await prisma.contact.findUnique({
      where: { tenantId_phoneE164: { tenantId, phoneE164 } },
    });

    if (!contact) {
      contact = await prisma.contact.create({
        data: {
          tenantId,
          waId,
          phoneE164,
          name: contactName,
        },
      });
    }

    // Get or create conversation
    let conversation = await prisma.conversation.findFirst({
      where: { contactId: contact.id },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          tenantId,
          contactId: contact.id,
        },
      });
    }

    // Create message
    const createdMessage = await prisma.message.create({
      data: {
        tenantId,
        conversationId: conversation.id,
        direction: 'INBOUND',
        type: 'TEXT',
        waMessageId: `test_${Date.now()}`,
        body: message,
      },
    });

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { lastInboundAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: 'Test message created successfully',
      data: {
        messageId: createdMessage.id,
        conversationId: conversation.id,
        contactId: contact.id,
        contactName: contact.name,
        phoneNumber: phoneE164,
        body: message,
      },
    });
  } catch (error) {
    console.error('Error in test webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process test message', details: String(error) },
      { status: 500 }
    );
  }
}
