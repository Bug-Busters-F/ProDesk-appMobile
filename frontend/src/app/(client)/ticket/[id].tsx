import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, FlatList, 
  KeyboardAvoidingView, Platform, ActivityIndicator, 
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { io, Socket } from 'socket.io-client';
import { MessageBubble, MessageType } from '../../../components/chat/MessageBubble';
import { useAuth } from '@/contexts/AuthContext';

const BACKEND_URL = 'http://10.0.2.2:3000'; // O socket vai usar essa base limpa

// Na função setupChatRoom(), adicione o prefixo ProDeskApi na requisição HTTP:


export default function TicketChatScreen() {
  const router = useRouter();
  
  const { id: routeId, initialMessage, isNewTicket } = useLocalSearchParams();
  const { user } = useAuth();
  
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  
  const [realChatId, setRealChatId] = useState<string | null>(null);
  
  const flatListRef = useRef<FlatList>(null);
  const socketRef = useRef<Socket | null>(null);
  const hasSentInitialMessage = useRef(false);

  useEffect(() => {
    const setupChatRoom = async () => {
      
      try {
        let finalChatId = null;

        if (isNewTicket === 'true') {
            const chatResponse = await fetch(`${BACKEND_URL}/ProDeskApi/chat`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ticketId: routeId,
                clientId: user?.id,
                agentId: '507f1f77bcf86cd799439033', 
                groupId: '507f1f77bcf86cd799439034', 
              })
            });
           
           if (!chatResponse.ok) {
             Alert.alert('Erro', 'Não foi possível criar a sala de chat.');
             return;
           }
           
           const chatData = await chatResponse.json();
           finalChatId = chatData.id || chatData._id;
        } else {
           finalChatId = routeId as string;
        }

        if (finalChatId) {
           setRealChatId(finalChatId);
        }
      } catch (error) {
        console.error('Erro ao configurar sala de chat:', error);
      }
    };

    if (user?.id && routeId) {
      setupChatRoom();
    }
  }, [routeId, isNewTicket, user?.id]);

  useEffect(() => {
    if (!user?.token || !realChatId) return;

    socketRef.current = io(BACKEND_URL, {
      transports: ['websocket'],
      auth: { token: user.token } 
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      socket.emit('entrarChat', { chatId: realChatId });
      socket.emit('buscarHistorico', { chatId: realChatId });

      if (initialMessage && !hasSentInitialMessage.current) {
        hasSentInitialMessage.current = true;
        socket.emit('enviarMensagem', { chatId: realChatId, content: initialMessage });
      }
    });

    socket.on('historicoChat', (data: { chatId: string, mensagens: any[] }) => {
      const history = data.mensagens.map((msg) => ({
        id: msg._id || msg.id,
        text: msg.content,
        sender: msg.senderId === user.id ? 'USER' : (msg.isSystemMessage ? 'BOT' : 'AGENT'),
        time: new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      } as MessageType)); 
      
      setMessages(history);
      setIsLoadingHistory(false);
    });

    socket.on('novaMensagem', (msg: any) => {
      setMessages((prev) => [...prev, {
        id: msg._id || msg.id,
        text: msg.content,
        sender: msg.senderId === user.id ? 'USER' : (msg.isSystemMessage ? 'BOT' : 'AGENT'),
        time: new Date(msg.createdAt || Date.now()).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      } as MessageType]);
    });

    socket.on('erro', (err) => console.log('Erro Socket:', err));

    return () => {
      socket.emit('sairChat', { chatId: realChatId });
      socket.disconnect();
    };
  }, [realChatId, user, initialMessage]);

  const handleSendMessage = () => {
    if (!inputText.trim() || !realChatId) return; // Alterado para validar o realChatId
    socketRef.current?.emit('enviarMensagem', { chatId: realChatId, content: inputText.trim() });
    setInputText('');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        
        {/* HEADER */}
        <View className="flex-row items-center px-6 py-4 border-b border-slate-100 shadow-sm z-10 bg-white">
          <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color="#1e293b" />
          </TouchableOpacity>
          <View>
            <Text className="text-lg font-bold text-slate-800">
              Protocolo #{typeof routeId === 'string' ? routeId.slice(-6).toUpperCase() : 'NOVO'}
            </Text>
            <Text className="text-orange-500 font-bold text-xs">ONLINE AGORA</Text>
          </View>
        </View>

        {/* ÁREA DO CHAT */}
        {isLoadingHistory ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#f97316" />
            <Text className="text-slate-400 mt-4">Conectando ao atendimento...</Text>
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
            ListFooterComponent={( <View className="h-4" /> )}
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