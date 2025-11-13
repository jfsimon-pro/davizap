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
    const config = await prisma.whatsAppIntegration.findFirst({
      where: { tenantId: user.tenantId },
    });

    return NextResponse.json(config || {});
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { wabaId, phoneNumberId, displayPhone, verifyToken, accessToken } = body;

    // Check if config exists
    const existing = await prisma.whatsAppIntegration.findFirst({
      where: { tenantId: user.tenantId },
    });

    if (existing) {
      const updated = await prisma.whatsAppIntegration.update({
        where: { id: existing.id },
        data: {
          wabaId,
          phoneNumberId,
          displayPhone,
          verifyToken,
          accessToken,
        },
      });
      return NextResponse.json(updated);
    } else {
      const created = await prisma.whatsAppIntegration.create({
        data: {
          tenantId: user.tenantId,
          wabaId,
          phoneNumberId,
          displayPhone,
          verifyToken,
          accessToken,
        },
      });
      return NextResponse.json(created);
    }
  } catch (error) {
    console.error('Error saving WhatsApp config:', error);
    return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
  }
}
