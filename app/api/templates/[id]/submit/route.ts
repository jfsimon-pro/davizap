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

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const user = getAuthUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const template = await prisma.template.findUnique({
      where: { id },
    });

    if (!template || template.tenantId !== user.tenantId) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Create a submission record
    const submission = await prisma.templateSubmission.create({
      data: {
        tenantId: user.tenantId,
        templateId: id,
        payload: {
          name: template.name,
          language: template.language,
          category: template.category,
          headerJson: template.headerJson,
          bodyText: template.bodyText,
          footerText: template.footerText,
          buttonsJson: template.buttonsJson,
        },
        status: 'SUBMITTED',
      },
    });

    // Update template status
    await prisma.template.update({
      where: { id },
      data: {
        status: 'SUBMITTED',
        lastSubmittedAt: new Date(),
      },
    });

    return NextResponse.json(submission);
  } catch (error) {
    console.error('Error submitting template:', error);
    return NextResponse.json({ error: 'Failed to submit template' }, { status: 500 });
  }
}
