import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function NewTicket() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const router = useRouter();

  const handleSendTicket = () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert("Campos Obrigatórios", "Por favor, preencha o título e a descrição antes de enviar.");
      return;
    }

    // POST para API
    // const response = await api.post('/tickets', { title, description... });

    const ticketId = '12345';
    router.replace({
      pathname: '/(client)/ticket/[id]',
      params: { id: ticketId },
    });
  };
  const isFormValid = title.trim().length > 0 && description.trim().length > 0;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 pt-20">
        <View className="flex-row items-center mb-8">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1e293b" />
          </TouchableOpacity>
          <Text className="flex-1 text-center text-lg font-bold text-slate-800 mr-6">
            Abertura de Chamado
          </Text>
        </View>

        <Text className="text-3xl font-bold text-slate-900 mb-2">Novo Chamado</Text>
        <Text className="text-slate-500 mb-8 leading-5">
          Preencha os dados abaixo para que nossa equipe possa te ajudar o mais rápido possível.
        </Text>

        <View className="mb-6">
          <Text className="text-slate-700 font-semibold mb-2">
            Título do Problema <Text className="text-red-500">*</Text>
          </Text>
          <TextInput
            placeholder="Ex: Falha na conexão com o servidor"
            className="w-full h-14 border border-slate-200 rounded-xl px-4 text-slate-900"
            value={title}
            onChangeText={setTitle}
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
            className="w-full p-4 border border-slate-200 rounded-xl text-slate-900 h-40"
            value={description}
            onChangeText={setDescription}
          />
          <Text className={`text-right text-xs mt-1 ${description.length >= 500 ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
            {description.length}/500
          </Text>
        </View>

        <TouchableOpacity className="w-full border-2 border-dashed border-slate-300 rounded-xl p-6 flex-row items-center justify-center mb-8">
          <View className="bg-orange-100 p-2 rounded-lg mr-4">
            <Ionicons name="attach" size={20} color="#f97316" />
          </View>
          <View>
            <Text className="font-bold text-slate-800">Anexar evidências (opcional)</Text>
            <Text className="text-slate-400 text-xs">PDF, JPG ou PNG de até 5MB</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={handleSendTicket}
          disabled={!isFormValid}
          className={`w-full h-16 rounded-2xl flex-row items-center justify-center shadow-lg mb-4 transition-colors ${
            isFormValid ? 'bg-orange-500 shadow-orange-300' : 'bg-slate-300 shadow-slate-200'
          }`}
        >
          <Text className="text-white font-bold text-lg mr-2">Enviar Chamado</Text>
          <Ionicons name="send" size={18} color="white" />
        </TouchableOpacity>

        <Text className="text-center text-slate-400 text-xs mb-8">
          Nossa equipe responde em média em até 2 horas úteis.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
