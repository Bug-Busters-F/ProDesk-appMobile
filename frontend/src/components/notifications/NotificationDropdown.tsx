import React from 'react';
import { View, Text, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'Novo Chamado',
    message: 'Um novo chamado foi aberto por João Silva.',
    time: '5 min atrás',
    isRead: false,
  },
  {
    id: '2',
    title: 'Atualização de Status',
    message: 'O chamado #9831 foi marcado como resolvido.',
    time: '1h atrás',
    isRead: true,
  },
  {
    id: '3',
    title: 'Mensagem de Suporte',
    message: 'Você recebeu uma nova mensagem no chat do suporte.',
    time: '2h atrás',
    isRead: true,
  },
];

interface NotificationDropdownProps {
  onClose: () => void;
}

const { width } = Dimensions.get('window');

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onClose }) => {
  return (
    <View 
      className="absolute top-16 right-0 z-50 bg-white rounded-2xl shadow-xl border border-gray-100"
      style={{ width: width * 0.85, maxHeight: 400 }}
    >
      <View className="p-4 border-b border-gray-100 flex-row justify-between items-center">
        <Text className="text-lg font-bold text-gray-800">Notificações</Text>
        <TouchableOpacity onPress={onClose}>
          <MaterialIcons name="close" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={MOCK_NOTIFICATIONS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity className={`p-4 border-b border-gray-50 ${item.isRead ? 'bg-white' : 'bg-orange-50/30'}`}>
            <View className="flex-row justify-between items-start mb-1">
              <Text className={`text-sm ${item.isRead ? 'font-medium text-gray-700' : 'font-bold text-gray-900'}`}>
                {item.title}
              </Text>
              <Text className="text-xs text-gray-400">{item.time}</Text>
            </View>
            <Text className="text-xs text-gray-500 leading-4">{item.message}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View className="p-8 items-center">
            <Text className="text-gray-400">Nenhuma notificação</Text>
          </View>
        }
      />

      <TouchableOpacity className="p-3 items-center">
        <Text className="text-orange-500 font-semibold text-sm">Ver todas</Text>
      </TouchableOpacity>
    </View>
  );
};
