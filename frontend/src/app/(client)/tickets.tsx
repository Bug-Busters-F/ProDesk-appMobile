import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const TICKETS = [
  {
    id: '#12845',
    title: 'Falha no Saas',
    date: 'Ontem, 14:30',
    status: 'EM PROGRESSO',
    info: '3 mensagens',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
  {
    id: '#12890',
    title: 'Dúvida acesso na plataforma',
    date: 'Hoje, 09:15',
    status: 'ABERTO',
    info: 'Aguardando resposta',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    id: '#11402',
    title: 'Erro ao carregar página de usuário',
    date: '12 Mai, 10:00',
    status: 'RESOLVIDO',
    info: 'Finalizado',
    color: 'text-slate-600',
    bg: 'bg-slate-100',
  },
  {
    id: '#10998',
    title: 'Migração de servicos SCRUM',
    date: '05 Mai, 16:45',
    status: 'RESOLVIDO',
    info: 'Finalizado',
    color: 'text-slate-600',
    bg: 'bg-slate-100',
  },
  {
    id: '#10995',
    title: 'Migração de servicos SCRUM',
    date: '05 Mai, 16:45',
    status: 'RESOLVIDO',
    info: 'Finalizado',
    color: 'text-slate-600',
    bg: 'bg-slate-100',
  },
  {
    id: '#10991',
    title: 'Migração de servicos SCRUM',
    date: '05 Mai, 16:45',
    status: 'RESOLVIDO',
    info: 'Finalizado',
    color: 'text-slate-600',
    bg: 'bg-slate-100',
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

        {TICKETS.map(ticket => (
          <TouchableOpacity
            key={ticket.id}
            className="bg-white border border-slate-100 rounded-3xl p-5 mb-4 shadow-sm shadow-slate-200"
          >
            <View className="flex-row justify-between items-start mb-3">
              <Text className="text-slate-400 font-medium text-xs">{ticket.id}</Text>
              <View className={`${ticket.bg} px-3 py-1 rounded-full`}>
                <Text className={`${ticket.color} font-bold text-[10px]`}>{ticket.status}</Text>
              </View>
            </View>

            <Text className="text-lg font-bold text-slate-800 mb-4">{ticket.title}</Text>

            <View className="flex-row items-center justify-between border-t border-slate-50 pt-4">
              <View className="flex-row items-center">
                <Ionicons name="calendar-outline" size={14} color="#94a3b8" />
                <Text className="text-slate-400 text-xs ml-1">{ticket.date}</Text>
              </View>

              <View className="flex-row items-center">
                {ticket.status === 'RESOLVIDO' ? (
                  <Ionicons name="checkmark-circle" size={16} color="#f97316" />
                ) : (
                  <MaterialCommunityIcons name="message-text-outline" size={14} color="#94a3b8" />
                )}
                <Text
                  className={`${ticket.status === 'RESOLVIDO' ? 'text-orange-500' : 'text-slate-400'} text-xs ml-1 font-medium`}
                >
                  {ticket.info}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
