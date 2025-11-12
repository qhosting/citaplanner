/**
 * Notification Store
 * 
 * Estado global para gestionar notificaciones en tiempo real
 */

import { create } from 'zustand';

export interface Notification {
  id: string;
  type: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: Date;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  
  // Actions
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  setNotifications: (notifications: Notification[]) => void;
  setLoading: (loading: boolean) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  addNotification: (notification) => {
    set((state) => {
      // Evitar duplicados
      if (state.notifications.some((n) => n.id === notification.id)) {
        return state;
      }

      const newNotifications = [notification, ...state.notifications];
      const unreadCount = newNotifications.filter((n) => !n.isRead).length;

      return {
        notifications: newNotifications,
        unreadCount,
      };
    });
  },

  markAsRead: (id) => {
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      );
      const unreadCount = notifications.filter((n) => !n.isRead).length;

      return {
        notifications,
        unreadCount,
      };
    });
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  },

  removeNotification: (id) => {
    set((state) => {
      const notifications = state.notifications.filter((n) => n.id !== id);
      const unreadCount = notifications.filter((n) => !n.isRead).length;

      return {
        notifications,
        unreadCount,
      };
    });
  },

  setNotifications: (notifications) => {
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.isRead).length,
    });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  clearAll: () => {
    set({
      notifications: [],
      unreadCount: 0,
    });
  },
}));
