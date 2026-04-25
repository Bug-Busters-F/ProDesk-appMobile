import React, { useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '@/services/api';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

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

    useEffect(() => {
        if (company && visible) {
            reset({
                name: company.name,
                cnpj: company.cnpj
            });
            clearErrors();
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
        onClose();
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
            animationType="slide"
            transparent={true}
            statusBarTranslucent={true}
        >
            <View className="flex-1 justify-end bg-black/50">
                
                <TouchableOpacity className="flex-1" onPress={handleCancel} />
                
                <View className="bg-white rounded-t-3xl p-6 h-[70%]">
                    <Text className="text-xl font-bold mb-4 text-slate-900">Editar Empresa</Text>
                    
                    <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
                        
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