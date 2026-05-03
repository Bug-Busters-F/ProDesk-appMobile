import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, TextInput } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AgentTicketCard, AgentTicketStatus } from '@/components/tickets/AgentTicketCard';
import { Feather } from '@expo/vector-icons';
import api from '@/services/api';

export default function AgentTickets() {
  const router = useRouter();
  
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [focused, setFocused] = useState(false);
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
        
        return {
          ...t,
          category: categoryDictionary[rawCategory] || rawCategory || 'Sem Categoria'
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
  useEffect(() => {
    fetchTickets();
  }, []);
  const onRefresh = () => {
    setRefreshing(true);
    fetchTickets();
  };

  const filteredTickets = tickets.filter(ticket => {
    let statusMatch = true;
    if (activeFilter === 'Pendentes') statusMatch = ticket.status === 'OPEN';
    if (activeFilter === 'Em atendimento') statusMatch = ticket.status === 'IN_PROGRESS';
    if (activeFilter === 'Escalonados') statusMatch = ticket.status === 'ESCALATED';
    if (activeFilter === 'Resolvidos') statusMatch = ticket.status === 'CLOSED';
    let searchMatch = true;
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const title = (ticket.title || ticket.props?.title || '').toLowerCase();
      const id = (ticket.id || ticket._id || '').toLowerCase();
      
      searchMatch = title.includes(query) || id.includes(query);
    }

    return statusMatch && searchMatch;
  });

  const mapStatusToUI = (backendStatus: string): AgentTicketStatus => {
    switch(backendStatus) {
      case 'OPEN': return 'PENDENTE';
      case 'IN_PROGRESS': return 'EM ATENDIMENTO';
      case 'ESCALATED': return 'ESCALONADO';
      default: return 'PENDENTE';
    }
  };

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
        <View
            className={`flex-row items-center rounded-xl px-4 py-3 border mb-6 ${
                focused ? "bg-white border-orange-500" : "bg-white border-gray-200"
            }`}
        >
            <Feather name="search" size={20} color={focused ? "#F97316" : "#9CA3AF"} />
            <TextInput
                placeholder="Buscar por título ou protocolo..."
                placeholderTextColor="#9CA3AF"
                className="ml-3 flex-1 text-slate-700"
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 h-12">
          {['Todos', 'Pendentes', 'Em atendimento', 'Escalonados', 'Resolvidos'].map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                onPress={() => setActiveFilter(filter)}
                className={`px-5 py-2.5 rounded-full mr-3 ${isActive ? 'bg-orange-500' : 'bg-orange-50 border border-orange-100'}`}
              >
                <Text className={`font-bold ${isActive ? 'text-white' : 'text-orange-600'}`}>
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

            return (
              <AgentTicketCard 
                 key={ticketId} 
                 ticket={{
                  id: ticketId,
                  title: title,
                  clientName: 'Cliente', 
                  category: category,
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