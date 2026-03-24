// src/app/(auth)/login.tsx
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
  const { signIn, isLoading } = useAuth();

  return (
    <View className="flex-1 justify-center px-6 bg-white">
      <View className="gap-4">
        <TouchableOpacity
          className="bg-blue-600 p-4 rounded-xl items-center mt-4 flex-row justify-center h-14"
          onPress={() => signIn('cliente')}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-lg">Entrar como Cliente</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-emerald-600 p-4 rounded-xl items-center flex-row justify-center h-14"
          onPress={() => signIn('atendente')}
          disabled={isLoading}
        >
          <Text className="text-white font-bold text-lg">Entrar como Atendente</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-purple-600 p-4 rounded-xl items-center flex-row justify-center h-14"
          onPress={() => signIn('admin')}
          disabled={isLoading}
        >
          <Text className="text-white font-bold text-lg">Entrar como Admin</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}