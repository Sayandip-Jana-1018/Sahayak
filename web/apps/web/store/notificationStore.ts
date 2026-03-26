import { create } from 'zustand';

export interface Notification {
  id: string;
  type: 'sos' | 'medication' | 'device' | 'location' | 'general';
  title: string;
  body: string;
  timestamp: number;
  read: boolean;
  link?: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
}

const MAX_NOTIFICATIONS = 50;

function loadFromStorage(): Notification[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('sahayak-notifications');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(notifications: Notification[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('sahayak-notifications', JSON.stringify(notifications.slice(0, MAX_NOTIFICATIONS)));
  } catch { /* quota exceeded — ignore */ }
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: loadFromStorage(),
  unreadCount: loadFromStorage().filter((n) => !n.read).length,

  addNotification: (n) => {
    const newNotif: Notification = {
      ...n,
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
      read: false,
    };
    const updated = [newNotif, ...get().notifications].slice(0, MAX_NOTIFICATIONS);
    saveToStorage(updated);
    set({ notifications: updated, unreadCount: updated.filter((x) => !x.read).length });
  },

  markRead: (id) => {
    const updated = get().notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    saveToStorage(updated);
    set({ notifications: updated, unreadCount: updated.filter((x) => !x.read).length });
  },

  markAllRead: () => {
    const updated = get().notifications.map((n) => ({ ...n, read: true }));
    saveToStorage(updated);
    set({ notifications: updated, unreadCount: 0 });
  },

  clearAll: () => {
    saveToStorage([]);
    set({ notifications: [], unreadCount: 0 });
  },
}));
