import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../context/ChatContext';
import { MessageCircle, Send, Loader2, Sprout, Sparkles, X, LifeBuoy } from 'lucide-react';
import Markdown from 'react-markdown';
import { useLocation } from 'react-router-dom';

/* ════════════════════════════════════════════════
   INJECTED KEYFRAMES
   ════════════════════════════════════════════════ */
const CHAT_ANIM_CSS = `
  @keyframes chatSlideUp {
    0%   { opacity:0; transform: translateY(24px) scale(0.96); }
    100% { opacity:1; transform: translateY(0)    scale(1);    }
  }
  .chat-slide-up {
    animation: chatSlideUp 0.32s cubic-bezier(0.22,1,0.36,1) forwards;
  }
  @keyframes chatBubbleIn {
    0%   { opacity:0; transform: translateY(6px); }
    100% { opacity:1; transform: translateY(0); }
  }
  .bubble-in {
    animation: chatBubbleIn 0.28s cubic-bezier(0.22,1,0.36,1) forwards;
  }
  @keyframes typingDot {
    0%, 60%, 100% { transform: translateY(0); }
    30%           { transform: translateY(-4px); }
  }
  .typing-dot { animation: typingDot 1.2s infinite; }
  .typing-dot:nth-child(2) { animation-delay: 0.15s; }
  .typing-dot:nth-child(3) { animation-delay: 0.30s; }
`;

if (typeof document !== 'undefined' && !document.getElementById('agro-chat-anim')) {
  const tag = document.createElement('style');
  tag.id = 'agro-chat-anim';
  tag.textContent = CHAT_ANIM_CSS;
  document.head.appendChild(tag);
}

/* ════════════════════════════════════════════════
   COMPONENT
   ════════════════════════════════════════════════ */
