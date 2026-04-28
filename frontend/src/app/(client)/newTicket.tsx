import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext'; 
import * as DocumentPicker from 'expo-document-picker';
import { uploadFile } from '@/services/api';

const BACKEND_URL = 'http://10.0.2.2:3000/ProDeskApi';

export default function NewTicket() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachment, setAttachment] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  
  const router = useRouter();
  const { user } = useAuth(); 

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ 
        type: '*/*',
        copyToCacheDirectory: true 
      });
      
      if (!result.canceled) {
        setAttachment(result.assets[0]);
      }
    } catch (error) {
      console.error("Erro ao selecionar documento:", error);
      Alert.alert("Erro", "Não foi possível selecionar o arquivo.");
    }
  };

  const handleSendTicket = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert("Campos Obrigatórios", "Por favor, preencha o título e a descrição antes de enviar.");
      return;
    }

    setIsSubmitting(true);

    try {
      let fileUrl = '';
      if (attachment) {
        fileUrl = await uploadFile(attachment.uri, attachment.name);
      }
      const triageResponse = await fetch(`${BACKEND_URL}/triage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: description.trim() })
      });
      
      const triageData = await triageResponse.json();
      const category = triageData.value || 'OTHER';

      const ticketResponse = await fetch(`${BACKEND_URL}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category: category,
          clientId: user?.id,
          attachmentUrl: fileUrl 
        })
      });

      if (!ticketResponse.ok) throw new Error("Falha ao criar ticket");
      
      const ticketData = await ticketResponse.json();
      const ticketId = ticketData.id || ticketData._id;

      const initialMessage = `[ NOVA SOLICITAÇÃO ]\n\nTítulo: ${title.trim()}\nDescrição: ${description.trim()}`;

      router.replace({
        pathname: '/(client)/ticket/[id]',
        params: { 
          id: ticketId,
          initialMessage: initialMessage, 
          isNewTicket: 'true',
          attachmentUrl: fileUrl
        },
      });

    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível abrir o chamado. Verifique a sua conexão.");
      setIsSubmitting(false);
    }
  };

  const isFormValid = title.trim().length > 0 && description.trim().length > 0;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 pt-20">
        
        <View className="flex-row items-center mb-8">
          <TouchableOpacity onPress={() => router.back()} disabled={isSubmitting}>
            <Ionicons name="arrow-back" size={24} color="#1e293b" />
          </TouchableOpacity>
          <Text className="flex-1 text-center text-lg font-bold text-slate-800 mr-6">
            Abertura de Chamado
          </Text>
        </View>

        <Text className="text-3xl font-bold text-slate-900 mb-2">Novo Chamado</Text>
        <Text className="text-slate-500 mb-8 leading-5">
          Preencha os dados abaixo para que a nossa inteligência artificial o direcione.
        </Text>

        <View className="mb-6">
          <Text className="text-slate-700 font-semibold mb-2">
            Título do Problema <Text className="text-red-500">*</Text>
          </Text>
          <TextInput
            placeholder="Ex: Falha na conexão com o servidor"
            className="w-full h-14 border border-slate-200 rounded-xl px-4 text-slate-900 focus:border-orange-500"
            value={title}
            onChangeText={setTitle}
            editable={!isSubmitting}
          />
        </View>

        <View className="mb-6">
          <Text className="text-slate-700 font-semibold mb-2">
            Descrição Detalhada <Text className="text-red-500">*</Text>
          </Text>
          <TextInput
            placeholder="Descreva o que está acontecendo com o máximo de detalhes..."
            multiline
            numberOfLines={6}
            maxLength={500}
            textAlignVertical="top"
            className="w-full p-4 border border-slate-200 rounded-xl text-slate-900 h-40 focus:border-orange-500"
            value={description}
            onChangeText={setDescription}
            editable={!isSubmitting}
          />
          <Text className={`text-right text-xs mt-1 ${description.length >= 500 ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
            {description.length}/500
          </Text>
        </View>

        <View className="mb-8">
          <Text className="text-slate-700 font-semibold mb-2">Anexo (opcional)</Text>
          
          {!attachment ? (
            <TouchableOpacity 
              onPress={handlePickDocument}
              disabled={isSubmitting}
              className="border-2 border-dashed border-slate-300 rounded-xl p-6 items-center justify-center bg-slate-50"
            >
              <Feather name="paperclip" size={24} color="#64748b" />
              <Text className="text-slate-500 mt-2 font-medium">Selecionar arquivo ou foto</Text>
            </TouchableOpacity>
          ) : (
            <View className="flex-row items-center bg-orange-50 p-4 rounded-xl border border-orange-200">
              <Feather name="file" size={20} color="#f97316" />
              <Text className="flex-1 ml-3 text-slate-700 font-medium" numberOfLines={1}>
                {attachment.name}
              </Text>
              <TouchableOpacity onPress={() => setAttachment(null)} disabled={isSubmitting}>
                <Ionicons name="close-circle" size={24} color="#ef4444" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <TouchableOpacity 
          onPress={handleSendTicket}
          disabled={!isFormValid || isSubmitting}
          className={`w-full h-16 rounded-2xl flex-row items-center justify-center shadow-lg mb-10 transition-colors ${
            isFormValid && !isSubmitting ? 'bg-orange-500 shadow-orange-300' : 'bg-slate-300 shadow-slate-200'
          }`}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text className="text-white font-bold text-lg mr-2">Enviar Chamado</Text>
              <Ionicons name="send" size={18} color="white" />
            </>
          )}
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}