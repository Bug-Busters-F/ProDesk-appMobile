import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AgentTicketCard, AgentTicketData } from '@/components/tickets/AgentTicketCard';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const MOCK_TICKETS: AgentTicketData[] = [
  { id: '12345', clientName: 'João Silva', category: 'INTERNET / SUPORTE', timeAgo: '15 min atrás', description: 'Problema de Conexão Wi-Fi intermitente no setor de vendas', status: 'PENDENTE' },
  { id: '12346', clientName: 'Maria Oliveira', category: 'SISTEMAS INTERNOS', timeAgo: '32 min atrás', description: 'Erro ao acessar o portal corporativo (Erro 403)', status: 'EM ATENDIMENTO' },
  { id: '12347', clientName: 'Carlos Souza', category: 'HARDWARE', timeAgo: '1h atrás', description: 'Troca de toner da impressora do RH solicitada', status: 'ESCALONADO' },
];

export default function AgentHome() {
  const router = useRouter();
  const { signOut } = useAuth();
  const [activeFilter, setActiveFilter] = useState('Todos');

  return (
    <SafeAreaView className="flex-1 bg-stone-50" edges={['top']}>
      <View className="px-6 pt-4 pb-2 flex-row justify-between items-center">
        <Text className="text-2xl font-bold text-slate-900">Chamados do Setor</Text>
      </View>
      <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
        {/* FILTROS HORIZONTAIS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
          {['Todos', 'Pendentes', 'Em atendimento'].map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                onPress={() => setActiveFilter(filter)}
                className={`px-5 py-2 rounded-full mr-3 ${isActive ? 'bg-orange-500' : 'bg-orange-50'}`}
              >
                <Text className={`font-bold ${isActive ? 'text-white' : 'text-orange-500'}`}>
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* LISTA DE CHAMADOS */}
        {MOCK_TICKETS.map(ticket => (
          <AgentTicketCard 
            key={ticket.id} 
            ticket={ticket} 
            onPress={() => router.push({
              pathname: '/(agent)/ticket/[id]',
              params: { id: ticket.id }
            })}
          />
        ))}
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}