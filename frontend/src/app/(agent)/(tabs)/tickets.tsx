import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AgentTicketCard, AgentTicketStatus } from '@/components/tickets/AgentTicketCard';
import { useTicketStore } from '@/stores/ticketStore';

const BACKEND_URL = 'http://10.0.2.2:3000/ProDeskApi';

export default function AgentTickets() {
  const router = useRouter();
  
  const {tickets, loading, selectedTicket, fetchTickets, fetchTicketById} = useTicketStore()

  const [activeFilter, setActiveFilter] = useState('Todos');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);
  
  const onRefresh = () => {
    setRefreshing(true);
    fetchTickets();
  };

  const mapStatusToUI = (backendStatus: string): AgentTicketStatus => {
    switch(backendStatus) {
      case 'OPEN': return 'PENDENTE';
      case 'IN_PROGRESS': return 'EM ATENDIMENTO';
      case 'ESCALATED': return 'ESCALONADO';
      default: return 'PENDENTE';
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    if (activeFilter === 'Todos') return true;
    if (activeFilter === 'Pendentes') return ticket.status === 'OPEN';
    if (activeFilter === 'Em atendimento') return ticket.status === 'IN_PROGRESS';
    return true;
  });

  return (
    <SafeAreaView className="flex-1 bg-stone-50" edges={['top']}>
      <View className="px-6 pt-4 pb-2 flex-row justify-between items-center">
        <Text className="text-2xl font-bold text-slate-900">Chamados do Setor</Text>
      </View>
      
      <ScrollView 
        className="flex-1 px-6 pt-4" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#f97316']} />
        }
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 h-10">
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

        {loading ? (
          <View className="mt-10 items-center">
            <ActivityIndicator size="large" color="#f97316" />
            <Text className="text-slate-400 mt-4">Carregando chamados...</Text>
          </View>
        ) : (
          filteredTickets.map(t => {
            const ticketId = t.id;
            const ticketTitle = t.title;
            const category = t.category;
            const description = t.description;
            const status = t.status;
            const createdAt = t.createdAt;

            return (
              <AgentTicketCard 
                key={ticketId} 
                ticket={{
                  id: ticketId,
                  title: ticketTitle,
                  clientName: 'Cliente', 
                  category: category,
                  timeAgo: new Date(createdAt).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                  description: description,
                  status: mapStatusToUI(status)
                }} 
                // onPress={fetchTicketById(ticketId)}
                onPress={async () => {
                try {
                  const res = await fetch(`${BACKEND_URL}/chat/ticket/${ticketId}`);
                  if (!res.ok) {
                    Alert.alert('Aviso', 'O chat deste chamado ainda não foi criado.');
                    return; 
                  }

                  const chatData = await res.json();
                  const chatId = chatData?.id || chatData?._id;
                  
                  if (chatId) {
                    router.push({
                      pathname: '/(client)/ticket/[id]',
                      params: { id: chatId }
                    });
                  } else {
                    Alert.alert('Aviso', 'O chat deste chamado não possui ID válido.');
                  }
                } catch (e) {
                  console.error(e);
                  Alert.alert('Erro', 'Falha ao conectar na sala do chamado.');
                }
              }}
              />
            )
          })
        )}

        {!loading && filteredTickets.length === 0 && (
           <Text className="text-center text-slate-400 mt-10">Nenhum chamado encontrado nesta categoria.</Text>
        )}

        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}