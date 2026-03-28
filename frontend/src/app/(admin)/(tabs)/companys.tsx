import { useRouter } from 'expo-router'; 
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import CompanyCard from '@/components/CompanyCard';

export default function Companys () {
    const router = useRouter();
    const [focused, setFocused] = useState(false); 

    return (
        <SafeAreaView className="flex-1 px-4 bg-stone-50 mt-6">
            <ScrollView>
                <View className="flex-row items-center justify-between mb-6">
                    <View>
                        <Text className="text-2xl font-bold text-slate-900">Controle de Empresas</Text>
                        <Text className="text-slate-500">Gerencie as empresas do sistema</Text>
                    </View>
                    <TouchableOpacity
                        className="bg-orange-500 w-12 h-12 rounded-xl items-center justify-center shadow-lg shadow-orange-300"
                        onPress={() => router.push('/(admin)/registerCompany')}
                    >
                        <Ionicons name="add" size={30} color="white" />
                    </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8">
                    {['Todos', 'Alfabética', 'Mais Recentes', 'Mais Antigas'].map((filter, index) => (
                        <TouchableOpacity
                        key={filter}
                        className={`px-4 py-2 rounded-full mr-2 ${index === 0 ? 'bg-orange-500' : 'bg-slate-50 border border-slate-100'}`}
                        >
                        <Text className={`font-medium ${index === 0 ? 'text-white' : 'text-slate-500'}`}>
                            {filter}
                        </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <View
                    className={`flex-row items-center rounded-xl px-4 py-3 border mb-6 ${
                        focused
                        ? "bg-white border-orange-500"
                        : "bg-gray-100 border-transparent"
                    }`}
                    >
                    <Feather
                        name="search"
                        size={20}
                        color={focused ? "#F97316" : "#9CA3AF"}
                    />

                    <TextInput
                        placeholder="Procure por nome ou CNPJ"
                        placeholderTextColor="#9CA3AF"
                        className="ml-3 flex-1 text-gray-700"
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                    />
                </View>

                <View className="flex-row items-center px-5 py-5 rounded-2xl mb-6 bg-[#F5E9DA] border border-[#E8D5C0]">
                    <View className="size-14 rounded-full bg-[#F1DEC7] flex items-center justify-center mr-5">
                        <MaterialIcons name="apartment" size={26} color="#F97316" />
                    </View>
                    <View>
                        <Text className="text-xs font-semibold tracking-widest text-orange-900">
                        TOTAL DE EMPRESAS
                        </Text>

                        <Text className="text-3xl font-bold text-orange-900">
                        42
                        </Text>
                    </View>
                </View>

                <CompanyCard
                    name="Tech Solutions Ltda"
                    cnpj="12.345.678/0001-90"
                    status="ACTIVE"
                    members={["JD"]}
                    extraMembers={4}
                    onEdit={() => console.log("Editar")}
                    onDelete={() => console.log("Excluir")}
                />
            </ScrollView>
        </SafeAreaView>
    )
}