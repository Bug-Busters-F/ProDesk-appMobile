import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  TicketCard,
  TicketData,
  TicketPriority,
  TicketStatus,
} from '@/components/tickets/TicketCard';

const MOCK_TICKETS: TicketData[] = [
  {
    _id: '507f1f77bcf86cd799439011',
    title: 'Falha na IA ao categorizar produtos',
    category: 'ARTIFICIAL_INTELLIGENCE',
    priority: TicketPriority.HIGH,
    status: TicketStatus.IN_PROGRESS,
    description: 'A IA parou de funcionar na tela de produtos',
    createdAt: new Date().toISOString(),
    agentId: 'agent-123',
  },
  {
    _id: '507f191e810c19729de860ea',
    title: 'Dúvida acesso no BI',
    category: 'BUSINESS_INTELLIGENCE',
    priority: TicketPriority.LOW,
    status: TicketStatus.OPEN,
    description: 'Não consigo acessar o dashboard',
    createdAt: new Date(Date.now() - 86400000).toISOString(), 
    agentId: null,
  },
  {
    _id: '507f191e810c19729de860eb',
    title: 'Migração de servicos SCRUM',
    category: 'WEB_APP',
    priority: TicketPriority.MEDIUM,
    status: TicketStatus.CLOSED,
    description: 'Finalização da migração',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    closedAt: new Date().toISOString(),
    agentId: 'agent-123',
  },
];

export default function Tickets() {
  const router = useRouter();
  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 pt-12 px-6" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center justify-between mt-8 mb-6">
          <View>
            <Text className="text-2xl font-bold text-slate-900">Meus Chamados</Text>
            <Text className="text-slate-500">Gerencie suas solicitações de suporte</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(client)/newTicket')}
            className="bg-orange-500 w-12 h-12 rounded-xl items-center justify-center shadow-lg shadow-orange-300"
          >
            <Ionicons name="add" size={30} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8">
          {['Todos', 'Abertos', 'Em Progresso', 'Resolvidos'].map((filter, index) => (
            <TouchableOpacity
              key={filter}
              className={`px-4 py-2 rounded-full mr-2 ${index === 0 ? 'bg-orange-500' : 'bg-slate-50 border border-slate-100'}`}
            >
              <Text className={`font-medium ${index === 0 ? 'text-white' : 'text-slate-500'}`}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {MOCK_TICKETS.map(ticket => (
          <TicketCard
            key={ticket._id}
            ticket={ticket}
            onPress={() => router.push({
              pathname: '/(client)/ticket/[id]',
              params: { id: ticket._id }
            })}
          />
        ))}

        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
