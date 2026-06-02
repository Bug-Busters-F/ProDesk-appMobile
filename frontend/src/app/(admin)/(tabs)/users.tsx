import { useFocusEffect, useRouter } from 'expo-router'; 
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import UserCard from '@/components/user/UserCard';
import api from '@/services/api';
import EditUserModal from '@/components/user/EditUserModal';

interface User {
    id: string;
    _id?: string;
    name: string;
    email: string;
    role: string;
    companyId?: string | any;
    company?: any;
    categories?: string[] | any[];
}

export default function Users () {
    const router = useRouter();
    const [focused, setFocused] = useState(false);
    const [search, setSearch] = useState('');
    const [activeFilter, setActiveFilter] = useState('Todos');
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [photoRefreshToken, setPhotoRefreshToken] = useState(0);

    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(search.toLowerCase()) || 
        user.email.toLowerCase().includes(search.toLowerCase())
    );

    const fetchUsers = async (pageNumber: number = 1) => {
        try {
            setLoading(true);
            const params: any = { page: pageNumber, limit: 50 }; // Aumentado o limite para busca local mais eficaz
            
            if (activeFilter !== 'Todos') {
                const roleMap: Record<string, string> = {
                    'Administrador': 'admin',
                    'Atendente': 'support',
                    'Cliente': 'client'
                }
                params.role = roleMap[activeFilter];
            }

            const response = await api.get('/user', { params });
            
            const fetchedUsers = response.data.data || response.data.users || response.data.items || (Array.isArray(response.data) ? response.data : []);
            setUsers(fetchedUsers);
            
            const meta = response.data.meta || response.data;
            const calcTotalPages = meta.totalPages || (fetchedUsers.length === 50 ? pageNumber + 1 : pageNumber);
            setTotalPages(calcTotalPages);
            setPage(pageNumber);

        } catch (error) {
            console.error("Erro ao buscar usuários:", error);
            Alert.alert("Erro", "Não foi possível carregar a lista de usuários.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchUsers(1);
    }, [activeFilter]);

    useFocusEffect(
        useCallback(() => {
            fetchUsers(1);
            setPhotoRefreshToken(prev => prev + 1);
        }, [activeFilter])
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
                            fetchUsers(page);
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

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setIsEditModalVisible(true);
    };

    return (
        <SafeAreaView className="flex-1 px-4 bg-stone-50 mt-6">
            <ScrollView showsVerticalScrollIndicator={false}>
                <View className="flex-row items-center justify-between mb-6">
                    <View>
                        <Text className="text-2xl font-bold text-slate-900 mb-2">Controle de Usuários</Text>
                        <Text className="text-slate-500">Gerencie os usuários do sistema</Text>
                    </View>
                    <TouchableOpacity
                        className="bg-orange-500 w-12 h-12 rounded-xl items-center justify-center shadow-lg shadow-orange-300"
                        onPress={() => router.push('/(admin)/registerUser')}
                    >
                        <Ionicons name="add" size={30} color="white" />
                    </TouchableOpacity>
                </View>

                <View
                    className={`flex-row items-center rounded-xl px-4 mb-6 py-3 border ${
                        focused ? "bg-white border-orange-500" : "bg-gray-100 border-transparent"
                    }`}
                    >
                    <Feather name="search" size={20} color={focused ? "#F97316" : "#9CA3AF"} />
                    <TextInput
                        placeholder="Procure por nome"
                        placeholderTextColor="#9CA3AF"
                        className="ml-3 flex-1 text-gray-700"
                        value={search}
                        onChangeText={setSearch}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                    />
                </View> 

                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-10 h-12" contentContainerStyle={{ paddingBottom: 8 }}>
                  {['Todos', 'Administrador', 'Atendente', 'Cliente'].map((filter) => {
                    const isActive = activeFilter === filter;
                    return (
                      <TouchableOpacity
                        key={filter}
                        onPress={() => setActiveFilter(filter)}
                        className={`px-5 py-2 rounded-full mr-3 h-10 items-center justify-center ${isActive ? 'bg-orange-500' : 'bg-orange-50'}`}
                      >
                        <Text className={`font-bold ${isActive ? 'text-white' : 'text-orange-500'}`}>
                          {filter}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                <TouchableOpacity 
                    onPress={() => router.push('/(admin)/accessRequests')}
                    className="flex-row items-center justify-between bg-slate-50 border border-slate-100 p-4 rounded-2xl mb-6"
                >
                    <View className="flex-row items-center">
                        <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center mr-3">
                            <MaterialCommunityIcons name="account-clock" size={20} color="#f97316" />
                        </View>
                        <View>
                            <Text className="font-bold text-slate-800">Solicitações de Acesso</Text>
                            <Text className="text-xs text-slate-400">Ver pedidos pendentes</Text>
                        </View>
                    </View>
                    <Feather name="chevron-right" size={20} color="#CBD5E1" />
                </TouchableOpacity>

                {loading ? (
                    <ActivityIndicator size="large" color="#F97316" className='mt-10' />
                ) : (
                    filteredUsers?.map(user => {
                        const safeRole = user.role?.toLowerCase();
                        const translatedRole = roleNames[safeRole] || user.role;
                        const userId = user.id || (user._id as string);

                        return (
                            <UserCard
                                key={userId}
                                userId={userId}
                                name={user.name}
                                email={user.email}
                                role={translatedRole}
                                refreshToken={photoRefreshToken}
                                onEdit={() => handleEdit(user)}
                                onDelete={() => handleDelete(userId, user.name)}
                            />
                        )
                    })
                )}

                {filteredUsers.length === 0 && !loading && (
                    <Text className="text-center text-gray-500 mt-10 mb-10">
                        Nenhum usuário encontrado.
                    </Text>
                )}

                {!loading && totalPages > 0 && (
                <View className="mt-6 mb-16 items-center gap-3">
                    <View className="flex-row items-center gap-1.5 mb-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                            <TouchableOpacity
                                key={p}
                                onPress={() => fetchUsers(p)}
                                className={`rounded-full transition-all ${
                                    p === page
                                        ? 'w-6 h-2.5 bg-orange-500'
                                        : 'w-2.5 h-2.5 bg-slate-200'
                                }`}
                            />
                        ))}
                    </View>

                    <Text className="text-xs text-slate-400 font-medium tracking-wide">
                        Página <Text className="text-orange-500 font-bold">{page}</Text> de {totalPages}
                    </Text>

                    <View className="flex-row items-center gap-3">
                        <TouchableOpacity
                            disabled={page === 1}
                            onPress={() => fetchUsers(page - 1)}
                            className={`flex-row items-center gap-2 px-5 py-3 rounded-2xl ${
                                page === 1
                                    ? 'bg-slate-100'
                                    : 'bg-orange-500 shadow-md shadow-orange-300'
                            }`}
                        >
                            <Feather
                                name="arrow-left"
                                size={16}
                                color={page === 1 ? '#CBD5E1' : 'white'}
                            />
                            <Text className={`font-semibold text-sm ${page === 1 ? 'text-slate-300' : 'text-white'}`}>
                                Anterior
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            disabled={page >= totalPages}
                            onPress={() => fetchUsers(page + 1)}
                            className={`flex-row items-center gap-2 px-5 py-3 rounded-2xl ${
                                page >= totalPages
                                    ? 'bg-slate-100'
                                    : 'bg-orange-500 shadow-md shadow-orange-300'
                            }`}
                        >
                            <Text className={`font-semibold text-sm ${page >= totalPages ? 'text-slate-300' : 'text-white'}`}>
                                Próxima
                            </Text>
                            <Feather
                                name="arrow-right"
                                size={16}
                                color={page >= totalPages ? '#CBD5E1' : 'white'}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            )}
            </ScrollView>

            <EditUserModal
                visible={isEditModalVisible}
                user={selectedUser}
                onClose={() => {
                    setIsEditModalVisible(false);
                    setSelectedUser(null);
                }}
                onSuccess={() => fetchUsers(page)} 
            />
        </SafeAreaView>
    )
}