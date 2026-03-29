import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Send, Paperclip, Image, Film, FileText,
  Phone, MessageCircle, Bot, User, Clock, Download
} from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { getNexoraUser } from "@/lib/nexora-auth";
import AppLayout from "@/components/AppLayout";

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

// Rendu markdown léger (gras **texte**, sauts de ligne)
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
    messages, loading, sendMessage, uploadFile,
    markAdminMessagesRead, requestOperator
  } = useChat();

  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [operatorRequested, setOperatorRequested] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Marquer comme lus à l'ouverture
  useEffect(() => {
    markAdminMessagesRead();
  }, [markAdminMessagesRead]);

  // Scroll auto vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Ajuster hauteur textarea
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height = Math.min(textAreaRef.current.scrollHeight, 120) + "px";
    }
  }, [text]);

  const handleSend = async () => {
    if ((!text.trim() && !sending) || sending) return;
    setSending(true);
    await sendMessage(text.trim());
    setText("");
    setSending(false);
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

  // Grouper messages par date
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-card" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-foreground text-sm">Sophia — Support NEXORA</p>
            <p className="text-xs text-emerald-500 font-semibold">En ligne </p>
          </div>
          
        {/* ── Zone de messages ── */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4 scroll-smooth">

          {loading && (
            <div className="flex justify-center py-8">
              <div className="w-7 h-7 rounded-full border-3 border-violet-500 border-t-transparent animate-spin" />
            </div>
          )}

          {!loading && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mb-4 shadow-xl shadow-violet-200 dark:shadow-violet-900">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-lg font-black text-foreground mb-2">Bienvenue sur le support NEXORA</h2>
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                Je suis Sophia, votre assistante virtuelle. Posez-moi toutes vos questions sur NEXORA !
              </p>
              <div className="mt-6 flex flex-wrap gap-2 justify-center">
                {["Comment transférer de l'argent ?", "Aide boutique", "Problème de connexion", "Immobilier"].map(q => (
                  <button key={q} onClick={() => { setText(q); textAreaRef.current?.focus(); }}
                    className="px-3 py-1.5 rounded-xl bg-muted hover:bg-violet-100 dark:hover:bg-violet-900/30 text-xs font-semibold text-muted-foreground hover:text-violet-700 dark:hover:text-violet-300 transition-colors border border-border">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {grouped.map(({ date, msgs }) => (
            <div key={date}>
              {/* Séparateur date */}
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

                  return (
                    <div key={msg.id} className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>

                      {/* Avatar */}
                      {!isUser && (
                        <div className={`w-7 h-7 rounded-xl flex-shrink-0 flex items-center justify-center ${
                          isAdmin ? "bg-blue-600" : "bg-gradient-to-br from-violet-600 to-indigo-600"
                        }`}>
                          {isAdmin
                            ? <User className="w-3.5 h-3.5 text-white" />
                            : <Bot className="w-3.5 h-3.5 text-white" />
                          }
                        </div>
                      )}

                      {/* Bulle message */}
                      <div className={`max-w-[80%] space-y-1 ${isUser ? "items-end" : "items-start"} flex flex-col`}>

                        {/* Label expéditeur */}
                        {!isUser && (
                          <span className="text-[10px] font-bold text-muted-foreground ml-1">
                            {isAdmin ? "Agent NEXORA" : "Sophia"}
                          </span>
                        )}

                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          isUser
                            ? "bg-violet-600 text-white rounded-br-sm"
                            : isAdmin
                            ? "bg-blue-600 text-white rounded-bl-sm"
                            : "bg-card border border-border text-foreground rounded-bl-sm"
                        }`}>

                          {/* Fichier joint */}
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

                          {isExpired && msg.file_url && (
                            <div className="flex items-center gap-2 text-xs opacity-60 italic mb-2">
                              <Clock className="w-3 h-3" /> Fichier expiré (72h)
                            </div>
                          )}

                          {/* Texte */}
                          {msg.content && (
                            isBot
                              ? <RenderBotMessage content={msg.content} />
                              : <span className="whitespace-pre-wrap">{msg.content}</span>
                          )}
                        </div>

                        {/* Heure */}
                        <span className={`text-[10px] text-muted-foreground ${isUser ? "mr-1" : "ml-1"}`}>
                          {formatTime(msg.created_at)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Bouton Appeler un opérateur ── */}
        {!operatorRequested ? (
          <div className="flex-shrink-0 px-2 mb-2">
            <button
              onClick={handleRequestOperator}
              className="w-full flex items-center justify-center gap-2 h-10 rounded-xl border-2 border-dashed border-violet-300 dark:border-violet-700 text-violet-600 dark:text-violet-400 text-sm font-bold hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all">
              <Phone className="w-4 h-4" /> Appeler un opérateur humain
            </button>
          </div>
        ) : (
          <div className="flex-shrink-0 px-2 mb-2">
            <div className="w-full flex items-center justify-center gap-2 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-semibold">
              <Clock className="w-4 h-4" /> Un opérateur a été notifié — il vous répond bientôt
            </div>
          </div>
        )}

        {/* ── Zone de saisie ── */}
        <div className="flex-shrink-0 bg-card border border-border rounded-2xl shadow-sm p-3">
          <div className="flex items-end gap-2">

            {/* Bouton fichier */}
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
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-muted hover:bg-violet-100 dark:hover:bg-violet-900/30 text-muted-foreground hover:text-violet-600 transition-all flex-shrink-0"
              title="Joindre un fichier (image, vidéo, document)">
              {uploading
                ? <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                : <Paperclip className="w-4 h-4" />
              }
            </button>

            {/* Texte */}
            <textarea
              ref={textAreaRef}
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Écrivez votre message..."
              rows={1}
              className="flex-1 resize-none bg-transparent text-foreground text-sm placeholder-muted-foreground outline-none leading-relaxed py-1.5 max-h-[120px]"
            />

            {/* Envoyer */}
            <button
              onClick={handleSend}
              disabled={!text.trim() || sending}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white transition-all active:scale-95 flex-shrink-0 shadow-lg shadow-violet-300/30">
              {sending
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <Send className="w-4 h-4" />
              }
            </button>
          </div>

          {/* Aide types de fichiers */}
          <div className="flex items-center gap-3 mt-2 px-1">
            <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Image className="w-3 h-3" /> Photos</span>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Film className="w-3 h-3" /> Vidéos</span>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1"><FileText className="w-3 h-3" /> Docs</span>
            <span className="text-[10px] text-muted-foreground ml-auto">Entrée pour envoyer</span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
