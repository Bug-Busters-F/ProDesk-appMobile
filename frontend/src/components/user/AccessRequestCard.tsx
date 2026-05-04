import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { FontAwesome, Feather } from "@expo/vector-icons";

type Props = {
  name: string;
  email: string;
  cnpj: string;
  isApproving: boolean;
  isRejecting: boolean;
  onApprove: () => void;
  onReject: () => void;
};

export default function AccessRequestCard({
  name,
  email,
  cnpj,
  isApproving,
  isRejecting,
  onApprove,
  onReject,
}: Props) {
  const isActionRunning = isApproving || isRejecting;

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
        <View className="w-12 h-12 rounded-full bg-orange-100 items-center justify-center mr-3 overflow-hidden">
          <FontAwesome name="user" size={18} color="#f97316" />
        </View>

        <View className="flex-1">
          <Text className="font-semibold" numberOfLines={1}>{name}</Text>
          <Text className="text-sm text-gray-500" numberOfLines={1}>{email}</Text>
        </View>
      </View>

      <View className="mb-4">
        <Text className="text-sm text-slate-700 font-medium bg-slate-50 p-2 rounded-lg border border-slate-100">
           CNPJ: <Text className="font-normal">{cnpj}</Text>
        </Text>
      </View>

      <View className="flex-row justify-between items-center gap-3">
        <TouchableOpacity
          onPress={onReject}
          disabled={isActionRunning}
          className="flex-1 h-11 flex-row bg-slate-100 rounded-full items-center justify-center"
        >
          {isRejecting ? (
            <ActivityIndicator size="small" color="#ef4444" />
          ) : (
            <>
              <Feather name="x" size={18} color="#ef4444" />
              <Text className="text-red-500 font-semibold ml-2">Negar</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onApprove}
          disabled={isActionRunning}
          className="flex-1 h-11 flex-row bg-orange-500 rounded-full items-center justify-center"
        >
          {isApproving ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Feather name="check" size={18} color="white" />
              <Text className="text-white font-semibold ml-2">Aprovar</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}