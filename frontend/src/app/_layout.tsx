import '../../global.css';
import { useRouter, useSegments, usePathname, Stack } from 'expo-router';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../contexts/AuthContext'

function InitialLayout () {
  const { user, isLoading } = useAuth()
  const segments = useSegments()
  const router = useRouter()
  const pathname = usePathname() 

  useEffect(() => {
    if (isLoading) return

    const inAuthGroup = segments[0] === '(auth)'
  
    const isIndex = pathname === '/'

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login')
    } else if (user && (inAuthGroup || isIndex)) {
        if (user.role === 'client') {
          router.replace('/(client)/(tabs)/clientHome')
        }  else if (user.role === 'atendente') {
          router.replace('/(agent)/(tabs)/agentHome')
        }  else if (user.role === 'admin') {
          router.replace('/(admin)/(tabs)/adminHome')
        }
    }
  }, [user, isLoading, segments, pathname])

  

  return <Stack screenOptions={{ headerShown: false }} />
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <InitialLayout />
    </AuthProvider>
  )
}