import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { io, Socket } from 'socket.io-client';
import { MessageBubble, MessageType } from '@/components/chat/MessageBubble';
import { api, useAuth } from '@/contexts/AuthContext';

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
   if (!user?.token) return;

    const socketUrl = api.defaults.baseURL?.replace('/ProDeskApi', '') || 'http://SEU_IPV4:3000';

    socketRef.current = io(socketUrl, {
      transports: ['websocket'],
      auth: { token: user.token }, 
      extraHeaders: {
        Authorization: `Bearer ${user.token}` 
      }
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      socket.emit('entrarChat', { chatId: id });
      socket.emit('buscarHistorico', { chatId: id });
    });

    socket.on('historicoChat', (data: { chatId: string, mensagens: any[] }) => {
      const history = data.mensagens.map((msg) => {
        const isMe = msg.senderId === user.id;
        return {
          id: msg._id || msg.id,
          text: msg.content,
          sender: isMe ? 'USER' : 'AGENT', 
          agentName: isMe ? undefined : 'Cliente',
          time: new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        } as MessageType;
      });
      setMessages(history);
      setIsLoadingHistory(false);
    });

    socket.on('novaMensagem', (msg: any) => {
      const isMe = msg.senderId === user.id;
      setMessages((prev) => [...prev, {
        id: msg._id || msg.id,
        text: msg.content,
        sender: isMe ? 'USER' : 'AGENT',
        agentName: isMe ? undefined : 'Cliente',
        attachmentUrl: msg.attachmentUrl,
        time: new Date(msg.createdAt || Date.now()).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      } as MessageType]); 
    });

    return () => {
      socket.emit('sairChat', { chatId: id });
      socket.disconnect();
    };
  }, [id, user]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    socketRef.current?.emit('enviarMensagem', { chatId: id, content: inputText.trim() });
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