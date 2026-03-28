import { View, Text, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import LoginForm from '@/components/LoginForm';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Login() {
  const { signIn, isLoading } = useAuth();

  return (
    <SafeAreaView className='flex-1 px-4 bg-stone-50'>
      {/* Logo ProDesk */}
      <View className='flex items-center mb-14'>
        <Image
          source={require('../../../assets/images/ProDesk-Logo.png')}
          className='w-28 h-28 '
        />
        <Text className=' text-3xl font-bold'>
          ProDesk
        </Text>
      </View>

      {/* Welcome Section */}
      <View className='flex items-center'>
        <Text className='text-4xl font-bold mb-2'>
          Bem-Vindo
        </Text>
        <Text className='text-lg mb-9'>
          Faça login para acessar sua conta 
        </Text>
      </View>

      {/* Formulario de login */}
      <View> 
        <LoginForm />
      </View>

      {/* Regsitro e Recuperar Senha */}
      <View className='items-center'>
        <TouchableOpacity onPress={() => {/* Funcao do Redirect */}}>
          <Text className='mb-4 text-orange-500'>
          Esqueci minha senha
        </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {/* Funcao do Redirect */}}>
          <Text className='mb-24 underline text-gray-500'>
            Solicitar Acesso
          </Text>
        </TouchableOpacity>
      </View>

      {/* Apenas para testar acesso/redirect */}
      <View className="flex-row justify-around">
        <TouchableOpacity
          className="bg-orange-500 px-4 rounded-xl justify-center items-center h-14 w-20"
          onPress={() => signIn('cliente')}
          disabled={isLoading}
        >
          <Text className="text-white font-bold text-lg">Cli</Text>  
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-orange-500 px-4 rounded-xl justify-center items-center h-14 w-20"
          onPress={() => signIn('atendente')}
          disabled={isLoading}
        >
          <Text className="text-white font-bold text-lg">Ate</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-orange-500 px-4 rounded-xl items-center justify-center h-14 w-20"
          onPress={() => signIn('admin')}
          disabled={isLoading}
        >
          <Text className="text-white font-bold text-lg">Adm</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View className='items-center flex-1 justify-end pb-8'>
        <Text className='text-sm text-gray-300'>
          © 2026 ProDesk. Todos os direitos reservados.
        </Text>
      </View>
    </SafeAreaView>
  );
}