import type { User } from './index';

export type NotificationType =
  | 'NEW_FOLLOWER'
  | 'POST_LIKE'
  | 'POST_COMMENT'
  | 'NEW_MESSAGE';

export type ReferenceType = 'post' | 'comment' | 'conversation' | 'follow';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  actorId: string;
  referenceId?: string | null;
  referenceType?: ReferenceType | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationWithActor extends Notification {
  actor: User;
}

export const NOTIFICATION_CONFIG: Record<
  NotificationType,
  {
    icon: string;
    getMessage: (actorName: string) => string;
    getLink: (referenceId?: string | null, referenceType?: string | null) => string;
  }
> = {
  NEW_FOLLOWER: {
    icon: 'UserPlus',
    getMessage: (actorName) => `${actorName} te ha seguido`,
    getLink: (_, __, actorUsername?: string) => `/usuario/${actorUsername}`,
  },
  POST_LIKE: {
    icon: 'Heart',
    getMessage: (actorName) => `${actorName} le dio like a tu publicacion`,
    getLink: () => '/comunidad',
  },
  POST_COMMENT: {
    icon: 'MessageCircle',
    getMessage: (actorName) => `${actorName} comento en tu publicacion`,
    getLink: () => '/comunidad',
  },
  NEW_MESSAGE: {
    icon: 'Mail',
    getMessage: (actorName) => `${actorName} te envio un mensaje`,
    getLink: () => '/mensajes',
  },
};
