import { ActivityIndicator, View, Text } from 'react-native';

//Tela inicial enquanto AuthCOntext faz as decisoes

export default function Index() {
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <ActivityIndicator size="large" color="#2563eb" />
    </View>
  );
}