import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, FlatList, 
  KeyboardAvoidingView, Platform, ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MessageBubble, MessageType } from '../../../components/chat/MessageBubble';

// Mock inicial
const INITIAL_MESSAGES: MessageType[] = [
  {
    id: '1',
    text: '[ informações enviadas via formulário ]\n\nFalha na conexão com o servidor. O sistema não passa da tela de login.',
    sender: 'USER',
    time: '14:20',
  },
  {
    id: '2',
    text: 'Olá! Sou a IA de triagem. Um momento enquanto consulto seu protocolo em nosso sistema para te direcionar ao melhor atendente.',
    sender: 'BOT',
    agentName: 'Assistente Virtual',
    time: '14:21',
  }
];

export default function TicketChatScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // eFEITO DE CARREGAMENTO (GET do Axios)
  useEffect(() => {
    // Simulando busca do histórico de mensagens no backend
    const fetchHistory = async () => {
      setIsLoadingHistory(true);
      // const response = await api.get(`/tickets/${id}/messages`);
      // setMessages(response.data);
      
      setTimeout(() => {
        setMessages(INITIAL_MESSAGES);
        setIsLoadingHistory(false);
      }, 1000); 
    };

    fetchHistory();

    //lugar ideal conectar o Socket.io
    // socket.emit('joinRoom', id);
    // socket.on('newMessage', (msg) => setMessages(prev => [...prev, msg]));
    
    // return () => socket.disconnect();
  }, [id]);

  // FUNÇÃO DE ENVIO DE MENSAGEM (POST do Axios ou Socket emit)
  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage: MessageType = {
      id: Math.random().toString(), // No backend, o Mongo geraria isso
      text: inputText.trim(),
      sender: 'USER',
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newMessage]);
    setInputText('');

    // Simulando a API enviando e o Bot respondendo
    // await api.post(`/tickets/${id}/messages`, { text: newMessage.text });
    simulateBotResponse();
  };

  const simulateBotResponse = () => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [...prev, {
        id: Math.random().toString(),
        text: 'Sua mensagem foi recebida. Um especialista já vai te atender!',
        sender: 'BOT',
        agentName: 'Assistente Virtual',
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 2000);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        {/* HEADER */}
        <View className="flex-row items-center px-6 py-4 border-b border-slate-100 shadow-sm z-10 bg-white">
          <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color="#1e293b" />
          </TouchableOpacity>
          <View>
            <Text className="text-lg font-bold text-slate-800">
              Protocolo #{typeof id === 'string' ? id.slice(-6).toUpperCase() : 'NOVO'}
            </Text>
            <Text className="text-orange-500 font-bold text-xs">ONLINE AGORA</Text>
          </View>
        </View>

        {/* ÁREA DO CHAT */}
        {isLoadingHistory ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#f97316" />
            <Text className="text-slate-400 mt-4">Carregando histórico...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <MessageBubble message={item} />}
            contentContainerStyle={{ padding: 24, paddingBottom: 10 }}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => {
              setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
            }}
            ListHeaderComponent={(
              <View className="items-center mb-8 mt-2">
                <View className="bg-orange-50 px-4 py-1 rounded-full border border-orange-100">
                  <Text className="text-orange-500 font-bold text-xs">INÍCIO DO ATENDIMENTO</Text>
                </View>
              </View>
            )}
            ListFooterComponent={(
              isTyping ? (
                <View className="flex-row items-center mt-2 ml-10 mb-4">
                  <View className="flex-row gap-1 mr-2">
                    <View className="w-1.5 h-1.5 bg-orange-300 rounded-full" />
                    <View className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
                    <View className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                  </View>
                  <Text className="text-slate-400 text-xs italic">Assistente está digitando...</Text>
                </View>
              ) : <View className="h-4" />
            )}
          />
        )}

        {/* BARRA DE INPUT */}
        <View className="flex-row items-center px-4 py-3 border-t border-slate-100 bg-white">
          <TouchableOpacity className="p-2">
            <Feather name="plus-circle" size={24} color="#94a3b8" />
          </TouchableOpacity>
          
          <View className="flex-1 flex-row items-center bg-slate-50 border border-slate-200 rounded-full px-4 h-12 mx-2">
            <TextInput
              placeholder="Digite sua mensagem..."
              className="flex-1 text-slate-800 h-full"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSendMessage}
            />
            <TouchableOpacity disabled={!inputText.trim()}>
              <Feather name="smile" size={20} color={inputText.trim() ? "#f97316" : "#94a3b8"} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            onPress={handleSendMessage}
            disabled={!inputText.trim()}
            className="w-12 h-12 rounded-full items-center justify-center"
            style={{
              backgroundColor: inputText.trim() ? '#f97316' : '#e2e8f0', 
              elevation: inputText.trim() ? 4 : 0,
              shadowColor: '#fdba74', 
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: inputText.trim() ? 0.4 : 0,
              shadowRadius: 4,
            }}
          >
            <Ionicons name="send" size={18} color="white" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}