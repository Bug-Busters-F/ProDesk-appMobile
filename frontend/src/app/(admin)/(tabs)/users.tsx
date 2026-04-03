import { useFocusEffect, useRouter } from 'expo-router'; 
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import UserCard from '@/components/UserCard';
import api from '@/services/api';

interface User {
    id: string
    name: string
    email: string
    role: string
}

export default function Users () {
    const router = useRouter();
    const [focused, setFocused] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const response = await api.get('/user')
            setUsers(response.data.data)
        } catch (error) {
            console.error("Erro ao buscar usuários:", error);
            Alert.alert("Erro", "Não foi possível carregar a lista de usuários.");
        } finally {
            setLoading(false);
        }
    }

    useFocusEffect(
        useCallback(() => {
            fetchUsers()
        }, [])
    )

    const roleNames: Record<string, string> = {
        'admin': 'Administrador',
        'client': 'Cliente',
        'support': 'Atendente'

    }

    const handleDelete = (id: string, name: string) => {
        Alert.alert(
            "Excluir usuário",
            `Tem certeza que deseja excluir o usuário ${name}?`,
            [
                {text: "Cancelar", style: "cancel"},
                {
                    text: "Excluir",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await api.delete(`/user/${id}`)
                            setUsers(prev => prev.filter(user => user.id !== id))
                            Alert.alert("Sucesso", "Usuário excluído!")
                        } catch (error) {
                            console.log("Erro ao deletar", error)
                            Alert.alert("Erro", "Não foi possível excluir o usuário")
                        }
                    }
                }
            ]
        )
    }

    {/* handleEdit aqui */}

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

                {loading ? (
                    <ActivityIndicator size="large" color="#F97316" className='mt-10' />
                ) : (
                    users?.map(user => {
                        const translatedRole = roleNames[user.role] || user.role

                        return (
                            <UserCard
                                key={user.id}
                                name={user.name}
                                email={user.email}
                                role={translatedRole}
                                onEdit={() => console.log("Editar usuário")}
                                onDelete={() => handleDelete(user.id, user.name)}
                            />
                        )
                    })
                )}

                {users.length === 0 && !loading && (
                    <Text className="text-center text-gray-500 mt-10">
                        Nenhum usuário encontrado.
                    </Text>
                )}
            </ScrollView>
        </SafeAreaView>
    )
}