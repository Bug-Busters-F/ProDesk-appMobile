import { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AdminFaqCard from '@/components/faq/adminFaqCard';

const INITIAL_MOCK = [
    { id: '1', question: 'Como faço para redefinir minha senha?', answer: 'Na tela de login, clique em "Esqueci minha senha".' },
    { id: '2', question: 'Qual o tempo de resposta dos chamados?', answer: 'O tempo de resposta varia conforme a gravidade. Até 2h para críticos.' },
];

export default function FaqManagement() {
    const router = useRouter();
    const [focused, setFocused] = useState(false);
    const [search, setSearch] = useState("");
    const [faqs, setFaqs] = useState(INITIAL_MOCK); 

    const handleDelete = (id: string, question: string) => {
        Alert.alert(
            "Excluir Pergunta",
            `Tem certeza que deseja excluir: "${question}"?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir",
                    style: "destructive",
                    onPress: () => {
                        setFaqs(prev => prev.filter(f => f.id !== id));
                        Alert.alert("Sucesso", "Pergunta removida do sistema.");
                    }
                }
            ]
        );
    }

    const handleEdit = (faq: any) => {
        Alert.alert("Editar", `Abrindo modal para editar: ${faq.question}`);
    }

    const handleAdd = () => {
        Alert.alert("Nova Pergunta", "Aqui abrirá a tela/modal de criação de nova pergunta do FAQ.");
    }

    const filteredFaqs = faqs.filter(f => f.question.toLowerCase().includes(search.toLowerCase()));

    return (
        <SafeAreaView className="flex-1 px-4 bg-stone-50 mt-6">
            <ScrollView showsVerticalScrollIndicator={false}>
                <View className="flex-row items-center justify-between mb-6">
                    <View className="flex-row items-center flex-1">
                        <TouchableOpacity onPress={() => router.back()} className="mr-3">
                            <Ionicons name="arrow-back" size={28} color="#334155" />
                        </TouchableOpacity>
                        <View>
                            <Text className="text-2xl font-bold text-slate-900 mb-1">Perguntas Frequentes</Text>
                            <Text className="text-slate-500">Gerencie o FAQ do sistema</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        className="bg-orange-500 w-12 h-12 rounded-xl items-center justify-center shadow-lg shadow-orange-300"
                        onPress={() => router.push("/(admin)/registerFaq")}
                    >
                        <Ionicons name="add" size={30} color="white" />
                    </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8">
                    {['Todos', 'Mais Acessados', 'Recentes'].map((filter, index) => (
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

                <View className={`flex-row items-center rounded-xl px-4 py-3 border mb-6 ${focused ? "bg-white border-orange-500" : "bg-gray-100 border-transparent"}`}>
                    <Feather name="search" size={20} color={focused ? "#F97316" : "#9CA3AF"} />
                    <TextInput
                        placeholder="Buscar perguntas..."
                        placeholderTextColor="#9CA3AF"
                        className="ml-3 flex-1 text-gray-700 py-1"
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>

                {filteredFaqs.length > 0 ? (
                    filteredFaqs.map(faq => (
                        <AdminFaqCard
                            key={faq.id}
                            question={faq.question}
                            answerPreview={faq.answer}
                            onEdit={() => handleEdit(faq)}
                            onDelete={() => handleDelete(faq.id, faq.question)}
                        />
                    ))
                ) : (
                    <View className="items-center justify-center mt-10">
                        <Feather name="file-text" size={48} color="#CBD5E1" />
                        <Text className="text-slate-400 mt-4 text-lg">Nenhuma pergunta encontrada</Text>
                    </View>
                )}
                
                <View className="h-10" />
            </ScrollView>
        </SafeAreaView>
    );
}