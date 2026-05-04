import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import RegisterGroupForm from '@/components/category/RegisterCategoryForm';

export default function RegisterGroup() {
  return (
    <SafeAreaView className="flex-1 bg-stone-50">
      <KeyboardAwareScrollView className="px-4">
        {/* Texto Inicial */}
        <View>
          <Text className="text-4xl font-bold mb-2">Cadastro de Categorias</Text>
          <Text className="text-gray-400 text-md mb-9">
            Preencha os campos abaixos para adicionar uma nova categoria de atendentes ao sistema
          </Text>
        </View>

        {/* Formulario de Cadastro */}
        <RegisterGroupForm />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
