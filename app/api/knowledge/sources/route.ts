import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { chunkText, generateEmbedding } from '@/lib/rag';

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
    const sources = await prisma.knowledgeSource.findMany({
      where: { tenantId: user.tenantId },
      include: {
        chunks: {
          select: { id: true, ordinal: true, text: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(sources);
  } catch (error) {
    console.error('Error fetching knowledge sources:', error);
    return NextResponse.json({ error: 'Failed to fetch sources' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { title, type, content } = body;

    if (!title || !type || !content) {
      return NextResponse.json(
        { error: 'title, type, and content are required' },
        { status: 400 }
      );
    }

    // Create knowledge source
    const source = await prisma.knowledgeSource.create({
      data: {
        tenantId: user.tenantId,
        title,
        type,
        version: '1.0.0',
      },
    });

    // Chunk the content
    const chunks = chunkText(content);

    // Generate embeddings for each chunk
    const createdChunks = [];
    for (let i = 0; i < chunks.length; i++) {
      const embedding = await generateEmbedding(chunks[i]);
      const chunk = await prisma.knowledgeChunk.create({
        data: {
          tenantId: user.tenantId,
          sourceId: source.id,
          ordinal: i,
          text: chunks[i],
          embedding: JSON.stringify(embedding),
        },
      });
      createdChunks.push(chunk);

      // Add delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return NextResponse.json({
      ...source,
      chunks: createdChunks,
    });
  } catch (error) {
    console.error('Error creating knowledge source:', error);
    return NextResponse.json({ error: 'Failed to create source' }, { status: 500 });
  }
}
