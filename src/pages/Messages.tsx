import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useConversations } from '../hooks/useConversations';
import type { ConversationWithUser, User } from '../types';
import { ConversationList } from '../components/ConversationList';
import { ChatWindow } from '../components/ChatWindow';

export function Messages() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const { conversations, loading, getOrCreateConversation, refresh } = useConversations();
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithUser | null>(null);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 1024);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle incoming "to" parameter to start a new conversation
  useEffect(() => {
    const toUserId = searchParams.get('to');
    if (toUserId && user && toUserId !== user.id) {
      startConversationWith(toUserId);
    }
  }, [searchParams, user]);

  // Handle incoming "conversation" parameter to open a specific conversation
  useEffect(() => {
    const conversationId = searchParams.get('conversation');
    if (conversationId && conversations.length > 0) {
      const convList = conversations as ConversationWithUser[];
      const conv = convList.find(c => c.id === conversationId);
      if (conv) {
        setSelectedConversation(conv);
        setSearchParams({});
      }
    }
  }, [searchParams, conversations]);

  async function startConversationWith(otherUserId: string) {
    try {
      // Get or create conversation
      const conversationId = await getOrCreateConversation(otherUserId);
      if (!conversationId) return;

      // Get user info
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', otherUserId)
        .single();

      if (userData) {
        const userRecord = userData;
        const otherUser: User = {
          id: userRecord.id,
          displayName: userRecord.display_name,
          username: userRecord.username,
          avatarUrl: userRecord.avatar_url,
          createdAt: userRecord.created_at
        };

        // Create a temporary conversation object
        const tempConversation: ConversationWithUser = {
          id: conversationId,
          participant1: user!.id < otherUserId ? user!.id : otherUserId,
          participant2: user!.id < otherUserId ? otherUserId : user!.id,
          lastMessageAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          otherUser
        };

        setSelectedConversation(tempConversation);
      }

      // Clear the "to" parameter
      setSearchParams({});
      refresh();
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  }

  // Select first conversation when loaded (desktop only)
  useEffect(() => {
    const convList = conversations as ConversationWithUser[];
    if (!isMobileView && convList.length > 0 && !selectedConversation) {
      setSelectedConversation(convList[0]);
    }
  }, [conversations, isMobileView]);

  // Update selected conversation when conversations refresh
  useEffect(() => {
    if (selectedConversation) {
      const convList = conversations as ConversationWithUser[];
      const updated = convList.find(c => c.id === selectedConversation.id);
      if (updated) {
        setSelectedConversation(updated);
      }
    }
  }, [conversations]);

  const handleSelectConversation = (conversation: ConversationWithUser) => {
    setSelectedConversation(conversation);
  };

  const handleBack = () => {
    setSelectedConversation(null);
  };

  // Mobile view: show either list or chat
  if (isMobileView) {
    return (
      <div className="h-[calc(100vh-8rem)]">
        {selectedConversation ? (
          <ChatWindow
            conversation={selectedConversation}
            onBack={handleBack}
          />
        ) : (
          <div className="h-full bg-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-700">
              <h1 className="text-xl font-bold text-white">Mensajes</h1>
            </div>
            <ConversationList
              conversations={conversations as ConversationWithUser[]}
              selectedId={undefined}
              onSelect={handleSelectConversation}
              loading={loading}
            />
          </div>
        )}
      </div>
    );
  }

  // Desktop view: split layout
  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4">
      {/* Conversation List */}
      <div className="w-80 flex-shrink-0 bg-slate-800 rounded-xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-700">
          <h1 className="text-xl font-bold text-white">Mensajes</h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ConversationList
            conversations={conversations as ConversationWithUser[]}
            selectedId={selectedConversation?.id}
            onSelect={handleSelectConversation}
            loading={loading}
          />
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 bg-slate-800 rounded-xl overflow-hidden">
        {selectedConversation ? (
          <ChatWindow conversation={selectedConversation} />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <MessageCircle size={64} className="text-slate-600 mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Tus mensajes</h2>
            <p className="text-slate-400 max-w-sm">
              Selecciona una conversacion o visita el perfil de un usuario para enviarle un mensaje
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
