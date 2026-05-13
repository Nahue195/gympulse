import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { MessageCircle } from 'lucide-react';
import type { ConversationWithUser } from '../types';

interface ConversationListProps {
  conversations: ConversationWithUser[];
  selectedId?: string;
  onSelect: (conversation: ConversationWithUser) => void;
  loading?: boolean;
}

export function ConversationList({ conversations, selectedId, onSelect, loading }: ConversationListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <MessageCircle size={48} className="text-slate-600 mb-4" />
        <p className="text-slate-400">No hay conversaciones</p>
        <p className="text-sm text-slate-500 mt-1">
          Visita el perfil de un usuario para enviarle un mensaje
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-700">
      {conversations.map((conversation) => {
        const isSelected = selectedId === conversation.id;
        const hasUnread = (conversation.unreadCount ?? 0) > 0;

        return (
          <button
            key={conversation.id}
            onClick={() => onSelect(conversation)}
            className={`w-full flex items-center gap-3 p-4 text-left transition-colors ${
              isSelected
                ? 'bg-blue-600/20'
                : 'hover:bg-slate-700/50'
            }`}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-emerald-400 flex items-center justify-center text-white font-semibold overflow-hidden">
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
              {hasUnread && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {conversation.unreadCount}
                </span>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className={`font-semibold truncate ${hasUnread ? 'text-white' : 'text-slate-200'}`}>
                  {conversation.otherUser.displayName}
                </p>
                {conversation.lastMessage && (
                  <span className="text-xs text-slate-500 flex-shrink-0">
                    {formatDistanceToNow(new Date(conversation.lastMessage.createdAt), {
                      addSuffix: false,
                      locale: es
                    })}
                  </span>
                )}
              </div>
              {conversation.lastMessage && (
                <p className={`text-sm truncate ${hasUnread ? 'text-slate-300' : 'text-slate-400'}`}>
                  {conversation.lastMessage.content}
                </p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
