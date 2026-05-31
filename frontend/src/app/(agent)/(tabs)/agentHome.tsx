import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, TouchableWithoutFeedback, ActivityIndicator, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { NotificationDropdown } from "../../../components/notifications/NotificationDropdown";
import { useNotifications } from "@/contexts/NotificationContext";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";

const recentTickets = [
  {
    id: "4529",
    title: "Instabilidade no Servidor",
    subtitle: "Aberto há 15min",
    icon: "dns",
    color: "#FB923C",
    dot: "#F97316",
  },
  {
    id: "4525",
    title: "Redefinição de Senha VPN",
    subtitle: "Em atendimento",
    icon: "vpn-key",
    color: "#60A5FA",
    dot: "#3B82F6",
  },
  {
    id: "4521",
    title: "Erro Crítico de Banco de Dados",
    subtitle: "Escalonado Nível 2",
    icon: "warning",
    color: "#F87171",
    dot: "#EF4444",
  },
];

export default function Dashboard() {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const { unreadCount } = useNotifications();
  const { user } = useAuth();

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
        // Filter categories based on user's assigned categories
        const userCats = user?.categories || [];
        const filtered = response.data.filter((cat: any) => {
          const catId = cat.id || cat._id;
          return userCats.includes(catId);
        });
        setCategories(filtered);
      } catch (error) {
        console.error("Erro ao buscar categorias:", error);
      }
    };
    fetchCategories();
    fetchMetrics('');
  }, [user]);

  const handleSelectCategory = (catId: string) => {
    setSelectedCategory(catId);
    fetchMetrics(catId);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F3F4F6]">
      <TouchableWithoutFeedback onPress={() => setShowNotifications(false)}>
        <View className="flex-1 px-6 pt-5">

          <View className="bg-white rounded-3xl p-5 mb-6 shadow-sm relative z-50">
            <View className="flex-row justify-between items-center mb-5">
              
              <View className="flex-row items-center">
                <View>
                  <Text className="text-xl font-bold text-gray-800">
                    Olá, {user?.name || 'Atendente'}
                  </Text>
                  <Text className="text-orange-500 text-base font-medium mt-1">
                    Setor de Atendimento
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
                      Meus Setores
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

            {/* Cards */}
            {loading ? (
              <View className="py-10 items-center justify-center">
                <ActivityIndicator size="large" color="#F97316" />
              </View>
            ) : (
              <View className="flex-row flex-wrap justify-between">
                
                {/* Pendentes */}
                <View className="w-[48%] bg-gray-50 rounded-2xl p-5 mb-4 border-l-4 border-orange-400">
                  <Text className="text-gray-400 text-sm font-semibold">
                    PENDENTES
                  </Text>
                  <View className="flex-row items-center justify-between mt-3">
                    <Text className="text-3xl font-bold text-gray-800">{metrics?.openTickets || 0}</Text>
                    
                  </View>
                </View>

                {/* Em atendimento */}
                <View className="w-[48%] bg-gray-50 rounded-2xl p-5 mb-4 border-l-4 border-blue-400">
                  <Text className="text-gray-400 text-sm font-semibold">
                    EM ATENDIMENTO
                  </Text>
                  <View className="flex-row items-center justify-between mt-3">
                    <Text className="text-3xl font-bold text-gray-800">{metrics?.inProgressTickets || 0}</Text>
                  </View>
                </View>

                {/* Escalonados */}
                <View className="w-[48%] bg-gray-50 rounded-2xl p-5 border-l-4 border-red-400">
                  <Text className="text-gray-400 text-sm font-semibold">
                    ESCALONADOS
                  </Text>
                  <View className="flex-row items-center justify-between mt-3">
                    <Text className="text-3xl font-bold text-gray-800">{metrics?.escalatedTickets || 0}</Text>
                    
                  </View>
                </View>

                {/* Resolvidos */}
                <View className="w-[48%] bg-gray-50 rounded-2xl p-5 border-l-4 border-green-400">
                  <Text className="text-gray-400 text-sm font-semibold">
                    RESOLVIDOS
                  </Text>
                  <View className="flex-row items-center justify-between mt-3">
                    <Text className="text-3xl font-bold text-gray-800">{metrics?.closedTickets || 0}</Text>
                    
                  </View>
                </View>

              </View>
            )}
          </View>

        {/* Chamados */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-gray-800 font-bold text-lg">
            Chamados Recentes
          </Text>
          <TouchableOpacity onPress={() => router.push('/(agent)/(tabs)/tickets')}>
            <Text className="text-orange-500 font-semibold text-base">
              Ver todos
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={recentTickets}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View className="bg-white rounded-2xl p-5 mb-4 flex-row items-center justify-between shadow-sm">
              
              <View className="flex-row items-center flex-1">
                <View
                  className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                  style={{ backgroundColor: `${item.color}20` }}
                >
                  <MaterialIcons
                    size={24}
                    color={item.color}
                  />
                </View>

                <View className="flex-1">
                  <Text className="text-gray-800 font-semibold text-base">
                    {item.title}
                  </Text>
                  <Text className="text-gray-400 text-sm mt-1">
                    ID: #{item.id} • {item.subtitle}
                  </Text>
                </View>
              </View>

              <View
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.dot }}
              />
            </View>
          )}
        />
      </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}