import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, Alert, ScrollView, Image, Modal, Pressable, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth, api } from '@/contexts/AuthContext';
import { io } from 'socket.io-client';

export default function TicketDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  
  const [ticket, setTicket] = useState<any>(null);
  const [clientInfo, setClientInfo] = useState<{ name: string, company: string, profileImage?: string }>({
    name: 'Carregando...',
    company: '...',
  });
  const [loading, setLoading] = useState(true);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [escalateReason, setEscalateReason] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  const fetchTicket = async () => {
    try {
      const res = await api.get(`/tickets/${id}`);
      const ticketData = res.data;
      setTicket(ticketData);

      if (ticketData.clientId) {
        try {
          const userRes = await api.get(`/user/${ticketData.clientId}`);
          setClientInfo({
            name: userRes.data.name,
            company: userRes.data.company?.name || 'Sem empresa',
            profileImage: userRes.data.profileImage
          });
        } catch (userError) {
          console.log("Erro ao buscar dados do cliente", userError);
          setClientInfo({ name: 'Usuário Desconhecido', company: '-' });
        }
      }
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível carregar o chamado');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/category'); 
      setCategories(res.data);
    } catch (e) {
      console.log('Erro ao buscar categorias', e);
    }
  };

  useEffect(() => {
    fetchTicket();
    fetchCategories(); 
  }, []);

  const sendSystemMessage = async (messageText: string) => {
    try {
      const res = await api.get(`/chat/ticket/${id}`);
      const chatId = res.data?.id || res.data?._id;
      
      if (chatId && user?.token) {
        const socketUrl = api.defaults.baseURL?.replace('/ProDeskApi', '') || 'http://10.0.2.2:3000';
        const tempSocket = io(socketUrl, {
          transports: ['websocket'],
          auth: { token: user.token },
          extraHeaders: { Authorization: `Bearer ${user.token}` }
        });
        
        tempSocket.on('connect', () => {
          tempSocket.emit('enviarMensagem', { chatId, content: messageText });
          setTimeout(() => tempSocket.disconnect(), 1000);
        });
      }
    } catch (err) {
      console.log("Erro ao enviar notificação automática:", err);
    }
  };

  const handleAssignAgent = async () => {
    if (!user) {
      Alert.alert('Erro', 'Usuário não autenticado');
      return;
    }

    if (ticket?.agentId && ticket.agentId !== user.id) {
      Alert.alert('Aviso', 'Este chamado já está com outro atendente');
      return;
    }

    try {
      await api.put(`/tickets/${id}/assignAgent`, {
        agentId: user.id,
      });
      await fetchTicket();
      let realName = user.name;
      try {
        const userRes = await api.get(`/user/${user.id}`);
        if (userRes.data && userRes.data.name) {
           realName = userRes.data.name;
        }
      } catch (err) {
        console.log("Não foi possível buscar o nome real do atendente", err);
      }
      await sendSystemMessage(`👋 Olá! O especialista ${realName} acaba de assumir o seu chamado. Como podemos ajudar?`);
      
      handleOpenChat();
    } catch (error: any) {
      console.log(error?.response?.data || error);
      Alert.alert('Erro', 'Não foi possível assumir o chamado');
    }
  };

  const handleOpenChat = async () => {
    if (user?.role === 'support' && ticket?.agentId && ticket.agentId !== user.id) {
      setShowWarningModal(true);
      return;
    }

    try {
      const res = await api.get(`/chat/ticket/${id}`);
      const chatData = res.data;
      const chatId = chatData?.id || chatData?._id;

      if (!chatId) {
        Alert.alert('Aviso', 'Chat não possui ID válido');
        return;
      }

      router.push({
        pathname: '/(agent)/ticket/[id]', 
        params: { id: chatId }
      });

    } catch {
      Alert.alert('Erro', 'Falha ao abrir chat');
    }
  };

  const handleOpenEscalateModal = () => {
    if (ticket?.status !== 'IN_PROGRESS') { 
       Alert.alert('Aviso', 'O chamado precisa estar em andamento para ser escalonado.'); 
       return; 
    }
    setShowEscalateModal(true);
  };

  const confirmEscalation = async () => {
    if (!selectedCategory) {
      Alert.alert('Aviso', 'Por favor, selecione um setor/categoria de destino.');
      return;
    }
    if (!escalateReason.trim()) {
      Alert.alert('Aviso', 'Por favor, descreva o que já foi feito.');
      return;
    }

    try {
      await api.put(`/tickets/${id}/escalate`, {
        groupId: selectedCategory.id || 'UUID_PADRAO_DO_GRUPO', 
        category: selectedCategory.id,
        whatWasDone: escalateReason,
      });

      setShowEscalateModal(false);
      setEscalateReason('');
      
      await sendSystemMessage(`⚠️ [SISTEMA] Seu chamado foi escalonado para a fila da categoria "${selectedCategory.name}". Em breve um novo especialista dará andamento.`);
      
      Alert.alert('Sucesso', 'Chamado escalonado com sucesso!');
      fetchTicket();

    } catch (error: any) {
      const apiMessage = error?.response?.data?.message;
      const errorMessage = Array.isArray(apiMessage) 
         ? apiMessage.join('\n') 
         : (apiMessage || 'Falha ao escalonar chamado.');
      Alert.alert('Erro de Validação', errorMessage);
    }
  };

  const handleChangeStatus = () => {
    Alert.alert('Status', 'Implementar alteração de status');
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-[#F8F9FA]">
        <ActivityIndicator size="large" color="#f97316" />
      </SafeAreaView>
    );
  }

  const categoryName = categories.find(cat => (cat.id || cat._id) === ticket.category)?.name || ticket.category || 'Carregando...';

  if (!ticket) return null;

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FA]" edges={['top', 'bottom']}>
      {/* HEADER */}
      <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-100 bg-[#F8F9FA]">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Feather name="arrow-left" size={24} color="#1e293b" />
        </TouchableOpacity>
        <View className="items-center">
          <Text className="text-slate-800 font-bold text-lg">Detalhes do Chamado</Text>
          <Text className="text-orange-500 font-bold text-sm">#{ticket.id}</Text>
        </View>
        <TouchableOpacity onPress={() => setIsMenuVisible(true)} className="p-2">
          <Feather name="more-vertical" size={24} color="#1e293b" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* STATUS + TITULO */}
        <View className="px-6 pt-8 pb-6 flex-row items-start border-b border-gray-100">
          <View className="w-16 h-16 rounded-full bg-orange-100 items-center justify-center mr-4">
            <MaterialCommunityIcons name="ticket-confirmation-outline" size={32} color="#f97316" />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center mb-1.5">
              <View className="w-2.5 h-2.5 rounded-full bg-orange-500 mr-2" />
              <Text className="text-orange-500 font-bold text-xs uppercase tracking-wider">
                STATUS: {ticket.status}
              </Text>
            </View>
            <Text className="text-xl font-bold text-slate-800 mb-1 leading-6">
              {ticket.title || 'Chamado'}
            </Text>
            <Text className="text-slate-400 text-sm">
              Alta Prioridade
            </Text>
          </View>
        </View>

        {/* CLIENTE */}
        <View className="px-6 py-6 flex-row justify-between">
          <View className="flex-1">
            <Text className="text-slate-400 text-xs font-bold mb-2">CLIENTE</Text>
            <View className="flex-row items-center">
              <Image
                source={{ uri: clientInfo.profileImage || 'https://i.pravatar.cc/100?img=33' }}
                className="w-7 h-7 rounded-full mr-2 bg-gray-300"
              />
              <Text className="text-slate-800 font-medium" numberOfLines={1}>
                {clientInfo.name}
              </Text>
            </View>
          </View>
          <View className="flex-1 pl-4">
            <Text className="text-slate-400 text-xs font-bold mb-2">EMPRESA</Text>
            <View className="flex-row items-center">
              <MaterialIcons name="domain" size={18} color="#94a3b8" />
              <Text className="text-slate-800 font-medium ml-1.5" numberOfLines={1}>
                {clientInfo.company}
              </Text>
            </View>
          </View>
        </View>

        {/* DESCRIÇÃO */}
        <View className="px-6 mb-6">
          <Text className="text-slate-400 text-xs font-bold mb-2">DESCRIÇÃO DETALHADA</Text>
          <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <Text className="text-slate-600 leading-6">
              {ticket.description}
            </Text>
          </View>
        </View>

        {/* INFO */}
        <View className="px-6 mb-8 flex-row justify-between">
          <View className="flex-1">
            <Text className="text-slate-400 text-xs font-bold mb-2">CATEGORIA</Text>
            <View className="bg-orange-50 self-start px-3 py-1.5 rounded-lg">
              <Text className="text-orange-500 font-bold text-sm">
                {categoryName}
              </Text>
            </View>
          </View>
          <View className="flex-1 pl-4">
            <Text className="text-slate-400 text-xs font-bold mb-2">DATA/HORA</Text>
            <View className="flex-row items-center mt-1">
              <Feather name="calendar" size={16} color="#94a3b8" />
              <Text className="text-slate-600 ml-2 text-sm font-medium">
                {new Date(ticket.createdAt).toLocaleString('pt-BR')}
              </Text>
            </View>
          </View>
        </View>

        {/* BOTÕES */}
        <View className="px-6 pb-10">
          {ticket.status === 'OPEN' || !ticket.agentId ? (
            <TouchableOpacity
              onPress={handleAssignAgent}
              className="bg-orange-500 py-4 rounded-2xl flex-row justify-center items-center mb-4"
            >
              <MaterialCommunityIcons name="account-check" size={22} color="white" />
              <Text className="text-white font-bold text-base ml-2">
                Atender Chamado
              </Text>
            </TouchableOpacity>
            ) : (
              user?.role === 'admin' || ticket.agentId === user?.id || ticket.clientId === user?.id ? (
                <TouchableOpacity
                  onPress={handleOpenChat}
                  className="bg-orange-500 py-4 rounded-2xl flex-row justify-center items-center mb-4"
                >
                  <MaterialCommunityIcons name="reply" size={22} color="white" />
                  <Text className="text-white font-bold text-base ml-2">
                    Responder Cliente
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  activeOpacity={1} 
                  onPress={handleOpenChat} 
                  className="bg-gray-200 py-4 rounded-2xl flex-row justify-center items-center mb-4"
                >
                  <MaterialCommunityIcons name="lock-outline" size={22} color="#64748b" />
                  <Text className="text-slate-500 font-bold text-base ml-2">
                    Em atendimento por outro colaborador
                  </Text>
                </TouchableOpacity>
              )
            )}

          <TouchableOpacity
            onPress={handleChangeStatus}
            className="bg-transparent border-2 border-orange-400 py-4 rounded-2xl flex-row justify-center items-center mb-4"
          >
            <MaterialIcons name="swap-horiz" size={24} color="#f97316" />
            <Text className="text-orange-500 font-bold text-base ml-2">
              Alterar Status
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleOpenEscalateModal}
            className="bg-transparent border-2 border-red-500 py-4 rounded-2xl flex-row justify-center items-center"
          >
            <Text className="text-red-500 font-extrabold text-lg mr-2">!</Text>
            <Text className="text-red-500 font-bold text-base">
              Escalonar Chamado
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={showEscalateModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEscalateModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white pt-4 pb-8 px-6 rounded-t-3xl shadow-2xl">
            
            <View className="items-center mb-6">
              <View className="w-12 h-1.5 bg-gray-200 rounded-full" />
            </View>

            <Text className="text-xl font-bold text-slate-800 mb-4">
              Escalonar Chamado
            </Text>

            {/* SELEÇÃO DE DESTINO (SETOR/CATEGORIA) */}
            <Text className="text-slate-500 font-medium mb-2 text-sm">
              Para qual setor deseja enviar?
            </Text>
            <View className="flex-row flex-wrap mb-4">
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl border mr-2 mb-2 ${
                    selectedCategory?.id === cat.id 
                      ? 'bg-orange-50 border-orange-500' 
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <Text className={selectedCategory?.id === cat.id ? 'text-orange-600 font-bold' : 'text-slate-600'}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text className="text-slate-500 font-medium mb-2 text-sm">
              Descreva o que já foi tentado:
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-slate-700 mb-6 h-32"
              placeholder="Ex: Reiniciei o servidor, mas o erro de timeout persiste..."
              placeholderTextColor="#94a3b8"
              multiline
              textAlignVertical="top"
              value={escalateReason}
              onChangeText={setEscalateReason}
            />

            {/* BOTÕES DE AÇÃO */}
            <View className="flex-row justify-between">
              <TouchableOpacity
                onPress={() => setShowEscalateModal(false)}
                className="flex-1 bg-gray-100 py-4 rounded-xl items-center mr-2"
              >
                <Text className="text-slate-500 font-bold text-base">Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={confirmEscalation}
                className="flex-1 bg-red-500 py-4 rounded-xl items-center ml-2 flex-row justify-center"
              >
                <Feather name="corner-up-right" size={18} color="white" className="mr-2" />
                <Text className="text-white font-bold text-base ml-1">Escalonar</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

      <Modal
        visible={isMenuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsMenuVisible(false)} 
      >
        <Pressable 
          className="flex-1 bg-black/20" 
          onPress={() => setIsMenuVisible(false)}
        >
          <View className="absolute top-16 right-4 w-56 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            
            <TouchableOpacity
              onPress={() => {
                setIsMenuVisible(false); 
                router.push({
                  pathname: '/(agent)/ticket/history/[id]',
                  params: { id }
                });
              }}
              className="flex-row items-center px-4 py-4 border-b border-gray-50 active:bg-gray-50"
            >
              <Feather name="clock" size={18} color="#64748b" />
              <Text className="ml-3 text-slate-700 font-medium">Ver Histórico</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsMenuVisible(false)}
              className="flex-row items-center px-4 py-4 active:bg-gray-50"
            >
              <Feather name="x" size={18} color="#ef4444" />
              <Text className="ml-3 text-red-500 font-medium">Cancelar</Text>
            </TouchableOpacity>
            
          </View>
        </Pressable>
      </Modal>

      <Modal
        visible={showWarningModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowWarningModal(false)}
      >
        <Pressable 
          className="flex-1 justify-end bg-black/40"
          onPress={() => setShowWarningModal(false)} 
        >
          <Pressable className="bg-white pt-4 pb-10 px-6 rounded-t-3xl shadow-2xl">
            
            <View className="items-center mb-6">
              <View className="w-12 h-1.5 bg-gray-200 rounded-full" />
            </View>

            {/* Ícone */}
            <View className="items-center mb-4">
              <View className="w-16 h-16 bg-red-50 rounded-full items-center justify-center">
                <Feather name="shield-off" size={28} color="#ef4444" />
              </View>
            </View>

            {/* Textos */}
            <Text className="text-2xl font-bold text-slate-800 text-center mb-2">
              Acesso Restrito
            </Text>
            <Text className="text-slate-500 text-center mb-8 leading-6 text-base">
              Este chamado já está sendo atendido por outro especialista. Apenas o responsável pode visualizar e enviar mensagens.
            </Text>

            {/* Botão de Ação Primária */}
            <TouchableOpacity
              onPress={() => setShowWarningModal(false)}
              className="bg-slate-800 py-4 rounded-2xl items-center"
            >
              <Text className="text-white font-bold text-lg">
                Entendi
              </Text>
            </TouchableOpacity>

          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}