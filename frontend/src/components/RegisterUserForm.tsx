{/* IMPPLEMENTAR :
    
    - EXIBIR, EDITAR E EXCLUIR CLIENTES
    - EXIBIR, EDITAR E EXCLUIR EMPRESAS
    - EXIBIR, EDITAR E EXCLUIR GRUPOS 

    */}


import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup' 
import RNPickerSelect from 'react-native-picker-select';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useRouter } from "expo-router";
import api from "@/services/api";
import { useEffect, useState } from "react";

const userRegisterValidationSchema = yup.object().shape({
    name: yup.string().required('O nome completo é obrigatório').min(3, 'O nome deve ter pelo menos 3 caracteres'),
    email: yup.string().required('O email não pode ser vazio').email('Digite um email válido'),
    userType: yup.string().required('Selecione o tipo de usuário'),
    companyId: yup.string().when('userType', {
        is: 'Client',
        then: (schema) => schema.required('Selecione a empresa para o Cliente'),
        otherwise: (schema) => schema.optional(),
    }),
    groupId: yup.string().when('userType', {
        is: 'Support',
        then: (schema) => schema.required('Selecione o grupo do atendente'),
        otherwise: (schema) => schema.optional(),
    }),
    temporaryPassword: yup.string()
        .required('A senha temporária é obrigatória')
        .min(8, 'A senha deve ter no mínimo 8 caracteres')
        .matches(/[A-Z]/, 'A senha deve ter pelo menos 1 letra maiúscula')
        .matches(/[a-z]/, 'A senha deve ter pelo menos 1 letra minúscula')
        .matches(/[0-9]/, 'A senha deve ter pelo menos 1 número')
        .matches(/[\W_]/, 'A senha deve ter pelo menos 1 caractere especial'),
})

