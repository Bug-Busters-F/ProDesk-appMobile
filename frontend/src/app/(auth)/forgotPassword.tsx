// frontend/src/app/(auth)/forgotPassword.tsx
import { View, Text, TouchableOpacity, Image, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import api from '@/services/api'; // Importação da sua API configurada

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Estado para controlar o loading

  const handleSendLink = async () => {
    // Validação simples
    if (!email.trim()) {
      Alert.alert('Atenção', 'Por favor, insira o seu e-mail.');
      return;
    }

    setIsLoading(true);

    try {
      // Faz a requisição POST para o backend
      // NOTA: Confirme se o caminho do endpoint é exatamente '/auth/forgot-password'
      await api.post('/auth/forgot-password', { email });
      
      Alert.alert(
        'Sucesso!', 
        'Se o e-mail estiver registado, receberá as instruções para redefinir a sua senha em breve.',
        [
          { 
            text: 'Voltar ao Login', 
            onPress: () => router.back() // Volta para o login automaticamente após o sucesso
          }
        ]
      );
    } catch (error) {
      console.error('Erro ao enviar e-mail de recuperação:', error);
      Alert.alert(
        'Erro', 
        'Não foi possível enviar o link de recuperação. Verifique a sua ligação ou tente novamente mais tarde.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className='flex-1 bg-stone-50 mt-6'>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className='px-4'>
        {/* Secção de Instruções */}
        <View className='flex mb-4'>
          <Text className='text-3xl font-bold mb-2'>
            Recuperar Senha
          </Text>
          <Text className='text-lg mb-9 text-gray-500'>
            Insira o seu e-mail registado para receber as instruções de redefinição.
          </Text>
        </View>

        {/* Formulário de Recuperação */}
        <View className='gap-y-4'>
          <View>
            <Text className='text-gray-700 mb-2 ml-1 font-medium'>E-mail</Text>
            <TextInput
              className='bg-white border border-gray-300 p-4 rounded-xl text-lg'
              placeholder="exemplo@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              editable={!isLoading} 
            />
          </View>

          <TouchableOpacity 
            onPress={handleSendLink}
            disabled={isLoading} 
            className={`p-4 rounded-xl items-center mt-4 shadow-sm ${isLoading ? 'bg-orange-300' : 'bg-orange-500'}`}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className='text-white font-bold text-lg'>
                Enviar Link de Recuperação
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Voltar para o Login */}
        <View className='items-center mt-8'>
          <TouchableOpacity onPress={() => router.back()} disabled={isLoading}>
            <Text className='text-gray-500 underline'>
              Voltar para o Login
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className='items-center flex-1 justify-end pb-8 mt-10'>
          <Text className='text-sm text-gray-300'>
            © 2026 ProDesk. Todos os direitos reservados.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}