import { NextRequest, NextResponse } from 'next/server';
import { streamChatReply } from '@/lib/ai-provider';

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GROQ_API_KEY && !process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GROQ_API_KEY atau GEMINI_API_KEY belum dikonfigurasi.' },
        { status: 500 }
      );
    }

    const { history, message } = await req.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Pesan tidak boleh kosong.' }, { status: 400 });
    }

    const readable = await streamChatReply(history || [], message.trim());

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (err: unknown) {
    console.error('Error API chatbot:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Terjadi kesalahan internal.' },
      { status: 500 }
    );
  }
}