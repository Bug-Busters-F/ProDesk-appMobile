import { useFocusEffect, useRouter } from 'expo-router';
import {ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import categoryCard from '@/components/category/CategoryCard';
import EditCategoryModal from '@/components/category/EditCategoryModal';
import api from '@/services/api';
import CategoryCard from '@/components/category/CategoryCard';

interface Category {
  id: string;
  name: string;
  keywords: string[];
  trainingPhrases: string[];
}

export default function Categories() {
  const router = useRouter();
  const [focused, setFocused] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/category');
      setCategories(response.data);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      Alert.alert('Erro', 'Não foi possível carregar a lista de categorias.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCategories();
    }, []),
  );

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Excluir Categoria', `Tem certeza que deseja excluir a categoria ${name}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/category/${id}`);
            setCategories(prev => prev.filter(category => category.id !== id));
            Alert.alert('Sucesso', 'Categoria excluída!');
          } catch (error) {
            console.log('Erro ao deletar', error);
            Alert.alert('Erro', 'Não foi possível excluir a categoria.');
          }
        },
      },
    ]);
  };

  const handleOpenEdit = (category: Category) => {
    setCategoryToEdit(category);
    setIsEditModalVisible(true);
  };

  const handleUpdateSuccess = (updatedCategory: Category) => {
    setCategories(prevCategories =>
      prevCategories.map(category => (category.id === updatedCategory.id ? updatedCategory : category)),
    );
  };

  return (
    <SafeAreaView className="flex-1 px-4 bg-stone-50 mt-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-2xl font-bold text-slate-900 mb-2">Controle de Categorias</Text>
            <Text className="text-slate-500">Gerencie os setores de atendimento</Text>
          </View>
          <TouchableOpacity
            className="bg-orange-500 w-12 h-12 rounded-xl items-center justify-center shadow-lg shadow-orange-300"
            onPress={() => router.push('/(admin)/registerCategory')}
          >
            <Ionicons name="add" size={30} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8 max-h-10">
          {['Todos', 'Ativos', 'Inativos'].map((filter, index) => (
            <TouchableOpacity
              key={filter}
              className={`px-4 py-2 rounded-full mr-2 ${index === 0 ? 'bg-orange-500' : 'bg-slate-50 border border-slate-200'}`}
            >
              <Text className={`font-medium ${index === 0 ? 'text-white' : 'text-slate-500'}`}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View
          className={`flex-row items-center rounded-xl px-4 mb-6 py-3 border ${
            focused ? 'bg-white border-orange-500' : 'bg-white border-gray-200'
          }`}
        >
          <Feather name="search" size={20} color={focused ? '#F97316' : '#9CA3AF'} />

          <TextInput
            placeholder="Procure categoria por nome"
            placeholderTextColor="#9CA3AF"
            className="ml-3 flex-1 text-gray-700"
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#F97316" className="mt-10" />
        ) : (
          categories?.map(category => (
            <CategoryCard
              key={category.id}
              name={category.name}
              description={
                category.keywords.length > 0
                  ? category.keywords.slice(0, 3).join(', ') + (category.keywords.length > 3 ? '...' : '')
                  : `${category.trainingPhrases.length} frases de treino`
              }
              onEdit={() => handleOpenEdit(category)}
              onDelete={() => handleDelete(category.id, category.name)}
            />
          ))
        )}
        <View className="h-20" />
      </ScrollView>
      <EditCategoryModal
        visible={isEditModalVisible}
        category={categoryToEdit}
        onClose={() => setIsEditModalVisible(false)}
        onSuccess={handleUpdateSuccess}
      />
    </SafeAreaView>
  );
}
