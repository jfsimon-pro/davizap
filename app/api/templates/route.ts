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
    const templates = await prisma.template.findMany({
      where: { tenantId: user.tenantId },
      include: {
        submissions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { name, language, category, headerJson, bodyText, footerText, buttonsJson } = body;

    if (!name || !language || !category || !bodyText) {
      return NextResponse.json(
        { error: 'name, language, category, and bodyText are required' },
        { status: 400 }
      );
    }

    const template = await prisma.template.create({
      data: {
        tenantId: user.tenantId,
        name,
        language,
        category,
        headerJson: headerJson || null,
        bodyText,
        footerText: footerText || null,
        buttonsJson: buttonsJson || null,
        status: 'DRAFT',
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
}
