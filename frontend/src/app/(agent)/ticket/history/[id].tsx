import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { api } from '@/contexts/AuthContext';

export default function TicketHistory() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const res = await api.get(`/tickets/${id}/history`);
      const historyArray = res.data.history || res.data || [];
      const agentIds = [...new Set(historyArray
        .map((item: any) => item.responsibleAgent)
        .filter((agentId: any) => agentId !== null && agentId !== undefined)
      )];

      const agentDictionary: Record<string, string> = {};
      await Promise.all(
        agentIds.map(async (agentId: any) => {
          try {
            const userRes = await api.get(`/user/${agentId}`);
            agentDictionary[agentId] = userRes.data.name;
          } catch (err) {
            console.log(`Erro ao buscar nome do agente ${agentId}`, err);
            agentDictionary[agentId] = "Especialista";
          }
        })
      );

      const mappedHistory = historyArray.map((item: any) => ({
        ...item,
        agentName: item.responsibleAgent ? (agentDictionary[item.responsibleAgent] || "Especialista") : null
      }));

      const sortedHistory = mappedHistory.sort((a: any, b: any) => {
        const dateA = new Date(a.occurredAt?.$date || a.occurredAt).getTime();
        const dateB = new Date(b.occurredAt?.$date || b.occurredAt).getTime();
        return dateB - dateA;
      });

      setHistory(sortedHistory);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const getEventStyle = (event: string) => {
    switch (event) {
      case 'OPEN_NEW_TICKET':
        return { icon: 'ticket-account', color: 'text-blue-500', bg: 'bg-blue-100' };
      case 'NEW_AGENT':
        return { icon: 'account-arrow-right', color: 'text-orange-500', bg: 'bg-orange-100' };
      case 'ESCALATE':
        return { icon: 'alert-octagon', color: 'text-red-500', bg: 'bg-red-100' };
      case 'CLOSE_TICKET':
        return { icon: 'check-circle-outline', color: 'text-green-500', bg: 'bg-green-100' };
      default:
        return { icon: 'circle-medium', color: 'text-gray-500', bg: 'bg-gray-100' };
    }
  };

  const formatDate = (dateObj: any) => {
    const dateString = dateObj?.$date || dateObj;
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const renderItem = ({ item, index }: { item: any, index: number }) => {
    const isLastItem = index === history.length - 1;
    const style = getEventStyle(item.event);

    return (
      <View className="flex-row px-6">
        <View className="items-center mr-4">
          {!isLastItem && (
            <View className="absolute top-8 bottom-[-24] w-0.5 bg-gray-200 z-0" />
          )}
          <View className={`w-10 h-10 rounded-full items-center justify-center z-10 ${style.bg} border-4 border-[#F8F9FA]`}>
            <MaterialCommunityIcons name={style.icon as any} size={20} className={style.color} />
          </View>
        </View>
        <View className="flex-1 pb-8 pt-1">
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-slate-800 font-bold text-base capitalize">
              {item.status.replace('_', ' ')}
            </Text>
            <Text className="text-slate-400 text-xs font-medium">
              {formatDate(item.occurredAt)}
            </Text>
          </View>

          <Text className="text-slate-600 text-sm leading-5">
            {item.message}
          </Text>

          {item.solution && (
            <View className="mt-3 bg-green-50 p-3 rounded-xl border border-green-100">
              <Text className="text-green-800 text-xs font-bold mb-1">SOLUÇÃO REGISTRADA</Text>
              <Text className="text-green-700 text-sm">{item.solution}</Text>
            </View>
          )}

          {item.agentName && (
            <View className="flex-row items-center mt-2">
              <Feather name="user" size={14} color="#f97316" />
              <Text className="text-orange-600 font-bold text-xs ml-1.5 uppercase tracking-wide">
                Resp: {item.agentName}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-[#F8F9FA]">
        <ActivityIndicator size="large" color="#f97316" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FA]" edges={['top', 'bottom']}>
      {/* HEADER */}
      <View className="flex-row items-center px-4 py-4 border-b border-gray-100 bg-[#F8F9FA] mb-6">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Feather name="arrow-left" size={24} color="#1e293b" />
        </TouchableOpacity>
        <View className="flex-1 items-center pr-8">
          <Text className="text-slate-800 font-bold text-lg">Histórico do Chamado</Text>
        </View>
      </View>

      {/* TIMELINE */}
      <FlatList
        data={history}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
}