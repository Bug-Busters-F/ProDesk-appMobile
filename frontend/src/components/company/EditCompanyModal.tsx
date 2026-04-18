import React, { useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, StatusBar } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '@/services/api';
import { Pressable } from 'react-native';

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
    });

    useEffect(() => {
        if (company) {
            reset({
                name: company.name,
                cnpj: company.cnpj
            });
        }
    }, [company, reset]);

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

            const response = await api.patch(`/company/${company.id}`, payload);

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

    return (
       <Modal
            visible={visible}
            animationType="fade"
            transparent
            statusBarTranslucent={true} 
            navigationBarTranslucent={true}
            onRequestClose={onClose}
            >

            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

            <View className="absolute inset-0 bg-black/50 justify-center items-center">
                
                <Pressable
                    className="absolute inset-0"
                    onPress={onClose}
                />
                
                {/* Container do Formulário */}
                <View className="bg-white rounded-2xl p-6 shadow-xl w-[90%] max-w-md">
                    <Text className="text-xl font-bold text-slate-900 mb-6">
                        Editar Empresa
                    </Text>

                    <View className="mb-5">
                        <Text className="mb-1 text-slate-700">Nome</Text>
                        <Controller
                            control={control}
                            name="name"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    className="border border-gray-300 rounded-lg px-3 h-14 focus:border-orange-500 bg-gray-50"
                                    placeholder="Nome da empresa"
                                    onBlur={onBlur}
                                    onChangeText={(text) => { onChange(text); clearErrors("name"); }}
                                    value={value}
                                />
                            )}
                        />
                        {errors.name && <Text className="text-xs text-red-500 mt-1">{errors.name.message}</Text>}
                    </View>

                    <View className="mb-8">
                        <Text className="mb-1 text-slate-700">CNPJ</Text>
                        <Controller
                            control={control}
                            name="cnpj"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    className="border border-gray-300 rounded-lg px-3 h-14 focus:border-orange-500 bg-gray-50"
                                    placeholder="Apenas números"
                                    keyboardType="numeric"
                                    onBlur={onBlur}
                                    onChangeText={(text) => { onChange(text); clearErrors("cnpj"); }}
                                    value={value}
                                />
                            )}
                        />
                        {errors.cnpj && <Text className="text-xs text-red-500 mt-1">{errors.cnpj.message}</Text>}
                    </View>

                    <TouchableOpacity
                        className="items-center py-4 bg-orange-500 rounded-xl mb-3 flex-row justify-center"
                        onPress={handleSubmit(handleUpdate)}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-md text-white font-bold">Salvar Alterações</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="items-center py-4 bg-gray-100 rounded-xl"
                        onPress={onClose}
                    >
                        <Text className="text-md text-slate-600 font-bold">Cancelar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}