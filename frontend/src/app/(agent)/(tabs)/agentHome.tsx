// src/app/(agent)/(tabs)/agentHome.tsx
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AgentHome() {
  return (
    <SafeAreaView className="flex-1 bg-stone-50 justify-center items-center">
      <Text className="text-2xl font-bold text-slate-800">Dashboard do Atendente</Text>
      <Text className="text-slate-500 mt-2">Resumo e métricas (Em breve)</Text>
    </SafeAreaView>
  );
}