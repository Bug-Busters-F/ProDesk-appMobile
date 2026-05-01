import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import LoginForm from '@/components/auth/LoginForm';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function Login() {
   const router = useRouter();

  return (
    <SafeAreaView className='flex-1 px-4 bg-stone-50'>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
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
          <TouchableOpacity onPress={() => router.push('/(auth)/forgotPassword')}>
            <Text className='mb-4 text-orange-500'>
            Esqueci minha senha
          </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(auth)/registerAccess')}>
            <Text className='mb-24 underline text-gray-500'>
              Solicitar Acesso
            </Text>
          </TouchableOpacity>
        </View>

        

        {/* Footer */}
        <View className='items-center flex-1 justify-end pb-8'>
          <Text className='text-sm text-gray-300'>
            © 2026 ProDesk. Todos os direitos reservados.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}