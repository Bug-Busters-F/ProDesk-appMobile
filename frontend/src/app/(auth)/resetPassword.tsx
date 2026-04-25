import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';

export default function ResetPassword() {
  const { token } = useLocalSearchParams(); 
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleResetPassword = async () => {
    if (!token) {
      Alert.alert('Erro', 'Token de redefinição inválido ou ausente.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }

    try {
      Alert.alert('Sucesso', 'Senha alterada com sucesso!');
      router.replace('/(auth)/login'); 
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível alterar a senha.');
    }
  };

  return (
    <SafeAreaView className='flex-1 px-4 bg-stone-50'>
      <View className='mb-10 items-center'>
        <Text className='text-3xl font-bold mb-2'>Nova Senha</Text>
        <Text className='text-gray-500 text-center'>
          Digite sua nova senha para atualizar sua conta.
        </Text>
      </View>

      <View className='space-y-4'>
        <TextInput
          className='bg-white border border-gray-300 p-4 rounded-lg'
          placeholder="Nova Senha"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TextInput
          className='bg-white border border-gray-300 p-4 rounded-lg mt-4'
          placeholder="Confirme a Nova Senha"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity 
          className='bg-orange-500 p-4 rounded-lg mt-8 items-center'
          onPress={handleResetPassword}
        >
          <Text className='text-white font-bold text-lg'>Redefinir Senha</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}