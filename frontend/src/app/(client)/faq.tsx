import { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import ClientFaqCard from '@/components/faq/clientFaqCard';

const MOCK_FAQS = [
    { id: '1', question: 'Como faço para redefinir minha senha?', answer: 'Na tela de login, clique em "Esqueci minha senha". Enviaremos um e-mail com as instruções para cadastrar uma nova senha segura.' },
    { id: '2', question: 'Qual o tempo de resposta dos chamados?', answer: 'O tempo de resposta (SLA) varia conforme a gravidade. Chamados críticos são respondidos em até 2 horas, enquanto dúvidas gerais têm prazo de 24 horas úteis.' },
    { id: '3', question: 'Como anexo um arquivo no meu chamado?', answer: 'Ao criar ou editar um chamado, clique no ícone de "clipe" na parte inferior da tela para selecionar documentos ou imagens da sua galeria.' },
];

export default function ClientFaq() {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [focused, setFocused] = useState(false);

    const filteredFaqs = MOCK_FAQS.filter(f => 
        f.question.toLowerCase().includes(search.toLowerCase()) || 
        f.answer.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <SafeAreaView className="flex-1 bg-stone-50">
            <View className="px-6 pt-6 pb-4 bg-white shadow-sm flex-row items-center">
                <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2 bg-slate-50 rounded-full">
                    <Ionicons name="arrow-back" size={24} color="#334155" />
                </TouchableOpacity>
                <View>
                    <Text className="text-2xl font-bold text-slate-900">Ajuda e FAQ</Text>
                    <Text className="text-slate-500 text-sm">Dúvidas frequentes</Text>
                </View>
            </View>

            <ScrollView className="flex-1 px-4 pt-6" showsVerticalScrollIndicator={false}>
                <View className={`flex-row items-center rounded-xl px-4 py-3 border mb-8 ${focused ? "bg-white border-orange-500" : "bg-gray-100 border-transparent"}`}>
                    <Feather name="search" size={20} color={focused ? "#F97316" : "#9CA3AF"} />
                    <TextInput
                        placeholder="Pesquise sua dúvida..."
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
                        <ClientFaqCard key={faq.id} question={faq.question} answer={faq.answer} />
                    ))
                ) : (
                    <View className="items-center justify-center mt-10">
                        <Feather name="info" size={48} color="#CBD5E1" />
                        <Text className="text-slate-400 mt-4 text-lg">Nenhuma pergunta encontrada</Text>
                    </View>
                )}
                <View className="h-10" />
            </ScrollView>
        </SafeAreaView>
    );
}