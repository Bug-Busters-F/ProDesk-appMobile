import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '@/services/api';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Feather } from '@expo/vector-icons';

const updateCategorySchema = yup.object().shape({
    name: yup.string().required('O nome é obrigatório'),
    keywords: yup.array().of(yup.string().required()), 
    trainingPhrases: yup.array().of(yup.string().required())
});

type Category = {
    id: string;
    name: string;
    keywords: string[];
    trainingPhrases: string[];
};

type Props = {
    visible: boolean;
    category: Category | null;
    onClose: () => void;
    onSuccess: (updated: Category) => void;
};

export default function EditCategoryModal({ visible, category, onClose, onSuccess }: Props) {
    const { control, handleSubmit, reset, setValue, watch, setError, clearErrors, formState: { errors, isSubmitting } } = useForm({
        resolver: yupResolver(updateCategorySchema),
        defaultValues: { name: '', keywords: [], trainingPhrases: [] }
    });

    const [keywordInput, setKeywordInput] = useState('');
    const [phraseInput, setPhraseInput] = useState('');

    const keywords = watch('keywords') || [];
    const trainingPhrases = watch('trainingPhrases') || [];

    useEffect(() => {
        if (category) {
            reset({
                name: category.name,
                keywords: category.keywords || [],
                trainingPhrases: category.trainingPhrases || []
            });
            setKeywordInput('');
            setPhraseInput('');
        }
    }, [category, reset]);

    const addKeyword = () => {
        if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
            setValue('keywords', [...keywords, keywordInput.trim()]);
            setKeywordInput('');
            clearErrors('keywords'); 
        }
    };

    const addPhrase = () => {
        if (phraseInput.trim() && !trainingPhrases.includes(phraseInput.trim())) {
            setValue('trainingPhrases', [...trainingPhrases, phraseInput.trim()]);
            setPhraseInput('');
            clearErrors('trainingPhrases'); 
        }
    };

    const handleUpdate = async (data: any) => {
        if (!category) return;

        let hasError = false;

        if (!data.keywords || data.keywords.length === 0) {
            setError('keywords', { type: 'manual', message: 'É obrigatório adicionar pelo menos uma keyword.' });
            hasError = true;
        }

        if (!data.trainingPhrases || data.trainingPhrases.length === 0) {
            setError('trainingPhrases', { type: 'manual', message: 'É obrigatório adicionar pelo menos uma frase de treinamento.' });
            hasError = true;
        }

        if (hasError) return; 

        try {
            await api.patch(`/category/${category.id}`, data);
            onSuccess({ ...category, ...data });
            Alert.alert("Sucesso", "Categoria atualizada!");
            onClose();
        } catch (error) {
            Alert.alert("Erro", "Falha ao atualizar categoria.");
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true} statusBarTranslucent={true}>
            <View className="flex-1 justify-end bg-black/50">
                <TouchableOpacity className="flex-1" onPress={onClose} />
                
                <View className="bg-white rounded-t-3xl p-6 h-[85%]">
                    <Text className="text-xl font-bold mb-4">Editar Categoria</Text>
                    
                    <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
                        {/* NOME */}
                        <Controller control={control} name="name" render={({ field: { onChange, value } }) => (
                            <View className="mb-4">
                                <Text className="text-xs text-gray-500 mb-1">Nome</Text>
                                <TextInput className="border border-gray-300 rounded-lg py-3 px-3" value={value} onChangeText={onChange} />
                                {errors.name && <Text className="text-xs text-red-500 mt-1">{errors.name.message as string}</Text>}
                            </View>
                        )} />

                        {/* KEYWORDS */}
                        <View className="mb-4">
                            <Text className="text-xs text-gray-500 mb-1">Keywords</Text>
                            <View className="flex-row mb-2">
                                <TextInput className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2" value={keywordInput} onChangeText={setKeywordInput} onSubmitEditing={addKeyword} />
                                <TouchableOpacity className="bg-orange-500 px-4 justify-center rounded-r-lg" onPress={addKeyword}>
                                    <Feather name="plus" size={20} color="white" />
                                </TouchableOpacity>
                            </View>
                            <View className="flex-row flex-wrap gap-2">
                                {keywords.map((kw, i) => (
                                    <View key={i} className="flex-row bg-gray-200 px-3 py-1 rounded-full items-center">
                                        <Text className="text-xs mr-2">{kw}</Text>
                                        <TouchableOpacity onPress={() => setValue('keywords', keywords.filter((k: string) => k !== kw))}>
                                            <Feather name="x" size={12} color="red" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                            {errors.keywords && <Text className="text-xs text-red-500 mt-2">{errors.keywords.message as string}</Text>}
                        </View>

                        {/* FRASES */}
                        <View className="mb-6">
                            <Text className="text-xs text-gray-500 mb-1">Frases de Treinamento</Text>
                            <View className="flex-row mb-2">
                                <TextInput className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2" value={phraseInput} onChangeText={setPhraseInput} onSubmitEditing={addPhrase} />
                                <TouchableOpacity className="bg-orange-500 px-4 justify-center rounded-r-lg" onPress={addPhrase}>
                                    <Feather name="plus" size={20} color="white" />
                                </TouchableOpacity>
                            </View>
                            <View className="gap-2">
                                {trainingPhrases.map((phrase, i) => (
                                    <View key={i} className="flex-row bg-gray-50 border border-gray-200 p-2 rounded items-center justify-between">
                                        <Text className="text-xs flex-1">{phrase}</Text>
                                        <TouchableOpacity onPress={() => setValue('trainingPhrases', trainingPhrases.filter((p: string) => p !== phrase))}>
                                            <Feather name="trash" size={14} color="red" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                            {errors.trainingPhrases && <Text className="text-xs text-red-500 mt-2">{errors.trainingPhrases.message as string}</Text>}
                        </View>

                        <TouchableOpacity className="bg-orange-500 py-4 rounded-xl items-center mb-3" onPress={handleSubmit(handleUpdate)}>
                            {isSubmitting ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold">Salvar Alterações</Text>}
                        </TouchableOpacity>

                        <TouchableOpacity className="bg-white border border-gray-300 py-4 rounded-xl items-center mb-10" onPress={onClose}>
                            <Text className="text-gray-600 font-bold">Cancelar</Text>
                        </TouchableOpacity>

                    </KeyboardAwareScrollView>
                </View>
            </View>
        </Modal>
    );
}