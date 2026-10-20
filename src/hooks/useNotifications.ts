import { useCallback, useState } from 'react';
import type { IssueNotification } from '../types/issue';

/** Owns notification state and the common unread/read operations. */
export function useNotifications(initialNotifications: IssueNotification[] = []) {
  const [notifications, setNotifications] =
    useState<IssueNotification[]>(initialNotifications);

  const addNotification = useCallback((notification: IssueNotification) => {
    setNotifications((current) => [notification, ...current]);
  }, []);

  const markAsRead = useCallback((id: IssueNotification['id']) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id ? { ...notification, unread: false } : notification,
      ),
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, unread: false })),
    );
  }, []);

  const removeNotification = useCallback((id: IssueNotification['id']) => {
    setNotifications((current) =>
      current.filter((notification) => notification.id !== id),
    );
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.reduce(
    (count, notification) => count + Number(notification.unread),
    0,
  );

  return {
    notifications,
    setNotifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearNotifications,
  };
}