const ChatWidget: React.FC = () => {
  const { isChatOpen, toggleChat, messages, sendMessage, loading } = useChat();
  const [input, setInput]           = useState('');
  const messagesEndRef              = useRef<HTMLDivElement>(null);
  const location                    = useLocation();

  /* ─── scroll to bottom (logic unchanged) ─── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isChatOpen, loading]);

  /* ─── URL context extraction (logic unchanged) ─── */
  const getContext = () => {
    const m = location.pathname.match(/\/activities\/([a-f0-9]{24})/);
    return m ? { activityId: m[1] } : {};
  };

  /* ─── send handler (logic unchanged) ─── */
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const text = input;
    setInput('');
    await sendMessage(text, getContext());
  };

  /* ════════════════════════════════════════════════
     RENDER
     ════════════════════════════════════════════════ */
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end font-sans">

      {/* ══════════════════════════════════════
          CHAT WINDOW
          ══════════════════════════════════════ */}
      {isChatOpen && (
        <div
          className="chat-slide-up flex flex-col mb-3 overflow-hidden"
          style={{
            width: '360px',
            maxWidth: 'calc(100vw - 32px)',
            height: '520px',
            borderRadius: '28px',
            background: 'linear-gradient(175deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.88) 100%)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.55)',
            boxShadow: '0 24px 48px -12px rgba(4,31,12,0.18), 0 4px 8px -2px rgba(4,31,12,0.08)',
          }}
        >
          {/* ── Header ── */}
          <div
            className="flex-shrink-0 relative"
            style={{ background: 'linear-gradient(135deg, #041f0c 0%, #2D6A4F 100%)' }}
          >
            {/* Tri-color accent stripe — same as booking card top */}
            <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, #2D6A4F, #74C69D, #FFB000)' }} />

            <div className="flex items-center justify-between px-4 py-3.5">
              {/* Left: avatar + title */}
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'rgba(255,255,255,0.12)',
                    border: '1px solid rgba(255,255,255,0.18)',
                  }}
                >
                  <LifeBuoy size={18} color="rgba(255,255,255,0.9)" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-white text-[13px] leading-tight">Agro Support</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: '#74C69D', boxShadow: '0 0 5px rgba(116,198,157,0.5)' }}
                    />
                    <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      Online · System Help
                    </span>
                  </div>
                </div>
              </div>

              {/* Close */}
              <button
                onClick={toggleChat}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-colors duration-200 active:scale-90"
                style={{ color: 'rgba(255,255,255,0.5)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* ── Messages area ── */}
          <div
            className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
            style={{ background: 'linear-gradient(175deg, #F5F2ED 0%, #FAF9F6 100%)' }}
          >
            {/* Empty state */}
            {messages.length === 0 && !loading && (
              <div className="h-full flex flex-col items-center justify-center text-center px-4">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                  style={{
                    background: 'linear-gradient(135deg, rgba(45,106,79,0.1), rgba(116,198,157,0.06))',
                    border: '1px solid rgba(45,106,79,0.15)',
                  }}
                >
                  <Sparkles size={22} style={{ color: '#2D6A4F' }} />
                </div>
                <p className="font-serif font-bold text-dark text-[14px] mb-1.5">Need Help?</p>
                <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(125,90,80,0.5)' }}>
                  Ask about bookings, payments, or account issues.
                </p>

                {/* Quick-prompt pills */}
                <div className="flex flex-wrap justify-center gap-1.5 mt-4">
                  {['Booking help', 'Payment issue', 'Account'].map(hint => (
                    <button
                      key={hint}
                      onClick={() => { setInput(hint); }}
                      className="px-3 py-1 rounded-full text-[10px] font-bold transition-all duration-200 active:scale-95"
                      style={{
                        background: '#fff',
                        color: '#2D6A4F',
                        border: '1px solid rgba(45,106,79,0.18)',
                      }}
                    >
                      {hint}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message list */}
            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={idx}
                  className={`bubble-in flex ${isUser ? 'justify-end' : 'justify-start items-end gap-2'}`}
                  style={{ animationDelay: `${idx * 0.04}s` }}
                >
                  {/* Bot avatar */}
                  {!isUser && (
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mb-0.5"
                      style={{
                        background: 'linear-gradient(135deg, rgba(45,106,79,0.1), rgba(116,198,157,0.06))',
                        border: '1px solid rgba(45,106,79,0.15)',
                      }}
                    >
                      <Sprout size={13} style={{ color: '#2D6A4F' }} />
                    </div>
                  )}

                  {/* Bubble */}
                  <div
                    className="max-w-[82%] px-3.5 py-2.5 text-[12.5px] leading-relaxed"
                    style={isUser ? {
                      background: 'linear-gradient(135deg, #2D6A4F, #3a8a65)',
                      color: '#fff',
                      borderRadius: '18px 18px 18px 6px',
                      boxShadow: '0 2px 10px rgba(45,106,79,0.25)',
                    } : {
                      background: '#fff',
                      color: 'rgba(4,31,12,0.75)',
                      borderRadius: '18px 18px 6px 18px',
                      border: '1px solid rgba(125,90,80,0.1)',
                      boxShadow: '0 1px 4px rgba(4,31,12,0.06)',
                    }}
                  >
                    {isUser ? (
                      msg.content
                    ) : (
                      <Markdown
                        components={{
                          p:      ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,
                          ul:     ({ children }) => <ul className="list-disc ml-4 mb-1.5 space-y-0.5">{children}</ul>,
                          ol:     ({ children }) => <ol className="list-decimal ml-4 mb-1.5 space-y-0.5">{children}</ol>,
                          li:     ({ children }) => <li className="leading-normal">{children}</li>,
                          strong: ({ children }) => <strong className="font-bold" style={{ color: 'rgba(4,31,12,0.85)' }}>{children}</strong>,
                          a:      ({ children, href }) => (
                            <a href={href} className="underline hover:opacity-70 transition-opacity" style={{ color: '#2D6A4F' }} target="_blank" rel="noreferrer">
                              {children}
                            </a>
                          ),
                        }}
                      >
                        {msg.content}
                      </Markdown>
                    )}
                  </div>
                </div>
              );
            })}

            {/* ── Typing indicator ── */}
            {loading && (
              <div className="bubble-in flex justify-start items-end gap-2">
                {/* Avatar */}
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mb-0.5"
                  style={{
                    background: 'linear-gradient(135deg, rgba(45,106,79,0.1), rgba(116,198,157,0.06))',
                    border: '1px solid rgba(45,106,79,0.15)',
                  }}
                >
                  <Sprout size={13} style={{ color: '#2D6A4F' }} />
                </div>

                {/* Dots bubble */}
                <div
                  className="flex gap-1.5 items-center px-4 py-3"
                  style={{
                    background: '#fff',
                    borderRadius: '18px 18px 6px 18px',
                    border: '1px solid rgba(125,90,80,0.1)',
                    boxShadow: '0 1px 4px rgba(4,31,12,0.06)',
                  }}
                >
                  <span className="typing-dot w-1.5 h-1.5 rounded-full" style={{ background: '#FFB000' }} />
                  <span className="typing-dot w-1.5 h-1.5 rounded-full" style={{ background: '#FFB000' }} />
                  <span className="typing-dot w-1.5 h-1.5 rounded-full" style={{ background: '#FFB000' }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ── Input footer ── */}
          <form
            onSubmit={handleSend}
            className="flex-shrink-0 px-3.5 py-3"
            style={{ background: 'rgba(255,255,255,0.97)', borderTop: '1px solid rgba(125,90,80,0.08)' }}
          >
            <div className="relative flex items-center">
              {/* Text input */}
              <input
                className="w-full rounded-full text-[12.5px] font-medium text-dark placeholder-neutral/35 focus:outline-none transition-all duration-200"
                style={{
                  background: 'linear-gradient(135deg, #F5F2ED, #FAF9F6)',
                  border: '1px solid rgba(125,90,80,0.12)',
                  paddingLeft: '18px',
                  paddingRight: '44px',
                  paddingTop: '11px',
                  paddingBottom: '11px',
                }}
                placeholder="Type your issue…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={e => (e.target.style.border = '1px solid rgba(45,106,79,0.3)', e.target.style.boxShadow = '0 0 0 3px rgba(45,106,79,0.1)')}
                onBlur={e  => (e.target.style.border = '1px solid rgba(125,90,80,0.12)', e.target.style.boxShadow = 'none')}
              />

              {/* Send button */}
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="absolute right-1.5 w-8 h-8 rounded-full flex items-center justify-center text-white transition-all duration-200 active:scale-90 disabled:opacity-40"
                style={{
                  background: 'linear-gradient(135deg, #2D6A4F, #3a8a65)',
                  boxShadow: '0 2px 8px rgba(45,106,79,0.3)',
                }}
              >
                {loading
                  ? <Loader2 size={14} className="animate-spin" />
                  : <Send size={14} style={{ marginLeft: '1px' }} />
                }
              </button>
            </div>

            {/* Footer label */}
            <p
              className="text-center text-[9px] font-bold uppercase tracking-widest mt-2"
              style={{ color: 'rgba(125,90,80,0.3)' }}
            >
              Powered by AgroLK Support
            </p>
          </form>
        </div>
      )}

      {/* ══════════════════════════════════════
          FLOATING TOGGLE PILL
          ══════════════════════════════════════ */}
      <button
        onClick={toggleChat}
        className="flex items-center text-white transition-all duration-300 active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #2D6A4F, #1e5a3a)',
          borderRadius: '50px',
          boxShadow: '0 8px 28px rgba(45,106,79,0.38)',
          padding: isChatOpen ? '0' : '0 20px 0 16px',
          width: isChatOpen ? '52px' : 'auto',
          height: '52px',
          justifyContent: isChatOpen ? 'center' : 'flex-start',
          gap: isChatOpen ? '0' : '8px',
          opacity: isChatOpen ? 0.6 : 1,
          pointerEvents: 'auto',
        }}
      >
        {/* Icon + saffron ping dot */}
        <div className="relative flex-shrink-0">
          {isChatOpen ? <X size={22} /> : <MessageCircle size={22} />}

          {/* Saffron notification dot */}
          {!isChatOpen && (
            <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
              <span
                className="animate-ping absolute inset-0 rounded-full"
                style={{ background: 'rgba(255,176,0,0.6)' }}
              />
              <span
                className="relative rounded-full h-3 w-3"
                style={{ background: '#FFB000' }}
              />
            </span>
          )}
        </div>

        {/* Label — hidden when open */}
        {!isChatOpen && (
          <span className="text-[13px] font-bold tracking-wide">Help</span>
        )}
      </button>
    </div>
  );
};

export default ChatWidget;