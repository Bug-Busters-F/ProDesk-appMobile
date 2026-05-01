import { View, Text, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useState } from 'react';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = {
    question: string;
    answer: string;
}

export default function ClientFaqCard({ question, answer }: Props) {
    const [expanded, setExpanded] = useState(false);

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(!expanded);
    }

    return (
        <TouchableOpacity 
            activeOpacity={0.8}
            onPress={toggleExpand} 
            className={`bg-white p-5 rounded-2xl mb-4 border ${expanded ? 'border-orange-200' : 'border-slate-100'}`}
            style={{ elevation: 2, shadowColor: "#CDCDCD", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}
        >
            <View className="flex-row justify-between items-center">
                <Text className={`font-bold flex-1 text-base mr-4 ${expanded ? 'text-orange-600' : 'text-slate-800'}`}>
                    {question}
                </Text>
                <View className={`w-8 h-8 rounded-full items-center justify-center ${expanded ? 'bg-orange-100' : 'bg-slate-50'}`}>
                    <Feather name={expanded ? "chevron-up" : "chevron-down"} size={20} color={expanded ? "#F97316" : "#94A3B8"} />
                </View>
            </View>

            {expanded && (
                <View className="mt-4 pt-4 border-t border-slate-100">
                    <Text className="text-slate-600 leading-6 text-sm">
                        {answer}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
}