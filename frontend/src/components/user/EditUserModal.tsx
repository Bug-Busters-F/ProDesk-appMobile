import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '@/services/api';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Feather } from '@expo/vector-icons';

const ROLE_NAMES: Record<string, string> = {
    'admin': 'Administrador',
    'support': 'Atendente',
    'client': 'Cliente'
};

const updateUserSchema = yup.object().shape({
    name: yup.string().required('O nome é obrigatório'),
    email: yup.string().email('E-mail inválido').required('O e-mail é obrigatório'),
    companyId: yup.string().nullable(),
    role: yup.string().required('O cargo é obrigatório'),
    categories: yup.array().of(yup.string()).required()
});

type User = {
    id?: string;
    _id?: string;
    name: string;
    email: string;
    role: string;
    companyId?: string | any;
    company?: any;
    categories?: string[] | any[];
};

type Props = {
    visible: boolean;
    user: User | null;
    onClose: () => void;
    onSuccess: () => void;
};

export default function EditUserModal({ visible, user, onClose, onSuccess }: Props) {
    const { control, handleSubmit, reset, setValue, watch, clearErrors, formState: { errors, isSubmitting } } = useForm({
        resolver: yupResolver(updateUserSchema),
        defaultValues: { name: '', email: '', companyId: null, role: 'client', categories: [] }
    });

    const [companies, setCompanies] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const watchedRole = watch('role');
    const watchedCategories = watch('categories') || [];
    const watchedCompanyId = watch('companyId');

    const originalRole = user?.role?.toLowerCase() || 'client';
    const isClient = originalRole === 'client';

    const getSafeCompanyId = (userData: any): string | null => {
        if (!userData) return null;
        let extractedId = null;
        if (userData.companyId && typeof userData.companyId === 'object') {
            extractedId = userData.companyId._id || userData.companyId.id;
        } else if (typeof userData.companyId === 'string' || typeof userData.companyId === 'number') {
            extractedId = userData.companyId;
        } else if (userData.company && typeof userData.company === 'object') {
            extractedId = userData.company._id || userData.company.id;
        } else if (typeof userData.company === 'string' || typeof userData.company === 'number') {
            extractedId = userData.company;
        }
        return extractedId ? String(extractedId) : null;
    };

    // ✅ CORREÇÃO: fetchOptions recebe o user e só faz reset DEPOIS que os dados chegarem
    const fetchOptions = async (userData: User | null) => {
        setIsLoadingData(true);
        try {
            const [compRes, catRes] = await Promise.all([
                api.get('/company'),
                api.get('/category')
            ]);
            const fetchedCompanies = compRes.data.data || compRes.data || [];
            const fetchedCategories = catRes.data.data || catRes.data || [];

            setCompanies(fetchedCompanies);
            setCategories(fetchedCategories);

            // Reset só acontece aqui, com a lista já disponível
            if (userData) {
                const safeCompId = getSafeCompanyId(userData);
                const safeCatIds = userData.categories?.map((c: any) =>
                    typeof c === 'object' ? String(c._id || c.id) : String(c)
                ) || [];

                reset({
                    name: userData.name,
                    email: userData.email,
                    companyId: safeCompId,
                    role: userData.role?.toLowerCase() || 'client',
                    categories: safeCatIds,
                });
                clearErrors();
            }
        } catch (error) {
            console.error("Erro ao carregar opções", error);
        } finally {
            setIsLoadingData(false);
        }
    };

    // ✅ Um único useEffect, sem corrida entre carregar dados e popular o form
    useEffect(() => {
        if (visible && user) {
            fetchOptions(user);
        }
    }, [visible, user]);

    const handleCancel = () => {
        setDropdownOpen(false);
        clearErrors();
        onClose();
    };

    const handleUpdate = async (data: any) => {
        if (!user) return;
        const userId = user._id || user.id;

        try {
            const compIdOriginal = getSafeCompanyId(user);
            const hasBasicChanges = data.name !== user.name || data.email !== user.email || (isClient && String(data.companyId) !== String(compIdOriginal));

            if (hasBasicChanges) {
                const payload: any = { name: data.name, email: data.email };
                if (isClient) payload.companyId = data.companyId;
                await api.patch(`/user/${userId}`, payload);
            }

            if (!isClient) {
                if (data.role !== originalRole) {
                    await api.patch(`/user/changeRole/${userId}`, { role: data.role });
                }
                const originalCats = user.categories?.map((c: any) =>
                    typeof c === 'object' ? String(c._id || c.id) : String(c)
                ) || [];
                if (originalCats.length !== data.categories.length || !originalCats.every((c: string) => data.categories.includes(c))) {
                    await api.patch(`/user/changeCategories/${userId}`, { categories: data.categories });
                }
            }

            Alert.alert("Sucesso", "Utilizador atualizado com sucesso!");
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Erro na atualização:", error?.response?.data || error);
            Alert.alert("Erro ao atualizar", "Não foi possível guardar as alterações. Verifique as informações.");
        }
    };

    const getSelectedCompanyName = () => {
        if (!watchedCompanyId) return 'Selecionar empresa';
        const found = companies.find(c => String(c.id || c._id) === String(watchedCompanyId));
        if (found) return found.name;
        // Fallback enquanto a lista carrega
        if (user?.companyId?.name) return user.companyId.name;
        if (user?.company?.name) return user.company.name;
        return 'A carregar...';
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true} statusBarTranslucent={true}>
            <View className="flex-1 justify-end bg-black/50">
                <TouchableOpacity className="flex-1" onPress={handleCancel} />
                <View className="bg-white rounded-t-3xl p-6 h-[85%]">
                    <Text className="text-xl font-bold mb-4 text-slate-900">Editar Utilizador</Text>

                    {isLoadingData ? (
                        <ActivityIndicator size="large" color="#f97316" className="mt-10" />
                    ) : (
                        <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
                            <View className="mb-4">
                                <Text className="text-xs text-gray-500 mb-1">Nome</Text>
                                <Controller control={control} name="name" render={({ field: { onChange, value } }) => (
                                    <TextInput className="border border-gray-300 rounded-lg py-3 px-3 focus:border-orange-500" placeholder="Nome completo" onChangeText={onChange} value={value} />
                                )} />
                            </View>

                            <View className="mb-4">
                                <Text className="text-xs text-gray-500 mb-1">E-mail</Text>
                                <Controller control={control} name="email" render={({ field: { onChange, value } }) => (
                                    <TextInput className="border border-gray-300 rounded-lg py-3 px-3 focus:border-orange-500" keyboardType="email-address" autoCapitalize="none" onChangeText={onChange} value={value} />
                                )} />
                            </View>

                            {isClient && (
                                <View className="mb-8 z-50">
                                    <Text className="text-xs text-gray-500 mb-1">Empresa</Text>
                                    <TouchableOpacity className="border border-gray-300 rounded-lg py-3 px-3 flex-row justify-between items-center bg-white" onPress={() => setDropdownOpen(!dropdownOpen)}>
                                        <Text className={watchedCompanyId ? "text-slate-900" : "text-gray-400"}>
                                            {getSelectedCompanyName()}
                                        </Text>
                                        <Feather name={dropdownOpen ? "chevron-up" : "chevron-down"} size={20} color="gray" />
                                    </TouchableOpacity>

                                    {dropdownOpen && (
                                        <View className="border border-gray-200 rounded-lg mt-1 bg-white max-h-40 shadow-sm">
                                            <ScrollView nestedScrollEnabled={true}>
                                                <TouchableOpacity className="py-3 px-4 border-b border-gray-100" onPress={() => { setValue('companyId', null); setDropdownOpen(false); }}>
                                                    <Text className="text-gray-500 italic">Nenhuma empresa</Text>
                                                </TouchableOpacity>
                                                {companies.map(c => (
                                                    <TouchableOpacity
                                                        key={String(c.id || c._id)}
                                                        className="py-3 px-4 border-b border-gray-100"
                                                        onPress={() => { setValue('companyId', String(c.id || c._id)); setDropdownOpen(false); }}
                                                    >
                                                        <Text className="text-slate-700">{c.name}</Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </ScrollView>
                                        </View>
                                    )}
                                </View>
                            )}

                            {!isClient && (
                                <>
                                    <View className="mb-4">
                                        <Text className="text-xs text-gray-500 mb-2">Nível de Acesso</Text>
                                        <View className="flex-row flex-wrap gap-2">
                                            {['admin', 'support'].map(r => (
                                                <TouchableOpacity key={r} onPress={() => setValue('role', r)} className={`px-4 py-2 rounded-full border ${watchedRole === r ? 'bg-orange-500 border-orange-500' : 'bg-white border-gray-300'}`}>
                                                    <Text className={watchedRole === r ? 'text-white font-medium' : 'text-gray-600'}>{ROLE_NAMES[r]}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>

                                    <View className="mb-8">
                                        <Text className="text-xs text-gray-500 mb-2">Categorias Atendidas</Text>
                                        <View className="flex-row flex-wrap gap-2">
                                            {categories.map(cat => {
                                                const catId = String(cat.id || cat._id);
                                                const isSelected = watchedCategories.some(id => String(id) === catId);
                                                return (
                                                    <TouchableOpacity key={catId} onPress={() => {
                                                        setValue('categories', isSelected ? watchedCategories.filter(id => String(id) !== catId) : [...watchedCategories, catId]);
                                                    }} className={`px-3 py-1.5 rounded-lg border flex-row items-center ${isSelected ? 'bg-orange-100 border-orange-400' : 'bg-gray-50 border-gray-200'}`}>
                                                        <Text className={`text-sm mr-1 ${isSelected ? 'text-orange-700 font-semibold' : 'text-gray-600'}`}>{cat.name}</Text>
                                                        {isSelected && <Feather name="check" size={14} color="#c2410c" />}
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    </View>
                                </>
                            )}

                            <TouchableOpacity className="bg-orange-500 py-4 rounded-xl items-center mb-3 mt-4" onPress={handleSubmit(handleUpdate)} disabled={isSubmitting}>
                                {isSubmitting ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Salvar Alterações</Text>}
                            </TouchableOpacity>

                            <TouchableOpacity className="bg-white border border-gray-300 py-4 rounded-xl items-center mb-10" onPress={handleCancel} disabled={isSubmitting}>
                                <Text className="text-gray-600 font-bold text-lg">Cancelar</Text>
                            </TouchableOpacity>
                        </KeyboardAwareScrollView>
                    )}
                </View>
            </View>
        </Modal>
    );
}