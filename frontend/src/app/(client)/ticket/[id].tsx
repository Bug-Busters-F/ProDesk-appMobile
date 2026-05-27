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
import { MessageBubble, MessageType } from '@/components/chat/MessageBubble';
import { useAuth } from '@/contexts/AuthContext';
import * as DocumentPicker from 'expo-document-picker';
import api, { uploadFile } from '@/services/api';

export default function TicketChatScreen() {
  const router = useRouter();
  
  const { id: routeId, initialMessage, isNewTicket, attachmentUrl, ticketId } = useLocalSearchParams();
  const realTicketId = (isNewTicket === 'true' ? routeId : ticketId) as string;
  const { user } = useAuth();
  
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  
  const [realChatId, setRealChatId] = useState<string | null>(null);
  
  const flatListRef = useRef<FlatList>(null);
  const socketRef = useRef<Socket | null>(null);
  const hasSentInitialMessage = useRef(false);

  const namesCache = useRef<Record<string, string>>({});
  
  const handlePickAndSendFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
    
    if (!result.canceled && realChatId) {
        const file = result.assets[0];
        const fileUrl = await uploadFile(file.uri, file.name);
        
        const isImage = file.name.match(/\.(jpeg|jpg|gif|png)$/i);
        const messageType = isImage ? 'IMAGE' : 'FILE';
        
        socketRef.current?.emit('enviarMensagem', { 
            chatId: realChatId, 
            content: isImage ? 'Imagem enviada' : 'Arquivo enviado',
            attachmentUrl: fileUrl,
            type: messageType 
        });
    }
  };

  useEffect(() => {
    const setupChatRoom = async () => {
      try {
        let finalChatId = null;

        if (isNewTicket === 'true') {
            const chatResponse = await api.post('/chat', {
                ticketId: routeId,
                clientId: user?.id,
            });
            
            const chatData = chatResponse.data;
            finalChatId = chatData.id || chatData._id;
        } else {
           finalChatId = routeId as string;
        }

        if (finalChatId) {
           setRealChatId(finalChatId);
        }
      } catch (error: any) {
        console.log('ERRO API CHAT:', error?.response?.data || error.message);
        Alert.alert('Erro', 'Não foi possível criar a sala de chat.');
      }
    };

    if (user?.id && routeId) {
      setupChatRoom();
    }
  }, [routeId, isNewTicket, user?.id]);

  useEffect(() => {
    if (!user?.token || !realChatId) return;
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
      socket.emit('entrarChat', { chatId: realChatId });
      socket.emit('buscarHistorico', { chatId: realChatId });

      if (initialMessage && !hasSentInitialMessage.current) {
        hasSentInitialMessage.current = true;
        const safeAttachmentUrl = Array.isArray(attachmentUrl) ? attachmentUrl[0] : attachmentUrl;
        
        const isImage = safeAttachmentUrl && safeAttachmentUrl.match(/\.(jpeg|jpg|gif|png)$/i);
        const tipoInicial = safeAttachmentUrl ? (isImage ? 'IMAGE' : 'FILE') : 'TEXT';

        socket.emit('enviarMensagem', { 
          chatId: realChatId, 
          content: initialMessage,
          attachmentUrl: safeAttachmentUrl, 
          type: tipoInicial 
        });
      }
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

    socket.on('erro', (err) => console.log('Erro Socket:', err));

    return () => {
      socket.emit('sairChat', { chatId: realChatId });
      socket.disconnect();
    };
  }, [realChatId, user, initialMessage, attachmentUrl]);

  const handleSendMessage = () => {
    if (!inputText.trim() || !realChatId) return; 
    socketRef.current?.emit('enviarMensagem', { chatId: realChatId, content: inputText.trim() });
    setInputText('');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        
        <View className="flex-row items-center justify-between px-6 py-4 border-b border-slate-100 shadow-sm z-10 bg-white">
          <View className="flex-row items-center flex-1 mr-4">
            <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2 -ml-2">
              <Ionicons name="arrow-back" size={24} color="#1e293b" />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-lg font-bold text-slate-800" numberOfLines={1}>
                Protocolo #{typeof routeId === 'string' ? routeId.slice(-6).toUpperCase() : 'NOVO'}
              </Text>
              <Text className="text-orange-500 font-bold text-xs">ONLINE AGORA</Text>
            </View>
          </View>

          {isNewTicket !== 'true' && realChatId && (
            <TouchableOpacity 
              onPress={() => router.push({
                pathname: '/(client)/ticket/history/[id]',
                params: { id: realTicketId }
              })}
              className="p-2 bg-slate-50 border border-slate-200 rounded-full"
            >
              <Feather name="clock" size={20} color="#64748b" />
            </TouchableOpacity>
          )}
        </View>

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

        <View className="flex-row items-center px-4 py-3 border-t border-slate-100 bg-white">
          <TouchableOpacity onPress={handlePickAndSendFile} className="p-2">
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