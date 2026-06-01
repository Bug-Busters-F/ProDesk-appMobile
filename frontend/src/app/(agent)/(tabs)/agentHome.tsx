import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, Text, FlatList, TouchableOpacity, TouchableWithoutFeedback, ActivityIndicator, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { NotificationDropdown } from "../../../components/notifications/NotificationDropdown";
import { useNotifications } from "@/contexts/NotificationContext";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";
import { getTickets, getCategories } from "@/services/api";
import { TicketDTO, TicketStatus } from "@/services/dtos/ticketDTO";
import { CategoryDTO } from "@/services/dtos/categoryDTO";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Dashboard() {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [tickets, setTickets] = useState<TicketDTO[]>([]);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  const { unreadCount } = useNotifications();
  const { user } = useAuth();

  const fetchMetrics = async (categoryId: string) => {
    setLoadingMetrics(true);
    try {
      const url = categoryId ? `/tickets/metrics?categoryId=${categoryId}` : '/tickets/metrics';
      const response = await api.get(url);
      setMetrics(response.data);
    } catch (error) {
      console.error("Erro ao buscar métricas:", error);
    } finally {
      setLoadingMetrics(false);
    }
  };

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [ticketsData, categoriesData] = await Promise.all([
        getTickets(),
        getCategories()
      ]);
      setTickets(ticketsData);
      
      const userCats = (user?.categories || []) as any[];
      const filtered = categoriesData.filter((cat: any) => {
        const catId = cat.id || (cat as any)._id;
        return userCats.some(uc => (typeof uc === 'object' ? uc.id : uc) === catId);
      });
      setCategories(filtered);
      
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
    fetchMetrics('');
  }, [fetchData]);

  const handleSelectCategory = (catId: string) => {
    setSelectedCategory(catId);
    fetchMetrics(catId);
  };

  const userCategoriesDisplay = useMemo(() => {
    if (!user?.categories || user.categories.length === 0) return "Geral";
    
    const mapped = user.categories
      .map(cat => {
        if (typeof cat === 'object' && cat !== null) return (cat as any).name;
        const categoryFound = categories.find(c => c.id === cat || (c as any)._id === cat);
        return categoryFound ? categoryFound.name : null;
      })
      .filter(Boolean)
      .join(", ");
      
    return mapped || "Suporte";
  }, [user, categories]);

  const recentTickets = useMemo(() => {
    return [...tickets]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);
  }, [tickets]);

  const getStatusInfo = (status: TicketStatus | { id: string, name: string }) => {
    const statusKey = typeof status === 'object' ? status.id : status;
    switch (statusKey) {
      case TicketStatus.OPEN:
        return { label: typeof status === 'object' ? (status as any).name : "Pendente", colorClass: "border-orange-400" };
      case TicketStatus.IN_PROGRESS:
        return { label: typeof status === 'object' ? (status as any).name : "Em atendimento", colorClass: "border-blue-400" };
      case TicketStatus.ESCALATED:
        return { label: typeof status === 'object' ? (status as any).name : "Escalonado", colorClass: "border-red-400" };
      case TicketStatus.CLOSED:
        return { label: typeof status === 'object' ? (status as any).name : "Resolvido", colorClass: "border-green-400" };
      default:
        return { label: typeof status === 'object' ? (status as any).name : status, colorClass: "border-gray-400" };
    }
  };

  if (isLoading && loadingMetrics) {
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

            {/* Filtro de Setor (develop) */}
            {categories.length > 0 && (
              <View className="mb-5 -mx-1">
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <TouchableOpacity 
                    onPress={() => handleSelectCategory('')}
                    style={{
                      backgroundColor: selectedCategory === '' ? '#f97316' : '#f9fafb',
                      borderColor: selectedCategory === '' ? '#f97316' : '#e5e7eb',
                    }}
                    className="px-4 py-2 rounded-full mx-1 border"
                  >
                    <Text 
                      style={{ color: selectedCategory === '' ? '#ffffff' : '#4b5563' }}
                      className="font-semibold"
                    >
                      Meus Setores
                    </Text>
                  </TouchableOpacity>
                  {categories.map((cat) => {
                    const catId = cat.id || (cat as any)._id;
                    const isSelected = selectedCategory === catId;
                    return (
                      <TouchableOpacity 
                        key={catId}
                        onPress={() => handleSelectCategory(catId)}
                        style={{
                          backgroundColor: isSelected ? '#f97316' : '#f9fafb',
                          borderColor: isSelected ? '#f97316' : '#e5e7eb',
                        }}
                        className="px-4 py-2 rounded-full mx-1 border"
                      >
                        <Text 
                          style={{ color: isSelected ? '#ffffff' : '#4b5563' }}
                          className="font-semibold"
                        >
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Cards de Métricas Reais (develop) */}
            {loadingMetrics ? (
              <View className="py-10 items-center justify-center">
                <ActivityIndicator size="small" color="#F97316" />
              </View>
            ) : (
              <View className="flex-row flex-wrap justify-between">
                
                {/* Pendentes */}
                <View className="w-[48%] bg-gray-50 rounded-2xl p-5 mb-4 border-l-4 border-orange-400">
                  <Text className="text-gray-400 text-sm font-semibold uppercase">
                    Pendentes
                  </Text>
                  <View className="flex-row items-center justify-between mt-3">
                    <Text className="text-3xl font-bold text-gray-800">{metrics?.openTickets || 0}</Text>
                  </View>
                </View>

                {/* Em atendimento */}
                <View className="w-[48%] bg-gray-50 rounded-2xl p-5 mb-4 border-l-4 border-blue-400">
                  <Text className="text-gray-400 text-sm font-semibold uppercase">
                    Em atendimento
                  </Text>
                  <View className="flex-row items-center justify-between mt-3">
                    <Text className="text-3xl font-bold text-gray-800">{metrics?.inProgressTickets || 0}</Text>
                  </View>
                </View>

                {/* Escalonados */}
                <View className="w-[48%] bg-gray-50 rounded-2xl p-5 border-l-4 border-red-400">
                  <Text className="text-gray-400 text-sm font-semibold uppercase">
                    Escalonados
                  </Text>
                  <View className="flex-row items-center justify-between mt-3">
                    <Text className="text-3xl font-bold text-gray-800">{metrics?.escalatedTickets || 0}</Text>
                  </View>
                </View>

                {/* Resolvidos */}
                <View className="w-[48%] bg-gray-50 rounded-2xl p-5 border-l-4 border-green-400">
                  <Text className="text-gray-400 text-sm font-semibold uppercase">
                    Resolvidos
                  </Text>
                  <View className="flex-row items-center justify-between mt-3">
                    <Text className="text-3xl font-bold text-gray-800">{metrics?.closedTickets || 0}</Text>
                  </View>
                </View>

              </View>
            )}
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
