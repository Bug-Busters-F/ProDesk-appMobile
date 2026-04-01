import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { io, Socket } from 'socket.io-client';
import { MessageBubble, MessageType } from '@/components/chat/MessageBubble';
import { useAuth } from '@/contexts/AuthContext';

const BACKEND_URL = 'http://10.0.2.2:3000';

export default function AgentTicketChatScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); 
  const { user } = useAuth();
  
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  
  const flatListRef = useRef<FlatList>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io(BACKEND_URL, { transports: ['websocket'] });
    const socket = socketRef.current;

    socket.on('connect', () => {
      socket.emit('entrarChat', { chatId: id });
    });

    socket.on('novaMensagem', (msg: any) => {
      const isMe = msg.senderId === user?.id;
      
      const incomingMsg: MessageType = {
        id: msg._id,
        text: msg.content,
        sender: isMe ? 'USER' : 'AGENT',
        agentName: isMe ? undefined : 'Cliente', 
        time: new Date(msg.createdAt || Date.now()).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, incomingMsg]);
    });

    const fetchHistory = async () => {
      setIsLoadingHistory(true);
      try {
        const response = await fetch(`${BACKEND_URL}/ProDeskApi/messages/${id}`);
        if (response.ok) {
          const data = await response.json();
          const formattedMessages: MessageType[] = data.map((msg: any) => {
            const isMe = msg.senderId === user?.id;
            return {
              id: msg._id,
              text: msg.content,
              sender: isMe ? 'USER' : 'AGENT',
              agentName: isMe ? undefined : 'Cliente',
              time: new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            };
          });
          setMessages(formattedMessages);
        }
      } catch (error) {
        console.error("Erro ao buscar histórico:", error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchHistory();

    return () => {
      socket.emit('sairChat', { chatId: id });
      socket.disconnect();
    };
  }, [id, user?.id]);

  const handleSendMessage = () => {
    if (!inputText.trim() || !user?.id) return;

    const payload = {
      chatId: id,
      senderId: user.id, // ID do Atendente enviando
      content: inputText.trim(),
      isSystemMessage: false,
    };

    socketRef.current?.emit('enviarMensagem', payload);
    setInputText('');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        
        <View className="flex-row items-center px-6 py-4 border-b border-slate-100 shadow-sm z-10 bg-white">
          <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color="#1e293b" />
          </TouchableOpacity>
          <View>
            <Text className="text-lg font-bold text-slate-800">Atendimento #{typeof id === 'string' ? id.slice(-6).toUpperCase() : '...'}</Text>
            <Text className="text-blue-500 font-bold text-xs">SALA DO CLIENTE</Text>
          </View>
        </View>

        {isLoadingHistory ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#f97316" />
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
          />
        )}

        <View className="flex-row items-center px-4 py-3 border-t border-slate-100 bg-white">
          <View className="flex-1 flex-row items-center bg-slate-50 border border-slate-200 rounded-full px-4 h-12 mx-2">
            <TextInput
              placeholder="Responder ao cliente..."
              className="flex-1 text-slate-800 h-full"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSendMessage}
            />
          </View>
          <TouchableOpacity 
            onPress={handleSendMessage}
            disabled={!inputText.trim()}
            className="w-12 h-12 rounded-full items-center justify-center"
            style={{ backgroundColor: inputText.trim() ? '#f97316' : '#e2e8f0' }}
          >
            <Ionicons name="send" size={18} color="white" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}