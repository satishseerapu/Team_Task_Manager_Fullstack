import { createContext, useContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  pushNotification,
  clearNotifications,
} from '../store/slices/notificationsSlice';
import { storage } from '../utils/storage';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      dispatch(clearNotifications());
      return;
    }

    dispatch(fetchNotifications());

    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      auth: { token: storage.getToken() },
      transports: ['websocket'],
    });

    socket.on('taskAssigned', (payload) => {
      dispatch(pushNotification({
        _id: payload._id ?? Date.now().toString(),
        message: payload.message ?? `You were assigned: "${payload.taskTitle}"`,
        isRead: false,
        createdAt: new Date().toISOString(),
        type: 'task_assigned',
        meta: payload,
      }));
    });

    socket.on('connect', () => console.log('[Socket] connected:', socket.id));
    socket.on('disconnect', () => console.log('[Socket] disconnected'));

    socketRef.current = socket;
    return () => socket.disconnect();
  }, [user, dispatch]);

  return <NotificationContext.Provider value={null}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const dispatch = useDispatch();
  const list = useSelector((state) => state.notifications.list);
  const unreadCount = useSelector((state) => state.notifications.unreadCount);
  const loading = useSelector((state) => state.notifications.loading);

  return {
    notifications: list,
    unreadCount,
    loading,
    fetchNotifications: () => dispatch(fetchNotifications()),
    markAsRead: (id) => dispatch(markNotificationRead(id)),
    markAllAsRead: () => dispatch(markAllNotificationsRead()),
  };
}
