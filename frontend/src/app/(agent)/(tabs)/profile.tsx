import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';

type Category = {
  id: string;
  name: string;
};

export default function AgentProfile() {
  const { user, signOut, setUser } = useAuth(); 
  const [image, setImage] = useState<string | null>(null);
  const [hasImage, setHasImage] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  const imageKeyRef = useRef(0);

  useEffect(() => {
    if (user?.id) {
      imageKeyRef.current += 1;
      setImage(`${api.defaults.baseURL}/files/profile/${user.id}?${new Date().getTime()}`);
      setHasImage(false);
      fetchUserData();
    }
  }, [user?.id]); 

  const fetchUserData = async () => {
    try {
      const response = await api.get(`/user/${user?.id}`); 
      
      if (response.data) {
        if (response.data.categories) {
          setCategories(response.data.categories);
        }
        
        if (setUser && user) {
          setUser({
            ...user,
            name: response.data.name || user.name,
            email: response.data.email || user.email,
          });
        }
      }
    } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Permissão negada", "É necessário permitir o acesso à galeria.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], 
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    setIsUploading(true);

    imageKeyRef.current += 1;

    const formData = new FormData();
    const uriParts = uri.split('.');
    const fileType = uriParts[uriParts.length - 1] || 'jpeg'; 
    formData.append('file', { 
      uri,
      name: `profile-${user?.id}.${fileType}`,
      type: `image/${fileType}`,
    } as any);

    try {
      const response = await api.post('/files/profile', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Accept: 'application/json',
        },
      });

      setImage(uri);
      setHasImage(true);
      
      if (response.data && setUser && user) {
        setUser({ ...user, profileImage: response.data.path || uri });
      }
      
      Alert.alert("Sucesso", "Foto de perfil atualizada!");
    } catch (error: any) {
      console.error("Erro no upload:", error.response?.data || error.message);
      Alert.alert("Erro", "Não foi possível enviar a imagem.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    Alert.alert(
      "Remover Foto",
      "Deseja realmente remover sua foto de perfil?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Remover", 
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete('/files/profile');
              imageKeyRef.current += 1;
              setImage(null);
              setHasImage(false);

              if (setUser && user) setUser({ ...user, profileImage: null });
            } catch (error) {
              Alert.alert("Erro", "Não foi possível remover a foto.");
            }
          }
        }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      "Sair",
      "Tem certeza que deseja encerrar a sessão?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Sair", style: "destructive", onPress: signOut }
      ]
    );
  };

  const handleImageLoad = (key: number) => {
    if (key === imageKeyRef.current) {
      setHasImage(true);
    }
  };

  const handleImageError = (key: number) => {
    if (key === imageKeyRef.current) {
      setHasImage(false);
      setImage(null);
    }
  };

  return (
    <SafeAreaView className='flex-1 bg-stone-50 dark:bg-stone-950'>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className='px-6 pt-10'>
        
        {/* Cabeçalho de Perfil */}
        <View className='items-center mb-8'>
          <View className='relative'>
            <View className='w-32 h-32 rounded-full bg-stone-200 dark:bg-stone-800 items-center justify-center border-4 border-white dark:border-stone-900 shadow-sm overflow-hidden'>
              {image ? (
                <>
                  <Image
                    source={{ uri: image }}
                    className='w-full h-full'
                    onLoad={() => handleImageLoad(imageKeyRef.current)}
                    onError={() => handleImageError(imageKeyRef.current)}
                    style={hasImage ? undefined : { width: 0, height: 0 }}
                  />
                  {!hasImage && (
                    <Ionicons name="person" size={64} color="#a8a29e" />
                  )}
                </>
              ) : (
                <Ionicons name="person" size={64} color="#a8a29e" />
              )}
              {isUploading && (
                <View className='absolute inset-0 bg-black/30 items-center justify-center'>
                  <ActivityIndicator color="#ffffff" />
                </View>
              )}
            </View>
            
            <TouchableOpacity 
              onPress={handlePickImage}
              className='absolute bottom-0 right-0 bg-orange-500 p-2 rounded-full border-2 border-white dark:border-stone-900'
            >
              <Ionicons name="camera" size={20} color="white" />
            </TouchableOpacity>
          </View>

          <View className='flex-row mt-4 gap-x-4'>
            <TouchableOpacity onPress={handlePickImage}>
              <Text className='text-orange-500 font-semibold'>Alterar foto</Text>
            </TouchableOpacity>
            {hasImage && (
              <TouchableOpacity onPress={handleRemoveImage}>
                <Text className='text-red-500 font-semibold'>Remover</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Card de Informações do Usuário */}
        <View className='bg-white dark:bg-stone-900 p-6 rounded-3xl shadow-sm mb-6'>
          <Text className='text-gray-400 dark:text-gray-500 text-xs font-bold uppercase mb-4'>Informações da Conta</Text>
          
          <View className='gap-y-4'>
            <View>
              <Text className='text-gray-500 dark:text-gray-400 text-sm'>Nome</Text>
              <Text className='text-lg font-semibold text-stone-900 dark:text-white'>
                {user?.name || 'Carregando...'}
              </Text>
            </View>

            <View className='h-[1px] bg-stone-100 dark:bg-stone-800' />

            <View>
              <Text className='text-gray-500 dark:text-gray-400 text-sm'>E-mail</Text>
              <Text className='text-lg font-semibold text-stone-900 dark:text-white'>
                {user?.email || 'Carregando...'}
              </Text>
            </View>

            <View className='h-[1px] bg-stone-100 dark:bg-stone-800' />

            {/* Categorias Associadas (Tags/Badges) */}
            <View>
              <Text className='text-gray-500 dark:text-gray-400 text-sm mb-2'>Categorias de Atendimento</Text>
              
              {isLoadingCategories ? (
                <ActivityIndicator size="small" color="#f97316" className='self-start mt-2' />
              ) : (
                <View className='flex-row flex-wrap gap-2 mt-1'>
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <View 
                        key={category.id} 
                        className='bg-orange-100 dark:bg-orange-900/40 px-3 py-1 rounded-full border border-orange-200 dark:border-orange-800'
                      >
                        <Text className='text-sm font-bold text-orange-600 dark:text-orange-400'>
                          {category.name}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <Text className='text-sm text-gray-400 italic'>Nenhuma categoria associada.</Text>
                  )}
                </View>
              )}
            </View>
          </View>
        </View>

        <View className='mt-auto pt-6 pb-8'>
          <TouchableOpacity 
            onPress={handleLogout}
            className='bg-red-50 dark:bg-red-950/30 p-4 rounded-3xl flex-row items-center justify-center gap-x-2 mb-8'
          >
            <Ionicons name="log-out-outline" size={24} color="#ef4444" />
            <Text className='text-red-500 font-bold text-lg'>Sair da Conta</Text>
          </TouchableOpacity>
          
          <View className='items-center'>
            <Text className='text-sm text-gray-300 dark:text-gray-600'>
              © 2026 ProDesk. Todos os direitos reservados.
            </Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}