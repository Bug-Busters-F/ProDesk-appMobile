import { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '@/services/api';
import { jwtDecode } from "jwt-decode"

export type UserRole = 'client' | 'support' | 'admin'

export type User = {
    id: string
    email: string,
    password: string,
    role: UserRole
}

export type AuthContextData = {
    user: User | null
    isLoading: boolean,
    signIn: (email: string, password: string) => Promise<UserRole>
    signOut: () => void
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData)

export const AuthProvider = ({ children }: { children: React.ReactNode}) => {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function loadStorageData() {
            const storedToken = await SecureStore.getItemAsync('prodesk_token')
            const storedUser = await SecureStore.getItemAsync('prodesk_user')

            if (storedToken && storedUser) {
                api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
                setUser(JSON.parse(storedUser))
            }
            setIsLoading(false)
        }
        loadStorageData()
    }, [])

    const signIn = async (email: string, password: string) => {
        setIsLoading(true)
        try {
            const response = await api.post('/auth/login', { email, password})

            const { token } = response.data

            const decoded: any = jwtDecode(token)

            const userData: User = {
                id: decoded.sub,
                email: decoded.email,
                password: '',
                role: decoded.role.toLowerCase() as UserRole
            }

            await SecureStore.setItemAsync('prodesk_token', token)
            await SecureStore.setItemAsync('prodesk_user', JSON.stringify(userData))

            api.defaults.headers.common['Authorization'] = `Bearer ${token}`

            setUser(userData)

            return userData.role
        } catch (error) {
            console.log('Erro no login', error)
            throw error;
        } finally {
            setIsLoading(false)
        }
    }

    const signOut = async () => {
        await SecureStore.deleteItemAsync('prodesk_token');
        await SecureStore.deleteItemAsync('prodesk_user');
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, isLoading, signIn, signOut}}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
export { api }