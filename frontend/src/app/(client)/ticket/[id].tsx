import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

// Mocks para simular a conversa
const MOCK_MESSAGES = [
  {
    id: '1',
    text: '[ informacoes enviadas via formulário ]\n\nFalha na conexão com o servidor. O sistema não passa da tela de login.',
    sender: 'USER',
    time: '14:20',
  },
  {
    id: '2',
    text: 'Olá! Sou o Carlos e vou te ajudar. Um momento enquanto consulto seu protocolo em nosso sistema.',
    sender: 'BOT',
    agentName: 'Carlos Mendes',
    time: '14:21',
  }
];

export default function TicketChatScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState(MOCK_MESSAGES);

  const renderMessage = ({ item }: { item: typeof MOCK_MESSAGES[0] }) => {
    const isUser = item.sender === 'USER';

    return (
      <View className={`mb-6 ${isUser ? 'items-end' : 'items-start'}`}>
        <Text className="text-slate-400 text-xs mb-1 mx-2">
          {isUser ? `Você • ${item.time}` : `${item.agentName} • ${item.time}`}
        </Text>
        
        <View className="flex-row items-end">
          {!isUser && (
            <View className="w-8 h-8 bg-slate-300 rounded-full mr-2 mb-1" />
          )}

          <View 
            className={`p-4 rounded-2xl max-w-[80%] ${
              isUser 
                ? 'bg-orange-100 rounded-tr-sm' 
                : 'bg-slate-50 border border-slate-100 rounded-tl-sm'
            }`}
          >
            <Text className="text-slate-800 leading-5">{item.text}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <View className="flex-row items-center px-6 py-4 border-b border-slate-100">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#1e293b" />
          </TouchableOpacity>
          <View>
            <Text className="text-lg font-bold text-slate-800">Protocolo #{id || '12345'}</Text>
            <Text className="text-orange-500 font-bold text-xs">ONLINE AGORA</Text>
          </View>
        </View>

        {/* ÁREA DO CHAT */}
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
          ListHeaderComponent={() => (
            <View className="items-center mb-8 mt-4">
              <View className="bg-orange-50 px-4 py-1 rounded-full">
                <Text className="text-orange-500 font-bold text-xs">HOJE</Text>
              </View>
            </View>
          )}
          ListFooterComponent={() => (
            // Indicador de digitação (Mock)
            <View className="flex-row items-center mt-2 ml-10">
              <View className="flex-row gap-1 mr-2">
                <View className="w-1.5 h-1.5 bg-orange-300 rounded-full" />
                <View className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
                <View className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
              </View>
              <Text className="text-slate-400 text-xs italic">Carlos está digitando...</Text>
            </View>
          )}
        />

        <View className="flex-row items-center px-4 py-3 border-t border-slate-100 bg-white">
          <TouchableOpacity className="p-2">
            <Feather name="plus-circle" size={24} color="#94a3b8" />
          </TouchableOpacity>
          
          <View className="flex-1 flex-row items-center bg-slate-50 border border-slate-100 rounded-full px-4 h-12 mx-2">
            <TextInput
              placeholder="Digite sua mensagem..."
              className="flex-1 text-slate-800"
              value={inputText}
              onChangeText={setInputText}
            />
            <TouchableOpacity>
              <Feather name="smile" size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity className="bg-orange-500 w-12 h-12 rounded-full items-center justify-center shadow-md shadow-orange-300">
            <Ionicons name="send" size={18} color="white" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}