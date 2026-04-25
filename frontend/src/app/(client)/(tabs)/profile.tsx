import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useColorScheme } from 'nativewind';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';

export default function ClientProfile() {
  const { user, signOut, setUser } = useAuth(); 
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const [image, setImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      setImage(`${api.defaults.baseURL}/files/profile/${user.id}?${new Date().getTime()}`);
    }
  }, [user]);

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
              await api.delete('/users/profile-image');
              setImage(null);
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

  return (
    <SafeAreaView className='flex-1 bg-stone-50 dark:bg-stone-950'>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className='px-6 pt-10'>
        
        {/* Cabeçalho de Perfil */}
        <View className='items-center mb-8'>
          <View className='relative'>
            <View className='w-32 h-32 rounded-full bg-stone-200 dark:bg-stone-800 items-center justify-center border-4 border-white dark:border-stone-900 shadow-sm overflow-hidden'>
              {image ? (
                <Image source={{ uri: image }} className='w-full h-full' />
              ) : (
                <Ionicons name="person" size={64} color="#a8a29e" />
              )}
              {isUploading && (
                <View className='absolute inset-0 bg-black/30 items-center justify-center'>
                  <ActivityIndicator color="#ffffff" />
                </View>
              )}
            </View>
            
            {/* Botão Flutuante para Alterar */}
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
            {image && (
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
              <Text className='text-lg font-semibold text-stone-900 dark:text-white'>{user?.name || 'Usuário Cliente'}</Text>
            </View>

            <View className='h-[1px] bg-stone-100 dark:bg-stone-800' />

            <View>
              <Text className='text-gray-500 dark:text-gray-400 text-sm'>E-mail</Text>
              <Text className='text-lg font-semibold text-stone-900 dark:text-white'>{user?.email || 'email@exemplo.com'}</Text>
            </View>
          </View>
        </View>

        {/* Configurações de Tema
        <View className='bg-white dark:bg-stone-900 p-4 rounded-3xl shadow-sm mb-6 flex-row items-center justify-between'>
          <View className='flex-row items-center gap-x-3'>
            <View className='bg-stone-100 dark:bg-stone-800 p-2 rounded-xl'>
              <Ionicons 
                name={colorScheme === 'dark' ? "moon" : "sunny"} 
                size={22} 
                color={colorScheme === 'dark' ? "#fb923c" : "#eab308"} 
              />
            </View>
            <Text className='text-lg font-medium text-stone-900 dark:text-white'>Modo Escuro</Text>
          </View>
          <Switch
            value={colorScheme === 'dark'}
            onValueChange={toggleColorScheme}
            trackColor={{ false: '#d6d3d1', true: '#fdba74' }}
            thumbColor={colorScheme === 'dark' ? '#f97316' : '#f4f4f5'}
          />
        </View> */}

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