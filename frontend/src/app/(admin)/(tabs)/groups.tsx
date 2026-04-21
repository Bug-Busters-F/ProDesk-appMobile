import { useFocusEffect, useRouter } from 'expo-router'; 
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import GroupCard from '@/components/group/GroupCard';
import EditCategoryModal from '@/components/group/EditCategoryModal'; 
import api from '@/services/api';

interface Group {
    id: string;
    name: string;
    keywords: string[];
    trainingPhrases: string[];
}

export default function Groups () {
    const router = useRouter();
    const [focused, setFocused] = useState(false);
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true); 
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [groupToEdit, setGroupToEdit] = useState<Group | null>(null);

    const fetchGroups = async () => {
        try {
            setLoading(true);
            const response = await api.get('/category'); 
            setGroups(response.data);
        } catch (error) {
            console.error("Erro ao buscar grupos:", error);
            Alert.alert("Erro", "Não foi possível carregar a lista de grupos.");
        } finally {
            setLoading(false);
        }
    }

    useFocusEffect(
        useCallback(() => {
            fetchGroups();
        }, [])
    );

    const handleDelete = (id: string, name: string) => {
        Alert.alert(
            "Excluir grupo",
            `Tem certeza que deseja excluir o grupo ${name}?`,
            [
                {text: "Cancelar", style: "cancel"},
                {
                    text: "Excluir",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await api.delete(`/category/${id}`); 
                            setGroups(prev => prev.filter(group => group.id !== id));
                            Alert.alert("Sucesso", "Grupo excluído!");
                        } catch (error) {
                            console.log("Erro ao deletar", error);
                            Alert.alert("Erro", "Não foi possível excluir o grupo.");
                        }
                    }
                }
            ]
        );
    }

    const handleOpenEdit = (group: Group) => {
        setGroupToEdit(group);
        setIsEditModalVisible(true);
    };

    const handleUpdateSuccess = (updatedGroup: Group) => {
        setGroups(prevGroups => 
            prevGroups.map(group => 
                group.id === updatedGroup.id ? updatedGroup : group
            )
        );
    };

    return (
        <SafeAreaView className="flex-1 px-4 bg-stone-50 mt-6">
            <ScrollView showsVerticalScrollIndicator={false}>
                <View className="flex-row items-center justify-between mb-6">
                    <View>
                        <Text className="text-2xl font-bold text-slate-900">Controle de Grupos</Text>
                        <Text className="text-slate-500">Gerencie os setores de atendimento</Text>
                    </View>
                    <TouchableOpacity
                        className="bg-orange-500 w-12 h-12 rounded-xl items-center justify-center shadow-lg shadow-orange-300"
                        onPress={() => router.push('/(admin)/registerGroup')}
                    >
                        <Ionicons name="add" size={30} color="white" />
                    </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8 max-h-10">
                    {['Todos', 'Ativos', 'Inativos'].map((filter, index) => (
                        <TouchableOpacity
                            key={filter}
                            className={`px-4 py-2 rounded-full mr-2 ${index === 0 ? 'bg-orange-500' : 'bg-slate-50 border border-slate-200'}`}
                        >
                            <Text className={`font-medium ${index === 0 ? 'text-white' : 'text-slate-500'}`}>
                                {filter}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <View
                    className={`flex-row items-center rounded-xl px-4 mb-6 py-3 border ${
                        focused
                        ? "bg-white border-orange-500"
                        : "bg-white border-gray-200"
                    }`}
                >
                    <Feather
                        name="search"
                        size={20}
                        color={focused ? "#F97316" : "#9CA3AF"}
                    />

                    <TextInput
                        placeholder="Procure grupo por nome"
                        placeholderTextColor="#9CA3AF"
                        className="ml-3 flex-1 text-gray-700"
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                    />
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#F97316" className='mt-10' />
                ) : (
                    groups?.map(group => (
                        <GroupCard
                            key={group.id}
                            name={group.name}
                            description={
                                group.keywords.length > 0
                                    ? group.keywords.slice(0, 3).join(', ') + 
                                      (group.keywords.length > 3 ? '...' : '')
                                    : `${group.trainingPhrases.length} frases de treino`
                            }
                            onEdit={() => handleOpenEdit(group)}
                            onDelete={() => handleDelete(group.id, group.name)}
                        />
                    ))
                )}
                <View className="h-20" /> 
            </ScrollView>
            <EditCategoryModal 
                visible={isEditModalVisible}
                category={groupToEdit} 
                onClose={() => setIsEditModalVisible(false)}
                onSuccess={handleUpdateSuccess}
            />
        </SafeAreaView>
    );
}