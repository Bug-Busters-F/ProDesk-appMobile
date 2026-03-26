import { View, Text, TouchableOpacity } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import Feather from '@expo/vector-icons/Feather';

export default function Home() {
  const { signOut, user } = useAuth(); 

  return (
    <SafeAreaView className="flex-1 px-4 bg-stone-50">
      <View className="flex-row justify-between items-center">
        <Text>
          Home Admin
        </Text>

        <TouchableOpacity 
          onPress={signOut}
          className="bg-red-500 px-8 py-4 rounded-xl"
        >
          <Feather name="log-out" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}