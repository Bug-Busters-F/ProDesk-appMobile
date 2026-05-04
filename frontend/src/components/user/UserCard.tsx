import { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { FontAwesome, Feather } from "@expo/vector-icons";
import api from "@/services/api";

type Props = {
  userId: string;
  name: string;
  email: string;
  role: string;
  refreshToken?: number; 
  onEdit?: () => void;
  onDelete?: () => void;
};

export default function UserCard({
  userId,
  name,
  email,
  role,
  refreshToken = 0,
  onEdit,
  onDelete,
}: Props) {
  const [hasImage, setHasImage] = useState(false);
  const [imageUri, setImageUri] = useState('');
  const imageKeyRef = useRef(0);

  useEffect(() => {
    imageKeyRef.current += 1;
    setHasImage(false);
    setImageUri(`${api.defaults.baseURL}/files/profile/${userId}?t=${Date.now()}`);
  }, [userId, refreshToken]);

  const handleImageLoad = (key: number) => {
    if (key === imageKeyRef.current) setHasImage(true);
  };

  const handleImageError = (key: number) => {
    if (key === imageKeyRef.current) setHasImage(false);
  };

  return (
    <View
      className="bg-white rounded-lg p-4 mb-4"
      style={{
        elevation: 4,
        shadowColor: "#CDCDCD",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      }}
    >
      <View className="flex-row items-center mb-4">
        <View className="w-12 h-12 rounded-full bg-orange-200 items-center justify-center mr-3 overflow-hidden">
          {imageUri ? (
            <>
              <Image
                source={{ uri: imageUri }}
                onLoad={() => handleImageLoad(imageKeyRef.current)}
                onError={() => handleImageError(imageKeyRef.current)}
                style={hasImage ? { width: 48, height: 48 } : { width: 0, height: 0 }}
              />
              {!hasImage && (
                <FontAwesome name="user" size={18} color="#f97316" />
              )}
            </>
          ) : (
            <FontAwesome name="user" size={18} color="#f97316" />
          )}
        </View>

        <View className="flex-1">
          <Text className="font-semibold" numberOfLines={1}>{name}</Text>
          <Text className="text-sm text-gray-500" numberOfLines={1}>{email}</Text>
        </View>
      </View>

      <View className="flex-row justify-between items-center">
        <View className="px-3 py-1 bg-gray-300 rounded-full">
          <Text className="text-sm text-gray-700">{role}</Text>
        </View>

        <View className="flex-row">
          <TouchableOpacity
            onPress={onEdit}
            className="w-12 h-12 rounded-full bg-transparent items-center justify-center mr-3"
          >
            <FontAwesome name="pencil" size={20} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onDelete}
            className="w-12 h-12 rounded-full bg-transparent items-center justify-center"
          >
            <Feather name="trash-2" size={20} color="#94A3B8" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}