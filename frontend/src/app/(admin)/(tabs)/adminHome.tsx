import React, { useState } from "react";
import { View, Text, FlatList, ScrollView, TouchableOpacity, TouchableWithoutFeedback } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { NotificationDropdown } from "../../../components/notifications/NotificationDropdown";

const recentTickets = [
  {
    id: "9831",
    title: "Erro no login do sistema",
    subtitle: "João Silva • há 15 min",
    status: "ALTA",
    color: "#FB923C",
    icon: "error-outline",
  },
  {
    id: "9827",
    title: "Solicitação de novo hardware",
    subtitle: "Maria Souza • há 1h",
    status: "MÉDIA",
    color: "#60A5FA",
    icon: "build",
  },
  {
    id: "9821",
    title: "Manutenção elétrica",
    subtitle: "Pedro Costa • há 45 min",
    status: "RESOLVIDO",
    color: "#34D399",
    icon: "bolt",
  },
];

export default function Home() {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);

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
                className="flex justify-center items-center h-12 w-12 bg-orange-50 rounded-full"
              >
                <MaterialIcons name="notifications-none" size={24} color="#FF8C00" />
              </TouchableOpacity>

              {showNotifications && (
                <NotificationDropdown onClose={() => setShowNotifications(false)} />
              )}
            </View>
          
          {/* Cards principais */}
          <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-400 font-semibold">
                TOTAL DE CHAMADOS
              </Text>
              <Text className="text-green-500 font-bold">+12.5%</Text>
            </View>
            <Text className="text-3xl font-bold text-gray-800 mt-2">
              1.284
            </Text>
            <View className="h-2 bg-gray-200 rounded-full mt-3">
              <View className="w-[70%] h-2 bg-orange-400 rounded-full" />
            </View>
          </View>

          <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-400 font-semibold">
                RESOLVIDOS
              </Text>
              <Text className="text-green-500 font-bold">+5.2%</Text>
            </View>
            <Text className="text-3xl font-bold text-gray-800 mt-2">
              942
            </Text>
            <View className="h-2 bg-gray-200 rounded-full mt-3">
              <View className="w-[60%] h-2 bg-green-400 rounded-full" />
            </View>
          </View>

          <View className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-400 font-semibold">
                TEMPO MÉDIO
              </Text>
              <Text className="text-red-400 font-bold">-8.1%</Text>
            </View>
            <Text className="text-3xl font-bold text-gray-800 mt-2">
              4.2h
            </Text>
            <View className="h-2 bg-gray-200 rounded-full mt-3">
              <View className="w-[50%] h-2 bg-blue-400 rounded-full" />
            </View>
          </View>

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

          {/* Chamados por setor */}
          <View className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
            <View className="flex-row justify-between mb-4">
              <Text className="font-bold text-gray-800">
                Chamados por Setor
              </Text>
              <Text className="text-gray-400 text-sm">
                últimos 30 dias
              </Text>
            </View>

            <View className="flex-row justify-between">
              {["S1", "S2", "S3", "Dev", "Outros"].map((item) => (
                <Text key={item} className="text-gray-400 text-sm">
                  {item}
                </Text>
              ))}
            </View>
          </View>

          {/* Status */}
          <View className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
            <Text className="font-bold text-gray-800 mb-4">
              Status dos Chamados
            </Text>

            {/* Barra proporcional */}
            <View className="h-3 w-full bg-gray-200 overflow-hidden flex-row mb-5 rounded-full">
              <View className="w-[70%] bg-orange-400" />
              <View className="w-[25%] bg-green-400" />
              <View className="w-[5%] bg-red-400" />
            </View>

            {/* Legenda */}
            <View className="space-y-2">
              
              <View className="flex-row justify-between items-center mb-2">
                <View className="flex-row items-center">
                  <View className="w-3 h-3 rounded-full bg-orange-400 mr-2" />
                  <Text className="text-gray-600">Em Aberto</Text>
                </View>
                <Text className="font-semibold text-gray-800">70%</Text>
              </View>

              <View className="flex-row justify-between items-center mb-2">
                <View className="flex-row items-center">
                  <View className="w-3 h-3 rounded-full bg-green-400 mr-2" />
                  <Text className="text-gray-600">Resolvidos</Text>
                </View>
                <Text className="font-semibold text-gray-800">25%</Text>
              </View>

              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center">
                  <View className="w-3 h-3 rounded-full bg-red-400 mr-2" />
                  <Text className="text-gray-600">Críticos</Text>
                </View>
                <Text className="font-semibold text-gray-800">5%</Text>
              </View>

            </View>
          </View>

          {/* Recentes */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-gray-800 font-bold text-lg">
              Chamados Recentes
            </Text>
            <TouchableOpacity>
              <Text className="text-orange-500 font-semibold">
                Ver todos
              </Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={recentTickets}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View className="bg-white rounded-2xl p-4 mb-3 flex-row items-center justify-between shadow-sm">

                <View className="flex-row items-center flex-1">
                  <View
                    className="w-12 h-12 rounded-xl items-center justify-center mr-3"
                    style={{ backgroundColor: `${item.color}20` }}
                  >
                    <MaterialIcons
                      name={item.icon as any}
                      size={22}
                      color={item.color}
                    />
                  </View>

                  <View className="flex-1">
                    <Text className="text-gray-800 font-semibold">
                      {item.title}
                    </Text>
                    <Text className="text-gray-400 text-sm">
                      {item.subtitle}
                    </Text>
                  </View>
                </View>

                <View className="bg-gray-100 px-3 py-1 rounded-full ml-2">
                  <Text
                    className="text-xs font-bold"
                    style={{ color: item.color }}
                  >
                    {item.status}
                  </Text>
                </View>
              </View>
            )}
          />
          <View className="h-10" />
        </View>
      </ScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}