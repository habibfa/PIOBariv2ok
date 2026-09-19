import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Loader2, Minus, Bot, Pill, ShieldCheck, Activity } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function FloatingAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      role: 'assistant', 
      content: 'Halo! Saya **Asisten AI Klinis PIOBARI**. Ada yang bisa saya bantu terkait perhitungan dosis obat, kompatibilitas IV, keamanan kehamilan, atau interaksi obat?' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    "Dosis Paracetamol sirup anak BB 12 kg",
    "Interaksi Warfarin + Ciprofloxacin",
    "Kompatibilitas Ceftriaxone & Ringer Laktat",
    "Kategori FDA Metformin untuk ibu hamil"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  const handleSend = async (messageText?: string) => {
    const textToSend = (messageText || input).trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    if (!messageText) setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage.content,
          history: messages.slice(-5)
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        if (response.status === 404) {
          throw new Error("Endpoint /api/chat-ai belum aktif. Pastikan server dev berjalan.");
        }
        throw new Error(errData.error || `Koneksi gagal (Status ${response.status})`);
      }

      const data = await response.json();
      
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: data.reply 
      }]);
    } catch (error: any) {
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: 'Maaf, terjadi kendala teknis: ' + (error?.message || 'Gagal menghubungi asisten AI.') 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        id="btn-open-ai-assistant"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 lg:bottom-7 right-5 lg:right-7 w-14 h-14 bg-gradient-to-tr from-emerald-600 via-teal-600 to-teal-400 text-white rounded-full shadow-[0_12px_28px_rgba(13,148,136,0.38)] hover:shadow-[0_16px_36px_rgba(13,148,136,0.5)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center z-40 border-2 border-white/80 group"
        title="Tanya Asisten AI Klinis"
      >
        <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-amber-300 fill-amber-300 animate-bounce" />
        <Bot className="w-7 h-7 transition-transform group-hover:rotate-12" />
      </button>
    );
  }

  return (
    <div 
      id="modal-ai-floating-assistant"
      className={`fixed right-4 sm:right-7 bottom-20 lg:bottom-7 w-[calc(100vw-32px)] sm:w-[410px] glass-card rounded-3xl shadow-[0_20px_60px_-15px_rgba(15,23,42,0.2)] flex flex-col z-50 transition-all duration-300 overflow-hidden ${
        isMinimized ? 'h-16' : 'h-[540px] max-h-[82vh]'
      }`}
    >
      {/* 3D Glass Header */}
      <div 
        className="bg-gradient-to-r from-teal-700 via-emerald-600 to-teal-600 text-white px-5 py-4 flex items-center justify-between cursor-pointer select-none border-b border-white/10"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner border border-white/25">
            <Bot className="w-5 h-5 text-emerald-100" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-white">Asisten AI Klinis</span>
              <span className="text-[10px] bg-emerald-400/20 text-emerald-200 border border-emerald-300/30 px-2 py-0.5 rounded-full font-semibold">
                PIOBARI AI
              </span>
            </div>
            <span className="text-[10px] text-teal-100/90 font-medium">Online • Terintegrasi Panduan Farmasi</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
            className="p-1.5 hover:bg-white/15 rounded-xl transition-colors text-white/90"
            title={isMinimized ? "Perbesar" : "Minimalkan"}
          >
            <Minus className="w-4 h-4" />
          </button>
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); setIsOpen(false); setIsMinimized(false); }}
            className="p-1.5 hover:bg-white/15 rounded-xl transition-colors text-white/90"
            title="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat Messages Body */}
      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gradient-to-b from-slate-50/60 to-teal-50/20 custom-scrollbar">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[86%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed shadow-xs transition-all ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-tr from-emerald-600 to-teal-600 text-white rounded-br-xs shadow-teal-700/20' 
                    : 'bg-white/90 backdrop-blur-md border border-slate-200/80 text-slate-700 rounded-bl-xs shadow-[0_2px_12px_rgba(0,0,0,0.03)] prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0'
                }`}>
                  {msg.role === 'user' ? (
                    <span className="font-medium">{msg.content}</span>
                  ) : (
                    <div className="markdown-body text-slate-700">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/90 backdrop-blur-md border border-teal-100 text-teal-800 rounded-2xl rounded-bl-xs px-4 py-3 text-xs flex items-center gap-2.5 shadow-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-teal-600 shrink-0" />
                  <span className="font-medium animate-pulse">Menelaah literatur farmakologi...</span>
                </div>
              </div>
            )}

            {/* Quick Suggestions when conversation is short */}
            {messages.length <= 2 && !isLoading && (
              <div className="pt-2">
                <p className="text-[11px] font-semibold text-slate-400 mb-2 px-1">Pertanyaan Cepat:</p>
                <div className="flex flex-wrap gap-1.5">
                  {quickPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSend(prompt)}
                      className="text-left text-[11px] font-medium px-3 py-1.5 rounded-full bg-white hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200/80 hover:border-emerald-200 transition-all shadow-2xs"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 3D Glass Input Pill */}
          <div className="p-3 bg-white/95 backdrop-blur-xl border-t border-slate-200/60">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tanyakan obat, dosis, atau interaksi..."
                className="w-full bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-slate-200/80 focus:border-teal-400 text-xs rounded-2xl pl-4 pr-12 py-3 outline-hidden transition-all text-slate-800 placeholder-slate-400 shadow-inner"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 p-2 bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 disabled:from-slate-300 disabled:to-slate-300 text-white rounded-xl transition-all shadow-sm active:scale-95 disabled:scale-100"
                title="Kirim Pesan"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

