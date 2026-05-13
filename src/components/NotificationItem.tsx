import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { UserPlus, Heart, MessageCircle, Mail, X } from 'lucide-react';
import clsx from 'clsx';
import type { NotificationWithActor, NotificationType } from '../types/notifications';

interface NotificationItemProps {
  notification: NotificationWithActor;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const NOTIFICATION_ICONS: Record<NotificationType, typeof UserPlus> = {
  NEW_FOLLOWER: UserPlus,
  POST_LIKE: Heart,
  POST_COMMENT: MessageCircle,
  NEW_MESSAGE: Mail,
};

const NOTIFICATION_COLORS: Record<NotificationType, string> = {
  NEW_FOLLOWER: 'bg-blue-500',
  POST_LIKE: 'bg-red-500',
  POST_COMMENT: 'bg-green-500',
  NEW_MESSAGE: 'bg-purple-500',
};

function getNotificationMessage(
  type: NotificationType,
  actorName: string
): string {
  const messages: Record<NotificationType, string> = {
    NEW_FOLLOWER: `${actorName} te ha seguido`,
    POST_LIKE: `A ${actorName} le gusto tu publicacion`,
    POST_COMMENT: `${actorName} comento en tu publicacion`,
    NEW_MESSAGE: `${actorName} te envio un mensaje`,
  };
  return messages[type];
}

function getNotificationLink(
  type: NotificationType,
  actorUsername?: string
): string {
  const links: Record<NotificationType, string> = {
    NEW_FOLLOWER: `/usuario/${actorUsername}`,
    POST_LIKE: '/comunidad',
    POST_COMMENT: '/comunidad',
    NEW_MESSAGE: '/mensajes',
  };
  return links[type];
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  onClose,
}: NotificationItemProps) {
  const navigate = useNavigate();
  const Icon = NOTIFICATION_ICONS[notification.type];
  const iconColor = NOTIFICATION_COLORS[notification.type];

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    const link = getNotificationLink(notification.type, notification.actor.username);
    navigate(link);
    onClose();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(notification.id);
  };

  return (
    <div
      onClick={handleClick}
      className={clsx(
        'flex items-start gap-3 p-3 cursor-pointer transition-all hover:bg-slate-800 group',
        !notification.isRead && 'bg-slate-800/50'
      )}
    >
      {/* Avatar with icon overlay */}
      <div className="relative flex-shrink-0">
        {notification.actor.avatarUrl ? (
          <img
            src={notification.actor.avatarUrl}
            alt={notification.actor.displayName}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
            {notification.actor.displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <div
          className={clsx(
            'absolute -bottom-1 -right-1 p-1 rounded-full',
            iconColor
          )}
        >
          <Icon size={12} className="text-white" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={clsx('text-sm', notification.isRead ? 'text-slate-400' : 'text-white')}>
          {getNotificationMessage(notification.type, notification.actor.displayName)}
        </p>
        <p className="text-xs text-slate-500 mt-1">
          {formatDistanceToNow(new Date(notification.createdAt), {
            addSuffix: true,
            locale: es,
          })}
        </p>
      </div>

      {/* Unread indicator & delete button */}
      <div className="flex items-center gap-2">
        {!notification.isRead && (
          <div className="w-2 h-2 rounded-full bg-blue-500" />
        )}
        <button
          onClick={handleDelete}
          className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
