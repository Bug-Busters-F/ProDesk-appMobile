import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import RegisterCompanyForm from "@/components/RegisterCompanyForm";

export default function RegisterCompany () {
    return(
            <SafeAreaView className='flex-1 bg-stone-50'>
                <KeyboardAwareScrollView className="px-4">     
                    {/* Texto Inicial */}
                    <View>
                        <Text className='text-4xl font-bold mb-2'>
                            Cadastro de Empresas
                        </Text>
                        <Text className='text-gray-400 text-md mb-9'>
                            Preencha os campos abaixos para adicionar uma nova emrpesa ao sistema
                        </Text>
                    </View>
    
                    {/* Formulario de Cadastro */}
                    <RegisterCompanyForm />
                </KeyboardAwareScrollView>
            </SafeAreaView>
        )
}