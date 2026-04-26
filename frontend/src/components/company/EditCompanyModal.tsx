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
};

type Props = {
    visible: boolean;
    company: Company | null;
    onClose: () => void;
    onSuccess: (updatedCompany: Company) => void;
};

export default function EditCompanyModal({ visible, company, onClose, onSuccess }: Props) {
    const { control, handleSubmit, reset, clearErrors, formState: { errors, isSubmitting } } = useForm({
        resolver: yupResolver(updateCompanySchema),
        mode: 'onSubmit',
        defaultValues: { name: '', cnpj: '' }
    });

    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [imageError, setImageError] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [timestamp, setTimestamp] = useState(Date.now());

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
            setSelectedImage(null);
            setImageError(false);
            setTimestamp(Date.now()); // Força o refresh da foto atual
        }
    }, [company, visible, reset, clearErrors]);

    const handleCancel = () => {
        if (company) {
            reset({
                name: company.name,
                cnpj: company.cnpj
            });
        }
        clearErrors();
        setSelectedImage(null);
        onClose();
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
            setImageError(false); // Reseta erro caso o usuário tenha pego uma nova imagem
        }
    };

    const handleUpdate = async (data: { name: string, cnpj: string }) => {
        if (!company) return;

        try {
            const cleanCnpj = data.cnpj.replace(/\D/g, '');

            const payload: any = { 
                name: data.name 
            };

            if (cleanCnpj !== company.cnpj) {
                payload.cnpj = cleanCnpj;
            }

            // Atualiza os dados de texto
            await api.patch(`/company/${company.id}`, payload);

            // Atualiza a imagem, se houver uma nova
            if (selectedImage) {
                const formData = new FormData();
                formData.append('file', {
                    uri: selectedImage,
                    name: 'logo.jpg',
                    type: 'image/jpeg'
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
            console.log("DADOS DO ERRO:", error.response?.data);
            Alert.alert("Erro", "Não foi possível atualizar a empresa.");
        }
    };

    const existingImageUrl = company ? `${api.defaults.baseURL}/files/company/${company.id}?t=${timestamp}` : null;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            statusBarTranslucent={true}
        >
            <View className="flex-1 justify-end bg-black/50">
                
                <TouchableOpacity className="flex-1" onPress={handleCancel} />
                
                <View className="bg-white rounded-t-3xl p-6 h-[75%]">
                    <Text className="text-xl font-bold mb-4 text-slate-900">Editar Empresa</Text>
                    
                    <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
                        
                        {/* Imagem / Logo */}
                        <TouchableOpacity 
                            onPress={pickImage} 
                            className="self-center mb-6 w-24 h-24 rounded-full bg-gray-100 justify-center items-center overflow-hidden border border-gray-300 relative"
                        >
                            {selectedImage ? (
                                <Image source={{ uri: selectedImage }} className="w-full h-full" />
                            ) : (existingImageUrl && !imageError) ? (
                                <Image 
                                    source={{ 
                                        uri: existingImageUrl,
                                        headers: token ? { Authorization: `Bearer ${token}` } : {} 
                                    }} 
                                    className="w-full h-full"
                                    onError={() => setImageError(true)}
                                />
                            ) : (
                                <FontAwesome name="building-o" size={32} color="#9ca3af" />
                            )}
                            
                            {/* Ícone sútil de edição em cima da imagem */}
                            <View className="absolute bottom-1 right-1 bg-white p-1 rounded-full shadow">
                                <Feather name="edit-2" size={14} color="#f97316" />
                            </View>
                        </TouchableOpacity>

                        {/* CAMPO NOME */}
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

                        {/* CAMPO CNPJ */}
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

                        {/* BOTÃO SALVAR */}
                        <TouchableOpacity
                            className="bg-orange-500 py-4 rounded-xl items-center mb-3"
                            onPress={handleSubmit(handleUpdate)}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-bold">Salvar Alterações</Text>
                            )}
                        </TouchableOpacity>

                        {/* BOTÃO CANCELAR */}
                        <TouchableOpacity
                            className="bg-white border border-gray-300 py-4 rounded-xl items-center mb-10"
                            onPress={handleCancel}
                            disabled={isSubmitting}
                        >
                            <Text className="text-gray-600 font-bold">Cancelar</Text>
                        </TouchableOpacity>
                        
                    </KeyboardAwareScrollView>
                </View>
            </View>
        </Modal>
    );
}