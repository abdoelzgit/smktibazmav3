import { getSystemInstruction } from './chatbot-knowledge';
import { ai } from './gemini';

export type ChatMessage = {
  role: 'user' | 'model';
  content: string;
};

export function getGroqApiKey(customKey?: string): string {
  const raw = customKey || process.env.GROQ_API_KEY || '';
  return raw.replace(/^["']+|["']+$|\s+/g, '').trim();
}

/**
 * Fungsi eksplisit untuk menguji koneksi ke Groq API.
 * Menguji apakah GROQ_API_KEY valid dan mengembalikan respon serta latensi.
 */
export async function testGroqConnection(customApiKey?: string): Promise<{
  success: boolean;
  message: string;
  reply?: string;
  latencyMs?: number;
}> {
  const apiKey = getGroqApiKey(customApiKey);

  if (!apiKey) {
    return {
      success: false,
      message: 'GROQ_API_KEY belum diisi di file .env atau parameter.',
    };
  }

  const startTime = Date.now();
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen/qwen3.8-27b',
        messages: [
          { role: 'system', content: 'Kamu adalah Ujang, Asisten AI SMK TI BAZMA.' },
          { role: 'user', content: 'Halo Ujang, tes koneksi Groq API!' },
        ],
        max_tokens: 80,
        temperature: 0.3,
      }),
    });

    const latencyMs = Date.now() - startTime;

    if (!res.ok) {
      const errText = await res.text();
      return {
        success: false,
        message: `Groq API Error Status (${res.status}): ${errText}`,
        latencyMs,
      };
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || '';

    return {
      success: true,
      message: `Koneksi Groq API (Qwen 3.8 27B) Berhasil! Latensi: ${latencyMs}ms.`,
      reply,
      latencyMs,
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: `Gagal terhubung ke endpoint Groq API: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/**
 * Health check untuk API AI.
 * Memeriksa Groq API jika GROQ_API_KEY terpasang, jika tidak fallback ke Gemini.
 */
export async function checkAiHealth(): Promise<{ ok: boolean; provider: string; error?: string }> {
  if (getGroqApiKey()) {
    const groqTest = await testGroqConnection();
    if (groqTest.success) {
      return { ok: true, provider: 'Groq (Qwen 3.8 27B)' };
    }
    console.warn('Groq API Key terpasang tapi tes gagal, fallback ke Gemini:', groqTest.message);
  }

  if (process.env.GEMINI_API_KEY?.trim()) {
    try {
      await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [{ role: 'user', parts: [{ text: 'ping' }] }],
        config: {
          maxOutputTokens: 1,
          temperature: 0,
        },
      });
      return { ok: true, provider: 'Gemini 2.0 Flash' };
    } catch (err: unknown) {
      return {
        ok: false,
        provider: 'Gemini',
        error: err instanceof Error ? err.message : 'Koneksi Gemini gagal.',
      };
    }
  }

  return { ok: false, provider: 'None', error: 'Tidak ada API Key (GROQ_API_KEY / GEMINI_API_KEY) yang valid.' };
}

/**
 * Mengirim percakapan ke Groq API (jika GROQ_API_KEY terpasang)
 * atau fallback ke Gemini API dengan model gemini-2.5-flash.
 */
export async function generateChatReply(
  history: ChatMessage[],
  userMessage: string
): Promise<string> {
  const systemInstruction = getSystemInstruction();

  const groqApiKey = getGroqApiKey();

  // 1. Coba Groq API terlebih dahulu jika GROQ_API_KEY tersedia
  if (groqApiKey) {
    try {
      const messages = [
        { role: 'system', content: systemInstruction },
        ...history.map((msg) => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
        })),
        { role: 'user', content: userMessage },
      ];

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'qwen/qwen3.8-27b',
          messages,
          temperature: 0.4,
          max_tokens: 1024,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content;
        if (text) return text;
      } else {
        const errorText = await res.text();
        console.warn('Groq API mengembalikan error, mencoba fallback ke Gemini:', errorText);
      }
    } catch (err) {
      console.warn('Gagal memanggil Groq API, mencoba fallback ke Gemini:', err);
    }
  }

  // 2. Fallback ke Gemini API dengan model gemini-2.5-flash
  const contents = [
    ...history.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    })),
    { role: 'user', parts: [{ text: userMessage }] },
  ];

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents,
    config: {
      systemInstruction,
      temperature: 0.4,
    },
  });

  return (
    response.text ||
    'Maaf ya, Ujang belum bisa memproses jawaban saat ini. Silakan coba beberapa saat lagi.'
  );
}

/**
 * Membuka stream percakapan (ReadableStream) untuk efek penulisan real-time.
 */
export async function streamChatReply(
  history: ChatMessage[],
  userMessage: string
): Promise<ReadableStream<Uint8Array>> {
  const systemInstruction = getSystemInstruction();
  const encoder = new TextEncoder();

  const groqApiKey = getGroqApiKey();

  // 1. Groq Streaming
  if (groqApiKey) {
    try {
      const messages = [
        { role: 'system', content: systemInstruction },
        ...history.map((msg) => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
        })),
        { role: 'user', content: userMessage },
      ];

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'qwen/qwen3.8-27b',
          messages,
          temperature: 0.4,
          max_tokens: 1024,
          stream: true,
        }),
      });

      if (res.ok && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        return new ReadableStream({
          async start(controller) {
            let buffer = '';
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });

                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                  const trimmed = line.trim();
                  if (trimmed.startsWith('data: ')) {
                    const dataStr = trimmed.slice(6);
                    if (dataStr === '[DONE]') continue;
                    try {
                      const parsed = JSON.parse(dataStr);
                      const delta = parsed.choices?.[0]?.delta?.content;
                      if (delta) {
                        controller.enqueue(encoder.encode(delta));
                      }
                    } catch {
                      // abaikan chunk parsial
                    }
                  }
                }
              }
            } catch (err) {
              console.error('Groq stream reading error:', err);
            } finally {
              controller.close();
            }
          },
        });
      }
    } catch (err) {
      console.warn('Groq streaming gagal, mencoba fallback ke Gemini:', err);
    }
  }

  // 2. Gemini Streaming Fallback (model gemini-2.5-flash)
  const contents = [
    ...history.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    })),
    { role: 'user', parts: [{ text: userMessage }] },
  ];

  const streamResult = await ai.models.generateContentStream({
    model: 'gemini-3.8-flash',
    contents,
    config: {
      systemInstruction,
      temperature: 0.4,
    },
  });

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamResult) {
          const text = chunk.text;
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }
      } catch (err) {
        console.error('Gemini stream error:', err);
      } finally {
        controller.close();
      }
    },
  });
}
