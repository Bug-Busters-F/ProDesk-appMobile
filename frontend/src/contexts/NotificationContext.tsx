import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import EventSource, { MessageEvent } from 'react-native-sse';
import { Platform } from 'react-native';
import { useAuth } from './AuthContext';
import { NotificationDTO } from '@/services/dtos/notificationDTO';
import { getNotifications, markAsRead as markAsReadAPI } from '@/services/api';

interface NotificationContextData {
  notifications: NotificationDTO[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextData>({} as NotificationContextData);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const { user } = useAuth();
  const esRef = useRef<EventSource | null>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const fetchHistory = async () => {
    try {
      const history = await getNotifications();
      setNotifications(history);
    } catch (error) {
      console.error('Erro ao buscar histórico de notificações:', error);
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
    // Implementação futura se o backend suportar mark-all
    // Por enquanto, podemos iterar ou apenas atualizar localmente se necessário
    const unreadOnes = notifications.filter(n => !n.read);
    await Promise.all(unreadOnes.map(n => markAsReadAPI(n.id)));
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  useEffect(() => {
    if (user?.token) {
      fetchHistory();

      const baseURL = Platform.OS === 'android' 
        ? 'http://10.0.2.2:3000/ProDeskApi' 
        : 'http://localhost:3000/ProDeskApi';
      
      const url = `${baseURL}/notifications/stream`;

      // Inicializa a conexão SSE
      const es = new EventSource(url, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      esRef.current = es;

      es.addEventListener('open', () => {
        console.log('SSE: Conexão aberta');
      });

      es.addEventListener('message', (event: MessageEvent) => {
        if (event.data) {
          try {
            const newNotification: NotificationDTO = JSON.parse(event.data);
            setNotifications(prev => [newNotification, ...prev]);
          } catch (e) {
            console.error('SSE: Erro ao processar mensagem', e);
          }
        }
      });

      es.addEventListener('error', (event) => {
        console.error('SSE: Erro na conexão', event);
      });

      return () => {
        console.log('SSE: Fechando conexão');
        es.close();
        esRef.current = null;
      };
    } else {
        // Se deslogar, limpa as notificações
        setNotifications([]);
        if (esRef.current) {
            esRef.current.close();
            esRef.current = null;
        }
    }
  }, [user]);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
