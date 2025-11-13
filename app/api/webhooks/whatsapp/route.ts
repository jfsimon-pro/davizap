import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  // Get the integration to verify the token
  const integration = await prisma.whatsAppIntegration.findFirst();

  if (mode === 'subscribe' && token === integration?.verifyToken) {
    console.log('Webhook verified');
    return new NextResponse(challenge, { status: 200 });
  } else {
    return new NextResponse('Forbidden', { status: 403 });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  console.log('Webhook received:', body);

  // Handle incoming messages
  if (body.entry?.[0]?.changes?.[0]?.value?.messages) {
    const messages = body.entry[0].changes[0].value.messages;
    const contacts = body.entry[0].changes[0].value.contacts;
    const metadata = body.entry[0].changes[0].value.metadata;

    for (const message of messages) {
      const waId = message.from;
      const phoneE164 = `+${waId}`;
      const messageText = message.text?.body || '';

      // Get tenant from metadata (phone_number_id)
      const phoneNumberId = metadata.phone_number_id;
      const integration = await prisma.whatsAppIntegration.findFirst({
        where: { phoneNumberId },
      });

      if (!integration) continue;

      const tenantId = integration.tenantId;

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
            name: contacts?.[0]?.profile?.name || waId,
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
      await prisma.message.create({
        data: {
          tenantId,
          conversationId: conversation.id,
          direction: 'INBOUND',
          type: 'TEXT',
          waMessageId: message.id,
          body: messageText,
        },
      });

      // Update conversation timestamp
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { lastInboundAt: new Date() },
      });
    }
  }

  // Handle message status updates
  if (body.entry?.[0]?.changes?.[0]?.value?.statuses) {
    const statuses = body.entry[0].changes[0].value.statuses;

    for (const status of statuses) {
      const statusValue = status.status; // 'sent', 'delivered', 'read', 'failed'
      const waMessageId = status.id;

      await prisma.message.updateMany({
        where: { waMessageId },
        data: {
          status: statusValue.toUpperCase(),
        },
      });
    }
  }

  return NextResponse.json({ success: true });
}
