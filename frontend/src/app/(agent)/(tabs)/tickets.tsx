import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from 'expo-router';
import { AgentTicketCard, AgentTicketStatus } from '@/components/tickets/AgentTicketCard';
import api from '@/services/api';

export default function AgentTickets() {
  const router = useRouter();
  
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

const fetchTickets = async () => {
    try {
      const [ticketsResponse, categoriesResponse] = await Promise.all([
        api.get('/tickets'),
        api.get('/category')
      ]);

      let ticketsData = ticketsResponse.data;
      const categoriesData = categoriesResponse.data;
      const categoryDictionary: Record<string, string> = {};
      categoriesData.forEach((cat: any) => {
        const catId = cat.id || cat._id;
        categoryDictionary[catId] = cat.name;
      });
      const formattedTickets = ticketsData.map((t: any) => {
        const rawCategory = t.category || t.props?.category;
        let categoryName = 'Sem Categoria';

        if (typeof rawCategory === 'object' && rawCategory !== null) {
          categoryName = rawCategory.name || 'Sem Categoria';
        } else if (rawCategory) {
          categoryName = categoryDictionary[rawCategory] || rawCategory;
        }
        
        return {
          ...t,
          categoryName
        };
      });

      formattedTickets.sort((a: any, b: any) => {
        const dateA = a.createdAt || a.props?.createdAt || 0;
        const dateB = b.createdAt || b.props?.createdAt || 0;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });

      setTickets(formattedTickets);
    } catch (error: any) {
      console.log("ERRO API TICKETS:", error?.response?.data || error.message);
      Alert.alert("Erro", "Não foi possível carregar os chamados.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTickets();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchTickets();
  };

  const mapStatusToUI = (backendStatus: any): AgentTicketStatus => {
    const statusKey = typeof backendStatus === 'object' ? backendStatus.id : backendStatus;
    switch(statusKey) {
      case 'OPEN': return 'PENDENTE';
      case 'IN_PROGRESS': return 'EM ATENDIMENTO';
      case 'ESCALATED': return 'ESCALONADO';
      case 'CLOSED': return 'RESOLVIDO';
      default: return 'PENDENTE';
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const statusKey = typeof ticket.status === 'object' ? ticket.status.id : ticket.status;
    if (activeFilter === 'Todos') return true;
    if (activeFilter === 'Pendentes') return statusKey === 'OPEN';
    if (activeFilter === 'Em atendimento') return statusKey === 'IN_PROGRESS';
    if (activeFilter === 'Resolvidos') return statusKey === 'CLOSED';
    return true;
  });

  const handleOpenDetails = (ticketId: string) => {
    router.push({
      pathname: '/(agent)/ticket/details/[id]',
      params: { id: ticketId }
    });
  };

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
          {['Todos', 'Pendentes', 'Em atendimento', 'Resolvidos'].map((filter) => {
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
            const ticketId = t.id || t._id;
            const title = t.title || t.props?.title || 'Chamado sem título'; 
            const category = t.category || t.props?.category;
            const description = t.description || t.props?.description;
            const status = t.status || t.props?.status;
            const createdAt = t.createdAt || t.props?.createdAt;
            const escalationLevel = t.escalationLevel || t.props?.escalationLevel || 1;

            return (
              <AgentTicketCard 
                 key={ticketId} 
                 ticket={{
                  id: ticketId,
                  title: title,
                  clientName: 'Cliente', 
                  category: t.categoryName,
                  escalationLevel: escalationLevel,
                  timeAgo: new Date(createdAt).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                  description: description,
                  status: mapStatusToUI(status)
                }} 
                 onPress={() => handleOpenDetails(ticketId)}
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
