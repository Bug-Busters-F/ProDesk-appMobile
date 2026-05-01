import { View, Text, TouchableOpacity, Image } from "react-native";
import { Feather, FontAwesome } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import api from "@/services/api";
import { storage } from "@/utils/storage";

type Props = { 
  id: string 
  name: string
  cnpj: string
  timestamp?: number 
  status?: "ACTIVE" | "INACTIVE"
  members?: string[];
  extraMembers?: number
  onEdit?: () => void
  onDelete?: () => void
}

export default function CompanyCard({
  id,
  name,
  cnpj,
  timestamp,
  status = "ACTIVE",
  members = [],
  extraMembers = 0,
  onEdit,
  onDelete,
}: Props) {
  const [imageError, setImageError] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [localTimestamp] = useState(Date.now()); 

  useEffect(() => {
    storage.getItem('prodesk_token').then(setToken);
  }, []);

  useEffect(() => {
    if (timestamp) {
      setImageError(false);
    }
  }, [timestamp]);

  const activeTimestamp = timestamp || localTimestamp;
  const imageUrl = `${api.defaults.baseURL}/files/company/${id}?t=${activeTimestamp}`;

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
        <View className="w-14 h-14 rounded-xl bg-[#F1DEC7] flex items-center justify-center overflow-hidden">
          {id && !imageError ? (
            <Image 
              source={{ 
                uri: imageUrl,
                headers: token ? { Authorization: `Bearer ${token}` } : {}
              }} 
              className="w-full h-full"
              onError={() => setImageError(true)}
              resizeMode="cover"
            />
          ) : (
            <FontAwesome name="building-o" size={24} color="#F97316" />
          )}
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

      <View className="h-[1px] bg-gray-200 mb-4" />

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