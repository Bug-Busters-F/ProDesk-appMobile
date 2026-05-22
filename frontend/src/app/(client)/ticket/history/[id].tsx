import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { api } from '@/contexts/AuthContext'; 

type HistoryEvent = {
  event: string;
  responsibleAgent: string | null;
  agentName?: string | null;
  status: string;
  message: string;
  solution: string | null;
  occurredAt: string;
};

export default function ClientTicketHistory() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const [history, setHistory] = useState<HistoryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = async () => {
    try {
      const res = await api.get(`/tickets/${id}/history`);
      
      let historyArray = [];
      if (Array.isArray(res.data)) {
        historyArray = res.data;
      } else if (res.data && Array.isArray(res.data.history)) {
        historyArray = res.data.history;
      }

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
            console.log(`Não foi possível buscar dados do atendente ${agentId}`, err);
            agentDictionary[agentId] = "Especialista"; 
          }
        })
      );
      const mappedHistory = historyArray.map((item: any) => ({
        ...item,
        agentName: item.responsibleAgent ? (agentDictionary[item.responsibleAgent] || "Especialista") : null
      }));

      const sortedHistory = mappedHistory.sort((a: any, b: any) => 
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
      );
      
      setHistory(sortedHistory);
    } catch (error) {
      console.log("Erro ao buscar histórico do cliente:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (id) fetchHistory();
  }, [id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const getEventConfig = (event: string) => {
    if (event.includes('OPEN')) return { icon: 'plus-circle', iconColor: '#10B981', bg: 'bg-green-50', border: 'border-green-100' };
    if (event.includes('AGENT')) return { icon: 'user', iconColor: '#3B82F6', bg: 'bg-blue-50', border: 'border-blue-100' };
    if (event.includes('CLOSE')) return { icon: 'check-circle', iconColor: '#64748B', bg: 'bg-gray-100', border: 'border-gray-200' };
    return { icon: 'refresh-cw', iconColor: '#F97316', bg: 'bg-orange-50', border: 'border-orange-100' };
  };

  const getEventTitle = (event: string) => {
    switch(event) {
      case 'OPEN_NEW_TICKET': return 'Chamado Aberto';
      case 'NEW_AGENT': return 'Atendente Atribuído';
      case 'ESCALATE': return 'Chamado Escalonado';
      default: return 'Atualização de Status';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FA]" edges={['top', 'bottom']}>
      
      <View className="flex-row items-center px-6 py-4 border-b border-slate-100 bg-white shadow-sm">
        <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2 -ml-2">
          <Feather name="arrow-left" size={24} color="#1e293b" />
        </TouchableOpacity>
        <View>
          <Text className="text-lg font-bold text-slate-800">Linha do Tempo</Text>
          <Text className="text-slate-400 text-xs">Acompanhe o andamento do seu chamado</Text>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#f97316" />
        </View>
      ) : history.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <MaterialCommunityIcons name="history" size={48} color="#94a3b8" />
          <Text className="text-slate-400 mt-2 text-center text-sm">Nenhuma atualização registrada ainda.</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={{ padding: 24 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#f97316']} />}
          renderItem={({ item, index }) => {
            const config = getEventConfig(item.event);
            const title = getEventTitle(item.event);
            const isLast = index === history.length - 1;

            return (
              <View className="flex-row min-h-[90px]">
                <View className="items-center mr-4">
                  <View className={`w-10 h-10 rounded-full ${config.bg} border ${config.border} items-center justify-center z-10 shadow-sm`}>
                    <Feather name={config.icon as any} size={18} color={config.iconColor} />
                  </View>
                  {!isLast && <View className="w-[2px] flex-1 bg-slate-200 my-1" />}
                </View>

                <View className="flex-1 bg-white p-4 rounded-2xl border border-slate-100 mb-4 shadow-sm">
                  <View className="flex-row justify-between items-start mb-1">
                    <Text className="text-slate-800 font-bold text-sm flex-1 mr-2" numberOfLines={1}>
                      {title}
                    </Text>
                    <Text className="text-slate-400 text-[10px] font-medium mt-0.5">
                      {new Date(item.occurredAt).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>

                  {item.agentName && (
                    <Text className="text-[11px] text-orange-500 font-bold mb-1.5 uppercase tracking-wide">
                      Responsável: {item.agentName}
                    </Text>
                  )}

                  <Text className="text-slate-500 text-xs leading-5">
                    {item.message}
                  </Text>
                </View>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}