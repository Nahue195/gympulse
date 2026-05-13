import { Bell, CheckCheck } from 'lucide-react';
import { NotificationItem } from './NotificationItem';
import { SkeletonNotification } from './Skeleton';
import type { NotificationWithActor } from '../types/notifications';

interface NotificationPanelProps {
  notifications: NotificationWithActor[];
  loading: boolean;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  unreadCount: number;
}

export function NotificationPanel({
  notifications,
  loading,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClose,
  unreadCount,
}: NotificationPanelProps) {
  return (
    <div
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-slate-900 rounded-xl border border-slate-700 shadow-xl overflow-hidden animate-scaleIn z-50"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
        <h3 className="font-semibold text-white">Notificaciones</h3>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            <CheckCheck size={14} />
            Marcar todas como leidas
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="divide-y divide-slate-800">
            {[...Array(3)].map((_, i) => (
              <SkeletonNotification key={i} />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="p-4 bg-slate-800 rounded-full mb-4">
              <Bell size={32} className="text-slate-500" />
            </div>
            <p className="text-slate-400 font-medium">Sin notificaciones</p>
            <p className="text-slate-500 text-sm mt-1">
              Te avisaremos cuando tengas nuevas actividades
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={onMarkAsRead}
                onDelete={onDelete}
                onClose={onClose}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
