import { useFocusEffect, useRouter } from 'expo-router'; 
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import AccessRequestCard from '@/components/user/AccessRequestCard';
import api from '@/services/api';

interface RequestModel {
    id: string;
    _id?: string;
    name: string;
    email: string;
    cnpj: string;
}

export default function AccessRequests() {
    const router = useRouter();
    const [requests, setRequests] = useState<RequestModel[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Controle de requisição em andamento por card
    const [actionState, setActionState] = useState<{ id: string, type: 'approve' | 'reject' } | null>(null);

    // Sistema de paginação idêntico ao users.tsx
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchRequests = async (pageNumber: number = 1) => {
        try {
            setLoading(true);
            const response = await api.get('/user/requests', {
                params: { status: 'PENDING', page: pageNumber, limit: 10 }
            });
            
            const fetchedRequests = response.data.data || response.data.requests || response.data.items || (Array.isArray(response.data) ? response.data : []);
            setRequests(fetchedRequests);
            
            const meta = response.data.meta || response.data;
            const calcTotalPages = meta.totalPages || (fetchedRequests.length === 10 ? pageNumber + 1 : pageNumber);
            setTotalPages(calcTotalPages);
            setPage(pageNumber);

        } catch (error) {
            console.error("Erro ao buscar solicitações:", error);
            Alert.alert("Erro", "Não foi possível carregar a lista de solicitações.");
        } finally {
            setLoading(false);
        }
    }

    useFocusEffect(
        useCallback(() => {
            fetchRequests(1);
        }, [])
    );

    const handleApprove = async (id: string) => {
        setActionState({ id, type: 'approve' });
        try {
            await api.patch(`/user/approve/${id}`);
            Alert.alert("Sucesso", "Solicitação aprovada com sucesso!");
            fetchRequests(page); // Atualiza a página atual mantendo a posição
        } catch (error) {
            console.error("Erro ao aprovar", error);
            Alert.alert("Erro", "Não foi possível aprovar a solicitação.");
        } finally {
            setActionState(null);
        }
    };

    const handleReject = (id: string) => {
        Alert.alert(
            "Negar solicitação",
            "Tem certeza que deseja negar o acesso para esta empresa?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Negar",
                    style: "destructive",
                    onPress: async () => {
                        setActionState({ id, type: 'reject' });
                        try {
                            await api.patch(`/user/reject/${id}`);
                            Alert.alert("Sucesso", "Solicitação negada com sucesso.");
                            fetchRequests(page); 
                        } catch (error) {
                            console.error("Erro ao negar", error);
                            Alert.alert("Erro", "Não foi possível negar a solicitação.");
                        } finally {
                            setActionState(null);
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView className="flex-1 px-4 bg-stone-50 mt-6">
            <ScrollView showsVerticalScrollIndicator={false}>
                <View className="flex-row items-center mb-6 mt-2">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2 bg-white rounded-full shadow-sm">
                        <Feather name="arrow-left" size={24} color="#0f172a" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-2xl font-bold text-slate-900">Solicitações Pendentes</Text>
                        <Text className="text-slate-500">Aprove ou negue acessos</Text>
                    </View>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#F97316" className='mt-10' />
                ) : (
                    (requests || []).map(req => {
                        const reqId = req.id || (req._id as string);

                        return (
                            <AccessRequestCard
                                key={reqId}
                                name={req.name}
                                email={req.email}
                                cnpj={req.cnpj}
                                isApproving={actionState?.id === reqId && actionState.type === 'approve'}
                                isRejecting={actionState?.id === reqId && actionState.type === 'reject'}
                                onApprove={() => handleApprove(reqId)}
                                onReject={() => handleReject(reqId)}
                            />
                        )
                    })
                )}

                {(requests || []).length === 0 && !loading && (
                    <View className="items-center mt-16 mb-10">
                        <Feather name="check-circle" size={48} color="#CBD5E1" className="mb-4" />
                        <Text className="text-center text-gray-500 text-lg">
                            Nenhuma solicitação pendente!
                        </Text>
                    </View>
                )}

                {/* Paginação */}
                {!loading && totalPages > 0 && (requests || []).length > 0 && (
                    <View className="mt-6 mb-16 items-center gap-3">
                        <View className="flex-row items-center gap-1.5 mb-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                <TouchableOpacity
                                    key={p}
                                    onPress={() => fetchRequests(p)}
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
                                onPress={() => fetchRequests(page - 1)}
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
                                onPress={() => fetchRequests(page + 1)}
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
        </SafeAreaView>
    );
}