import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, Modal, TextInput } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { api, useAuth } from '@/contexts/AuthContext';
import {
  TicketCard,
  TicketData,
  TicketPriority,
  TicketStatus,
} from '@/components/tickets/TicketCard';

export default function Tickets() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [ticketToClose, setTicketToClose] = useState<string | null>(null);
  const [closeReason, setCloseReason] = useState('');

  const fetchTickets = async () => {
    try {
      const response = await api.get('/tickets');
      const data = response.data; 

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
    } catch (error: any) {
      console.log("ERRO API TICKETS CLIENTE:", error?.response?.data || error.message);
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

  const confirmClosing = async () => {
    if (!closeReason.trim()) {
      Alert.alert('Aviso', 'Por favor, descreva o motivo para encerrar o chamado.');
      return;
    }

    try {
      await api.put(`/tickets/${ticketToClose}/status`, {
        status: 'CLOSED',
        solution: closeReason, 
      });

      setShowCloseModal(false);
      setCloseReason('');
      setTicketToClose(null);
      Alert.alert('Sucesso', 'Chamado encerrado com sucesso!');
      
      fetchTickets();

    } catch (error: any) {
      const apiMessage = error?.response?.data?.message;
      const errorMessage = Array.isArray(apiMessage) 
        ? apiMessage.join('\n') 
        : (apiMessage || 'Falha ao encerrar chamado.');

      Alert.alert('Erro', errorMessage);
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    if (activeFilter === 'Todos') return true;
    if (activeFilter === 'Abertos') return ticket.status === 'OPEN';
    if (activeFilter === 'Em Progresso') return ticket.status === 'IN_PROGRESS';
    if (activeFilter === 'Resolvidos') return ticket.status === 'CLOSED';
    return true;
  });

  return (
    <View className="flex-1 bg-stone-50">
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
            <View key={ticket._id} className="relative">
              <TicketCard
                ticket={ticket}
                onPress={async () => {
                  try {
                    const res = await api.get(`/chat/ticket/${ticket._id}`); 
                    const chatData = res.data;
                    const chatId = chatData?.id || chatData?._id;
                    
                    if (chatId) {
                      router.push({
                        pathname: '/(client)/ticket/[id]',
                        params: { 
                          id: chatId,
                          ticketId: ticket._id 
                        }
                      });
                    } else {
                      Alert.alert('Aviso', 'O chat deste chamado ainda não foi criado.');
                    }
                  } catch (e: any) {
                    console.log("ERRO API CHAT CLIENTE:", e?.response?.data || e.message);
                    Alert.alert('Erro', 'Falha ao conectar na sala do chamado.');
                  }
                }}
              />
              
              {/* BOTÃO DE 3 PONTINHOS SOBREPOSTO AO CARD */}
              {ticket.status !== 'CLOSED' && (
                <TouchableOpacity
                  onPress={() => {
                    setTicketToClose(ticket._id);
                    setShowCloseModal(true);
                  }}
                  className="absolute top-4 right-4 w-8 h-8 bg-red-50 rounded-full items-center justify-center z-10 border border-red-100 shadow-sm"
                >
                  <Feather color="#ef4444" name="x" size={16}/>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}

        {!loading && filteredTickets.length === 0 && (
          <Text className="text-center text-slate-400 mt-10">
            Nenhum chamado encontrado nesta categoria.
          </Text>
        )}

        <View className="h-10" />
      </ScrollView>

      {/* MODAL DE ENCERRAR CHAMADO (CLIENTE) */}
      <Modal
        visible={showCloseModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCloseModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white pt-4 pb-8 px-6 rounded-t-3xl shadow-2xl">
            
            {/* Tracinho de arrastar */}
            <View className="items-center mb-6">
              <View className="w-12 h-1.5 bg-gray-200 rounded-full" />
            </View>

            <View className="flex-row items-center mb-4">
              <Feather name="check-circle" size={24} color="#ef4444" className="mr-2" />
              <Text className="text-xl font-bold text-slate-800 ml-2">
                Encerrar Chamado
              </Text>
            </View>

            <Text className="text-slate-500 font-medium mb-2 text-sm">
              Por que você está encerrando este chamado?
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-slate-700 mb-6 h-32"
              placeholder="Ex: O problema já foi resolvido, não preciso mais de ajuda..."
              placeholderTextColor="#94a3b8"
              multiline
              textAlignVertical="top"
              value={closeReason}
              onChangeText={setCloseReason}
            />

            {/* BOTÕES DE AÇÃO */}
            <View className="flex-row justify-between">
              <TouchableOpacity
                onPress={() => {
                  setShowCloseModal(false);
                  setCloseReason('');
                  setTicketToClose(null);
                }}
                className="flex-1 bg-gray-100 py-4 rounded-xl items-center mr-2"
              >
                <Text className="text-slate-500 font-bold text-base">Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={confirmClosing}
                className="flex-1 bg-red-500 py-4 rounded-xl items-center ml-2 flex-row justify-center"
              >
                <Text className="text-white font-bold text-base ml-1">Confirmar Encerramento</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

    </View>
  );
}