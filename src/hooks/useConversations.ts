import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { ConversationWithUser, User } from '../types';

export function useConversations() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationWithUser[]>([]);
  const [loading, setLoading] = useState(true);

  const loadConversations = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get all conversations where user is a participant
      const { data: convData, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      if (convData) {
        // For each conversation, get the other user and last message
        const conversationsWithUsers = await Promise.all(
          convData.map(async (conv: any) => {
            const otherUserId = conv.participant_1 === user.id
              ? conv.participant_2
              : conv.participant_1;

            // Get other user info
            const { data: userData } = await supabase
              .from('users')
              .select('*')
              .eq('id', otherUserId)
              .single();

            // Get last message
            const { data: lastMsgData } = await supabase
              .from('messages')
              .select('*')
              .eq('conversation_id', conv.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();

            // Get unread count
            const { count: unreadCount } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('conversation_id', conv.id)
              .neq('sender_id', user.id)
              .is('read_at', null);

            const userRecord = userData as any;
            const msgRecord = lastMsgData as any;

            const otherUser: User = userRecord ? {
              id: userRecord.id,
              displayName: userRecord.display_name,
              username: userRecord.username,
              avatarUrl: userRecord.avatar_url,
              createdAt: userRecord.created_at
            } : {
              id: otherUserId,
              displayName: 'Usuario desconocido',
              username: 'unknown',
              createdAt: ''
            };

            return {
              id: conv.id,
              participant1: conv.participant_1,
              participant2: conv.participant_2,
              lastMessageAt: conv.last_message_at,
              createdAt: conv.created_at,
              otherUser,
              lastMessage: msgRecord ? {
                id: msgRecord.id,
                conversationId: msgRecord.conversation_id,
                senderId: msgRecord.sender_id,
                content: msgRecord.content,
                readAt: msgRecord.read_at,
                createdAt: msgRecord.created_at
              } : undefined,
              unreadCount: unreadCount ?? 0
            };
          })
        );

        setConversations(conversationsWithUsers);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Subscribe to new messages
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        () => {
          // Reload conversations when messages change
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, loadConversations]);

  async function getOrCreateConversation(otherUserId: string): Promise<string | null> {
    if (!user) return null;

    try {
      const { data, error } = await (supabase.rpc as any)('get_or_create_conversation', {
        p_user_1: user.id,
        p_user_2: otherUserId
      });

      if (error) throw error;

      loadConversations();
      return data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  }

  return {
    conversations,
    loading,
    refresh: loadConversations,
    getOrCreateConversation
  };
}
