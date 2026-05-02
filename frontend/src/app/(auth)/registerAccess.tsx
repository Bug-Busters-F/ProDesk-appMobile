import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '@/services/api';

const schema = yup.object({
  name: yup
    .string()
    .required('O nome completo é obrigatório.'),
  email: yup
    .string()
    .email('Digite um e-mail válido.')
    .required('O e-mail profissional é obrigatório.'),
  cnpj: yup
    .string()
    .required('O CNPJ é obrigatório.')
    .min(14, 'O CNPJ deve ter no mínimo 14 dígitos.')
});

type FormData = yup.InferType<typeof schema>;

export default function RegisterAccess() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const { control, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      cnpj: ''
    }
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);

    try {
      await api.post('/user/requestAccess', data);
      Alert.alert(
        'Solicitação Enviada',
        'Sua solicitação de acesso foi recebida. Nossa equipe entrará em contato em breve.',
        [{ text: 'OK', onPress: () => {
            reset();
            router.back();
        }}]
      );
    } catch (error: any) {
      console.error('Erro ao solicitar acesso:', error);
      
      // Captura a mensagem de erro vinda do backend (NestJS)
      let errorMessage = 'Não foi possível enviar sua solicitação. Tente novamente mais tarde.';
      
      if (error.response && error.response.data && error.response.data.message) {
        const backendMessage = error.response.data.message;
        // O NestJS pode retornar um array de strings (erros de validação) ou uma string direta
        errorMessage = Array.isArray(backendMessage) ? backendMessage[0] : backendMessage;
      }

      Alert.alert('Atenção', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className='flex-1 bg-stone-50 mt-6'>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className='px-4'>
        {/* Títulos de Instrução */}
        <View className='flex mb-6'>
          <Text className='text-3xl font-bold mb-2'>
            Solicitar Acesso
          </Text>
          <Text className='text-lg text-gray-500'>
            Preencha os campos abaixo com as informações da sua organização. Sua solicitação será analisada pela nossa equipe interna e você receberá um retorno em breve por e-mail.
          </Text>
        </View>

        {/* Formulário */}
        <View className='gap-y-5'>
          
          {/* Input Nome */}
          <View>
            <Text className='text-gray-700 mb-2 ml-1 font-medium'>Nome Completo</Text>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className={`bg-white border p-4 rounded-xl text-lg ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Digite seu nome"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  editable={!isLoading}
                />
              )}
            />
            {errors.name && <Text className="text-red-500 text-sm mt-1 ml-1">{errors.name.message}</Text>}
          </View>

          {/* Input Email */}
          <View>
            <Text className='text-gray-700 mb-2 ml-1 font-medium'>E-mail Profissional</Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className={`bg-white border p-4 rounded-xl text-lg ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="exemplo@empresa.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  editable={!isLoading}
                />
              )}
            />
            {errors.email && <Text className="text-red-500 text-sm mt-1 ml-1">{errors.email.message}</Text>}
          </View>

          {/* Input CNPJ */}
          <View>
            <Text className='text-gray-700 mb-2 ml-1 font-medium'>CNPJ da Empresa</Text>
            <Controller
              control={control}
              name="cnpj"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className={`bg-white border p-4 rounded-xl text-lg ${errors.cnpj ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="00.000.000/0000-00"
                  keyboardType="numeric"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  editable={!isLoading}
                />
              )}
            />
            {errors.cnpj && <Text className="text-red-500 text-sm mt-1 ml-1">{errors.cnpj.message}</Text>}
          </View>

          {/* Botão de Envio (Aciona o handleSubmit do Hook Form) */}
          <TouchableOpacity 
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
            className={`p-4 rounded-xl items-center mt-4 shadow-sm ${isLoading ? 'bg-orange-300' : 'bg-orange-500'}`}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className='text-white font-bold text-lg'>
                Solicitar Acesso
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Botão Voltar */}
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