import { View, Text, TouchableOpacity } from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Profile() {
  const { signOut, user } = useAuth();
  
  return (
    <SafeAreaView className="flex-1 bg-stone-50 justify-center items-center">
      <View className="items-center mb-8">
        <View className="w-24 h-24 bg-orange-100 rounded-full items-center justify-center mb-4">
          <Text className="text-orange-500 text-3xl font-bold">C</Text>
        </View>
        <Text className="text-2xl font-bold text-slate-800">Cliente</Text>
        <Text className="text-slate-500">Empresa Pro6Tech</Text>
      </View>

      <TouchableOpacity 
        onPress={signOut}
        className="bg-red-50 px-8 py-4 rounded-xl border border-red-100"
      >
        <Text className="text-red-500 font-bold text-lg">Encerrar Sessão</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}