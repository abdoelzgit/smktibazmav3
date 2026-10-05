'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  X,
  RotateCcw,
  Sparkles,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import { Blobatar } from '@blobatar/react';
import { useGaze } from '@blobatar/react/gaze';
import { happy, unsure, thinking, idle, sleepy } from 'blobatar/expression';
import 'blobatar/motion.css';
import 'blobatar/gaze.css';
import { sendChatMessage, checkApiHealth, type ChatMessageItem } from '@/app/actions/chatbot';

/**
 * Helper untuk menentukan ekspresi Blobatar berdasarkan isi teks respon Ujang.
 */
function getExpressionForText(content: string, defaultIdle = happy) {
  if (!content) return defaultIdle;
  const lower = content.toLowerCase();

  const unsureKeywords = [
    'maaf',
    'belum tersedia',
    'tidak tersedia',
    'belum ada',
    'tidak ditemukan',
    'tidak ada',
    'di luar',
    'kurang yakin',
    'tertidur',
    'tidak dapat terhubung',
  ];

  const isUnsure = unsureKeywords.some((kw) => lower.includes(kw));
  if (isUnsure) return unsure;

  return happy;
}


const SUGGESTED_PROMPTS = [
  'Apa saja jurusan di SMK TI BAZMA?',
  'Bagaimana alur & syarat pendaftaran PPDB?',
  'Apakah sekolah & asrama 100% gratis?',
  'Dimana alamat & lokasi SMK TI BAZMA?',
];

