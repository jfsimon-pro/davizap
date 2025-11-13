import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

  try {
    const campaigns = await prisma.broadcastCampaign.findMany({
      where: { tenantId: user.tenantId },
      include: {
        template: true,
        items: {
          select: { status: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { name, templateId, phoneNumbers, variables, scheduledAt } = body;

    if (!name || !templateId || !phoneNumbers || phoneNumbers.length === 0) {
      return NextResponse.json(
        { error: 'name, templateId, and phoneNumbers are required' },
        { status: 400 }
      );
    }

    const template = await prisma.template.findUnique({
      where: { id: templateId },
    });

    if (!template || template.tenantId !== user.tenantId) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Create campaign
    const campaign = await prisma.broadcastCampaign.create({
      data: {
        tenantId: user.tenantId,
        name,
        templateId,
        totalPlanned: phoneNumbers.length,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      },
    });

    // Create broadcast items
    const items = await Promise.all(
      phoneNumbers.map((phoneE164: string, index: number) =>
        prisma.broadcastItem.create({
          data: {
            tenantId: user.tenantId,
            campaignId: campaign.id,
            phoneE164,
            variables: variables?.[index] || {},
            status: 'QUEUED',
          },
        })
      )
    );

    return NextResponse.json({ ...campaign, items });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 });
  }
}
