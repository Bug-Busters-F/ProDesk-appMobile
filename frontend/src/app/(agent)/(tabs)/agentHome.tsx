import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, Text, FlatList, TouchableOpacity, TouchableWithoutFeedback, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { NotificationDropdown } from "../../../components/notifications/NotificationDropdown";
import { useNotifications } from "@/contexts/NotificationContext";
import { useAuth } from "@/contexts/AuthContext";
import { getTickets, getCategories } from "@/services/api";
import { TicketDTO, TicketStatus } from "@/services/dtos/ticketDTO";
import { CategoryDTO } from "@/services/dtos/categoryDTO";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRouter } from "expo-router";

export default function Dashboard() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [tickets, setTickets] = useState<TicketDTO[]>([]);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { unreadCount } = useNotifications();
  const { user } = useAuth();
  const router = useRouter();

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [ticketsData, categoriesData] = await Promise.all([
        getTickets(),
        getCategories()
      ]);
      setTickets(ticketsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const recentTickets = useMemo(() => {
    return [...tickets]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);
  }, [tickets]);

  const getStatusInfo = (status: TicketStatus | { id: string, name: string }) => {
    const statusKey = typeof status === 'object' ? status.id : status;
    switch (statusKey) {
      case TicketStatus.OPEN:
        return { label: typeof status === 'object' ? status.name : "Pendente", colorClass: "border-orange-400" };
      case TicketStatus.IN_PROGRESS:
        return { label: typeof status === 'object' ? status.name : "Em atendimento", colorClass: "border-blue-400" };
      case TicketStatus.ESCALATED:
        return { label: typeof status === 'object' ? status.name : "Escalonado", colorClass: "border-red-400" };
      case TicketStatus.CLOSED:
        return { label: typeof status === 'object' ? status.name : "Resolvido", colorClass: "border-green-400" };
      default:
        return { label: typeof status === 'object' ? status.name : status, colorClass: "border-gray-400" };
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#F3F4F6]">
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F3F4F6]">
      <TouchableWithoutFeedback onPress={() => setShowNotifications(false)}>
        <View className="flex-1 px-6 pt-5">

          <View className="bg-white rounded-3xl p-5 mb-6 shadow-sm relative z-50">
            <View className="flex-row justify-between items-center mb-5">
              
              <View className="flex-row items-center">
                <View>
                  <Text className="text-xl font-bold text-gray-800">
                    Painel de Atendimento
                  </Text>
                  <Text className="text-orange-500 text-base font-medium mt-1">
                    Visão Geral de Chamados
                  </Text>
                </View>
              </View>

              <TouchableOpacity 
                onPress={() => setShowNotifications(!showNotifications)}
                className="bg-gray-100 p-3 rounded-xl relative"
              >
                <Feather name="bell" size={22} color="#6B7280" />
                {unreadCount > 0 && (
                  <View className="absolute top-2.5 right-2.5 bg-orange-500 rounded-full h-2.5 w-2.5 border-2 border-gray-100" />
                )}
              </TouchableOpacity>

              {showNotifications && (
                <NotificationDropdown onClose={() => setShowNotifications(false)} />
              )}
            </View>

          {/* Cards de Métricas (Dados Mockados conforme solicitado) */}
          <View className="flex-row flex-wrap justify-between">
            
            {/* Pendentes */}
            <View className="w-[48%] bg-gray-50 rounded-2xl p-5 mb-4 border-l-4 border-orange-400">
              <Text className="text-gray-400 text-sm font-semibold uppercase">
                Pendentes
              </Text>
              <View className="flex-row items-center justify-between mt-3">
                <Text className="text-3xl font-bold text-gray-800">12</Text>
              </View>
            </View>

            {/* Em atendimento */}
            <View className="w-[48%] bg-gray-50 rounded-2xl p-5 mb-4 border-l-4 border-blue-400">
              <Text className="text-gray-400 text-sm font-semibold uppercase">
                Em atendimento
              </Text>
              <View className="flex-row items-center justify-between mt-3">
                <Text className="text-3xl font-bold text-gray-800">5</Text>
              </View>
            </View>

            {/* Escalonados */}
            <View className="w-[48%] bg-gray-50 rounded-2xl p-5 border-l-4 border-red-400">
              <Text className="text-gray-400 text-sm font-semibold uppercase">
                Escalonados
              </Text>
              <View className="flex-row items-center justify-between mt-3">
                <Text className="text-3xl font-bold text-gray-800">3</Text>
              </View>
            </View>

            {/* Resolvidos */}
            <View className="w-[48%] bg-gray-50 rounded-2xl p-5 border-l-4 border-green-400">
              <Text className="text-gray-400 text-sm font-semibold uppercase">
                Resolvidos
              </Text>
              <View className="flex-row items-center justify-between mt-3">
                <Text className="text-3xl font-bold text-gray-800">28</Text>
              </View>
            </View>

          </View>
        </View>

        {/* Chamados Recentes */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-gray-800 font-bold text-lg">
            Chamados Recentes
          </Text>
          <TouchableOpacity onPress={() => router.push("/(agent)/(tabs)/tickets")}>
            <Text className="text-orange-500 font-semibold text-base">
              Ver todos
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={recentTickets}
          keyExtractor={(item) => item._id || item.id || Math.random().toString()}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View className="bg-white rounded-2xl p-8 items-center shadow-sm">
              <Text className="text-gray-400 font-medium">Nenhum chamado recente</Text>
            </View>
          )}
          renderItem={({ item }) => {
            const { label, colorClass } = getStatusInfo(item.status);
            const ticketId = item._id || item.id || "";
            return (
              <TouchableOpacity 
                onPress={() => router.push(`/ticket/details/${ticketId}`)}
                className={`bg-white rounded-2xl p-5 mb-4 flex-row items-center justify-between shadow-sm border-l-4 ${colorClass}`}
              >
                <View className="flex-1">
                  <Text className="text-gray-800 font-semibold text-base" numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text className="text-gray-400 text-sm mt-1">
                    ID: #{ticketId ? ticketId.substring(0, 6).toUpperCase() : "N/A"} • {label}
                  </Text>
                  <Text className="text-gray-400 text-xs mt-0.5">
                    Aberto {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: ptBR })}
                  </Text>
                </View>

                <Feather name="chevron-right" size={20} color="#D1D5DB" />
              </TouchableOpacity>
            );
          }}
        />
      </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
