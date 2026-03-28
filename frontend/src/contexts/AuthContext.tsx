import { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'cliente' | 'atendente' | 'admin'

export type User = {
    id: string,
    name: string,
    email: string
    role: UserRole
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
        }, 1250)
    }, [])

    const signIn = async (role: UserRole) => {
        setIsLoading(true)
        setUser({
            id: '123',
            name: 'Joao Silva',
            email: 'teste@email.com',
            role: role
        })
        setIsLoading(false)
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