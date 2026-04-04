import React from "react";
import { View, Text, FlatList, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";

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
  return (
    <SafeAreaView className="flex-1 bg-[#F3F4F6]">
      <ScrollView>

        <View className="flex-1 px-6 pt-5">

          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-2xl font-bold text-gray-800">
              Painel Geral
            </Text>
          </View>

          {/* Visão Geral */}
          <Text className="text-lg font-bold text-gray-800">
            Visão Geral
          </Text>
          <Text className="text-gray-400 mb-4">
            Bem-vindo de volta! Aqui está o resumo de hoje.
          </Text>

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

          {/* Chamados por setor */}
          <View className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
            <View className="flex-row justify-between mb-4">
              <Text className="font-bold text-gray-800">
                Chamados por Setor
              </Text>
              <Text className="text-gray-400 text-sm">
                últimos 30 diasa
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

            <View className="flex-row justify-between items-center">
              <View className="items-center justify-center">
                <View className="w-24 h-24 rounded-full border-8 border-orange-400 items-center justify-center">
                  <Text className="font-bold text-gray-800">100%</Text>
                  <Text className="text-gray-400 text-xs">TOTAL</Text>
                </View>
              </View>

              <View>
                <Text className="text-gray-600 mb-1">🟠 Em Aberto 70%</Text>
                <Text className="text-gray-600 mb-1">🟢 Resolvidos 25%</Text>
                <Text className="text-gray-600">🔴 Críticos 5%</Text>
              </View>
            </View>
          </View>

          {/* Recentes */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-gray-800 font-bold text-lg">
              Chamados Recentes
            </Text>
            <Text className="text-orange-500 font-semibold">
              Ver todos
            </Text>
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

                <View className="bg-gray-100 px-3 py-1 rounded-full">
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}