function GazeBlobatar({
  name,
  size = 40,
  animate = 'always',
  className = '',
  expression = idle,
}: {
  name: string;
  size?: number;
  animate?: 'always' | 'hover';
  className?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expression?: any;
}) {
  const { ref } = useGaze({ travel: 3, lookAt: 'pointer' });
  return (
    <div className={`shrink-0 flex items-center justify-center ${className}`}>
      <Blobatar
        ref={ref}
        name={name}
        size={size}
        animate={animate}
        expression={expression}
        traits={{ shape: 0.933 }}
        palette={{ head: '#ffffff', eye: '#ff0000' }}
      />
    </div>
  );
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessageItem[]>([
    {
      role: 'model',
      content:
        'Assalamu\u2019alaikum! Selamat datang di **SMK TI BAZMA**. Saya Ujang, Asisten Virtual SMK TI BAZMA. Ada yang bisa saya bantu terkait informasi profil sekolah, jurusan PPLG & SIJA, atau pendaftaran PPDB?',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  const isUnavailable = isOffline || !!errorMsg;
  const isBusy = isLoading || isStreaming;

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isBusy, isOpen]);

  const checkConnection = useCallback(async () => {
    const result = await checkApiHealth();
    setIsOffline(!result.success);
  }, []);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  useEffect(() => {
    if (isOpen) checkConnection();
  }, [isOpen, checkConnection]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isBusy) return;

    setErrorMsg(null);
    setInputMessage('');

    const historySnapshot = [...messages];
    const newHistory: ChatMessageItem[] = [
      ...historySnapshot,
      { role: 'user', content: text },
    ];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: historySnapshot, message: text }),
      });

      setIsLoading(false);

      if (!response.ok || !response.body) {
        throw new Error(`Server error: ${response.status}`);
      }

      // Tambah bubble kosong yang akan diisi stream
      setMessages((prev) => [...prev, { role: 'model', content: '' }]);
      setIsStreaming(true);
      setIsOffline(false);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        // Append chunk ke pesan terakhir
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          return [
            ...prev.slice(0, -1),
            { ...last, content: last.content + chunk },
          ];
        });
      }
    } catch (err: unknown) {
      setIsLoading(false);
      const msg =
        err instanceof Error ? err.message : 'Gagal terhubung dengan server Ujang AI.';
      setErrorMsg(msg);
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          content:
            '\u26A0\uFE0F Maaf, Ujang tidak dapat terhubung ke server saat ini. Ujang sedang tertidur zzz...',
        },
      ]);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        role: 'model',
        content:
          'Assalamu\u2019alaikum! Percakapan telah direset. Ada informasi SMK TI BAZMA lain yang ingin Anda tanyakan?',
      },
    ]);
    setErrorMsg(null);
    checkConnection();
  };

  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      const formattedLine = line.split(/(\*\*.*?\*\*)/g).map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={pIdx} className="font-semibold text-blue-950 dark:text-blue-200">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        return (
          <li key={idx} className="ml-4 list-disc my-1">
            {line.trim().replace(/^[-*]\s+/, '')}
          </li>
        );
      }

      if (line.trim() === '') return <div key={idx} className="h-2" />;

      return (
        <p key={idx} className="my-1 leading-relaxed">
          {formattedLine}
        </p>
      );
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [activeReaction, setActiveReaction] = useState<any>(null);
  const prevBusyRef = useRef(isBusy);

  // Trigger reaksi respon (happy / unsure) selama 3.5 detik HANYA saat Ujang selesai merespon (isBusy: true -> false)
  useEffect(() => {
    const wasBusy = prevBusyRef.current;
    prevBusyRef.current = isBusy;

    if (wasBusy && !isBusy) {
      const lastMsg = [...messages]
        .reverse()
        .find((m) => m.role === 'model' && m.content.trim().length > 0);

      if (lastMsg) {
        const expr = getExpressionForText(lastMsg.content, happy);
        setActiveReaction(expr);

        const timer = setTimeout(() => {
          setActiveReaction(null);
        }, 3500);

        return () => clearTimeout(timer);
      }
    }
  }, [isBusy, messages]);

  const currentExpression = isUnavailable
    ? sleepy
    : isBusy
    ? thinking
    : activeReaction || idle;

  return (
    <div className="fixed bottom-5 min-h right-5 z-50 flex flex-col items-end pointer-events-auto">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-[90vw] sm:w-[380px] h-[530px] max-h-[80vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden mb-4 backdrop-blur-md"
          >
            {/* Header */}
            <div className="shrink-0 bg-gradient-to-r from-[#132B6D] to-[#1e3a8a] p-4 text-white flex items-center justify-between shadow-md">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center overflow-hidden border border-white/30 shadow-inner">
                  <GazeBlobatar
                    name="Ujang BAZMA AI"
                    size={40}
                    expression={currentExpression}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-sm">
                    <span>Ujang</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  </div>
                  <p className="text-xs text-blue-100/90 font-medium">
                    {isUnavailable
                      ? 'Tertidur (Offline)'
                      : isStreaming
                      ? 'Sedang Mengetik...'
                      : isLoading
                      ? 'Sedang Berpikir...'
                      : 'Agent'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={handleResetChat}
                  title="Reset Percakapan"
                  className="p-2 hover:bg-white/10 rounded-lg transition text-blue-100 hover:text-white cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Tutup Chat"
                  className="p-2 hover:bg-white/10 rounded-lg transition text-blue-100 hover:text-white cursor-pointer"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Area Pesan — min-h-0 fix flexbox overflow */}
            <div className="flex-1 min-h-0 p-4 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-950/50 text-sm">
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex gap-2.5 ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.role === 'model' && (
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-[#132B6D]/10 border border-[#132B6D]/20 shrink-0 mt-0.5">
                      <GazeBlobatar
                        name="Ujang BAZMA AI"
                        size={32}
                        expression={
                          index === messages.length - 1 ? currentExpression : idle
                        }
                      />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] px-4 py-3 rounded-2xl text-xs sm:text-sm shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-[#132B6D] text-white rounded-br-none'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-100 dark:border-slate-700/60'
                    }`}
                  >
                    {msg.content
                      ? renderFormattedContent(msg.content)
                      : index === messages.length - 1 && isStreaming && (
                          // Cursor berkedip saat stream belum ada konten
                          <span className="inline-block w-2 h-3.5 bg-slate-400 animate-pulse rounded-sm" />
                        )}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-700/10 border border-slate-500/20 shrink-0 mt-0.5">
                      <GazeBlobatar name="Pengguna SMK TI BAZMA" size={32} />
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Indikator Loading (sebelum stream mulai) */}
              {isLoading && (
                <div className="flex gap-2.5 justify-start items-center">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-[#132B6D]/10 border border-[#132B6D]/20 shrink-0">
                    <GazeBlobatar name="Ujang BAZMA AI" size={32} expression={thinking} />
                  </div>
                  <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 text-[#132B6D] animate-spin" />
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Ujang sedang berpikir...
                    </span>
                  </div>
                </div>
              )}

              {/* Suggested Prompts */}
              {messages.length === 1 && !isBusy && (
                <div className="pt-2 space-y-2">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Pertanyaan Populer:
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {SUGGESTED_PROMPTS.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(prompt)}
                        className="text-left text-xs bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-[#132B6D] dark:text-blue-300 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 transition shadow-xs hover:border-[#132B6D]/40 cursor-pointer"
                      >
                        💡 {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="shrink-0 p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center space-x-2"
            >
              <input
                type="text"
                placeholder="Tanyakan sesuatu tentang SMK TI BAZMA..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isBusy}
                className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-transparent focus:border-[#132B6D] focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden transition disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isBusy || !inputMessage.trim()}
                className="w-10 h-10 bg-[#132B6D] hover:bg-[#1a3889] disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition shadow-sm shrink-0 cursor-pointer disabled:cursor-not-allowed"
              >
                {isStreaming ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center justify-center w-14 h-14 bg-gradient-to-r from-[#132B6D] to-[#1e3a8a] text-white rounded-full shadow-2xl hover:shadow-blue-900/30 transition-all duration-300 border-2 border-white/20 overflow-hidden cursor-pointer"
        aria-label="Tanya Ujang AI"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="blobatar"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <GazeBlobatar
                name="Ujang BAZMA AI"
                size={44}
                expression={currentExpression}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {!isOpen && (
          <span className="absolute right-16 bg-slate-900 text-white text-xs font-medium px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition duration-200 pointer-events-none whitespace-nowrap shadow-md border border-slate-700">
            Tanya Ujang ✨
          </span>
        )}
      </motion.button>
    </div>
  );
}