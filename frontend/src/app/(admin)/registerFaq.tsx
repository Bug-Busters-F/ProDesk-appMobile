import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import RegisterFaqForm from '@/components/faq/registerFaqForm';

export default function RegisterFaq() {
  return (
    <SafeAreaView className="flex-1 bg-stone-50 mt-6">
      <KeyboardAwareScrollView className="px-4" showsVerticalScrollIndicator={false}>
        
        {/* Texto Inicial */}
        <View className="mt-4">
          <Text className="text-4xl font-bold mb-2 text-slate-900">Cadastro de FAQ</Text>
          <Text className="text-gray-400 text-md mb-9">
            Preencha os campos abaixo para adicionar uma nova pergunta e resposta às dúvidas frequentes.
          </Text>
        </View>

        {/* Formulario de Cadastro */}
        <RegisterFaqForm />
        
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}