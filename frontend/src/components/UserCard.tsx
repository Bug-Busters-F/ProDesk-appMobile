import { View, Text, TouchableOpacity } from "react-native";
import { FontAwesome, Feather } from "@expo/vector-icons";

type Props = {
  name: string;
  email: string;
  role: string;
  onEdit?: () => void;
  onDelete?: () => void;
};

export default function UserCard({
  name,
  email,
  role,
  onEdit,
  onDelete,
}: Props) {
  return (
    <View
      className="bg-white rounded-md p-4 mb-4"
      style={{
        elevation: 4,
        shadowColor: "#CDCDCD",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      }}
    >
      <View className="flex-row items-center mb-6">
        <View className="w-12 h-12 rounded-full bg-orange-200 flex items-center justify-center mr-3">
          <FontAwesome name="user" size={18} color="#f97316" />
        </View>

        <View>
          <Text className="font-semibold">{name}</Text>
          <Text className="text-sm text-gray-500">{email}</Text>
        </View>
      </View>

      <View className="flex-row justify-between items-center">
        <View className="px-3 py-1 bg-gray-300 rounded-full">
          <Text className="text-sm text-gray-800">{role}</Text>
        </View>

        <View className="flex-row">
          <TouchableOpacity
            onPress={onEdit}
            className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center mr-3"
          >
            <FontAwesome name="pencil" size={20} color="#374151" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onDelete}
            className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center"
          >
            <Feather name="trash-2" size={20} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}