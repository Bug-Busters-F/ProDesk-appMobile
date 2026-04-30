import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '@/services/api';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as ImagePicker from 'expo-image-picker';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { storage } from '@/utils/storage';

const updateCompanySchema = yup.object().shape({
    name: yup.string().required('O nome completo é obrigatório').min(3, 'O nome deve ter pelo menos 3 caracteres'),
    cnpj: yup.string().required('CNPJ da empresa é obrigatório').length(14, 'O CNPJ deve ter exatamente 14 dígitos')
});

type Company = {
    id: string;
    name: string;
    cnpj: string;
    timestamp?: number;
};

type Props = {
    visible: boolean;
    company: Company | null;
    onClose: () => void;
    onSuccess: (updatedCompany: Company) => void;
};

export default function EditCompanyModal({ visible, company, onClose, onSuccess }: Props) {
    const [newImage, setNewImage] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [imageError, setImageError] = useState(false);
    const [timestamp, setTimestamp] = useState(Date.now());

    const { control, handleSubmit, reset, clearErrors, formState: { errors, isSubmitting } } = useForm({
        resolver: yupResolver(updateCompanySchema),
        mode: 'onSubmit',
        defaultValues: { name: '', cnpj: '' }
    });

    useEffect(() => {
        storage.getItem('prodesk_token').then(setToken);
    }, []);

    useEffect(() => {
        if (company && visible) {
            reset({
                name: company.name,
                cnpj: company.cnpj
            });
            clearErrors();
            setNewImage(null);
            setImageError(false);
            setTimestamp(Date.now());
        }
    }, [company, visible, reset, clearErrors]);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled) {
            setNewImage(result.assets[0].uri);
            setImageError(false);
        }
    };

    const handleDeleteImage = () => {
        if (newImage) {
            setNewImage(null);
            return;
        }

        Alert.alert(
            "Remover Logo",
            "Tem certeza que deseja remover a logo desta empresa?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Remover",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await api.delete(`/files/company/${company?.id}`);
                            setImageError(true); 
                            setTimestamp(Date.now());
                            if (company) {
                                onSuccess({ ...company, timestamp: Date.now() }); 
                            }
                            Alert.alert("Sucesso", "Logo removida com sucesso!");
                        } catch (error: any) {
                            Alert.alert("Erro", "Não foi possível remover a logo.");
                        }
                    }
                }
            ]
        );
    };

    const handleUpdate = async (data: { name: string, cnpj: string }) => {
        if (!company) return;

        try {
            const cleanCnpj = data.cnpj.replace(/\D/g, '');
            const payload: any = { name: data.name };
            if (cleanCnpj !== company.cnpj) payload.cnpj = cleanCnpj;

            await api.patch(`/company/${company.id}`, payload);

            if (newImage) {
                const formData = new FormData();
                formData.append('file', {
                    uri: newImage,
                    name: `logo_edit_${company.id}.jpg`,
                    type: 'image/jpeg',
                } as any);

                await api.post(`/files/company/${company.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            onSuccess({ 
                ...company, 
                name: data.name, 
                cnpj: payload.cnpj ? payload.cnpj : company.cnpj 
            });
            
            Alert.alert("Sucesso", "Empresa atualizada com sucesso!");
            onClose();
            
        } catch (error: any) {
            Alert.alert("Erro", "Não foi possível atualizar a empresa.");
        }
    };

    const currentImageUrl = company ? `${api.defaults.baseURL}/files/company/${company.id}?t=${timestamp}` : null;

    return (
        <Modal visible={visible} animationType="slide" transparent={true} statusBarTranslucent={true}>
            <View className="flex-1 justify-end bg-black/50">
                <TouchableOpacity className="flex-1" onPress={onClose} />
                <View className="bg-white rounded-t-3xl p-6 h-[75%]">
                    <Text className="text-xl font-bold mb-4 text-slate-900">Editar Empresa</Text>
                    
                    <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
                        
                        {/* Wrapper da Imagem com o Botão de Excluir */}
                        <View className="self-center mb-6 relative mt-2">
                            <TouchableOpacity 
                                onPress={pickImage}
                                className="w-24 h-24 rounded-2xl bg-slate-100 justify-center items-center overflow-hidden border border-slate-300"
                            >
                                {newImage ? (
                                    <Image source={{ uri: newImage }} className="w-full h-full" />
                                ) : (currentImageUrl && !imageError) ? (
                                    <Image 
                                        source={{ 
                                            uri: currentImageUrl,
                                            headers: token ? { Authorization: `Bearer ${token}` } : {}
                                        }} 
                                        className="w-full h-full"
                                        onError={() => setImageError(true)}
                                    />
                                ) : (
                                    <FontAwesome name="building-o" size={32} color="#9ca3af" />
                                )}
                                <View className="absolute bottom-0 bg-black/30 w-full items-center py-1">
                                    <Feather name="edit" size={12} color="white" />
                                </View>
                            </TouchableOpacity>

                            {((currentImageUrl && !imageError) || newImage) && (
                                <TouchableOpacity 
                                    onPress={handleDeleteImage}
                                    className="absolute -top-2 -right-2 bg-red-500 w-8 h-8 rounded-full items-center justify-center border-2 border-white shadow-sm z-10"
                                >
                                    <Feather name="trash-2" size={14} color="white" />
                                </TouchableOpacity>
                            )}
                        </View>

                        <View className="mb-4">
                            <Text className="text-xs text-gray-500 mb-1">Nome</Text>
                            <Controller
                                control={control}
                                name="name"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        className="border border-gray-300 rounded-lg py-3 px-3 focus:border-orange-500"
                                        placeholder="Nome da empresa"
                                        onBlur={onBlur}
                                        onChangeText={(text) => { onChange(text); clearErrors("name"); }}
                                        value={value}
                                    />
                                )}
                            />
                            {errors.name && <Text className="text-xs text-red-500 mt-1">{errors.name.message as string}</Text>}
                        </View>

                        <View className="mb-8">
                            <Text className="text-xs text-gray-500 mb-1">CNPJ</Text>
                            <Controller
                                control={control}
                                name="cnpj"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        className="border border-gray-300 rounded-lg py-3 px-3 focus:border-orange-500"
                                        placeholder="Apenas números"
                                        keyboardType="numeric"
                                        onBlur={onBlur}
                                        onChangeText={(text) => { onChange(text); clearErrors("cnpj"); }}
                                        value={value}
                                    />
                                )}
                            />
                            {errors.cnpj && <Text className="text-xs text-red-500 mt-1">{errors.cnpj.message as string}</Text>}
                        </View>

                        <TouchableOpacity
                            className="bg-orange-500 py-4 rounded-xl items-center mb-3"
                            onPress={handleSubmit(handleUpdate)}
                            disabled={isSubmitting}
                        >
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