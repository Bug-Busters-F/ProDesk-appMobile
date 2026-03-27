import { useRouter } from 'expo-router'; 
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from '@expo/vector-icons';

export default function Users () {
    const router = useRouter(); 

    return (
        <SafeAreaView className="flex-1 px-4 bg-stone-50">
            <View>
                <Text className='text-2xl'>
                    Página que mostra os Usuários
                </Text>
                <TouchableOpacity 
                    className="flex-row items-center bg-orange-500 px-4 py-2 rounded-lg"
                    onPress={() => router.push('/(admin)/registerUser')} 
                    >
                    <Feather name="plus" size={20} color="white" />
                        <Text className="text-white font-bold ml-2">
                            Novo Usuário
                        </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}