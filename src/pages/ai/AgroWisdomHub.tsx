import React, { useState, useRef, useEffect } from 'react';
import { Send, Sprout, BookOpen, Sparkles, User, ArrowLeft, RefreshCw } from 'lucide-react';
import Markdown from 'react-markdown';
import { Link } from 'react-router-dom';
import { getAgroWisdom } from '../../services/aiService';
import { useAuth } from '../../context/AuthContext';

/* ── types (unchanged) ── */
interface WisdomMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
}

/* ═════════════════════════════════════════════
   AGRO WISDOM HUB
   ═════════════════════════════════════════════ */
const AgroWisdomHub: React.FC = () => {
  const { user }                        = useAuth();
  const [messages, setMessages]         = useState<WisdomMessage[]>([]);
  const [input, setInput]               = useState('');
  const [loading, setLoading]           = useState(false);
  const bottomRef                       = useRef<HTMLDivElement>(null);
  const inputRef                        = useRef<HTMLInputElement>(null);

  /* ── 1. personalised greeting (logic unchanged) ── */
  useEffect(() => {
    const userName = user?.fullName ? user.fullName.split(' ')[0] : 'Friend';
    setMessages([{
      role: 'assistant',
      content:
        `**Ayubowan, ${userName}!** 🌿 \n\n` +
        `I am your AgroLK Expert Advisor. I have read thousands of agricultural documents to help you.\n\n` +
        `*Ask me about:*\n` +
        `- Cinnamon cultivation standards\n` +
        `- Pest control for Paddy\n` +
        `- Best harvesting times`
    }]);
  }, [user]);

  /* ── 2. auto-scroll to bottom (logic unchanged) ── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  /* ── 3. auto-focus on mount (logic unchanged) ── */
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  /* ── handleAsk (logic unchanged) ── */
  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userQuery = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userQuery }]);
    setLoading(true);

    try {
      const res = await getAgroWisdom(userQuery);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: res.response,
        sources: res.sources
      }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "⚠️ **Connection Error**: I couldn't access the wisdom database. Please check your internet or try again."
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  /* ── handleClear (logic unchanged) ── */
  const handleClear = () => {
    const userName = user?.fullName ? user.fullName.split(' ')[0] : 'Friend';
    setMessages([{
      role: 'assistant',
      content: `**Chat Cleared.** \n\nReady for a new topic, ${userName}? Ask me anything about Sri Lankan agriculture.`
    }]);
  };

  /* ── render ── */
  return (
    <div className="min-h-screen bg-bg-white flex flex-col font-sans">

      {/* ╔══════════════════════════════════════════
          ║  STICKY HEADER  — frosted glass, same
          ║  treatment as main Header on scroll &
          ║  TripResult's top bar
          ╚══════════════════════════════════════════ */}
      <header className="sticky top-0 z-30
                         bg-white/90 backdrop-blur-xl
                         border-b border-slate-200/60 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">

          {/* left: back arrow + brand cluster */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="w-8 h-8 rounded-lg flex items-center justify-center
                         text-slate-400 hover:text-primary hover:bg-primary/8
                         transition-all duration-200"
            >
              <ArrowLeft size={18} />
            </Link>

            <div className="flex items-center gap-2.5">
              {/* icon badge — rounded-lg square, same pattern as Register, TripResult */}
              <div className="w-8 h-8 bg-primary/8 border border-primary/15 rounded-lg
                              flex items-center justify-center">
                <Sprout size={17} className="text-primary" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-sm font-serif font-bold text-slate-800 tracking-[-0.01em]">
                  Agro Wisdom Hub
                </span>
                <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider hidden sm:block">
                  Verified Agricultural Research
                </span>
              </div>
            </div>
          </div>

          {/* right: refresh + live indicator */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleClear}
              title="Start New Chat"
              className="w-8 h-8 rounded-lg flex items-center justify-center
                         text-slate-400 hover:text-primary hover:bg-primary/8
                         transition-all duration-200"
            >
              <RefreshCw size={16} />
            </button>

            {/* live pill — uses subtle-accent (sage) to stay on-brand */}
            <div className="hidden sm:flex items-center gap-1.5
                            bg-subtle-accent/10 border border-subtle-accent/20
                            px-2.5 py-1 rounded-full">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inset-0 rounded-full bg-subtle-accent opacity-60" />
                <span className="relative rounded-full h-1.5 w-1.5 bg-subtle-accent" />
              </span>
              <span className="text-[9px] font-bold text-subtle-accent uppercase tracking-wider">
                Live
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ╔══════════════════════════════════════════
          ║  CHAT MESSAGE LIST
          ╚══════════════════════════════════════════ */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-5 sm:px-6 overflow-y-auto">
        <div className="flex flex-col gap-5 pb-2">

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-2.5 sm:gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* avatar — rounded-xl square badge */}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border
                              ${msg.role === 'assistant'
                                ? 'bg-primary border-primary/30 shadow-sm shadow-primary/20'
                                : 'bg-white border-slate-200'
                              }`}>
                {msg.role === 'assistant'
                  ? <Sparkles size={15} className="text-white" />
                  : <User size={16} className="text-slate-500" />
                }
              </div>

              {/* bubble */}
              <div className={`max-w-[82%] sm:max-w-[78%] px-4 py-3 shadow-sm
                              ${msg.role === 'user'
                                ? 'bg-primary text-white rounded-2xl rounded-tr-none shadow-md shadow-primary/25'
                                : 'bg-white border border-slate-100 border-l-2 border-l-primary/15 text-slate-800 rounded-2xl rounded-tl-none'
                              }`}>

                {/* markdown content */}
                <div className="text-sm leading-relaxed">
                  <Markdown
                    components={{
                      p: ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,
                      ul: ({ children }) => (
                        <ul className={`list-disc ml-4 mb-1.5 space-y-0.5
                                        ${msg.role === 'user' ? 'marker:text-white/60' : 'marker:text-primary/40'}`}>
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => <ol className="list-decimal ml-4 mb-1.5 space-y-0.5">{children}</ol>,
                      li: ({ children }) => <li>{children}</li>,
                      strong: ({ children }) => (
                        <strong className={`font-bold ${msg.role === 'user' ? 'text-white' : 'text-slate-800'}`}>
                          {children}
                        </strong>
                      ),
                      em: ({ children }) => (
                        <em className={`italic ${msg.role === 'user' ? 'text-white/80' : 'text-slate-500'}`}>
                          {children}
                        </em>
                      ),
                      h1: ({ children }) => <h1 className="text-base font-serif font-bold mb-1.5">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-sm font-serif font-bold mb-1">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-xs font-bold mb-0.5">{children}</h3>,
                      a: ({ children, href }) => (
                        <a
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          className={`underline transition-colors
                                      ${msg.role === 'user'
                                        ? 'text-white/80 hover:text-white'
                                        : 'text-primary hover:text-secondary'
                                      }`}
                        >
                          {children}
                        </a>
                      )
                    }}
                  >
                    {msg.content}
                  </Markdown>
                </div>

                {/* RAG source pills */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className={`mt-3 pt-2.5 border-t ${msg.role === 'user' ? 'border-white/20' : 'border-slate-100'}`}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <BookOpen size={10} className={msg.role === 'user' ? 'text-white/50' : 'text-slate-400'} />
                      <span className={`text-[9px] font-bold uppercase tracking-widest
                                       ${msg.role === 'user' ? 'text-white/50' : 'text-slate-400'}`}>
                        References
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.sources.map((src, i) => (
                        <span
                          key={i}
                          className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border
                                      ${msg.role === 'user'
                                        ? 'bg-white/10 border-white/20 text-white/70'
                                        : 'bg-subtle-accent/10 border-subtle-accent/20 text-primary'
                                      }`}
                        >
                          {src}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* ── typing indicator ── */}
          {loading && (
            <div className="flex gap-2.5 sm:gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary border border-primary/30
                              shadow-sm shadow-primary/20
                              flex items-center justify-center shrink-0">
                <Sparkles size={15} className="text-white" />
              </div>

              <div className="bg-white border border-slate-100 border-l-2 border-l-primary/15
                              rounded-2xl rounded-tl-none shadow-sm
                              px-4 py-3 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="w-1.5 h-1.5 bg-subtle-accent rounded-full animate-bounce"
                        style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-subtle-accent rounded-full animate-bounce"
                        style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-subtle-accent rounded-full animate-bounce"
                        style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  Consulting knowledge base…
                </span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* ╔══════════════════════════════════════════
          ║  INPUT FOOTER  — frosted strip matching
          ║  the header treatment
          ╚══════════════════════════════════════════ */}
      <footer className="shrink-0
                         bg-white/90 backdrop-blur-xl
                         border-t border-slate-200/60
                         shadow-[0_-2px_12px_rgba(0,0,0,0.04)]
                         px-4 py-3.5 pb-5">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleAsk} className="relative flex items-center">

            {/* pill input — same focus system as every other input */}
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about crops, seasons, diseases, or farming techniques…"
              className="w-full pl-5 pr-14 py-3 rounded-full
                         bg-slate-50 border border-slate-200
                         text-sm text-slate-700 placeholder-slate-300 font-medium
                         focus:outline-none focus:bg-white
                         focus:ring-2 focus:ring-primary/20 focus:border-primary
                         transition-all duration-300 shadow-sm"
            />

            {/* send button — primary circle with glow shadow */}
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-1.5 top-1/2 -translate-y-1/2
                         w-9 h-9 rounded-full
                         bg-primary text-white
                         flex items-center justify-center
                         shadow-md shadow-primary/30
                         hover:shadow-lg hover:shadow-primary/40
                         disabled:opacity-45 disabled:cursor-not-allowed
                         disabled:hover:shadow-md
                         transition-all duration-300"
            >
              <Send size={16} className={`ml-0.5 ${loading ? 'opacity-0' : ''}`} />
            </button>
          </form>

          <p className="text-center text-[9px] text-slate-400 mt-2.5 font-medium">
            AgroLK AI provides advice based on Sri Lankan agricultural standards.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AgroWisdomHub;