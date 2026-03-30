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
  _optimistic?: boolean;
}

// ─────────────────────────────────────────────────────────────
// 30 RÉPONSES AUTOMATIQUES AVEC MOTS-CLÉS
// ─────────────────────────────────────────────────────────────
export const BOT_RESPONSES: { keywords: string[]; response: string }[] = [
  {
    keywords: ["bonjour", "bonsoir", "salut", "hello", "hi", "coucou", "hey"],
    response: "Bonjour 👋 Je suis Sophia, votre assistante Nexora. Comment puis-je vous aider aujourd'hui ?",
  },
  {
    keywords: ["abonnement", "premium", "plan", "tarif", "prix", "payer", "upgrade", "forfait"],
    response: "💎 L'abonnement **Nexora Premium** vous donne accès à toutes les fonctionnalités : immobilier, boutique digitale, épargne avancée et plus encore.\n\nPrix : 12$/mois. Rendez-vous sur la page **Abonnement** pour souscrire.",
  },
  {
    keywords: ["transfert", "envoyer argent", "recharge", "solde transfert", "mobile money", "wave", "orange money", "mtn"],
    response: "💸 Pour effectuer un transfert ou recharger votre compte Nexora Transfert :\n\n1. Allez dans **Transfert** depuis le menu\n2. Cliquez sur **Recharger** et choisissez votre réseau Mobile Money\n3. Entrez le montant et votre numéro\n\nFrais : 100 FCFA par recharge, 3% par transfert.",
  },
  {
    keywords: ["retrait", "retirer", "récupérer argent", "sortir argent", "envoyer vers"],
    response: "🏧 Pour retirer votre argent :\n\n1. Allez dans **Transfert**\n2. Cliquez sur **Envoyer**\n3. Choisissez le pays, le réseau et entrez le numéro destinataire\n\nFrais : 3% du montant envoyé. Le virement est traité en quelques minutes.",
  },
  {
    keywords: ["épargne", "epargne", "économiser", "economiser", "coffre", "dépôt", "mettre de côté"],
    response: "🐖 Nexora Épargne vous permet de mettre de côté en toute sécurité.\n\nAccédez à **Coffre-fort** depuis le menu pour déposer et gérer votre épargne. Plusieurs plans disponibles selon vos objectifs.",
  },
  {
    keywords: ["facture", "devis", "facturation", "créer facture", "document commercial"],
    response: "🧾 Nexora Factures vous permet de créer des factures et devis professionnels en quelques clics.\n\nAllez dans **Factures** depuis le menu principal.",
  },
  {
    keywords: ["immobilier", "appartement", "maison", "terrain", "louer", "vendre bien", "acheter maison"],
    response: "🏠 La section **Immobilier** est disponible avec l'abonnement Premium.\n\nVous pouvez publier et consulter des annonces immobilières (vente, location, terrain) dans toute l'Afrique de l'Ouest.",
  },
  {
    keywords: ["boutique", "créer boutique", "vendre produit", "commande boutique", "shop", "e-commerce"],
    response: "🛍️ **Nexora Boutique** vous permet de créer votre boutique en ligne et de vendre vos produits.\n\nFonctionnalité disponible avec l'abonnement Premium. Accédez via **Boutique** dans le menu.",
  },
  {
    keywords: ["prêt", "pret", "emprunt", "crédit", "credit", "financement", "dette"],
    response: "💰 La section **Prêts** vous permet de gérer vos emprunts et demandes de financement.\n\nAccédez via **Prêts** dans le menu principal.",
  },
  {
    keywords: ["mot de passe", "password", "connexion", "login", "compte bloqué", "accès refusé"],
    response: "🔐 Pour tout problème de connexion ou de mot de passe :\n\n1. Sur la page de connexion, cliquez sur **Mot de passe oublié**\n2. Suivez les instructions pour contacter notre support\n\nSi le problème persiste, écrivez à erickpakpo786@gmail.com",
  },
  {
    keywords: ["bug", "erreur", "problème technique", "ne fonctionne pas", "bloqué", "plantage"],
    response: "🔧 Désolé pour ce désagrément ! Pour nous aider à résoudre votre problème :\n\n1. Décrivez précisément ce qui se passe\n2. Indiquez sur quelle page vous êtes\n3. Précisez si le problème se répète\n\nNotre équipe technique traitera votre cas rapidement.",
  },
  {
    keywords: ["contact", "support", "aide", "help", "assistance", "opérateur", "operateur", "humain", "agent"],
    response: "👋 Je suis Sophia, l'assistante automatique de Nexora.\n\nSi vous souhaitez parler directement à un conseiller humain, cliquez sur le bouton **Appeler un opérateur** ci-dessous.",
  },
  {
    keywords: ["pays", "afrique", "disponible", "zone", "région", "pays éligible"],
    response: "🌍 Nexora est disponible dans **24 pays africains** !\n\nBénin, Côte d'Ivoire, Togo, Sénégal, Niger, Mali, Burkina Faso, Cameroun, Ghana, Nigeria, Kenya, Tanzanie, Ouganda, Rwanda, Guinée, RD Congo, Gabon, Congo, Maroc, Gambie, Sierra Leone, Liberia, Mozambique, Zambie.",
  },
  {
    keywords: ["inscription", "créer compte", "nouveau compte", "s'inscrire", "rejoindre"],
    response: "✅ Pour créer votre compte Nexora :\n\n1. Allez sur la page **Connexion**\n2. Cliquez sur **Créer un compte**\n3. Remplissez vos informations\n4. Votre compte est gratuit !\n\nL'inscription prend moins de 2 minutes.",
  },
  {
    keywords: ["frais", "commission", "coût", "tarif transfert", "combien ça coûte"],
    response: "💡 Voici les frais Nexora :\n\n• **Inscription** : Gratuite\n• **Recharge compte** : 100 FCFA\n• **Transfert d'argent** : 3% du montant\n• **Abonnement Premium** : 12$/mois\n\nAucun frais caché !",
  },
  {
    keywords: ["sécurité", "securite", "confidentiel", "données personnelles", "protection"],
    response: "🔒 Vos données sont protégées avec Nexora :\n\n• Chiffrement bout-en-bout AES-256\n• Connexions sécurisées (TLS 1.3)\n• Aucune revente de données\n• Coffre-fort personnel chiffré\n\nVotre confidentialité est notre priorité.",
  },
  {
    keywords: ["remboursement", "annuler", "retour", "rembourser", "litige"],
    response: "↩️ Pour un remboursement ou litige :\n\n1. Contactez d'abord le vendeur directement via WhatsApp\n2. Si pas de réponse sous 48h, ouvrez un litige via le chat support\n3. Notre équipe intervient dans les 72h\n\nConservez vos preuves d'achat.",
  },
  {
    keywords: ["profil", "modifier profil", "avatar", "photo de profil", "changer nom"],
    response: "👤 Pour modifier votre profil :\n\n1. Cliquez sur votre avatar en haut de la barre latérale\n2. Accédez à **Profil**\n3. Modifiez vos informations et sauvegardez\n\nVous pouvez changer votre nom, email et photo.",
  },
  {
    keywords: ["historique", "transaction", "relevé", "bilan", "mes opérations"],
    response: "📊 Consultez votre historique complet dans la section **Historique** du menu.\n\nVous y trouverez toutes vos opérations : entrées, dépenses, transferts, et leur statut.",
  },
  {
    keywords: ["lien", "liens", "contact", "liens contacts", "carnet d'adresses", "réseau social"],
    response: "🔗 La section **Liens & Contacts** vous permet de :\n\n• Créer des liens courts personnalisés\n• Partager vos réseaux sociaux\n• Gérer vos contacts importants\n\nAccédez via **Liens** dans le menu.",
  },
  {
    keywords: ["télécharger", "telecharger", "application", "app", "mobile", "android", "ios"],
    response: "📱 Nexora est accessible depuis votre navigateur mobile et desktop.\n\nPour l'installer comme application :\n1. Ouvrez Nexora dans Chrome\n2. Appuyez sur « Ajouter à l'écran d'accueil »\n3. Profitez de l'expérience native !",
  },
  {
    keywords: ["vitrine", "ma boutique", "url boutique", "lien boutique", "partager boutique"],
    response: "🏪 Votre vitrine boutique est accessible via :\n**nexora.vercel.app/shop/votre-slug**\n\nPartagez ce lien avec vos clients pour qu'ils puissent commander directement !",
  },
  {
    keywords: ["commande", "ma commande", "suivi commande", "où est ma commande", "statut commande"],
    response: "📦 Pour suivre votre commande :\n\n1. Utilisez le lien de suivi reçu après votre achat\n2. Ou contactez le vendeur directement via WhatsApp\n\nLe vendeur met à jour le statut : En attente → Confirmée → En route → Livrée.",
  },
  {
    keywords: ["paiement échoué", "paiement refusé", "transaction échouée", "erreur paiement"],
    response: "❌ Si votre paiement a échoué :\n\n1. Vérifiez que votre solde Mobile Money est suffisant\n2. Réessayez après quelques minutes\n3. Essayez un autre réseau (Wave, MTN, Orange...)\n\nSi le problème persiste, contactez le support.",
  },
  {
    keywords: ["whatsapp", "numéro", "appel", "téléphone support"],
    response: "📞 Contactez notre support directement :\n\n• **WhatsApp** : +229 51 76 23 41\n• **Email** : erickpakpo786@gmail.com\n\nDisponible du lundi au samedi, 8h - 20h.",
  },
  {
    keywords: ["bénin", "benin", "cotonou", "siège", "adresse nexora"],
    response: "📍 Nexora est basé au **Bénin**, en Afrique de l'Ouest.\n\nNous servons 24 pays africains. Notre équipe support est disponible via WhatsApp (+229 51 76 23 41) ou email.",
  },
  {
    keywords: ["gratuit", "plan gratuit", "fonctionnalité gratuite", "sans payer", "accès libre"],
    response: "🎁 Le plan **Gratuit** Nexora vous donne accès à :\n\n• Gestion financière (entrées & dépenses)\n• 10 factures par mois\n• 5 produits boutique\n• Coffre-fort (limité)\n• Chat support\n\nPassez au Premium pour tout débloquer !",
  },
  {
    keywords: ["notification", "alerte", "rappel", "recevoir notification"],
    response: "🔔 Pour activer les notifications Nexora :\n\n1. Allez dans **Paramètres boutique**\n2. Section **Notifications**\n3. Cliquez sur **Activer sur cet appareil**\n\nVous recevrez des alertes pour chaque nouvelle commande !",
  },
  {
    keywords: ["merci", "super", "parfait", "excellent", "génial", "top", "ok merci"],
    response: "😊 Avec plaisir ! Je suis là pour vous aider à tout moment.\n\nN'hésitez pas si vous avez d'autres questions. Bonne journée sur Nexora ! 🌟",
  },
  {
    keywords: ["au revoir", "bye", "bonne journée", "à bientôt", "adieu"],
    response: "👋 Au revoir et bonne journée ! N'hésitez pas à revenir si vous avez besoin d'aide.\n\nL'équipe Nexora est toujours disponible pour vous. 🙏",
  },
];

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
      // Remplace en conservant les messages optimistes non encore confirmés
      setMessages(prev => {
        const confirmed = data as ChatMessage[];
        const stillPending = prev.filter(
          m => m._optimistic && !confirmed.some(c => c.content === m.content && c.sender === m.sender)
        );
        return [...confirmed, ...stillPending];
      });
      const unread = (data as ChatMessage[]).filter(
        m => !m.is_read && (m.sender === "admin" || m.sender === "bot")
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
      const trimmed = content.trim();

      // ── OPTIMISTIC UPDATE : affichage immédiat côté utilisateur ──
      const optimisticMsg: ChatMessage = {
        id: `optimistic_${Date.now()}`,
        user_id: userId,
        content: trimmed || (fileData ? `[${fileData.file_type}]` : ""),
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

      // 1. Insérer en base
      const { error } = await (supabase as any).from("chat_messages").insert({
        user_id: userId,
        content: trimmed || (fileData ? `[${fileData.file_type}]` : ""),
        sender: "user",
        is_read: false,
        is_archived: false,
        file_url: fileData?.file_url ?? null,
        file_type: fileData?.file_type ?? null,
        file_name: fileData?.file_name ?? null,
        file_expires_at: fileData?.file_expires_at ?? null,
      });

      if (error) {
        console.error("Erreur envoi message:", error);
        return;
      }

      // Sync après insert réussi
      fetchMessages();

      // 2. Réponse bot si texte
      if (trimmed) {
        const botReply = findBotResponse(trimmed);
        if (botReply) {
          setTimeout(async () => {
            await (supabase as any).from("chat_messages").insert({
              user_id: userId, content: botReply,
              sender: "bot", is_read: false, is_archived: false,
            });
            fetchMessages();
          }, 800);
        } else {
          setTimeout(async () => {
            await (supabase as any).from("chat_messages").insert({
              user_id: userId,
              content: "Je n'ai pas trouvé de réponse automatique à votre question. Un conseiller va vous répondre dans les plus brefs délais. 🙏",
              sender: "bot", is_read: false, is_archived: false,
            });
            await (supabase as any).from("nexora_notifications").insert({
              type: "chat_unknown_question",
              user_id: userId,
              message: `Question sans réponse : "${trimmed.slice(0, 100)}"`,
              is_read: false,
            }).catch(() => {});
            fetchMessages();
          }, 800);
        }
      }
    },
    [userId, fetchMessages]
  );

  const uploadFile = useCallback(async (file: File): Promise<{
    file_url: string; file_type: "image" | "video" | "doc";
    file_name: string; file_expires_at: string;
  } | null> => {
    if (!userId) return null;
    const path = `chat/${userId}/${Date.now()}_${file.name}`;
    let file_type: "image" | "video" | "doc" = "doc";
    if (file.type.startsWith("image/")) file_type = "image";
    else if (file.type.startsWith("video/")) file_type = "video";
    const { data, error } = await supabase.storage.from("chat-files").upload(path, file, { upsert: false });
    if (error || !data) { console.error("Upload error:", error); return null; }
    const { data: urlData } = supabase.storage.from("chat-files").getPublicUrl(path);
    return {
      file_url: urlData.publicUrl, file_type, file_name: file.name,
      file_expires_at: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
    };
  }, [userId]);

  const markAdminMessagesRead = useCallback(async () => {
    if (!userId) return;
    await (supabase as any).from("chat_messages").update({ is_read: true })
      .eq("user_id", userId).in("sender", ["admin", "bot"]).eq("is_read", false);
    setUnreadCount(0);
  }, [userId]);

  const requestOperator = useCallback(async () => {
    if (!userId) return;
    await (supabase as any).from("chat_messages").insert({
      user_id: userId,
      content: "🔔 **L'utilisateur demande à parler à un opérateur humain.**",
      sender: "bot", is_read: false, is_archived: false,
    });
    await (supabase as any).from("nexora_notifications").insert({
      type: "chat_operator_request", user_id: userId,
      message: "Un utilisateur demande à parler à un opérateur.", is_read: false,
    }).catch(() => {});
    fetchMessages();
  }, [userId, fetchMessages]);

  useEffect(() => {
    if (!userId) return;
    fetchMessages();
    const channel = supabase
      .channel(`chat_user_${userId}`)
      .on("postgres_changes" as any, {
        event: "*", schema: "public",
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
// HOOK ADMIN — messages stables (ne disparaissent pas)
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
      .from("chat_messages").select("*")
      .eq("is_archived", false)
      .order("created_at", { ascending: false });

    if (error || !msgs) { setLoading(false); return; }

    const grouped: Record<string, ChatMessage[]> = {};
    (msgs as ChatMessage[]).forEach(m => {
      if (!grouped[m.user_id]) grouped[m.user_id] = [];
      grouped[m.user_id].push(m);
    });

    const userIds = Object.keys(grouped);
    const { data: users } = await (supabase as any)
      .from("nexora_users").select("id, nom_prenom, email, avatar_url").in("id", userIds);

    const userMap: Record<string, any> = {};
    (users || []).forEach((u: any) => { userMap[u.id] = u; });

    const convs: ChatConversation[] = userIds.map(uid => {
      const userMsgs = grouped[uid].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      const last = userMsgs[userMsgs.length - 1];
      const unread = userMsgs.filter(m => !m.is_read && m.sender === "user").length;
      const u = userMap[uid];
      return {
        user_id: uid,
        user_name: u?.nom_prenom || "Utilisateur",
        user_email: u?.email || "",
        avatar_url: u?.avatar_url || null,
        last_message: last?.content || "",
        last_message_at: last?.created_at || "",
        unread_count: unread,
        messages: userMsgs,
        has_operator_request: userMsgs.some(m => m.content.includes("demande à parler à un opérateur")),
        has_unknown_question: userMsgs.some(m => m.content.includes("Question sans réponse")),
      };
    });

    convs.sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());
    setConversations(convs);
    setLoading(false);
  }, []);

  const sendAdminReply = useCallback(async (userId: string, content: string) => {
    if (!content.trim()) return;
    await (supabase as any).from("chat_messages").insert({
      user_id: userId, content: content.trim(),
      sender: "admin", is_read: false, is_archived: false,
    });
    // Pas de fetchConversations() ici → le realtime s'en charge → messages ne disparaissent pas
  }, []);

  const markUserMessagesRead = useCallback(async (userId: string) => {
    await (supabase as any).from("chat_messages").update({ is_read: true })
      .eq("user_id", userId).eq("sender", "user").eq("is_read", false);
    fetchConversations();
  }, [fetchConversations]);

  const archiveConversation = useCallback(async (userId: string) => {
    await (supabase as any).from("chat_messages").update({ is_archived: true }).eq("user_id", userId);
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
