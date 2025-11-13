import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendTemplate } from '@/lib/whatsapp';

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

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const user = getAuthUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const campaign = await prisma.broadcastCampaign.findUnique({
      where: { id },
      include: {
        template: true,
        items: true,
      },
    });

    if (!campaign || campaign.tenantId !== user.tenantId) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const whatsappConfig = await prisma.whatsAppIntegration.findFirst({
      where: { tenantId: user.tenantId },
    });

    if (!whatsappConfig) {
      return NextResponse.json(
        { error: 'WhatsApp not configured' },
        { status: 400 }
      );
    }

    // Update campaign status
    await prisma.broadcastCampaign.update({
      where: { id },
      data: { startedAt: new Date() },
    });

    // Send messages in background
    let successCount = 0;
    let failureCount = 0;

    for (const item of campaign.items) {
      try {
        const result = await sendTemplate(
          {
            accessToken: whatsappConfig.accessToken,
            phoneNumberId: whatsappConfig.phoneNumberId,
            wabaId: whatsappConfig.wabaId,
          },
          item.phoneE164,
          campaign.template.name,
          campaign.template.language,
          item.variables ? Object.values(item.variables as Record<string, string>) : []
        );

        await prisma.broadcastItem.update({
          where: { id: item.id },
          data: {
            status: 'SENT',
            waMessageId: result.messages?.[0]?.id,
            sentAt: new Date(),
          },
        });

        successCount++;
      } catch (error) {
        failureCount++;
        await prisma.broadcastItem.update({
          where: { id: item.id },
          data: {
            status: 'FAILED',
            error: String(error),
          },
        });
      }

      // Add delay to respect rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Update campaign with completion status
    await prisma.broadcastCampaign.update({
      where: { id },
      data: {
        finishedAt: new Date(),
      },
    });

    return NextResponse.json({
      campaignId: id,
      successCount,
      failureCount,
    });
  } catch (error) {
    console.error('Error starting campaign:', error);
    return NextResponse.json({ error: 'Failed to start campaign' }, { status: 500 });
  }
}
