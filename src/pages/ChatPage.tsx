import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Send, Paperclip, FileText,
  Phone, Clock, Download
} from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { getNexoraUser } from "@/lib/nexora-auth";
import AppLayout from "@/components/AppLayout";

const SOPHIA_AVATAR = "https://i.ibb.co/MvGFCkX/file-00000000b90c7246ab59b08eaba09eb0.png";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Aujourd'hui";
  if (d.toDateString() === yesterday.toDateString()) return "Hier";
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long" });
}

function RenderBotMessage({ content }: { content: string }) {
  const parts = content.split(/\*\*(.*?)\*\*/g);
  return (
    <span className="whitespace-pre-wrap">
      {parts.map((part, i) =>
        i % 2 === 1
          ? <strong key={i} className="font-black">{part}</strong>
          : <span key={i}>{part}</span>
      )}
    </span>
  );
}

export default function ChatPage() {
  const navigate = useNavigate();
  const user = getNexoraUser();
  const {
    messages,
    loading,
    sendMessage,
    uploadFile,
    markAdminMessagesRead,
    requestOperator,
  } = useChat();

  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [operatorRequested, setOperatorRequested] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    markAdminMessagesRead();
  }, [markAdminMessagesRead]);

  // FIX: Scroll vers le bas à chaque nouveau message
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [messages]);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height = Math.min(textAreaRef.current.scrollHeight, 120) + "px";
    }
  }, [text]);

  const handleSend = async () => {
    const trimmedText = text.trim();
    if (!trimmedText || sending) return;

    setText("");
    setSending(true);

    try {
      await sendMessage(trimmedText);
    } catch (error) {
      console.error("Erreur d'envoi", error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fileData = await uploadFile(file);
    if (fileData) {
      await sendMessage("", fileData);
    }
    setUploading(false);
    e.target.value = "";
  };

  const handleRequestOperator = async () => {
    if (operatorRequested) return;
    setOperatorRequested(true);
    await requestOperator();
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  // Grouper les messages par date
  const grouped: { date: string; msgs: typeof messages }[] = [];
  messages.forEach(msg => {
    const d = formatDate(msg.created_at);
    const last = grouped[grouped.length - 1];
    if (!last || last.date !== d) {
      grouped.push({ date: d, msgs: [msg] });
    } else {
      last.msgs.push(msg);
    }
  });

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)] max-w-2xl mx-auto">

        {/* ── En-tête ── */}
        <div className="flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-2xl shadow-sm mb-3 flex-shrink-0">
          <div className="relative">
            <img
              src={SOPHIA_AVATAR}
              alt="Sophia"
              className="w-10 h-10 rounded-xl object-cover shadow-lg"
            />
            {/* FIX: Indicateur en ligne — vert vif */}
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-card shadow-sm shadow-green-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-foreground text-sm">Sophia — Support NEXORA</p>
            <p className="text-xs text-green-500 font-semibold">En ligne · Répond automatiquement</p>
          </div>
        </div>

        {/* ── Zone de messages ── */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4 scroll-smooth">
          {loading && (
            <div className="flex justify-center py-8">
              <div className="w-7 h-7 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
            </div>
          )}

          {!loading && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
              <img
                src={SOPHIA_AVATAR}
                alt="Sophia"
                className="w-16 h-16 rounded-2xl object-cover mb-4 shadow-xl shadow-violet-200 dark:shadow-violet-900"
              />
              <h2 className="text-lg font-black text-foreground mb-2">Bienvenue sur le support NEXORA</h2>
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                Je suis Sophia, votre assistante virtuelle. Posez-moi toutes vos questions sur NEXORA !
              </p>
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {["Comment transférer de l'argent ?", "Prix abonnement", "Créer une boutique"].map(q => (
                  <button
                    key={q}
                    onClick={() => { setText(q); textAreaRef.current?.focus(); }}
                    className="text-xs px-3 py-1.5 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 font-medium hover:bg-violet-200 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {grouped.map(({ date, msgs }) => (
            <div key={date}>
              <div className="flex items-center gap-3 my-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs font-semibold text-muted-foreground px-3 py-1 rounded-full bg-muted">{date}</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <div className="space-y-2">
                {msgs.map(msg => {
                  const isUser = msg.sender === "user";
                  const isBot = msg.sender === "bot";
                  const isAdmin = msg.sender === "admin";
                  const isExpired = msg.file_expires_at && new Date(msg.file_expires_at) < new Date();
                  const isOptimistic = (msg as any)._optimistic;

                  return (
                    <div key={msg.id} className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                      {!isUser && (
                        isAdmin ? (
                          <div className="w-7 h-7 rounded-xl flex-shrink-0 flex items-center justify-center bg-blue-600">
                            <span className="text-white text-[10px] font-black">A</span>
                          </div>
                        ) : (
                          <img
                            src={SOPHIA_AVATAR}
                            alt="Sophia"
                            className="w-7 h-7 rounded-xl flex-shrink-0 object-cover"
                          />
                        )
                      )}

                      <div className={`max-w-[80%] space-y-1 ${isUser ? "items-end" : "items-start"} flex flex-col`}>
                        {!isUser && (
                          <span className="text-[10px] font-bold text-muted-foreground ml-1">
                            {isAdmin ? "Agent NEXORA" : "Sophia"}
                          </span>
                        )}

                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed transition-opacity ${
                          isOptimistic ? "opacity-70" : "opacity-100"
                        } ${
                          isUser
                            ? "bg-violet-600 text-white rounded-br-sm"
                            : isAdmin
                            ? "bg-blue-600 text-white rounded-bl-sm"
                            : "bg-card border border-border text-foreground rounded-bl-sm"
                        }`}>
                          {msg.file_url && !isExpired && (
                            <div className="mb-2">
                              {msg.file_type === "image" && (
                                <img src={msg.file_url} alt={msg.file_name || "image"}
                                  className="max-w-[220px] rounded-xl object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => window.open(msg.file_url!, "_blank")}
                                />
                              )}
                              {msg.file_type === "video" && (
                                <video src={msg.file_url} controls className="max-w-[220px] rounded-xl" />
                              )}
                              {msg.file_type === "doc" && (
                                <a href={msg.file_url} target="_blank" rel="noopener noreferrer"
                                  className={`flex items-center gap-2 px-3 py-2 rounded-xl ${isUser ? "bg-white/15" : "bg-muted"}`}>
                                  <FileText className="w-4 h-4 flex-shrink-0" />
                                  <span className="text-xs font-semibold truncate max-w-[160px]">{msg.file_name}</span>
                                  <Download className="w-3.5 h-3.5 flex-shrink-0 opacity-70" />
                                </a>
                              )}
                            </div>
                          )}

                          {msg.content && (
                            isBot
                              ? <RenderBotMessage content={msg.content} />
                              : <span className="whitespace-pre-wrap">{msg.content}</span>
                          )}
                        </div>

                        <div className={`flex items-center gap-1 ${isUser ? "mr-1 justify-end" : "ml-1"}`}>
                          <span className="text-[10px] text-muted-foreground">
                            {formatTime(msg.created_at)}
                          </span>
                          {isUser && isOptimistic && (
                            <span className="text-[10px] text-muted-foreground">· Envoi...</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* ── Bouton opérateur ── */}
        <div className="flex-shrink-0 px-2 mb-2">
          {!operatorRequested ? (
            <button
              onClick={handleRequestOperator}
              className="w-full flex items-center justify-center gap-2 h-10 rounded-xl border-2 border-dashed border-green-400 dark:border-green-600 text-green-600 dark:text-green-400 text-sm font-bold hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all">
              {/* FIX: Icône flottante chat en VERT */}
              <span className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                <Phone className="w-3 h-3 text-white" />
              </span>
              Appeler un opérateur humain
            </button>
          ) : (
            <div className="w-full flex items-center justify-center gap-2 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-semibold">
              <Clock className="w-4 h-4" /> Un opérateur a été notifié — il vous répond bientôt
            </div>
          )}
        </div>

        {/* ── Zone de saisie ── */}
        <div className="flex-shrink-0 bg-card border border-border rounded-2xl shadow-sm p-3">
          <div className="flex items-end gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-muted hover:bg-green-100 dark:hover:bg-green-900/30 text-muted-foreground hover:text-green-600 transition-all flex-shrink-0"
              title="Joindre un fichier">
              {uploading
                ? <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                : <Paperclip className="w-4 h-4" />
              }
            </button>

            <textarea
              ref={textAreaRef}
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Écrivez votre message..."
              rows={1}
              className="flex-1 resize-none bg-transparent text-foreground text-sm placeholder-muted-foreground outline-none leading-relaxed py-1.5 max-h-[120px]"
            />

            <button
              onClick={handleSend}
              disabled={!text.trim() || sending}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-green-500 hover:bg-green-600 disabled:opacity-40 text-white transition-all active:scale-95 flex-shrink-0 shadow-lg shadow-green-300/30">
              {/* FIX: Bouton envoi en VERT */}
              {sending
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <Send className="w-4 h-4" />
              }
            </button>
          </div>

          <div className="flex items-center mt-1 px-1">
            <span className="text-[10px] text-muted-foreground ml-auto uppercase tracking-wider font-bold opacity-50">Entrée pour envoyer</span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
