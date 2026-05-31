import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, TouchableWithoutFeedback, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { NotificationDropdown } from "../../../components/notifications/NotificationDropdown";
import { useNotifications } from "@/contexts/NotificationContext";
import api from "@/services/api";

export default function Home() {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const { unreadCount } = useNotifications();

  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const fetchMetrics = async (categoryId: string) => {
    setLoading(true);
    try {
      const url = categoryId ? `/tickets/metrics?categoryId=${categoryId}` : '/tickets/metrics';
      const response = await api.get(url);
      setMetrics(response.data);
    } catch (error) {
      console.error("Erro ao buscar métricas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/category');
        setCategories(response.data);
      } catch (error) {
        console.error("Erro ao buscar categorias:", error);
      }
    };
    fetchCategories();
    fetchMetrics('');
  }, []);

  const handleSelectCategory = (catId: string) => {
    setSelectedCategory(catId);
    fetchMetrics(catId);
  };

  const formatAverageTime = (avgTime: any) => {
    if (!avgTime || avgTime.count === 0) return "--";
    if (avgTime.avgDays >= 1) return `${avgTime.avgDays.toFixed(1)}d`;
    if (avgTime.avgHours >= 1) return `${avgTime.avgHours.toFixed(1)}h`;
    return `${Math.round(avgTime.avgMinutes)}m`;
  };

  const total = metrics?.totalTickets || 0;
  const openPercent = total ? Math.round(((metrics?.openTickets || 0) / total) * 100) : 0;
  const inProgressPercent = total ? Math.round(((metrics?.inProgressTickets || 0) / total) * 100) : 0;
  const closedPercent = total ? Math.round(((metrics?.closedTickets || 0) / total) * 100) : 0;
  const escalatedPercent = total ? Math.round(((metrics?.escalatedTickets || 0) / total) * 100) : 0;

  return (
    <SafeAreaView className="flex-1 bg-stone-50">
      <TouchableWithoutFeedback onPress={() => setShowNotifications(false)}>
        <ScrollView showsVerticalScrollIndicator={false}>

          <View className="flex-1 px-6 pt-5">

            {/* Header */}
            <View className="flex-row justify-between pb-3 items-center mb-6 border-b border-b-gray-300 relative z-50">
              <View>
                <Text className="text-2xl font-bold text-gray-800">
                  Visão Geral
                </Text>
                <Text className="text-gray-400 mt-1">
                  Métricas e solicitações recentes. 
                </Text>
              </View>

              <TouchableOpacity 
                onPress={() => setShowNotifications(!showNotifications)}
                className="bg-gray-200/50 p-3 rounded-xl relative"
              >
                <Feather name="bell" size={22} color="#6B7280" />
                {unreadCount > 0 && (
                  <View className="absolute top-2.5 right-2.5 bg-orange-500 rounded-full h-2.5 w-2.5 border-2 border-stone-50" />
                )}
              </TouchableOpacity>

              {showNotifications && (
                <NotificationDropdown onClose={() => setShowNotifications(false)} />
              )}
            </View>

            {/* Filtro de Setor */}
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
                      Geral da Empresa
                    </Text>
                  </TouchableOpacity>
                  {categories.map((cat) => {
                    const catId = cat.id || cat._id;
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
          
          {loading ? (
            <View className="py-10">
              <ActivityIndicator size="large" color="#F97316" />
            </View>
          ) : (
            <>
              {/* Cards principais */}
              <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
                <View className="flex-row justify-between items-center">
                  <Text className="text-gray-400 font-semibold">
                    TOTAL DE CHAMADOS
                  </Text>
                </View>
                <Text className="text-3xl font-bold text-gray-800 mt-2">
                  {metrics?.totalTickets || 0}
                </Text>
              </View>

              <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
                <View className="flex-row justify-between items-center">
                  <Text className="text-gray-400 font-semibold">
                    RESOLVIDOS
                  </Text>
                </View>
                <Text className="text-3xl font-bold text-gray-800 mt-2">
                  {metrics?.closedTickets || 0}
                </Text>
              </View>

              <View className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
                <View className="flex-row justify-between items-center">
                  <Text className="text-gray-400 font-semibold">
                    TEMPO MÉDIO
                  </Text>
                </View>
                <Text className="text-3xl font-bold text-gray-800 mt-2">
                  {formatAverageTime(metrics?.averageResolutionTime)}
                </Text>
              </View>

              {/* Status */}
              <View className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
                <Text className="font-bold text-gray-800 mb-4">
                  Status dos Chamados
                </Text>

                {/* Barra proporcional corrigida */}
                <View className="h-3 w-full bg-gray-100 overflow-hidden flex-row mb-5 rounded-full">
                  {openPercent > 0 && (
                    <View style={{ backgroundColor: '#fb923c', width: `${openPercent}%`, height: '100%' }} />
                  )}
                  {inProgressPercent > 0 && (
                    <View style={{ backgroundColor: '#60a5fa', width: `${inProgressPercent}%`, height: '100%' }} />
                  )}
                  {closedPercent > 0 && (
                    <View style={{ backgroundColor: '#4ade80', width: `${closedPercent}%`, height: '100%' }} />
                  )}
                  {escalatedPercent > 0 && (
                    <View style={{ backgroundColor: '#f87171', width: `${escalatedPercent}%`, height: '100%' }} />
                  )}
                </View>

                {/* Legenda */}
                <View className="gap-y-3">
                  
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center">
                      <View className="w-3 h-3 rounded-full bg-orange-400 mr-2" />
                      <Text className="text-gray-600">Em Aberto</Text>
                    </View>
                    <Text className="font-semibold text-gray-800">{openPercent}%</Text>
                  </View>

                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center">
                      <View className="w-3 h-3 rounded-full bg-blue-400 mr-2" />
                      <Text className="text-gray-600">Em Atendimento</Text>
                    </View>
                    <Text className="font-semibold text-gray-800">{inProgressPercent}%</Text>
                  </View>

                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center">
                      <View className="w-3 h-3 rounded-full bg-green-400 mr-2" />
                      <Text className="text-gray-600">Resolvidos</Text>
                    </View>
                    <Text className="font-semibold text-gray-800">{closedPercent}%</Text>
                  </View>

                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center">
                      <View className="w-3 h-3 rounded-full bg-red-400 mr-2" />
                      <Text className="text-gray-600">Escalonados</Text>
                    </View>
                    <Text className="font-semibold text-gray-800">{escalatedPercent}%</Text>
                  </View>

                </View>
              </View>
            </>
          )
}

          {/* Acesso Rápido */}
          <Text className="text-lg font-bold text-gray-800 mb-4">
            Acesso Rápido
          </Text>
          <View className="flex-row justify-between mb-6">
            <TouchableOpacity 
              className="bg-white p-4 rounded-2xl items-center flex-1 mr-2 shadow-sm"
              onPress={() => router.push('/(admin)/faqManagement')}
            >
              <View className="w-12 h-12 rounded-full bg-orange-100 items-center justify-center mb-2">
                <MaterialIcons name="help-outline" size={24} color="#F97316" />
              </View>
              <Text className="text-xs font-semibold text-gray-700 text-center">Gerenciar FAQ</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="bg-white p-4 rounded-2xl items-center flex-1 mx-1 shadow-sm"
              onPress={() => router.push('/(admin)/registerUser')}
            >
              <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center mb-2">
                <MaterialIcons name="person-add" size={24} color="#3B82F6" />
              </View>
              <Text className="text-xs font-semibold text-gray-700 text-center">Novo Usuário</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="bg-white p-4 rounded-2xl items-center flex-1 ml-2 shadow-sm"
              onPress={() => router.push('/(admin)/registerCompany')}
            >
              <View className="w-12 h-12 rounded-full bg-green-100 items-center justify-center mb-2">
                <MaterialIcons name="business" size={24} color="#10B981" />
              </View>
              <Text className="text-xs font-semibold text-gray-700 text-center">Nova Empresa</Text>
            </TouchableOpacity>
          </View>

          <View className="h-10" />
        </View>
      </ScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
