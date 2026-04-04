import { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'cliente' | 'atendente' | 'admin'

export type User = {
    id: string,
    name: string,
    email: string,
    role: UserRole,
    token: string
}

type AuthContextData = {
    user: User | null
    isLoading: boolean,
    signIn: (role: UserRole) => Promise<void>
    signOut: () => void
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData)

export const AuthProvider = ({ children }: { children: React.ReactNode}) => {
    const [user, setUser] = useState<User | null>(null)

    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        setTimeout(() => {
            setUser(null)
            setIsLoading(false)
        }, 1000)
    }, [])

    const signIn = async (role: UserRole) => {
        setIsLoading(true)

        setTimeout(() => {
            const userId = role === 'cliente' 
              ? '507f1f77bcf86cd799439022' 
              : '507f1f77bcf86cd799439033'; 
            setUser({
                id: userId,     
                name: role === 'cliente' ? 'Cliente Teste' : 'Atendente Teste',
                email: `${role}@teste.com`,
                role: role,
                token: `TEST_TOKEN_${role.toUpperCase()}` 
            })
            setIsLoading(false)
        }, 1000)
    }

    const signOut = () => {
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, isLoading, signIn, signOut}}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)