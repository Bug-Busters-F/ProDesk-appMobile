import { View, Text, TouchableOpacity } from "react-native";
import { useAuth } from "../../contexts/AuthContext";

export default function Home() {
  const { signOut, user } = useAuth(); 

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="mb-12">
        Home Cliente
      </Text>

      <TouchableOpacity 
        onPress={signOut}
        className="bg-red-500 px-8 py-4 rounded-xl"
      >
        <Text className="text-white font-bold text-lg">Sair</Text>
      </TouchableOpacity>
    </View>
  );
}