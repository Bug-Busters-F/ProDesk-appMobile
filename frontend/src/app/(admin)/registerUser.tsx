import { Text, View, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from '@expo/vector-icons/Ionicons';

export default function RegisterUser () {
    return(
        <SafeAreaView className='flex-1 bg-stone-50'>
            {/* Barra do topo */}
            <View className="h-16 w-full px-2 mb-6 flex-row items-center justify-between border-b-2">
                <View>
                    <Image
                        source={require('../../../assets/images/ProDesk-Logo.png')}
                        className='w-14 h-14'
                    />
                </View>
                <View>
                    <Text className="text-lg font-semibold">
                        Cadastro
                    </Text>
                </View>
                <View className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <Ionicons name="notifications-outline" size={24} color="#FF8C00" />
                </View>
            </View>
            <View className="px-4">
                
                {/* Texto Inicial */}
                <View>
                    <Text className='text-4xl font-bold mb-2'>
                        Cadastro de Usuários
                    </Text>
                    <Text className='text-gray-400 text-md mb-9'>
                        Gerencie o acesso à plataforma criando novas credenciais de forma segura e rápida
                    </Text>
                </View>

                {/* Formulario de Cadastro */}
            </View>
        </SafeAreaView>
    )
}