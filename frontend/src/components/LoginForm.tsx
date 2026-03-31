import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup' 
import { useAuth } from "@/contexts/AuthContext";
import { router } from "expo-router";

const loginValidationSchema = yup.object().shape({
        email: yup
            .string()
            .required('O email não pode ser vazio')
            .email('Digite um email válido'),
        password: yup
            .string()
            .required('A senha não pode estar vazia') 
    })

export default function LoginForm () {
    const { control, handleSubmit, clearErrors, formState: {errors } } = useForm({
        resolver: yupResolver(loginValidationSchema),
        mode: 'onSubmit'
    })

    const { signIn } = useAuth()

    const handleLogin = async (data: { email: string, password: string }) => {
        console.log('Tentando logar com:', data)
        try {
            const role = await signIn(data.email, data.password)

            switch(role) {
                case 'admin':
                router.replace('/(admin)/(tabs)/adminHome');
                break;
            case 'support':
                router.replace('/(support)/supportHome'); 
                break;
            case 'client':
                router.replace('/(client)/(tabs)/clientHome');
                break;
            default:
                Alert.alert('Erro', 'Tipo de usuário não reconhecido.');
            }
        } catch (error) {
            Alert.alert("Erro", "Email ou senha incorretos")
        }
    }

    return (
        <View>
            {/* Campo Email  (add icone) */}
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
                            placeholder="Digite seu email"
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
            
            {/* Campo Senha (add icone) */}
            <View className="mb-6">
                <Text className="mb-1">
                    Senha
                </Text>
                <Controller
                    control={control}
                    name="password"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput 
                            className="border border-gray-400 rounded-lg px-2 h-16 focus:border-orange-700"
                            placeholder="Digite sua senha"
                            onBlur={onBlur}
                            onChangeText={(text) => {
                                onChange(text)
                                clearErrors("password")
                            }}
                            value={value}
                            secureTextEntry
                        />
                    ) }
                />
                {errors.password && <Text className="text-xs text-red-500">{errors.password.message}</Text>}
            </View>
            
            <TouchableOpacity 
                className="items-center py-5 bg-orange-500 rounded-lg mb-12 elevation-4" 
                onPress={handleSubmit(handleLogin)}
                style={{
                    shadowColor: '#f97316',
                    elevation: 8
                }}
            >
                <Text className="text-md text-white">Entrar</Text>
            </TouchableOpacity>
        </View>
    )
}