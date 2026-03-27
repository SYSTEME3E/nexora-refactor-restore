import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, ChevronDown } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { getNexoraUser } from "@/lib/nexora-auth";

// Photo d'assistante féminine via URL publique (Unsplash)
const ASSISTANT_PHOTO =
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop&face";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const user = getNexoraUser();
  const { messages, unreadCount, loading, sendMessage, markAdminMessagesRead } =
    useChat();

  // Scroll to bottom on new messages
  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  // Mark read when opening
  useEffect(() => {
    if (open && unreadCount > 0) markAdminMessagesRead();
  }, [open]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    await sendMessage(input);
    setInput("");
    setSending(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  if (!user) return null;

  return (
    <>
      {/* ── Floating Button ── */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3">
        {/* Pulse halo when unread */}
        {!open && unreadCount > 0 && (
          <div className="absolute inset-0 rounded-full animate-ping bg-violet-500 opacity-30" />
        )}

        <button
          onClick={() => setOpen((o) => !o)}
          className="relative w-15 h-15 rounded-full shadow-2xl flex items-center justify-center transition-transform active:scale-95 hover:scale-105"
          style={{
            width: 60,
            height: 60,
            background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
          }}
          aria-label="Ouvrir le chat"
        >
          {open ? (
            <ChevronDown className="w-6 h-6 text-white" />
          ) : (
            <MessageCircle className="w-6 h-6 text-white" />
          )}
          {/* Unread badge */}
          {!open && unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1 flex items-center justify-center rounded-full text-[11px] font-black text-white shadow-lg"
              style={{ background: "#ef4444" }}>
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Chat Window ── */}
      {open && (
        <div
          className="fixed bottom-[82px] right-6 z-[9998] flex flex-col rounded-3xl shadow-2xl overflow-hidden"
          style={{
            width: 360,
            height: 520,
            maxHeight: "calc(100vh - 120px)",
            background: "#ffffff",
            border: "1.5px solid #e5e7eb",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
            }}
          >
            <div className="relative">
              <img
                src={ASSISTANT_PHOTO}
                alt="Assistante Nexora"
                className="w-10 h-10 rounded-full object-cover border-2 border-white/40"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%236d28d9'/%3E%3Ctext x='20' y='25' text-anchor='middle' fill='white' font-size='18'%3E👩%3C/text%3E%3C/svg%3E";
                }}
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-violet-700"
                style={{ background: "#22c55e" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm leading-tight">Sophia — Support Nexora</p>
              <p className="text-violet-200 text-xs">Répond habituellement rapidement</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
            style={{ background: "#f8f7ff" }}>
            {/* Welcome message */}
            {messages.length === 0 && !loading && (
              <div className="flex items-start gap-2 mt-2">
                <img
                  src={ASSISTANT_PHOTO}
                  alt="Sophia"
                  className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-0.5"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'%3E%3Ccircle cx='14' cy='14' r='14' fill='%236d28d9'/%3E%3Ctext x='14' y='18' text-anchor='middle' fill='white' font-size='13'%3E👩%3C/text%3E%3C/svg%3E";
                  }}
                />
                <div className="rounded-2xl rounded-tl-sm px-3.5 py-2.5 max-w-[80%] shadow-sm"
                  style={{ background: "#7c3aed" }}>
                  <p className="text-white text-sm leading-relaxed">
                    Bonjour 👋 Je suis <strong>Sophia</strong>, votre assistante Nexora.<br />
                    Comment puis-je vous aider aujourd'hui ?
                  </p>
                </div>
              </div>
            )}

            {loading && (
              <div className="flex justify-center py-4">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="w-2 h-2 rounded-full bg-violet-400 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => {
              const isUser = msg.sender === "user";
              return (
                <div key={msg.id} className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                  {!isUser && (
                    <img
                      src={ASSISTANT_PHOTO}
                      alt="Sophia"
                      className="w-6 h-6 rounded-full object-cover flex-shrink-0 mb-0.5"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='12' fill='%236d28d9'/%3E%3Ctext x='12' y='16' text-anchor='middle' fill='white' font-size='11'%3E👩%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  )}
                  <div className={`max-w-[78%] flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                    <div
                      className={`px-3.5 py-2.5 shadow-sm ${
                        isUser
                          ? "rounded-2xl rounded-br-sm text-white"
                          : "rounded-2xl rounded-tl-sm text-white"
                      }`}
                      style={{
                        background: isUser
                          ? "linear-gradient(135deg, #4f46e5, #7c3aed)"
                          : "#7c3aed",
                      }}
                    >
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    </div>
                    <span className="text-[10px] text-gray-400 mt-0.5 px-1">
                      {formatTime(msg.created_at)}
                      {isUser && (
                        <span className="ml-1">{msg.is_read ? "✓✓" : "✓"}</span>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 px-3 py-3 border-t border-gray-100 flex-shrink-0 bg-white">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Écrivez votre message…"
              className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none bg-gray-50 border border-gray-200 focus:border-violet-400 focus:bg-white transition-all"
              disabled={sending}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95 flex-shrink-0 disabled:opacity-40"
              style={{
                background: input.trim()
                  ? "linear-gradient(135deg, #7c3aed, #4f46e5)"
                  : "#e5e7eb",
              }}
            >
              <Send className={`w-4 h-4 ${input.trim() ? "text-white" : "text-gray-400"}`} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
