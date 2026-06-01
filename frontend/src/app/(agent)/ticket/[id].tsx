import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { io, Socket } from 'socket.io-client';
import { MessageBubble, MessageType } from '@/components/chat/MessageBubble';
import { api, useAuth } from '@/contexts/AuthContext';
import * as DocumentPicker from 'expo-document-picker';
import { uploadFile } from '@/services/api';

export default function AgentTicketChatScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); 
  const { user } = useAuth();
  
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isTicketClosed, setIsTicketClosed] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);
  const socketRef = useRef<Socket | null>(null);
  
  const namesCache = useRef<Record<string, string>>({});

  const checkTicketStatus = async () => {
    try {
      const chatRes = await api.get(`/chat/${id}`);
      const ticketId = chatRes.data.ticketId;
      if (ticketId) {
        const ticketRes = await api.get(`/tickets/${ticketId}`);
        if (ticketRes.data.status === 'CLOSED') {
          setIsTicketClosed(true);
        }
      }
    } catch (e) {
      console.log('Erro ao buscar status do chamado', e);
    }
  };

  useEffect(() => {
    if (id) {
      checkTicketStatus();
    }
  }, [id]);

  useEffect(() => {
   if (!user?.token) return;

    const socketUrl = api.defaults.baseURL?.replace('/ProDeskApi', '') || 'http://10.0.2.2:3000';

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

    socket.on('historicoChat', async (data: { chatId: string, mensagens: any[] }) => {
      const uniqueIds = [...new Set(data.mensagens.map(m => m.senderId).filter(Boolean))];

      await Promise.all(uniqueIds.map(async (uid: any) => {
        if (!namesCache.current[uid]) {
          try {
            const res = await api.get(`/user/${uid}`);
            namesCache.current[uid] = res.data.name.split(' ')[0];
            namesCache.current[`role_${uid}`] = res.data.role;
          } catch(e) {
            namesCache.current[uid] = 'Usuário';
            namesCache.current[`role_${uid}`] = 'client';
          }
        }
      }));

      const history = data.mensagens.map((msg) => {
        const isMe = msg.senderId === user.id;
        const senderName = msg.isSystemMessage ? 'Sistema' : (namesCache.current[msg.senderId] || 'Usuário');
        const senderRole = namesCache.current[`role_${msg.senderId}`] || 'client'; 

        return {
          id: msg._id || msg.id,
          text: msg.content,
          attachmentUrl: msg.attachmentUrl, 
          type: msg.type, 
          sender: isMe ? 'USER' : (msg.isSystemMessage ? 'BOT' : 'AGENT'),
          senderRole: senderRole as any, 
          agentName: isMe ? undefined : senderName,
          time: new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        } as MessageType;
      });
      
      setMessages(history);
      setIsLoadingHistory(false);
    });

   socket.on('novaMensagem', async (msg: any) => {
      const isMe = msg.senderId === user.id;
      let senderName = 'Usuário';
      let senderRole = 'client';

      if (!isMe && !msg.isSystemMessage) {
          if (!namesCache.current[msg.senderId]) {
            try {
              const res = await api.get(`/user/${msg.senderId}`);
              namesCache.current[msg.senderId] = res.data.name.split(' ')[0];
              namesCache.current[`role_${msg.senderId}`] = res.data.role;
            } catch(e) {
              namesCache.current[msg.senderId] = 'Usuário';
              namesCache.current[`role_${msg.senderId}`] = 'client';
            }
          }
          senderName = namesCache.current[msg.senderId] || 'Usuário';
          senderRole = namesCache.current[`role_${msg.senderId}`] || 'client';
      }

      setMessages((prev) => [...prev, {
        id: msg._id || msg.id,
        text: msg.content,
        attachmentUrl: msg.attachmentUrl, 
        type: msg.type,
        sender: isMe ? 'USER' : (msg.isSystemMessage ? 'BOT' : 'AGENT'),
        senderRole: senderRole as any,
        agentName: isMe ? undefined : senderName,
        time: new Date(msg.createdAt || Date.now()).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      } as MessageType]);
    });

    return () => {
      socket.emit('sairChat', { chatId: id });
      socket.disconnect();
    };
  }, [id, user]);

  const handlePickAndSendFile = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      multiple: true,
    });

    if (!result.canceled) {
      for (const file of result.assets) {
        const fileUrl = await uploadFile(file.uri, file.name);

        const isImage = file.name.match(/\.(jpeg|jpg|gif|png)$/i);
        const messageType = isImage ? 'IMAGE' : 'FILE';

        socketRef.current?.emit('enviarMensagem', {
          chatId: id,
          content: isImage ? 'Imagem enviada' : 'Arquivo enviado',
          attachmentUrl: fileUrl,
          type: messageType,
        });
      }
    }
  } catch (error) {
    console.log('ERRO COMPLETO:', error);
  }
};

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

        {isTicketClosed ? (
          <View className="px-6 py-4 border-t border-slate-100 bg-slate-50 items-center justify-center">
            <View className="bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100 flex-row items-center">
              <Feather name="check-circle" size={16} color="#10b981" />
              <Text className="text-emerald-700 font-bold text-xs ml-2 text-center">
                Este chamado foi resolvido. O chat está fechado para novas mensagens.
              </Text>
            </View>
          </View>
        ) : (
          <View className="flex-row items-center px-4 py-3 border-t border-slate-100 bg-white">
            <TouchableOpacity
              onPress={handlePickAndSendFile}
              className="p-2"
            >
              <Feather
                name="plus-circle"
                size={24}
                color="#94a3b8"
              />
            </TouchableOpacity>
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
        )}

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}