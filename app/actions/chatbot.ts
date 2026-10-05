'use server';

import { checkAiHealth as checkHealth, generateChatReply } from '@/lib/ai-provider';

export type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type ChatMessageItem = {
  role: 'user' | 'model';
  content: string;
};

/**
 * Health check ringan ke AI Provider (Groq / Gemini).
 */
export async function checkApiHealth(): Promise<ActionResult<{ ok: boolean }>> {
  const result = await checkHealth();
  if (result.ok) {
    return { success: true, data: { ok: true } };
  }
  return { success: false, error: result.error || 'Koneksi API gagal.' };
}

/**
 * Server Action untuk memproses pesan percakapan pengguna.
 */
export async function sendChatMessage(
  history: ChatMessageItem[],
  newMessage: string
): Promise<ActionResult<{ reply: string }>> {
  try {
    if (!process.env.GROQ_API_KEY && !process.env.GEMINI_API_KEY) {
      return {
        success: false,
        error: 'GROQ_API_KEY atau GEMINI_API_KEY belum dikonfigurasi di file .env server.',
      };
    }

    const trimmedMsg = newMessage.trim();
    if (!trimmedMsg) {
      return {
        success: false,
        error: 'Pesan tidak boleh kosong.',
      };
    }

    const replyText = await generateChatReply(history, trimmedMsg);

    return {
      success: true,
      data: { reply: replyText },
    };
  } catch (err: unknown) {
    console.error('Error Server Action Chatbot:', err);
    const errorMessage =
      err instanceof Error ? err.message : 'Terjadi kesalahan internal pada server.';

    return {
      success: false,
      error: `Gagal memproses percakapan: ${errorMessage}`,
    };
  }
}

/**
 * Server Action khusus untuk menguji koneksi Groq API.
 */
export async function testGroqAction(customApiKey?: string) {
  const { testGroqConnection } = await import('@/lib/ai-provider');
  return testGroqConnection(customApiKey);
}