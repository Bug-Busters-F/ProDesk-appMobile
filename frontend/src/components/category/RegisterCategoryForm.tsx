import React, { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useRouter } from "expo-router";
import api from "@/services/api";
import { Feather } from '@expo/vector-icons';

interface CategoryFormData {
    name: string;
    keywords: string[];
    trainingPhrases: string[];
}

const categoryRegisterValidationSchema = yup.object().shape({
    name: yup.string().required('O nome é obrigatório').min(3, 'O nome deve ter pelo menos 3 caracteres'),
    keywords: yup.array().of(yup.string().required()).min(1, 'Adicione pelo menos uma palavra-chave'),
    trainingPhrases: yup.array().of(yup.string().required()).min(1, 'Adicione pelo menos uma frase de treinamento')
});

export default function RegisterCategoryForm() {
    const router = useRouter();
    
    const { control, handleSubmit, setValue, watch, clearErrors, formState: { errors } } = useForm<CategoryFormData>({
        resolver: yupResolver(categoryRegisterValidationSchema) as any,
        defaultValues: { name: '', keywords: [], trainingPhrases: [] },
        mode: 'onSubmit'
    });

    const [keywordInput, setKeywordInput] = useState('');
    const [phraseInput, setPhraseInput] = useState('');
    const keywords = watch('keywords') || [];
    const trainingPhrases = watch('trainingPhrases') || [];

    const addKeyword = () => {
        if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
            setValue('keywords', [...keywords, keywordInput.trim()]);
            setKeywordInput('');
            clearErrors('keywords');
        }
    };

    const removeKeyword = (kwToRemove: string) => {
        setValue('keywords', keywords.filter(kw => kw !== kwToRemove));
    };

    const addPhrase = () => {
        if (phraseInput.trim() && !trainingPhrases.includes(phraseInput.trim())) {
            setValue('trainingPhrases', [...trainingPhrases, phraseInput.trim()]);
            setPhraseInput('');
            clearErrors('trainingPhrases');
        }
    };

    const removePhrase = (phraseToRemove: string) => {
        setValue('trainingPhrases', trainingPhrases.filter(p => p !== phraseToRemove));
    };

    const handleRegister = async (data: CategoryFormData) => {
        try {
            const response = await api.post('/category', data);
            console.log("CATEGORIA CADASTRADA: ", response.data);
            router.replace('/(admin)/(tabs)/categories');
        } catch (error: any) {
            Alert.alert("Erro", "Não foi possível cadastrar a categoria.");
        }
    };

    return (
        <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
            {/* Campo Nome */}
            <View className="mb-5">
                <Text className="mb-1">
                    Nome
                </Text>
                <Controller
                    control={control}
                    name="name"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput 
                            className="border border-gray-400 rounded-lg px-2 h-16 focus:border-orange-700"
                            placeholder="Digite o nome da categoria"
                            onBlur={onBlur}
                            onChangeText={(text) => {
                                onChange(text);
                                clearErrors("name");
                            }}
                            value={value}
                        />
                    )}
                />
                {errors.name && <Text className="text-xs text-red-500 mt-1">{errors.name.message}</Text>} 
            </View>

            {/* Campo Palavras-chave (Keywords) */}
            <View className="mb-5">
                <Text className="mb-1">
                    Palavras-chave (Keywords)
                </Text>
                <View className="flex-row mb-2">
                    <TextInput 
                        className="flex-1 border border-gray-400 rounded-l-lg px-2 h-16 focus:border-orange-700"
                        placeholder="Ex: site, app, login"
                        value={keywordInput}
                        onChangeText={setKeywordInput}
                        onSubmitEditing={addKeyword}
                    />
                    <TouchableOpacity 
                        className="bg-orange-500 px-5 items-center justify-center rounded-r-lg" 
                        onPress={addKeyword}
                    >
                        <Feather name="plus" size={24} color="white" />
                    </TouchableOpacity>
                </View>
                
                {/* Lista de Tags visuais */}
                <View className="flex-row flex-wrap gap-2">
                    {keywords.map((kw, index) => (
                        <View key={index} className="flex-row items-center bg-gray-200 px-3 py-1.5 rounded-full">
                            <Text className="text-sm text-gray-700 mr-2">{kw}</Text>
                            <TouchableOpacity onPress={() => removeKeyword(kw)}>
                                <Feather name="x" size={14} color="#ef4444" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
                {errors.keywords && <Text className="text-xs text-red-500 mt-1">{errors.keywords.message}</Text>}
            </View>

            {/* Campo Frases de Treinamento */}
            <View className="mb-5">
                <Text className="mb-1">
                    Frases de Treinamento
                </Text>
                <View className="flex-row mb-2">
                    <TextInput 
                        className="flex-1 border border-gray-400 rounded-l-lg px-2 h-16 focus:border-orange-700"
                        placeholder="Ex: o site não abre"
                        value={phraseInput}
                        onChangeText={setPhraseInput}
                        onSubmitEditing={addPhrase}
                    />
                    <TouchableOpacity 
                        className="bg-orange-500 px-5 items-center justify-center rounded-r-lg" 
                        onPress={addPhrase}
                    >
                        <Feather name="plus" size={24} color="white" />
                    </TouchableOpacity>
                </View>
                
                {/* Lista de Frases Visuais */}
                <View className="gap-2">
                    {trainingPhrases.map((phrase, index) => (
                        <View key={index} className="flex-row items-center justify-between bg-white border border-gray-300 p-3 rounded-lg">
                            <Text className="text-sm text-gray-700 flex-1">{phrase}</Text>
                            <TouchableOpacity onPress={() => removePhrase(phrase)} className="ml-2">
                                <Feather name="trash-2" size={20} color="#ef4444" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
                {errors.trainingPhrases && <Text className="text-xs text-red-500 mt-1">{errors.trainingPhrases.message}</Text>}
            </View>

            {/* Botão Cadastrar */}
            <TouchableOpacity 
                className="items-center py-5 bg-orange-500 rounded-lg mb-4" 
                onPress={handleSubmit(handleRegister)}
                style={{ elevation: 5, shadowColor: '#f97316', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4 }}
            >
                <Text className="text-md text-white font-bold">
                    Cadastrar Categoria
                </Text>
            </TouchableOpacity>

            {/* Botão Cancelar */}
            <TouchableOpacity 
                className="items-center py-5 bg-white border border-gray-300 rounded-lg mb-12" 
                onPress={() => router.push('/(admin)/(tabs)/categories')}
            >
                <Text className="text-md text-gray-600 font-bold">
                    Cancelar
                </Text>
            </TouchableOpacity>
        </KeyboardAwareScrollView>
    );
}