export default function RegisterUserForm () {
    const router = useRouter()
    const [companyList, setCompanyList] = useState<{ label: string, value:string}[]> ([])
    const [groupList, setGroupList] = useState<{ label: string, value:string}[]> ([])

    useEffect(() => {
        async function fetchData() {
            try {
                const [companyRes, groupRes] = await Promise.all([
                    api.get('/company'),
                    api.get('/group')
                ]);

                setCompanyList(companyRes.data.map((c: any) => ({ label: c.name, value: c.id })));
                setGroupList(groupRes.data.map((g: any) => ({ label: g.name, value: g.id })));
            } catch (error) {
                console.log("Erro ao buscar dados iniciais: ", error)
            }
        }
        fetchData();
    }, [])

    const { control, handleSubmit, clearErrors, watch, formState: {errors } } = useForm({
            resolver: yupResolver(userRegisterValidationSchema),
            mode: 'onSubmit'
        })

    const selectedUserType = watch('userType')
    
    const handleRegister = async (userData: { name: string, email: string, userType: string, companyId?: string, groupId?: string, temporaryPassword: string}) => {
        try {
            const payload: any = {
                name: userData.name,
                email: userData.email,
                password: userData.temporaryPassword,
            }

            if (userData.userType === 'Client') {
                payload.companyId = userData.companyId;
                await api.post('/auth/register/client', payload);
            } else if (userData.userType === 'Support') {
                payload.groupId = userData.groupId; 
                await api.post('/auth/register/support', payload);
            } else if (userData.userType === 'Admin') {
                payload.groupId = userData.groupId; 
                await api.post('/auth/register/admin', payload);
            }

            Alert.alert("Sucesso", "Usuário cadastrado com sucesso!");
            router.replace('/(admin)/(tabs)/users');

        } catch (error: any) {
            const status = error.response?.status;
            const errorMessage = error.response?.data?.message;

            if (status === 400) {
                if (errorMessage === "Email taken!") {
                    Alert.alert("Atenção", "Este email já está cadastrado no sistema. Tente utilizar outro.");
                } else {
                    Alert.alert("Erro de Validação", "Verifique se os dados estão corretos.");
                }
            } else if (status === 403) {
                Alert.alert("Acesso Negado", "Você não tem permissão para cadastrar este usuário.");
            } else {
                Alert.alert("Erro", "Falha na comunicação com o servidor.");
            }
            console.log("Erro ao registrar usuário", error)
        }
    }

    return(
        <KeyboardAwareScrollView>
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
                            placeholder="Digite o nome completo"
                            onBlur={onBlur}
                            onChangeText={(text) => {
                                onChange(text)
                                clearErrors("name")
                            }}
                            value={value}
                        />
                    )}
                />
                {errors.name && <Text className="text-xs text-red-500 mt-1">{errors.name.message}</Text>} 
            </View>

            {/* Campo Email */}
            <View className="mb-5">
                <Text className="mb-1 ">
                    Email
                </Text>
                <Controller
                    control={control}
                    name="email"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput 
                            className="border border-gray-400 rounded-lg px-2 h-16 focus:border-orange-700"
                            placeholder="Digite o email"
                            onBlur={onBlur}
                            onChangeText={(text) => {
                                onChange(text)
                                clearErrors("email")
                            }}
                            value={value}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    ) }
                />
                {errors.email && <Text className="text-xs text-red-500">{errors.email.message}</Text>}
            </View>
            
            {/* Campo Tipo de Usuario */}
            <View className="mb-5">
                <Text className="mb-1">
                    Tipo de Usuário
                </Text>
                <Controller
                    control={control}
                    name="userType"
                    render={({ field: { onChange, value } }) => (
                        <View className="border border-gray-400 rounded-lg h-16 justify-center focus:border-orange-700">
                            <RNPickerSelect
                                onValueChange={(itemValue) => {
                                    onChange(itemValue);
                                    clearErrors("userType");
                                }}
                                value={value}
                                placeholder={{
                                    label: 'Selecione o tipo de usuário...',
                                    value: null, 
                                }}
                                style={{
                                    inputAndroid: {
                                        fontSize: 12,
                                        color: 'black', 
                                        height: '100%',
                                        paddingHorizontal: 8,
                                    },
                                    placeholder: {
                                        color: 'gray',
                                        fontSize: 8,
                                    },
                                }}
                                items={[
                                    { label: 'Administrador', value: 'Admin' },
                                    { label: 'Cliente', value: 'Client' },
                                    { label: 'Atendente', value: 'Support' },
                                ]}
                            />
                        </View>
                    )}
                />
                {errors.userType && <Text className="text-xs text-red-500 mt-1">{errors.userType.message}</Text>}
            </View>

            {/* Campo Grupo */}
            {(selectedUserType === 'Support' || selectedUserType === 'Admin') && (
                <View className="mb-5">
                    <Text className="mb-1">Grupo</Text>
                    <Controller
                        control={control}
                        name="groupId"
                        render={({ field: { onChange, value } }) => (
                            <View className="border border-gray-400 rounded-lg h-16 justify-center focus:border-orange-700">
                                <RNPickerSelect
                                    onValueChange={(itemValue) => {
                                        onChange(itemValue);
                                        clearErrors("groupId");
                                    }}
                                    value={value}
                                    placeholder={{ label: 'Selecione o grupo...', value: null }}
                                    items={groupList}
                                />
                            </View>
                        )}
                    />
                    {errors.groupId && <Text className="text-xs text-red-500 mt-1">{errors.groupId.message}</Text>}
                </View>
            )}

            {/* Campo Empresa */}
            {selectedUserType === 'Client' && (
                <View className="mb-5">
                    <Text className="mb-1">Empresa</Text>
                    <Controller
                        control={control}
                        name="companyId"
                        render={({ field: { onChange, value } }) => (
                            <View className="border border-gray-400 rounded-lg h-16 justify-center focus:border-orange-700">
                                <RNPickerSelect
                                    onValueChange={(itemValue) => {
                                        onChange(itemValue);
                                        clearErrors("companyId");
                                    }}
                                    value={value}
                                    placeholder={{ label: 'Selecione a empresa...', value: null }}
                                    items={companyList}
                                />
                            </View>
                        )}
                    />
                    {errors.companyId && <Text className="text-xs text-red-500 mt-1">{errors.companyId.message}</Text>}
                </View>
            )}
            
            {/* Campo Senha Temporaria */}
            <View className="mb-8">
                <Text className="mb-1">
                    Senha Temporária
                </Text>
                <Controller
                    control={control}
                    name="temporaryPassword"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput 
                            className="border border-gray-400 rounded-lg px-2 h-16 focus:border-orange-700"
                            placeholder="Digite a senha temporária"
                            onBlur={onBlur}
                            onChangeText={(text) => {
                                onChange(text)
                                clearErrors("temporaryPassword")
                            }}
                            value={value}
                            autoCapitalize="none"
                        />
                    )}
                />
                {errors.temporaryPassword && <Text className="text-xs text-red-500 mt-1">{errors.temporaryPassword.message}</Text>}
            </View>

            <TouchableOpacity 
                className="items-center py-5 bg-orange-500 rounded-lg mb-4" 
                onPress={handleSubmit(handleRegister)}
                style={{ elevation: 5, shadowColor: '#f97316', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4 }}
            >
                <Text className="text-md text-white font-bold">
                    Cadastrar Usuário
                </Text>
            </TouchableOpacity>

            <TouchableOpacity 
                className="items-center py-5 bg-white border border-gray-300 rounded-lg mb-12" 
                onPress={() => router.push('/(admin)/(tabs)/users')}
            >
                <Text className="text-md text-gray-600 font-bold">
                    Cancelar
                </Text>
            </TouchableOpacity>
        </KeyboardAwareScrollView>
    )
}