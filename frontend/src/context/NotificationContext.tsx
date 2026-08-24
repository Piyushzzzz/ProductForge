import React, { createContext, useContext, useState, useEffect } from 'react';
import { NotificationItem } from '../types/index.js';
import { api } from '../services/api.js';
import { useAuth } from './AuthContext.js';
import { io, Socket } from 'socket.io-client';

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (token) {
      fetchNotifications();
      const s = io('http://localhost:5000', {
        auth: { token }
      });
      setSocket(s);

      s.on('notification', (newNotif: NotificationItem) => {
        setNotifications((prev) => [newNotif, ...prev]);
      });

      return () => {
        s.disconnect();
      };
    } else {
      setNotifications([]);
      if (socket) socket.disconnect();
    }
  }, [token]);

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      // ignore
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // ignore
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
