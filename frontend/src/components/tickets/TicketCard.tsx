import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  ESCALATED = 'ESCALATED',
  CLOSED = 'CLOSED',
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export type TicketData = {
  _id: string;
  id?: string;
  title: string;
  category: string | { id: string, name: string };
  priority: TicketPriority;
  status: TicketStatus | { id: string, name: string };
  description: string;
  createdAt: string | Date;
  agentId?: string | null;
  closedAt?: string | Date | null;
};

type Props = {
  ticket: TicketData;
  onPress?: () => void;
};

const STATUS_MAP = {
  'OPEN': {
    label: 'ABERTO',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    icon: 'clock-outline', 
  },
  'IN_PROGRESS': {
    label: 'EM ATENDIMENTO',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    icon: 'message-text-outline',
  },
  'ESCALATED': {
    label: 'ESCALADO',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    icon: 'alert-circle-outline',
  },
  'CLOSED': {
    label: 'FINALIZADO',
    color: 'text-slate-600',
    bg: 'bg-slate-100',
    icon: 'check-circle-outline',
  },
};

const formatDate = (dateInput: string | Date) => {
  const date = new Date(dateInput);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

export function TicketCard({ ticket, onPress }: Props) {
  const statusKey = typeof ticket.status === 'object' ? ticket.status.id : ticket.status;
  const styleConfig = STATUS_MAP[statusKey as keyof typeof STATUS_MAP] || STATUS_MAP['OPEN'];
  const ticketId = ticket._id || ticket.id || "";
  const shortId = ticketId ? `#${ticketId.substring(ticketId.length - 6).toUpperCase()}` : "#N/A";

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white border border-slate-100 rounded-3xl p-5 mb-4 shadow-sm shadow-slate-200"
      activeOpacity={0.7}
    >
      <View className="flex-row justify-between items-start mb-3">
        <Text className="text-slate-400 font-medium text-xs font-mono">{shortId}</Text>
        <View className={`${styleConfig.bg} px-3 py-1 rounded-full`}>
          <Text className={`${styleConfig.color} font-bold text-[10px]`}>
            {typeof ticket.status === 'object' ? ticket.status.name : styleConfig.label}
          </Text>
        </View>
      </View>

      <Text className="text-lg font-bold text-slate-800 mb-4" numberOfLines={2}>
        {ticket.title}
      </Text>

      <View className="flex-row items-center justify-between border-t border-slate-50 pt-4">
        
        <View className="flex-row items-center">
          <Ionicons name="calendar-outline" size={14} color="#94a3b8" />
          <Text className="text-slate-400 text-xs ml-1 capitalize">
            {formatDate(ticket.createdAt)}
          </Text>
        </View>

        <View className="flex-row items-center">
          <MaterialCommunityIcons name={styleConfig.icon as any} size={14} color={statusKey === 'CLOSED' ? "#94a3b8" : "#f97316"} />
          <Text
            className={`${statusKey === 'CLOSED' ? 'text-slate-400' : 'text-orange-500'} text-xs ml-1 font-medium`}
          >
            {statusKey === 'CLOSED' ? 'Resolvido' 
              : !ticket.agentId ? 'Aguardando agente' 
              : 'Em análise'}
          </Text>
        </View>

      </View>
    </TouchableOpacity>
  );
}