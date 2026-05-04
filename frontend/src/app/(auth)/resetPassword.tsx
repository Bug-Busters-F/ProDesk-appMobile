import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import api from '@/services/api';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup.object({
  password: yup.string()
    .required('A senha temporária é obrigatória')
    .min(8, 'A senha deve ter no mínimo 8 caracteres')
    .matches(/[A-Z]/, 'A senha deve ter pelo menos 1 letra maiúscula')
    .matches(/[a-z]/, 'A senha deve ter pelo menos 1 letra minúscula')
    .matches(/[0-9]/, 'A senha deve ter pelo menos 1 número')
    .matches(/[\W_]/, 'A senha deve ter pelo menos 1 caractere especial'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'As senhas não coincidem')
    .required('A confirmação de senha é obrigatória'),
});

type FormData = yup.InferType<typeof schema>;

export default function ResetPassword() {
  const { token } = useLocalSearchParams(); 
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  });

  const onSubmit = async (data: FormData) => {
    if (!token) {
      Alert.alert('Erro', 'Token de redefinição inválido ou ausente.');
      return;
    }

    setIsLoading(true);

    try {
      await api.post('/auth/reset-password', { 
        token, 
        newPassword: data.password 
      });

      Alert.alert('Sucesso', 'Senha alterada com sucesso!', [
        { text: 'Ir para Login', onPress: () => router.replace('/(auth)/login') }
      ]);
    } catch (error: any) {
      console.error('Erro ao redefinir senha:', error);
      const message = error.response?.data?.message || 'Não foi possível alterar a senha. O link pode ter expirado.';
      Alert.alert('Erro', message);
    } finally {
      setIsLoading(false);
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

      <View className='gap-y-4'>
        
        {/* Campo de Nova Senha */}
        <View>
          <Text className='text-gray-700 mb-2 ml-1 font-medium'>Nova Senha</Text>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <View className={`flex-row items-center bg-white border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4`}>
                <TextInput
                  className='flex-1 py-4 text-lg'
                  placeholder="Digite a senha"
                  secureTextEntry={!showPassword}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  editable={!isLoading}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons 
                    name={showPassword ? "eye-off" : "eye"} 
                    size={22} 
                    color="#6b7280" 
                  />
                </TouchableOpacity>
              </View>
            )}
          />
          {errors.password && (
            <Text className="text-red-500 text-sm mt-1 ml-1">{errors.password.message}</Text>
          )}
        </View>

        {/* Campo de Confirmação de Senha */}
        <View>
          <Text className='text-gray-700 mb-2 ml-1 font-medium'>Confirme a Nova Senha</Text>
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <View className={`flex-row items-center bg-white border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4`}>
                <TextInput
                  className='flex-1 py-4 text-lg'
                  placeholder="Confirme a senha"
                  secureTextEntry={!showConfirmPassword}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  editable={!isLoading}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons 
                    name={showConfirmPassword ? "eye-off" : "eye"} 
                    size={22} 
                    color="#6b7280" 
                  />
                </TouchableOpacity>
              </View>
            )}
          />
          {errors.confirmPassword && (
            <Text className="text-red-500 text-sm mt-1 ml-1">{errors.confirmPassword.message}</Text>
          )}
        </View>

        {/* Botão de Ação */}
        <TouchableOpacity 
          className={`p-4 rounded-lg mt-8 items-center ${isLoading ? 'bg-orange-300' : 'bg-orange-500'}`}
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className='text-white font-bold text-lg'>Redefinir Senha</Text>
          )}
        </TouchableOpacity>

        <View className='items-center mt-8'>
          <TouchableOpacity onPress={() => router.back()} disabled={isLoading}>
            <Text className='text-gray-500 underline'>
              Voltar para o Login
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}