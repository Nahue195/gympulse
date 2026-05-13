import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useUnreadMessages() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    try {
      // Get all conversations where user is a participant
      const { data: convData } = await supabase
        .from('conversations')
        .select('id')
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`);

      if (!convData || convData.length === 0) {
        setUnreadCount(0);
        return;
      }

      const conversationIds = (convData as any[]).map(c => c.id);

      // Count unread messages in those conversations
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .in('conversation_id', conversationIds)
        .neq('sender_id', user.id)
        .is('read_at', null);

      if (error) throw error;

      setUnreadCount(count ?? 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Subscribe to new messages
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('unread-messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchUnreadCount]);

  return { unreadCount, refresh: fetchUnreadCount };
}
