import { NextResponse } from 'next/server';
import { createDefaultAdmin } from '@/lib/auth';

export async function POST() {
  try {
    await createDefaultAdmin();
    return NextResponse.json({ message: 'Admin criado com sucesso' });
  } catch (error) {
    console.error('Init error:', error);
    return NextResponse.json(
      { error: 'Erro ao inicializar' },
      { status: 500 }
    );
  }
}
