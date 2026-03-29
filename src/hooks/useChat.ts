import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getNexoraUser } from "@/lib/nexora-auth";

export interface ChatMessage {
  id: string;
  user_id: string;
  content: string;
  sender: "user" | "admin" | "bot";
  is_read: boolean;
  is_archived: boolean;
  created_at: string;
  file_url?: string | null;
  file_type?: "image" | "video" | "doc" | null;
  file_name?: string | null;
  file_expires_at?: string | null;
  _optimistic?: boolean; // flag pour les messages non encore confirmés
}

// ─────────────────────────────────────────────────────────────
// MESSAGES PRÉ-ENREGISTRÉS AVEC MOTS-CLÉS
// ─────────────────────────────────────────────────────────────
export const BOT_RESPONSES: {
  keywords: string[];
  response: string;
}[] = [
  {
    keywords: ["bonjour", "bonsoir", "salut", "hello", "hi", "coucou"],
    response: "Bonjour 👋 Je suis Sophia, votre assistante Nexora. Comment puis-je vous aider aujourd'hui ?",
  },
  {
    keywords: ["abonnement", "premium", "plan", "tarif", "prix", "payer", "upgrade"],
    response: "💎 L'abonnement **Nexora Premium** vous donne accès à toutes les fonctionnalités : immobilier, boutique digitale, épargne avancée et plus encore.\n\nPrix : 12$/mois. Rendez-vous sur la page **Abonnement** pour souscrire.",
  },
  {
    keywords: ["transfert", "envoyer", "recharge", "solde", "mobile money", "wave", "orange money", "mtn"],
    response: "💸 Pour effectuer un transfert ou recharger votre compte Nexora Transfert :\n\n1. Allez dans **Transfert** depuis le menu\n2. Cliquez sur **Recharger** et choisissez votre réseau Mobile Money\n3. Entrez le montant et votre numéro\n\nFrais : 100 FCFA par recharge, 3% par transfert.",
  },
  {
    keywords: ["retrait", "retirer", "récupérer argent", "sortir argent"],
    response: "🏧 Pour retirer votre argent :\n\n1. Allez dans **Transfert**\n2. Cliquez sur **Envoyer**\n3. Choisissez le pays, le réseau et entrez le numéro destinataire\n\nFrais : 3% du montant envoyé. Le virement est traité en quelques minutes.",
  },
  {
    keywords: ["épargne", "epargne", "économiser", "economiser", "coffre", "dépôt"],
    response: "🐖 Nexora Épargne vous permet de mettre de côté en toute sécurité.\n\nAccédez à **Coffre-fort** depuis le menu pour déposer et gérer votre épargne. Plusieurs plans disponibles selon vos objectifs.",
  },
  {
    keywords: ["facture", "devis", "facturation", "client", "document"],
    response: "🧾 Nexora Factures vous permet de créer des factures et devis professionnels en quelques clics.\n\nAllez dans **Factures** depuis le menu principal.",
  },
  {
    keywords: ["immobilier", "appartement", "maison", "terrain", "louer", "vendre", "acheter"],
    response: "🏠 La section **Immobilier** est disponible avec l'abonnement Premium.\n\nVous pouvez publier et consulter des annonces immobilières (vente, location, terrain) dans toute l'Afrique de l'Ouest.",
  },
  {
    keywords: ["boutique", "vendre", "produit", "commande", "shop", "e-commerce"],
    response: "🛍️ **Nexora Boutique** vous permet de créer votre boutique en ligne et de vendre vos produits.\n\nFonctionnalité disponible avec l'abonnement Premium. Accédez via **Boutique** dans le menu.",
  },
  {
    keywords: ["prêt", "pret", "emprunt", "crédit", "credit", "financement"],
    response: "💰 La section **Prêts** vous permet de gérer vos emprunts et demandes de financement.\n\nAccédez via **Prêts** dans le menu principal.",
  },
  {
    keywords: ["mot de passe", "password", "connexion", "login", "compte", "accès"],
    response: "🔐 Pour tout problème de connexion ou de mot de passe :\n\n1. Sur la page de connexion, cliquez sur **Mot de passe oublié**\n2. Entrez votre email pour recevoir un lien de réinitialisation\n\nSi le problème persiste, contactez notre support.",
  },
  {
    keywords: ["bug", "erreur", "problème", "probleme", "ne fonctionne pas", "bloqué", "bloque"],
    response: "🔧 Désolé pour ce désagrément ! Pour nous aider à résoudre votre problème :\n\n1. Décrivez précisément ce qui se passe\n2. Indiquez sur quelle page vous êtes\n3. Précisez si le problème se répète\n\nNotre équipe technique traitera votre cas rapidement.",
  },
  {
    keywords: ["contact", "support", "aide", "help", "assistance", "opérateur", "operateur", "humain"],
    response: "👋 Je suis Sophia, l'assistante automatique de Nexora.\n\nSi vous souhaitez parler directement à un conseiller humain, cliquez sur le bouton **Appeler un opérateur** ci-dessous.",
  },
];

