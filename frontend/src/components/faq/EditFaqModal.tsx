import React, { useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '@/services/api';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const updateFaqSchema = yup.object().shape({
    question: yup
        .string()
        .required('A pergunta é obrigatória')
        .min(5, 'A pergunta deve ter pelo menos 5 caracteres'),
    answer: yup
        .string() 
        .required('A resposta é obrigatória')
        .min(10, 'A resposta deve ter pelo menos 10 caracteres')
});

type Faq = {
    id?: string;
    _id?: string;
    question: string;
    answer: string;
};

type Props = {
    visible: boolean;
    faq: Faq | null;
    onClose: () => void;
    onSuccess: () => void;
};

export default function EditFaqModal({ visible, faq, onClose, onSuccess }: Props) {
    const { 
        control, 
        handleSubmit, 
        reset, 
        clearErrors, 
        formState: { errors, isSubmitting } 
    } = useForm({
        resolver: yupResolver(updateFaqSchema),
        defaultValues: { question: '', answer: '' }
    });

    useEffect(() => {
        if (visible && faq) {
            reset({
                question: faq.question,
                answer: faq.answer
            });
            clearErrors();
        }
    }, [visible, faq, reset, clearErrors]);

    const handleCancel = () => {
        clearErrors();
        onClose();
    };

    const handleUpdate = async (data: { question: string, answer: string }) => {
        if (!faq) return;
        const faqId = faq._id || faq.id;

        try {
            await api.put(`/faqs/${faqId}`, data);
            
            Alert.alert("Sucesso", "Pergunta atualizada com sucesso!");
            onSuccess(); 
            onClose();   
        } catch (error: any) {
            console.error("Erro na atualização da FAQ:", error?.response?.data || error);
            Alert.alert("Erro ao atualizar", "Não foi possível guardar as alterações. Tente novamente.");
        }
    };

    return (
        <Modal 
            visible={visible} 
            animationType="slide" 
            transparent={true} 
            statusBarTranslucent={true}
        >
            <View className="flex-1 justify-end bg-black/50">
                <TouchableOpacity className="flex-1" onPress={handleCancel} />
                
                <View className="bg-white rounded-t-3xl p-6 h-[85%]">
                    <Text className="text-xl font-bold mb-6 text-slate-900 text-center">
                        Editar Pergunta
                    </Text>

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
                                        className={`border rounded-lg px-4 h-16 focus:border-orange-500 ${errors.question ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="Ex: Como redefinir a senha?"
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                    />
                                )}
                            />
                            {errors.question && (
                                <Text className="text-xs text-red-500 mt-1">{errors.question.message}</Text>
                            )} 
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
                                        className={`border rounded-lg px-4 pt-4 pb-4 min-h-[200px] focus:border-orange-500 ${errors.answer ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="Descreva a solução para a pergunta..."
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                        multiline={true}
                                        numberOfLines={8} 
                                        style={{ textAlignVertical: 'top' }} 
                                    />
                                )}
                            />
                            {errors.answer && (
                                <Text className="text-xs text-red-500 mt-1">{errors.answer.message}</Text>
                            )} 
                        </View>

                        {/* Botão Salvar */}
                        <TouchableOpacity 
                            className={`bg-orange-500 py-4 rounded-xl items-center mb-3 mt-4 flex-row justify-center ${isSubmitting ? 'opacity-80' : ''}`} 
                            onPress={handleSubmit(handleUpdate)} 
                            disabled={isSubmitting}
                            style={{ elevation: 3, shadowColor: '#f97316', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3 }}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-bold text-lg">Salvar Alterações</Text>
                            )}
                        </TouchableOpacity>

                        {/* Botão Cancelar */}
                        <TouchableOpacity 
                            className="bg-white border border-gray-300 py-4 rounded-xl items-center mb-10" 
                            onPress={handleCancel} 
                            disabled={isSubmitting}
                        >
                            <Text className="text-gray-600 font-bold text-lg">Cancelar</Text>
                        </TouchableOpacity>

                    </KeyboardAwareScrollView>
                </View>
            </View>
        </Modal>
    );
}