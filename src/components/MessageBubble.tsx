import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Check, CheckCheck } from 'lucide-react';
import type { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const timeAgo = formatDistanceToNow(new Date(message.createdAt), {
    addSuffix: true,
    locale: es
  });

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
          isOwn
            ? 'bg-blue-600 text-white rounded-br-md'
            : 'bg-slate-700 text-white rounded-bl-md'
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        <div className={`flex items-center gap-1 mt-1 ${
          isOwn ? 'justify-end' : 'justify-start'
        }`}>
          <span className={`text-xs ${isOwn ? 'text-blue-200' : 'text-slate-400'}`}>
            {timeAgo}
          </span>
          {isOwn && (
            message.readAt ? (
              <CheckCheck size={14} className="text-blue-200" />
            ) : (
              <Check size={14} className="text-blue-300" />
            )
          )}
        </div>
      </div>
    </div>
  );
}
