import { Alert, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useRouter } from "expo-router";
import { useState } from "react";
import api from '@/services/api';

const faqValidationSchema = yup.object().shape({
    question: yup
        .string()
        .required('A pergunta é obrigatória')
        .min(5, 'A pergunta deve ter pelo menos 5 caracteres'),
    answer: yup
        .string() 
        .required('A resposta é obrigatória')
        .min(10, 'A resposta deve ter pelo menos 10 caracteres')
});
    
export default function RegisterFaqForm() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const { control, handleSubmit, clearErrors, formState: { errors } } = useForm({
        resolver: yupResolver(faqValidationSchema),
        mode: 'onSubmit'
    });
        
    const handleRegister = async (faqData: { question: string, answer: string }) => {
        setIsSubmitting(true);
        try {
            await api.post('/faqs', faqData);

            Alert.alert("Sucesso", "FAQ cadastrada com sucesso!");
            router.replace('/(admin)/faqManagement');
        } catch (error: any) {
            console.error("Erro ao cadastrar FAQ:", error);
            Alert.alert("Erro", "Não foi possível cadastrar a pergunta. Tente novamente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return(
        <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
            
            {/* Campo Pergunta */}
            <View className="mb-5 mt-2">
                <Text className="mb-1 text-gray-700 font-medium">
                    Pergunta
                </Text>
                <Controller
                    control={control}
                    name="question"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput 
                            className={`border rounded-lg px-4 h-16 focus:border-orange-700 ${errors.question ? 'border-red-500' : 'border-gray-400'}`}
                            placeholder="Ex: Como redefinir a senha?"
                            onBlur={onBlur}
                            onChangeText={(text) => {
                                onChange(text);
                                clearErrors("question");
                            }}
                            value={value}
                        />
                    )}
                />
                {errors.question && <Text className="text-xs text-red-500 mt-1">{errors.question.message}</Text>} 
            </View>

            {/* Campo Resposta */}
            <View className="mb-8">
                <Text className="mb-1 text-gray-700 font-medium">
                    Resposta
                </Text>
                <Controller
                    control={control}
                    name="answer"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput 
                            className={`border rounded-lg px-4 pt-4 pb-4 min-h-[200px] focus:border-orange-700 ${errors.answer ? 'border-red-500' : 'border-gray-400'}`}
                            placeholder="Descreva a solução para a pergunta..."
                            onBlur={onBlur}
                            onChangeText={(text) => {
                                onChange(text);
                                clearErrors("answer"); 
                            }}
                            value={value}
                            multiline={true}
                            numberOfLines={8} 
                            style={{ textAlignVertical: 'top' }} 
                        />
                    )}
                />
                {errors.answer && <Text className="text-xs text-red-500 mt-1">{errors.answer.message}</Text>} 
            </View>

            {/* Botões */}
            <TouchableOpacity 
                className="items-center py-5 bg-orange-500 rounded-lg mb-4 flex-row justify-center" 
                onPress={handleSubmit(handleRegister)}
                disabled={isSubmitting}
                style={{ elevation: 5, shadowColor: '#f97316', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4 }}
            >
                {isSubmitting ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text className="text-md text-white font-bold">
                        Cadastrar Pergunta
                    </Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity 
                className="items-center py-5 bg-white border border-gray-300 rounded-lg mb-12" 
                onPress={() => router.push('/(admin)/faqManagement')}
                disabled={isSubmitting}
            >
                <Text className="text-md text-gray-600 font-bold">
                    Cancelar
                </Text>
            </TouchableOpacity>
            
        </KeyboardAwareScrollView>
    );
}