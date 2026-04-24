'use client';

import {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import {useRouter} from 'next/navigation';
import {apiClient} from './api';
import {User, LoginRequest, RegisterRequest} from '@/types';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (credentials: LoginRequest) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({children}: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Check if user is logged in on mount
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            fetchUser();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUser = async () => {
        try {
            const userData = await apiClient.getCurrentUser();
            setUser(userData);
        } catch (error) {
            localStorage.removeItem('access_token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials: LoginRequest) => {
        const {access_token} = await apiClient.login(credentials);
        localStorage.setItem('access_token', access_token);
        document.cookie = `access_token=${access_token}; path=/; max-age=${7 * 24 * 60 * 60}`;
        await fetchUser();
        router.push('/chat');
    };

    const register = async (data: RegisterRequest) => {
        await apiClient.register(data);
        // Auto-login after registration
        await login({email: data.email, password: data.password});
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        document.cookie = 'access_token=; path=/; max-age=0';
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{user, loading, login, register, logout}}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}