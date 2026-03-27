import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getNexoraUser } from "@/lib/nexora-auth";

export interface ChatMessage {
  id: string;
  user_id: string;
  content: string;
  sender: "user" | "admin";
  is_read: boolean;
  is_archived: boolean;
  created_at: string;
}

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
      setMessages(data as ChatMessage[]);
      const unread = (data as ChatMessage[]).filter(
        (m) => !m.is_read && m.sender === "admin"
      ).length;
      setUnreadCount(unread);
    }
    setLoading(false);
  }, [userId]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!userId || !content.trim()) return;
      const { error } = await (supabase as any).from("chat_messages").insert({
        user_id: userId,
        content: content.trim(),
        sender: "user",
        is_read: false,
        is_archived: false,
      });
      if (error) console.error("Erreur envoi message:", error);
    },
    [userId]
  );

  const markAdminMessagesRead = useCallback(async () => {
    if (!userId) return;
    await (supabase as any)
      .from("chat_messages")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("sender", "admin")
      .eq("is_read", false);
    setUnreadCount(0);
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    fetchMessages();

    const channel = supabase
      .channel(`chat_user_${userId}`)
      .on(
        "postgres_changes" as any,
        {
          event: "*",
          schema: "public",
          table: "chat_messages",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchMessages]);

  return { messages, unreadCount, loading, sendMessage, markAdminMessagesRead, fetchMessages };
}

// ── Admin hook ─────────────────────────────────────────────────────────────
export interface ChatConversation {
  user_id: string;
  user_name: string;
  user_email: string;
  avatar_url: string | null;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  messages: ChatMessage[];
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

    // Group by user_id
    const grouped: Record<string, ChatMessage[]> = {};
    (msgs as ChatMessage[]).forEach((m) => {
      if (!grouped[m.user_id]) grouped[m.user_id] = [];
      grouped[m.user_id].push(m);
    });

    // Fetch user info
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
      return {
        user_id: uid,
        user_name: u?.nom_prenom || "Utilisateur",
        user_email: u?.email || "",
        avatar_url: u?.avatar_url || null,
        last_message: last?.content || "",
        last_message_at: last?.created_at || "",
        unread_count: unread,
        messages: userMsgs,
      };
    });

    // Sort by last message date
    convs.sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());
    setConversations(convs);
    setLoading(false);
  }, []);

  const sendAdminReply = useCallback(async (userId: string, content: string) => {
    if (!content.trim()) return;
    const { error } = await (supabase as any).from("chat_messages").insert({
      user_id: userId,
      content: content.trim(),
      sender: "admin",
      is_read: false,
      is_archived: false,
    });
    if (error) console.error("Erreur réponse admin:", error);
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

  return { conversations, loading, totalUnread, sendAdminReply, markUserMessagesRead, archiveConversation, fetchConversations };
}
