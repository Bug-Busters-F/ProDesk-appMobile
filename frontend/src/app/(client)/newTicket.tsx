import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext'; 
import { useTicketStore } from '@/stores/ticketStore';

const BACKEND_URL = 'http://10.0.2.2:3000/ProDeskApi';

export default function NewTicket() {
  const {createNewTicket} = useTicketStore()
 
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const router = useRouter();
  const { user } = useAuth(); 

  const handleSendTicket = async () => {
        if (!isFormValid) {
            Alert.alert("Campos Obrigatórios", "Por favor, preencha o título e a descrição.")
            return
        }

        try {
            await createNewTicket({
                title: title.trim(),
                description: description.trim(),
                clientId: user?.id
            })
            router.replace('/(client)/tickets')
        } catch {
            Alert.alert("Erro", "Não foi possível abrir o chamado.")
        }
    }

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
            className="w-full h-14 border border-slate-200 rounded-xl px-4 text-slate-900"
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
            className="w-full p-4 border border-slate-200 rounded-xl text-slate-900 h-40"
            value={description}
            onChangeText={setDescription}
            editable={!isSubmitting}
          />
          <Text className={`text-right text-xs mt-1 ${description.length >= 500 ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
            {description.length}/500
          </Text>
        </View>

        <TouchableOpacity 
          onPress={handleSendTicket} 
          disabled={!isFormValid || isSubmitting}
          className={`w-full h-16 rounded-2xl flex-row items-center justify-center shadow-lg mb-4 transition-colors ${
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