import { Text, TouchableOpacity, View } from "react-native"
import { Feather } from "@expo/vector-icons";

type Props = {
    name: string
    description: string
    onEdit?: () => void
    onDelete?: () => void
}

export default function GroupCard ({
    name,
    description,
    onEdit,
    onDelete
}: Props) {
    return (
        <View
            className="bg-white rounded-2xl px-5 py-6 mb-4"
            style={{
                elevation: 3,
                shadowColor: "#CDCDCD",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            }}
        >
            <View className="flex-row justify-between items-center">
                <View>
                    <Text className="text-2xl font-bold">{name}</Text>
                    <Text className="text-gray-500">{description}</Text>
                </View>
                <View className="flex-row">
                    <TouchableOpacity onPress={onEdit} className="mr-4">
                        <Feather name="edit-2" size={20} color="#1f2937" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={onDelete}>
                        <Feather name="trash-2" size={20} color="#1f2937" />
                    </TouchableOpacity>
                </View>
            </View>

        </View>
    )
}