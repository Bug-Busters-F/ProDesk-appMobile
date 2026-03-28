import { useRouter } from 'expo-router'; 
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import UserCard from '@/components/UserCard';

export default function Users () {
    const router = useRouter();
    const [focused, setFocused] = useState(false);  

    return (
        <SafeAreaView className="flex-1 px-4 bg-stone-50 mt-6">
            <ScrollView>
                <View className="flex-row items-center justify-between mb-6">
                    <View>
                        <Text className="text-2xl font-bold text-slate-900">Controle de Usuários</Text>
                        <Text className="text-slate-500">Gerencie os usuários do sistema</Text>
                    </View>
                    <TouchableOpacity
                        className="bg-orange-500 w-12 h-12 rounded-xl items-center justify-center shadow-lg shadow-orange-300"
                        onPress={() => router.push('/(admin)/registerUser')}
                    >
                        <Ionicons name="add" size={30} color="white" />
                    </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8">
                    {['Todos', 'Clientes', 'Atendentes', 'Administradores'].map((filter, index) => (
                        <TouchableOpacity
                        key={filter}
                        className={`px-4 py-2 rounded-full mr-2 ${index === 0 ? 'bg-orange-500' : 'bg-slate-50 border border-slate-100'}`}
                        >
                        <Text className={`font-medium ${index === 0 ? 'text-white' : 'text-slate-500'}`}>
                            {filter}
                        </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <View
                    className={`flex-row items-center rounded-xl px-4 mb-10 py-3 border ${
                        focused
                        ? "bg-white border-orange-500"
                        : "bg-gray-100 border-transparent"
                    }`}
                    >
                    <Feather
                        name="search"
                        size={20}
                        color={focused ? "#F97316" : "#9CA3AF"}
                    />

                    <TextInput
                        placeholder="Procure por nome"
                        placeholderTextColor="#9CA3AF"
                        className="ml-3 flex-1 text-gray-700"
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                    />
                </View>

                <UserCard
                    name="Renan Tomasi"
                    email="renan@empresa.com.br"
                    role="Administrador"
                    onEdit={() => console.log("Editar")}
                    onDelete={() => console.log("Excluir")}
                />
            </ScrollView>
        </SafeAreaView>
    )
}