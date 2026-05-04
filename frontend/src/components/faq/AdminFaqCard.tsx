import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

type Props = {
    question: string;
    answerPreview: string;
    onEdit: () => void;
    onDelete: () => void;
}

export default function AdminFaqCard({ question, answerPreview, onEdit, onDelete }: Props) {
    return (
        <View 
            className="bg-white rounded-2xl p-5 mb-4 border border-slate-100"
            style={{ elevation: 2, shadowColor: "#CDCDCD", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}
        >
            <Text className="text-lg font-bold text-slate-800 mb-2" numberOfLines={2}>
                {question}
            </Text>
            
            <Text className="text-slate-500 mb-4 leading-5" numberOfLines={2}>
                {answerPreview}
            </Text>

            <View className="h-[1px] bg-slate-100 mb-4" />

            <View className="flex-row justify-between items-center">
                <View className="px-3 py-1 bg-slate-100 rounded-lg">
                    <Text className="text-xs font-semibold text-slate-500">FAQ Item</Text>
                </View>

                <View className="flex-row items-center">
                    
                    {/* Botão Editar */}
                <TouchableOpacity
                    onPress={onEdit}
                    activeOpacity={0.7}
                    className="mr-3 w-10 h-10 rounded-full items-center justify-center"
                >
                    <Feather name="edit-2" size={18} color="#94A3B8" />
                </TouchableOpacity>

                {/* Botão Excluir */}
                <TouchableOpacity
                    onPress={onDelete}
                    activeOpacity={0.7}
                    className="w-10 h-10 rounded-full items-center justify-center"
                >
                    <Feather name="trash-2" size={18} color="#94A3B8" />
                </TouchableOpacity>

                </View>
            </View>
        </View>
    );
}