// Cherche une réponse bot selon les mots-clés
export function findBotResponse(message: string): string | null {
  const lower = message.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  for (const item of BOT_RESPONSES) {
    if (item.keywords.some(kw => {
      const kwNorm = kw.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return lower.includes(kwNorm);
    })) {
      return item.response;
    }
  }
  return null;
}

// ─────────────────────────────────────────────────────────────
// HOOK UTILISATEUR
// ─────────────────────────────────────────────────────────────
export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const currentUser = getNexoraUser();
  const userId = currentUser?.id;

  const fetchMessages = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("chat_messages")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (!error && data) {
      const confirmed = data as ChatMessage[];
      // Fusionne : garde les messages optimistic non encore confirmés
      setMessages(prev => {
        const pendingOptimistic = prev.filter(m =>
          m._optimistic &&
          !confirmed.some(
            c => c.content === m.content && c.sender === m.sender
          )
        );
        return [...confirmed, ...pendingOptimistic];
      });
      const unread = confirmed.filter(
        (m) => !m.is_read && (m.sender === "admin" || m.sender === "bot")
      ).length;
      setUnreadCount(unread);
    }
    setLoading(false);
  }, [userId]);

  const sendMessage = useCallback(
    async (content: string, fileData?: {
      file_url: string;
      file_type: "image" | "video" | "doc";
      file_name: string;
      file_expires_at: string;
    }) => {
      if (!userId) return;

      // ── OPTIMISTIC UPDATE : affiche le message immédiatement ──
      const optimisticId = `optimistic_${Date.now()}_${Math.random()}`;
      const optimisticMsg: ChatMessage = {
        id: optimisticId,
        user_id: userId,
        content: content.trim() || (fileData ? `[${fileData.file_type}]` : ""),
        sender: "user",
        is_read: false,
        is_archived: false,
        created_at: new Date().toISOString(),
        file_url: fileData?.file_url ?? null,
        file_type: fileData?.file_type ?? null,
        file_name: fileData?.file_name ?? null,
        file_expires_at: fileData?.file_expires_at ?? null,
        _optimistic: true,
      };
      setMessages(prev => [...prev, optimisticMsg]);

      // 1. Insérer le message en base
      const { error } = await (supabase as any).from("chat_messages").insert({
        user_id: userId,
        content: content.trim() || (fileData ? `[${fileData.file_type}]` : ""),
        sender: "user",
        is_read: false,
        is_archived: false,
        file_url: fileData?.file_url ?? null,
        file_type: fileData?.file_type ?? null,
        file_name: fileData?.file_name ?? null,
        file_expires_at: fileData?.file_expires_at ?? null,
      });

      if (error) {
        // Marquer le message comme échoué (tu peux afficher une icône ⚠️ dans l'UI)
        setMessages(prev =>
          prev.map(m =>
            m.id === optimisticId ? { ...m, _error: true } as ChatMessage : m
          )
        );
        return;
      }

      // Le realtime va déclencher fetchMessages() qui remplacera le message optimistic
      // par la version confirmée de la base

      // 2. Réponse bot
      if (content.trim()) {
        const botReply = findBotResponse(content);

        if (botReply) {
          setTimeout(async () => {
            await (supabase as any).from("chat_messages").insert({
              user_id: userId,
              content: botReply,
              sender: "bot",
              is_read: false,
              is_archived: false,
            });
          }, 800);
        } else {
          setTimeout(async () => {
            await (supabase as any).from("chat_messages").insert({
              user_id: userId,
              content: "Je n'ai pas trouvé de réponse automatique à votre question. Un conseiller va vous répondre dans les plus brefs délais. 🙏",
              sender: "bot",
              is_read: false,
              is_archived: false,
            });

            await (supabase as any).from("nexora_notifications").insert({
              type: "chat_unknown_question",
              user_id: userId,
              message: `Question sans réponse : "${content.trim().slice(0, 100)}"`,
              is_read: false,
            }).catch(() => {});
          }, 800);
        }
      }
    },
    [userId]
  );

  // Upload fichier vers Supabase Storage
  const uploadFile = useCallback(async (file: File): Promise<{
    file_url: string;
    file_type: "image" | "video" | "doc";
    file_name: string;
    file_expires_at: string;
  } | null> => {
    if (!userId) return null;

    const path = `chat/${userId}/${Date.now()}_${file.name}`;

    let file_type: "image" | "video" | "doc" = "doc";
    if (file.type.startsWith("image/")) file_type = "image";
    else if (file.type.startsWith("video/")) file_type = "video";

    const { data, error } = await supabase.storage
      .from("chat-files")
      .upload(path, file, { upsert: false });

    if (error || !data) {
      console.error("Upload error:", error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from("chat-files")
      .getPublicUrl(path);

    const expires = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();

    return {
      file_url: urlData.publicUrl,
      file_type,
      file_name: file.name,
      file_expires_at: expires,
    };
  }, [userId]);

  const markAdminMessagesRead = useCallback(async () => {
    if (!userId) return;
    await (supabase as any)
      .from("chat_messages")
      .update({ is_read: true })
      .eq("user_id", userId)
      .in("sender", ["admin", "bot"])
      .eq("is_read", false);
    setUnreadCount(0);
  }, [userId]);

  const requestOperator = useCallback(async () => {
    if (!userId) return;
    await (supabase as any).from("chat_messages").insert({
      user_id: userId,
      content: "🔔 **L'utilisateur demande à parler à un opérateur humain.**",
      sender: "bot",
      is_read: false,
      is_archived: false,
    });
    await (supabase as any).from("nexora_notifications").insert({
      type: "chat_operator_request",
      user_id: userId,
      message: "Un utilisateur demande à parler à un opérateur.",
      is_read: false,
    }).catch(() => {});
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    fetchMessages();

    const channel = supabase
      .channel(`chat_user_${userId}`)
      .on("postgres_changes" as any, {
        event: "*",
        schema: "public",
        table: "chat_messages",
        filter: `user_id=eq.${userId}`,
      }, () => { fetchMessages(); })
      .subscribe();

    channelRef.current = channel;
    return () => { supabase.removeChannel(channel); };
  }, [userId, fetchMessages]);

  return { messages, unreadCount, loading, sendMessage, uploadFile, markAdminMessagesRead, fetchMessages, requestOperator };
}

// ─────────────────────────────────────────────────────────────
// HOOK ADMIN
// ─────────────────────────────────────────────────────────────
export interface ChatConversation {
  user_id: string;
  user_name: string;
  user_email: string;
  avatar_url: string | null;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  messages: ChatMessage[];
  has_operator_request: boolean;
  has_unknown_question: boolean;
}

export function useAdminChat() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    const { data: msgs, error } = await (supabase as any)
      .from("chat_messages")
      .select("*")
      .eq("is_archived", false)
      .order("created_at", { ascending: false });

    if (error || !msgs) { setLoading(false); return; }

    const grouped: Record<string, ChatMessage[]> = {};
    (msgs as ChatMessage[]).forEach((m) => {
      if (!grouped[m.user_id]) grouped[m.user_id] = [];
      grouped[m.user_id].push(m);
    });

    const userIds = Object.keys(grouped);
    const { data: users } = await (supabase as any)
      .from("nexora_users")
      .select("id, nom_prenom, email, avatar_url")
      .in("id", userIds);

    const userMap: Record<string, any> = {};
    (users || []).forEach((u: any) => { userMap[u.id] = u; });

    const convs: ChatConversation[] = userIds.map((uid) => {
      const userMsgs = grouped[uid].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      const last = userMsgs[userMsgs.length - 1];
      const unread = userMsgs.filter((m) => !m.is_read && m.sender === "user").length;
      const u = userMap[uid];
      const hasOperatorReq = userMsgs.some(m => m.content.includes("demande à parler à un opérateur"));
      const hasUnknown = userMsgs.some(m => m.content.includes("Question sans réponse"));
      return {
        user_id: uid,
        user_name: u?.nom_prenom || "Utilisateur",
        user_email: u?.email || "",
        avatar_url: u?.avatar_url || null,
        last_message: last?.content || "",
        last_message_at: last?.created_at || "",
        unread_count: unread,
        messages: userMsgs,
        has_operator_request: hasOperatorReq,
        has_unknown_question: hasUnknown,
      };
    });

    convs.sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());
    setConversations(convs);
    setLoading(false);
  }, []);

  const sendAdminReply = useCallback(async (userId: string, content: string) => {
    if (!content.trim()) return;
    await (supabase as any).from("chat_messages").insert({
      user_id: userId,
      content: content.trim(),
      sender: "admin",
      is_read: false,
      is_archived: false,
    });
  }, []);

  const markUserMessagesRead = useCallback(async (userId: string) => {
    await (supabase as any)
      .from("chat_messages")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("sender", "user")
      .eq("is_read", false);
    fetchConversations();
  }, [fetchConversations]);

  const archiveConversation = useCallback(async (userId: string) => {
    await (supabase as any)
      .from("chat_messages")
      .update({ is_archived: true })
      .eq("user_id", userId);
    fetchConversations();
  }, [fetchConversations]);

  const totalUnread = conversations.reduce((s, c) => s + c.unread_count, 0);
  const totalOperatorRequests = conversations.filter(c => c.has_operator_request).length;
  const totalUnknownQuestions = conversations.filter(c => c.has_unknown_question).length;

  useEffect(() => {
    fetchConversations();
    const channel = supabase
      .channel("chat_admin_all")
      .on("postgres_changes" as any, { event: "*", schema: "public", table: "chat_messages" }, () => {
        fetchConversations();
      })
      .subscribe();
    channelRef.current = channel;
    return () => { supabase.removeChannel(channel); };
  }, [fetchConversations]);

  return {
    conversations, loading, totalUnread, totalOperatorRequests, totalUnknownQuestions,
    sendAdminReply, markUserMessagesRead, archiveConversation, fetchConversations
  };
}
