import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

import { useAuth, api } from '@/contexts/AuthContext';

export default function TicketDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchTicket = async () => {
    try {
      const res = await api.get(`/tickets/${id}`);
      setTicket(res.data);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível carregar o chamado');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, []);

  // 🔥 ASSUMIR CHAMADO
  const handleAssignAgent = async () => {
    if (!user) {
      Alert.alert('Erro', 'Usuário não autenticado');
      return;
    }

    // evita conflito de atendente
    if (ticket?.agentId && ticket.agentId !== user.id) {
      Alert.alert('Aviso', 'Este chamado já está com outro atendente');
      return;
    }

    try {
      await api.put(`/tickets/${id}/assignAgent`, {
        agentId: user.id,
      });

      await fetchTicket();

      // já abre o chat automaticamente (UX melhor)
      handleOpenChat();

    } catch (error: any) {
      console.log(error?.response?.data || error);
      Alert.alert('Erro', 'Não foi possível assumir o chamado');
    }
  };

  // 🔥 ABRIR CHAT
  const handleOpenChat = async () => {
    try {
      const res = await api.get(`/chat/ticket/${id}`);
      const chatData = res.data;
      const chatId = chatData?.id || chatData?._id;

      if (!chatId) {
        Alert.alert('Aviso', 'Chat não possui ID válido');
        return;
      }

      router.push({
        pathname: '/(client)/ticket/[id]',
        params: { id: chatId }
      });

    } catch {
      Alert.alert('Erro', 'Falha ao abrir chat');
    }
  };

  const handleEscalate = () => {
    Alert.alert('Escalonar', 'Implementar lógica de escalonamento aqui');
  };

  const handleChangeStatus = () => {
    Alert.alert('Status', 'Implementar alteração de status');
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-[#F8F9FA]">
        <ActivityIndicator size="large" color="#f97316" />
      </SafeAreaView>
    );
  }

  if (!ticket) return null;

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FA]" edges={['top', 'bottom']}>

      {/* HEADER */}
      <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-100 bg-[#F8F9FA]">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Feather name="arrow-left" size={24} color="#1e293b" />
        </TouchableOpacity>

        <View className="items-center">
          <Text className="text-slate-800 font-bold text-lg">Detalhes do Chamado</Text>
          <Text className="text-orange-500 font-bold text-sm">#{ticket.id}</Text>
        </View>

        <TouchableOpacity className="p-2">
          <Feather name="more-vertical" size={24} color="#1e293b" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

        {/* STATUS + TITULO */}
        <View className="px-6 pt-8 pb-6 flex-row items-start border-b border-gray-100">
          <View className="w-16 h-16 rounded-full bg-orange-100 items-center justify-center mr-4">
            <MaterialCommunityIcons name="ticket-confirmation-outline" size={32} color="#f97316" />
          </View>

          <View className="flex-1">
            <View className="flex-row items-center mb-1.5">
              <View className="w-2.5 h-2.5 rounded-full bg-orange-500 mr-2" />
              <Text className="text-orange-500 font-bold text-xs uppercase tracking-wider">
                STATUS: {ticket.status}
              </Text>
            </View>

            <Text className="text-xl font-bold text-slate-800 mb-1 leading-6">
              {ticket.title || 'Chamado'}
            </Text>

            <Text className="text-slate-400 text-sm">
              Alta Prioridade
            </Text>
          </View>
        </View>

        {/* CLIENTE */}
        <View className="px-6 py-6 flex-row justify-between">
          <View className="flex-1">
            <Text className="text-slate-400 text-xs font-bold mb-2">CLIENTE</Text>
            <View className="flex-row items-center">
              <Image
                source={{ uri: ticket.clientAvatar || 'https://i.pravatar.cc/100?img=33' }}
                className="w-7 h-7 rounded-full mr-2 bg-gray-300"
              />
              <Text className="text-slate-800 font-medium">{ticket.clientName || 'Cliente'}</Text>
            </View>
          </View>

          <View className="flex-1 pl-4">
            <Text className="text-slate-400 text-xs font-bold mb-2">EMPRESA</Text>
            <View className="flex-row items-center">
              <MaterialIcons name="domain" size={18} color="#94a3b8" />
              <Text className="text-slate-800 font-medium ml-1.5">{ticket.company || '-'}</Text>
            </View>
          </View>
        </View>

        {/* DESCRIÇÃO */}
        <View className="px-6 mb-6">
          <Text className="text-slate-400 text-xs font-bold mb-2">DESCRIÇÃO DETALHADA</Text>
          <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <Text className="text-slate-600 leading-6">
              {ticket.description}
            </Text>
          </View>
        </View>

        {/* INFO */}
        <View className="px-6 mb-8 flex-row justify-between">
          <View className="flex-1">
            <Text className="text-slate-400 text-xs font-bold mb-2">CATEGORIA</Text>
            <View className="bg-orange-50 self-start px-3 py-1.5 rounded-lg">
              <Text className="text-orange-500 font-bold text-sm">
                {ticket.category}
              </Text>
            </View>
          </View>

          <View className="flex-1 pl-4">
            <Text className="text-slate-400 text-xs font-bold mb-2">DATA/HORA</Text>
            <View className="flex-row items-center mt-1">
              <Feather name="calendar" size={16} color="#94a3b8" />
              <Text className="text-slate-600 ml-2 text-sm font-medium">
                {new Date(ticket.createdAt).toLocaleString('pt-BR')}
              </Text>
            </View>
          </View>
        </View>

        {/* BOTÕES */}
        <View className="px-6 pb-10">

          {ticket.status === 'OPEN' ? (
            <TouchableOpacity
              onPress={handleAssignAgent}
              className="bg-orange-500 py-4 rounded-2xl flex-row justify-center items-center mb-4"
            >
              <MaterialCommunityIcons name="account-check" size={22} color="white" />
              <Text className="text-white font-bold text-base ml-2">
                Atender Chamado
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleOpenChat}
              className="bg-orange-500 py-4 rounded-2xl flex-row justify-center items-center mb-4"
            >
              <MaterialCommunityIcons name="reply" size={22} color="white" />
              <Text className="text-white font-bold text-base ml-2">
                Responder Cliente
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={handleChangeStatus}
            className="bg-transparent border-2 border-orange-400 py-4 rounded-2xl flex-row justify-center items-center mb-4"
          >
            <MaterialIcons name="swap-horiz" size={24} color="#f97316" />
            <Text className="text-orange-500 font-bold text-base ml-2">
              Alterar Status
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleEscalate}
            className="bg-transparent border-2 border-red-500 py-4 rounded-2xl flex-row justify-center items-center"
          >
            <Text className="text-red-500 font-extrabold text-lg mr-2">!</Text>
            <Text className="text-red-500 font-bold text-base">
              Escalonar Chamado
            </Text>
          </TouchableOpacity>

        </View>

      </ScrollView>
    </SafeAreaView>
  );
}