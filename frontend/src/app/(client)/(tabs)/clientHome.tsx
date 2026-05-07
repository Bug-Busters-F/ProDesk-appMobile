import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function Home() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-stone-50">
      <View className="flex-1 px-5 pt-6">
        
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-800">
            Olá, Cliente
          </Text>
          <Text className="text-gray-400 mt-1">
            Como podemos ajudar hoje?
          </Text>
        </View>

        {/* Card 1 */}
        <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
          
          <View className="items-center">
            <View className="w-16 h-16 rounded-full bg-orange-100 items-center justify-center mb-4">
              <MaterialIcons name="confirmation-number" size={26} color="#F97316" />
            </View>

            <Text className="text-gray-800 font-bold text-base mb-1">
              Abrir Novo Chamado
            </Text>

            <Text className="text-gray-400 text-center text-sm mb-5">
              Inicie um novo atendimento com nossa equipe técnica ou de suporte.
            </Text>

            <TouchableOpacity onPress={() => router.push('/(client)/newTicket')} className="w-full bg-orange-500 py-3 rounded-xl items-center">
              <Text className="text-white font-semibold">
                + Novo Ticket
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Card 2 */}
        <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
          
          <View className="items-center">
            <View className="w-16 h-16 rounded-full bg-orange-100 items-center justify-center mb-4">
              <MaterialIcons name="list-alt" size={26} color="#F97316" />
            </View>

            <Text className="text-gray-800 font-bold text-base mb-1">
              Meus Chamados
            </Text>

            <Text className="text-gray-400 text-center text-sm mb-5">
              Acompanhe o status e histórico de todas as suas solicitações.
            </Text>

            <TouchableOpacity onPress={() => router.push('/(client)/(tabs)/tickets')} className="w-full bg-orange-100 py-3 rounded-xl items-center">
              <Text className="text-orange-500 font-semibold">
                Ver Histórico
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Card 3 */}
        <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          
          <View className="items-center">
            <View className="w-16 h-16 rounded-full bg-orange-100 items-center justify-center mb-4">
              <Feather name="help-circle" size={26} color="#F97316" />
            </View>

            <Text className="text-gray-800 font-bold text-base mb-1">
              FAQ - Perguntas
            </Text>

            <Text className="text-gray-400 text-center text-sm mb-5">
              Encontre respostas rápidas para as dúvidas mais comuns de outros usuários.
            </Text>

            <TouchableOpacity onPress={() => router.push('/(client)/faq')} className="w-full bg-orange-100 py-3 rounded-xl items-center">
              <Text className="text-orange-500 font-semibold">
                Explorar FAQ
              </Text>
            </TouchableOpacity>
          </View>
        </View>

      </View>
    </SafeAreaView>
  );
}