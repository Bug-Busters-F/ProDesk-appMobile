import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup' 
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useRouter } from "expo-router";
const userRegisterValidationSchema = yup.object().shape({
    name: yup
        .string()
        .required('O nome completo é obrigatório')
        .min(3, 'O nome deve ter pelo menos 3 caracteres'),
    cnpj: yup
        .string() 
        .required('CNPJ da empresa é obrigatório')
    })
    
export default function RegisterCompanyForm () {
    const router = useRouter()
    
        const { control, handleSubmit, clearErrors, formState: {errors } } = useForm({
                resolver: yupResolver(userRegisterValidationSchema),
                mode: 'onSubmit'
            })
        
        const handleRegister = (data: { name: string, cnpj: string }) => {
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
                            placeholder="Digite o nome da empresa"
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

            <TouchableOpacity 
                className="items-center py-5 bg-orange-500 rounded-lg mb-4" 
                onPress={handleSubmit(handleRegister)}
                style={{ elevation: 5, shadowColor: '#f97316', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4 }}
            >
                <Text className="text-md text-white font-bold">
                    Cadastrar Empresa
                </Text>
            </TouchableOpacity>

            <TouchableOpacity 
                className="items-center py-5 bg-white border border-gray-300 rounded-lg mb-12" 
                onPress={() => router.push('/(admin)/(tabs)/companys')}
            >
                <Text className="text-md text-gray-600 font-bold">
                    Cancelar
                </Text>
            </TouchableOpacity>
        </KeyboardAwareScrollView>
    )
}