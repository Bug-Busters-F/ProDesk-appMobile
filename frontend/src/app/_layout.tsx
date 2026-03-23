import '../../global.css';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { AuthProvider, useAuth } from '../contexts/AuthContext'

function InitialLayout () {
  const { user, isLoading } = useAuth()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    const inAuthGroup = segments[0] === '(auth)'

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login')
    } else if (user && inAuthGroup) {
        if (user.role === 'cliente') {
          router.replace('/(client)/clientHome')
        }  else if (user.role === 'atendente') {
          router.replace('/(agent)/agentHome')
        }  else if (user.role === 'admin') {
          router.replace('/(admin)/adminHome')
        }
    }
  }, [user, isLoading, segments])

  if (isLoading) {
    return(
      <View className='flex-1 justify-center items-center'>
        <ActivityIndicator size="large" color="orange" />
      </View>
    )
  }

  return <Slot />
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <InitialLayout />
    </AuthProvider>
  )
}