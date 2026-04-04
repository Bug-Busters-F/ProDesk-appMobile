import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export type AgentTicketStatus = 'PENDENTE' | 'EM ATENDIMENTO' | 'ESCALONADO';

export type AgentTicketData = {
  id: string;
  clientName: string;
  category: string;
  timeAgo: string;
  description: string;
  status: AgentTicketStatus;
};

type Props = {
  ticket: AgentTicketData;
  onPress: () => void;
};

const STATUS_CONFIG = {
  'PENDENTE': { dot: 'bg-red-500', button: 'bg-orange-500', buttonText: 'text-white', label: 'Atender' },
  'EM ATENDIMENTO': { dot: 'bg-blue-500', button: 'bg-white border border-orange-500', buttonText: 'text-orange-500', label: 'Detalhes' },
  'ESCALONADO': { dot: 'bg-orange-500', button: 'bg-white border border-orange-500', buttonText: 'text-orange-500', label: 'Detalhes' },
};

export function AgentTicketCard({ ticket, onPress }: Props) {
  const config = STATUS_CONFIG[ticket.status];

  return (
    <View className="bg-white border border-slate-100 rounded-3xl p-5 mb-4 shadow-sm shadow-slate-200">
      <View className="flex-row justify-between items-center mb-3">
        <View className="bg-orange-50 px-3 py-1 rounded-md">
          <Text className="text-orange-500 font-bold text-[10px] uppercase">{ticket.category}</Text>
        </View>
        <Text className="text-slate-400 text-xs">{ticket.timeAgo}</Text>
      </View>

      <Text className="text-lg font-bold text-slate-800 mb-1">
        #{ticket.id} - {ticket.clientName}
      </Text>
      <Text className="text-slate-500 text-sm mb-5" numberOfLines={2}>
        {ticket.description}
      </Text>

      <View className="flex-row items-center justify-between border-t border-slate-50 pt-4">
        <View className="flex-row items-center">
          <View className={`w-2 h-2 rounded-full mr-2 ${config.dot}`} />
          <Text className="text-slate-700 font-bold text-xs">STATUS: {ticket.status}</Text>
        </View>

        <TouchableOpacity 
          onPress={onPress}
          className={`px-6 py-2 rounded-lg ${config.button}`}
          activeOpacity={0.8}
        >
          <Text className={`font-bold text-sm ${config.buttonText}`}>
            {config.label}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}