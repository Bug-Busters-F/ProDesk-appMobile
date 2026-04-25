import { View, Text, TouchableOpacity } from "react-native";
import { Feather, FontAwesome } from "@expo/vector-icons";

type Props = { 
  name: string
  cnpj: string
  status?: "ACTIVE" | "INACTIVE"
  members?: string[];
  extraMembers?: number
  onEdit?: () => void
  onDelete?: () => void
}

export default function CompanyCard({
  name,
  cnpj,
  status = "ACTIVE",
  members = [],
  extraMembers = 0,
  onEdit,
  onDelete,
}: Props) {
  return (
    <View
      className="bg-white rounded-2xl p-5 mb-4"
      style={{
        elevation: 3,
        shadowColor: "#CDCDCD",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      }}
    >
      <View className="flex-row justify-between items-start mb-4">
        <View className="w-14 h-14 rounded-xl bg-[#F1DEC7] flex items-center justify-center">
          <FontAwesome name="building-o" size={24}  color="#F97316" />
        </View>

        <View className="px-3 py-1 rounded-full bg-green-200">
          <Text className="text-green-800 text-xs font-semibold">
            {status}
          </Text>
        </View>
      </View>

      <Text className="text-lg font-bold text-gray-800 mb-1">
        {name}
      </Text>

      <Text className="text-gray-500 mb-4">
        {cnpj}
      </Text>

      <View className="h-[1px] bg-[#E8D5C0] mb-4" />

      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center">
          {members.map((m, index) => (
            <View
              key={index}
              className="w-8 h-8 rounded-full bg-gray-300 items-center justify-center mr-2"
            >
              <Text className="text-xs font-semibold text-gray-700">
                {m}
              </Text>
            </View>
          ))}

          {extraMembers > 0 && (
            <View className="w-8 h-8 rounded-full bg-orange-200 items-center justify-center">
              <Text className="text-xs font-semibold text-orange-700">
                +{extraMembers}
              </Text>
            </View>
          )}
        </View>

        <View className="flex-row">
          <TouchableOpacity onPress={onEdit} className="mr-4">
            <Feather name="edit-2" size={20} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity onPress={onDelete}>
            <Feather name="trash-2" size={20} color="#94A3B8" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}