import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import ClientFaqCard from '@/components/faq/ClientFaqCard';
import api from '@/services/api';

interface Faq {
    _id?: string;
    id?: string;
    question: string;
    answer: string;
}

export default function ClientFaq() {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [focused, setFocused] = useState(false);
    const [faqs, setFaqs] = useState<Faq[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchFaqs = async () => {
            try {
                const response = await api.get('/faqs');
                setFaqs(response.data);
            } catch (error) {
                console.error("Erro ao buscar FAQs:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFaqs();
    }, []);

    const filteredFaqs = faqs.filter(f =>
        f.question?.toLowerCase().includes(search.toLowerCase()) ||
        f.answer?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1 px-6 pt-4">
                <View className="flex-row items-center mb-8">
                    <TouchableOpacity onPress={() => router.back()} disabled={isLoading}>
                        <Ionicons name="arrow-back" size={24} color="#1e293b" />
                    </TouchableOpacity>
                    <Text className="flex-1 text-center text-lg font-bold text-slate-800 mr-6">
                        Ajuda e FAQ
                    </Text>
                </View>

                <Text className="text-3xl font-bold text-slate-900 mb-2">Dúvidas Frequentes</Text>
                <Text className="text-slate-500 mb-8 leading-5">
                    {isLoading ? 'Carregando...' : `Explore nossa base com ${filteredFaqs.length} pergunta${filteredFaqs.length !== 1 ? 's' : ''} respondida${filteredFaqs.length !== 1 ? 's' : ''}.`}
                </Text>

                <View
                    className={`flex-row items-center rounded-2xl px-4 py-3 mb-6 border ${
                        focused
                            ? 'bg-white border-orange-300 shadow-sm'
                            : 'bg-white border-slate-200'
                    }`}
                    style={focused ? { shadowColor: '#F97316', shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 } : {}}
                >
                    <Feather name="search" size={17} color={focused ? "#F97316" : "#A8A29E"} />
                    <TextInput
                        placeholder="Pesquise sua dúvida..."
                        placeholderTextColor="#94A3B8"
                        className="ml-3 flex-1 text-slate-700 py-0.5 text-base"
                        value={search}
                        onChangeText={setSearch}
                    />
                    {search.length > 0 && (
                        <TouchableOpacity onPress={() => setSearch('')} activeOpacity={0.7}>
                            <View className="w-5 h-5 bg-slate-200 rounded-full items-center justify-center">
                                <Feather name="x" size={11} color="#64748B" />
                            </View>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Content */}
                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 24 }}
                >
                    {isLoading ? (
                        <View className="items-center justify-center mt-16">
                            <ActivityIndicator size="large" color="#F97316" />
                            <Text className="text-slate-400 mt-4 text-sm">Carregando perguntas...</Text>
                        </View>
                    ) : filteredFaqs.length > 0 ? (
                        <View className="gap-y-1">
                            {filteredFaqs.map((faq, index) => (
                                <ClientFaqCard
                                    key={faq._id || faq.id}
                                    question={faq.question}
                                    answer={faq.answer}
                                />
                            ))}
                        </View>
                    ) : (
                        <View className="items-center justify-center mt-16">
                            <View className="w-16 h-16 bg-slate-50 rounded-full items-center justify-center mb-4">
                                <Feather name="search" size={26} color="#CBD5E1" />
                            </View>
                            <Text className="text-slate-700 font-semibold text-base">Nenhum resultado</Text>
                            <Text className="text-slate-400 text-sm mt-1 text-center px-8">
                                Tente outras palavras ou abra um chamado abaixo.
                            </Text>
                        </View>
                    )}
                </ScrollView>
            </View>

            <View className="px-5 py-4 bg-white border-t border-slate-100">
                <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() => router.push('/(client)/newTicket')}
                >
                    <View className="rounded-2xl overflow-hidden">
                        <View className="bg-orange-500 p-4 flex-row items-center shadow-lg shadow-orange-300">
                            <View className="w-11 h-11 bg-white/20 rounded-xl items-center justify-center mr-4">
                                <MaterialCommunityIcons name="face-agent" size={22} color="#ffffff" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-white font-bold text-base tracking-tight">Ainda tem dúvidas?</Text>
                                <Text className="text-orange-100 text-xs mt-0.5 leading-4">
                                    Fale com um atendente agora mesmo.
                                </Text>
                            </View>
                            <View className="w-8 h-8 bg-white/20 rounded-full items-center justify-center">
                                <Feather name="arrow-right" size={15} color="#ffffff" />
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    );
}