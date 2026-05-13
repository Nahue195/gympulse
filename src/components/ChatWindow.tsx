import { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useMessages } from '../hooks/useMessages';
import type { ConversationWithUser } from '../types';
import { MessageBubble } from './MessageBubble';

interface ChatWindowProps {
  conversation: ConversationWithUser;
  onBack?: () => void;
}

export function ChatWindow({ conversation, onBack }: ChatWindowProps) {
  const { user } = useAuth();
  const { messages, loading, sendMessage, markAsRead } = useMessages(conversation.id);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read when viewing conversation
  useEffect(() => {
    markAsRead();
  }, [conversation.id]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const success = await sendMessage(newMessage);
    if (success) {
      setNewMessage('');
      inputRef.current?.focus();
    }
    setSending(false);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-slate-700 bg-slate-800 flex-shrink-0">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-all lg:hidden"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-emerald-400 flex items-center justify-center text-white font-semibold overflow-hidden flex-shrink-0">
          {conversation.otherUser.avatarUrl ? (
            <img
              src={conversation.otherUser.avatarUrl}
              alt={conversation.otherUser.displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            conversation.otherUser.displayName.charAt(0).toUpperCase()
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white truncate">{conversation.otherUser.displayName}</p>
          <p className="text-sm text-slate-400 truncate">@{conversation.otherUser.username}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-slate-400">No hay mensajes aun</p>
            <p className="text-sm text-slate-500 mt-1">Envia el primer mensaje</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.senderId === user?.id}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-slate-700 bg-slate-800 flex-shrink-0">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            maxLength={1000}
            className="flex-1 px-4 py-3 bg-slate-900 border-2 border-slate-700 rounded-full text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}
