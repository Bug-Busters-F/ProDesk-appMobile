import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import {
  TicketCard,
  TicketData,
  TicketPriority,
  TicketStatus,
} from '@/components/tickets/TicketCard';

const BACKEND_URL = 'http://10.0.2.2:3000/ProDeskApi';

export default function Tickets() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Todos');

  const fetchTickets = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/tickets`);
      
      if (!response.ok) {
        throw new Error('Falha ao buscar chamados');
      }
      const data = await response.json();

      const myTickets = data.filter((t: any) => t.clientId === user?.id);

      const formattedTickets: TicketData[] = myTickets.map((t: any) => ({
        _id: t.id || t._id,
        title: t.title || t.props?.title,
        category: t.category || t.props?.category,
        priority: (t.priority || t.props?.priority) as TicketPriority,
        status: (t.status || t.props?.status) as TicketStatus,
        description: t.description || t.props?.description,
        createdAt: t.createdAt || t.props?.createdAt,
        agentId: t.agentId || t.props?.agentId,
        closedAt: t.closedAt || t.props?.closedAt,
      }));

      formattedTickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setTickets(formattedTickets);
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível carregar os seus chamados.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTickets();
    }, [user?.id])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchTickets();
  };

  const filteredTickets = tickets.filter(ticket => {
    if (activeFilter === 'Todos') return true;
    if (activeFilter === 'Abertos') return ticket.status === 'OPEN';
    if (activeFilter === 'Em Progresso') return ticket.status === 'IN_PROGRESS';
    if (activeFilter === 'Resolvidos') return ticket.status === 'CLOSED';
    return true;
  });

  return (
    <View className="flex-1 bg-white">
      <ScrollView 
        className="flex-1 pt-12 px-6" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#f97316']} />
        }
      >
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

        {/* FILTROS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8 h-10">
          {['Todos', 'Abertos', 'Em Progresso', 'Resolvidos'].map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                onPress={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-full mr-2 ${isActive ? 'bg-orange-500' : 'bg-slate-50 border border-slate-100'}`}
              >
                <Text className={`font-medium ${isActive ? 'text-white' : 'text-slate-500'}`}>
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* LISTA DE CHAMADOS OU LOADING */}
        {loading ? (
          <View className="mt-10 items-center">
            <ActivityIndicator size="large" color="#f97316" />
            <Text className="text-slate-400 mt-4">Carregando chamados...</Text>
          </View>
        ) : (
          filteredTickets.map(ticket => (
            <TicketCard
              key={ticket._id}
              ticket={ticket}
              onPress={async () => {
                try {
                  const res = await fetch(`${BACKEND_URL}/chat/ticket/${ticket._id}`); 
                  const chatData = await res.json();
                  const chatId = chatData?.id || chatData?._id;
                  
                  if (chatId) {
                    router.push({
                      pathname: '/(client)/ticket/[id]',
                      params: { id: chatId }
                    });
                  } else {
                    Alert.alert('Aviso', 'O chat deste chamado ainda não foi criado.');
                  }
                } catch (e) {
                  console.error(e);
                  Alert.alert('Erro', 'Falha ao conectar na sala do chamado.');
                }
              }}
            />
          ))
        )}

        {!loading && filteredTickets.length === 0 && (
          <Text className="text-center text-slate-400 mt-10">
            Nenhum chamado encontrado nesta categoria.
          </Text>
        )}

        <View className="h-10" />
      </ScrollView>
    </View>
  );
}