import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup' 
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useRouter } from "expo-router";
import api from "@/services/api";

const groupRegisterValidationSchema = yup.object().shape({
    name: yup
        .string()
        .required('O nome do grupo é obrigatório')
        .min(3, 'O nome deve ter pelo menos 3 caracteres'),
    description: yup
        .string()
        .required('Adicione uma descrição para o grupo')
})

export default function RegisterGroupForm () {
    const router = useRouter()

    const { control, handleSubmit, clearErrors, formState: {errors } } = useForm({
        resolver: yupResolver(groupRegisterValidationSchema),
        mode: 'onSubmit'
    })

    const handleRegister = async (groupData: {name: string, description: string }) => {
        try {
            const response = await api.post('/group', {
                name: groupData.name,
                description: groupData.description
            })

            console.log("GRUPO CADASTRADO: ", response.data)
            router.replace('/(admin)/(tabs)/groups')
        } catch (error: any) {
            Alert.alert("Erro, não foi possivel cadastrar o grupo.")
        }
    }
    
    return (
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
                            placeholder="Digite o nome do grupo"
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
                    Descrição do grupo
                </Text>
                <Controller
                    control={control}
                    name="description"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput 
                            className="border border-gray-400 rounded-lg px-2 h-32 focus:border-orange-700 "
                            placeholder="Descreva o grupo e suas funções"
                            onBlur={onBlur}
                            onChangeText={(text) => {
                                onChange(text)
                                clearErrors("description") 
                            }}
                            value={value}
                            textAlignVertical="top"
                        />
                    )}
                />
                {errors.description && <Text className="text-xs text-red-500 mt-1">{errors.description.message}</Text>} 
            </View>

            <TouchableOpacity 
                className="items-center py-5 bg-orange-500 rounded-lg mb-4" 
                onPress={handleSubmit(handleRegister)}
                style={{ elevation: 5, shadowColor: '#f97316', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4 }}
            >
                <Text className="text-md text-white font-bold">
                    Cadastrar Grupo
                </Text>
            </TouchableOpacity>

            <TouchableOpacity 
                className="items-center py-5 bg-white border border-gray-300 rounded-lg mb-12" 
                onPress={() => router.push('/(admin)/(tabs)/groups')}
            >
                <Text className="text-md text-gray-600 font-bold">
                    Cancelar
                </Text>
            </TouchableOpacity>
        </KeyboardAwareScrollView>
    )
}