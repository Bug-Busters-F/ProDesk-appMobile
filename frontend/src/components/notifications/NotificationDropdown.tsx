import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNotifications } from '@/contexts/NotificationContext';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NotificationDropdownProps {
  onClose: () => void;
}

const { width } = Dimensions.get('window');

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onClose }) => {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const { user } = useAuth();
  const router = useRouter();

  const handleNotificationPress = async (notification: any) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    onClose();

    if (notification.type === 'access_request') {
      router.push('/(admin)/accessRequests');
      return;
    }

    const ticketId = notification.ticketId;
    const chatId = notification.chatId;

    if (ticketId) {
        if (user?.role === 'support') {
            router.push({
                pathname: '/(agent)/ticket/details/[id]',
                params: { id: ticketId }
            } as any);
        } else {
            router.push({
                pathname: '/(client)/ticket/[id]',
                params: { id: ticketId }
            } as any);
        }
    } 
    else if (chatId) {
        if (user?.role === 'support') {
            router.push({
                pathname: '/(agent)/ticket/details/[id]',
                params: { id: chatId }
            } as any);
        } else {
            router.push({
                pathname: '/(client)/ticket/[id]',
                params: { id: chatId }
            } as any);
        }
    }
  };

  return (
    <View 
      className="absolute top-16 right-0 z-50 bg-white rounded-2xl shadow-xl border border-gray-100"
      style={{ width: width * 0.85, maxHeight: 500 }}
    >
      <View className="p-4 border-b border-gray-100">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-bold text-gray-800">Notificações</Text>
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity onPress={markAllAsRead} className="flex-row items-center">
          <MaterialIcons name="done-all" size={16} color="#F97316" />
          <Text className="text-[11px] text-orange-500 font-bold ml-1">Marcar como visualizado</Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        {notifications.length === 0 ? (
          <View className="p-8 items-center">
            <MaterialIcons name="notifications-none" size={40} color="#E5E7EB" />
            <Text className="text-gray-400 mt-2">Nenhuma notificação</Text>
          </View>
        ) : (
          notifications.map((item) => {
            const timeLabel = formatDistanceToNow(new Date(item.createdAt), {
              addSuffix: true,
              locale: ptBR,
            });

            return (
              <TouchableOpacity 
                key={item.id}
                onPress={() => handleNotificationPress(item)}
                className={`p-4 border-b border-gray-50 ${item.read ? 'bg-white' : 'bg-orange-50/50'}`}
              >
                <View className="flex-row justify-between items-start mb-1">
                  <Text className={`text-sm flex-1 mr-2 ${item.read ? 'font-medium text-gray-700' : 'font-bold text-gray-900'}`}>
                    {item.title}
                  </Text>
                  <Text className="text-[10px] text-gray-400">{timeLabel}</Text>
                </View>
                <Text className="text-xs text-gray-500 leading-4">{item.message}</Text>
                {!item.read && (
                  <View className="absolute right-2 bottom-2 w-2 h-2 bg-orange-500 rounded-full" />
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};
