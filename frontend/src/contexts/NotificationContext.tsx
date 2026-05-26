import React, { createContext, useContext, useEffect, useState, useRef, useMemo } from 'react';
import EventSource, { MessageEvent } from 'react-native-sse';
import { Platform, AppState, AppStateStatus } from 'react-native';
import { useAuth } from './AuthContext';
import { NotificationDTO } from '@/services/dtos/notificationDTO';
import { getNotifications, markAsRead as markAsReadAPI } from '@/services/api';

interface NotificationContextData {
  notifications: NotificationDTO[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearReadNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextData>({} as NotificationContextData);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const { user } = useAuth();
  const esRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const appState = useRef(AppState.currentState);

  const sortedNotifications = useMemo(() => {
    return [...notifications].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [notifications]);

  const unreadCount = useMemo(() => {
    return sortedNotifications.filter(n => !n.read).length;
  }, [sortedNotifications]);

  const fetchHistory = async () => {
    if (!user?.token) return;
    try {
      const history = await getNotifications();
      setNotifications(history);
    } catch (error) {
      console.error('Erro ao buscar histórico de notificações:', error);
    }
  };

  const connectSSE = () => {
    if (!user?.token || esRef.current) return;

    const baseURL = Platform.OS === 'android' 
      ? 'http://10.0.2.2:3000/ProDeskApi' 
      : 'http://localhost:3000/ProDeskApi';
    
    const url = `${baseURL}/notifications/stream`;

    const es = new EventSource(url, {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    });

    esRef.current = es;

    es.addEventListener('open', () => {
      console.log('SSE: Conexão aberta');
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    });

    es.addEventListener('message', (event: MessageEvent) => {
      if (event.data) {
        try {
          const newNotification: NotificationDTO = JSON.parse(event.data);
          
          setNotifications(prev => {
            const exists = prev.some(n => n.id === newNotification.id);
            if (exists) return prev;
            return [newNotification, ...prev];
          });
        } catch (e) {
          console.error('SSE: Erro ao processar mensagem', e);
        }
      }
    });

    es.addEventListener('error', (event) => {
      console.error('SSE: Erro na conexão', event);
      disconnectSSE();
      
      if (user?.token && !reconnectTimeoutRef.current) {
        reconnectTimeoutRef.current = setTimeout(() => {
            reconnectTimeoutRef.current = null;
            connectSSE();
        }, 5000);
      }
    });
  };

  const disconnectSSE = () => {
    if (esRef.current) {
      console.log('SSE: Fechando conexão');
      esRef.current.close();
      esRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await markAsReadAPI(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  const markAllAsRead = async () => {
    const unreadOnes = notifications.filter(n => !n.read);
    if (unreadOnes.length === 0) return;
    
    try {
        await Promise.all(unreadOnes.map(n => markAsReadAPI(n.id)));
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
        console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  const clearReadNotifications = () => {
    setNotifications(prev => prev.filter(n => !n.read));
  };

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('App voltou para o primeiro plano, reconectando SSE...');
        fetchHistory(); 
        connectSSE();
      } else if (nextAppState === 'background') {
        console.log('App minimizado, encerrando SSE para poupar recursos.');
        disconnectSSE();
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    if (user?.token) {
      fetchHistory();
      connectSSE();
    } else {
      setNotifications([]);
      disconnectSSE();
    }

    return () => {
      subscription.remove();
      disconnectSSE();
    };
  }, [user]);

  return (
    <NotificationContext.Provider value={{ 
        notifications: sortedNotifications, 
        unreadCount, 
        markAsRead, 
        markAllAsRead, 
        clearReadNotifications 
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
