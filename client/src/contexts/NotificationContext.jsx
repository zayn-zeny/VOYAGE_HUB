import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // Connect to Socket.IO using standard proxy path
    const socketUrl = window.location.origin;
    const newSocket = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('Socket.IO connected');
      newSocket.emit('join', user._id);
    });

    newSocket.on('notification', (notification) => {
      console.log('Real-time notification received:', notification);
      setNotifications((prev) => [notification, ...prev]);

      // Show react-hot-toast alert
      toast.success(notification.message, {
        duration: 5000,
        position: 'top-right',
        icon: '✈️',
      });
    });

    newSocket.on('disconnect', () => {
      console.log('Socket.IO disconnected');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const clearNotifications = () => {
    setNotifications([]);
  };

  const markAsRead = (index) => {
    setNotifications((prev) => prev.filter((_, idx) => idx !== index));
  };

  return (
    <NotificationContext.Provider value={{ socket, notifications, clearNotifications, markAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
