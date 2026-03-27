 import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup' 
import RNPickerSelect from 'react-native-picker-select';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useRouter } from "expo-router";

const userRegisterValidationSchema = yup.object().shape({
    name: yup
        .string()
        .required('O nome completo é obrigatório')
        .min(3, 'O nome deve ter pelo menos 3 caracteres'),
    email: yup
        .string()
        .required('O email não pode ser vazio')
        .email('Digite um email válido'),
    cnpj: yup
        .string() 
        .required('CNPJ da empresa é obrigatório'),
    userType: yup
        .string()
        .required('Selecione o tipo de usuário'),
    temporaryPassword: yup
        .string()
        .required('A senha temporária é obrigatória')
        .min(8, 'A senha deve ter no mínimo 8 caracteres para segurança'),
})

export default function RegisterUserForm () {
    const router = useRouter()

    const { control, handleSubmit, clearErrors, formState: {errors } } = useForm({
            resolver: yupResolver(userRegisterValidationSchema),
            mode: 'onSubmit'
        })
    
    const handleRegister = (data: { name: string, email: string, cnpj: string, userType: string, temporaryPassword: string}) => {
        console.log("Dados Prontos para Envio:", data)
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

            {/* Campo CNPJ */}
            <View className="mb-5">
                <Text className="mb-1">
                    CNPJ
                </Text>
                <Controller
                    control={control}
                    name="cnpj"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput 
                            className="border border-gray-400 rounded-lg px-2 h-16 focus:border-orange-700"
                            placeholder="Digite apenas os números"
                            onBlur={onBlur}
                            onChangeText={(text) => {
                                onChange(text)
                                clearErrors("cnpj") 
                            }}
                            value={value}
                            keyboardType="numeric" 
                        />
                    )}
                />
                {errors.cnpj && <Text className="text-xs text-red-500 mt-1">{errors.cnpj.message}</Text>} 
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
                                    { label: 'Atendente', value: 'Attendant' },
                                ]}
                            />
                        </View>
                    )}
                />
                {errors.userType && <Text className="text-xs text-red-500 mt-1">{errors.userType.message}</Text>}
            </View>
            
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