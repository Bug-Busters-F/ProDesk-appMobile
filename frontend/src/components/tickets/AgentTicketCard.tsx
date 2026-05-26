import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export type AgentTicketStatus = 'PENDENTE' | 'EM ATENDIMENTO' | 'ESCALONADO' | 'RESOLVIDO';

export type AgentTicketData = {
  id: string;
  title: string;
  clientName?: string;
  category: string;
  escalationLevel?: number;
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
  'RESOLVIDO': { dot: 'bg-emerald-500', button: 'bg-emerald-50 border border-emerald-200', buttonText: 'text-emerald-600', label: 'Ver Detalhes' },
};

const LEVEL_CONFIG = {
  1: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
  },
  2: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
  },
  3: {
    bg: 'bg-red-50',
    text: 'text-red-600',
  },
};

export function AgentTicketCard({ ticket, onPress }: Props) {
  const config = STATUS_CONFIG[ticket.status];

  return (
    <View className="bg-white border border-slate-100 rounded-3xl p-5 mb-4 shadow-sm shadow-slate-200">
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-row items-center">

          <View className="bg-orange-50 px-3 py-1 rounded-md mr-2">
            <Text className="text-orange-500 font-bold text-[10px] uppercase">
              {ticket.category}
            </Text>
          </View>

          {ticket.escalationLevel && (
            <View
              className={`px-3 py-1 rounded-md ${LEVEL_CONFIG[
                  ticket.escalationLevel as keyof typeof LEVEL_CONFIG
                ]?.bg || 'bg-slate-100'
                }`}
            >
              <Text
                className={`font-bold text-[10px] uppercase ${LEVEL_CONFIG[
                    ticket.escalationLevel as keyof typeof LEVEL_CONFIG
                  ]?.text || 'text-slate-600'
                  }`}
              >
                N{ticket.escalationLevel}
              </Text>
            </View>
          )}
        </View>

        <Text className="text-slate-400 text-xs">
          {ticket.timeAgo}
        </Text>
      </View>

      <Text className="text-lg font-bold text-slate-800 mb-1" numberOfLines={1}>
        {ticket.title}
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