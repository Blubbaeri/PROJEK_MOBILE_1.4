// src/context/AuthContext.tsx 
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const TOKEN_KEY = 'my-jwt';

interface AuthContextType {
    // Ubah jadi Promise<void> biar kita bisa pake 'await signIn()' di halaman login
    signIn: (token: string) => Promise<void>;
    signOut: () => Promise<void>;
    session: string | null;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadToken = async () => {
            try {
                const token = await AsyncStorage.getItem(TOKEN_KEY);
                if (token) {
                    // Set token ke state
                    setSession(token);
                    // Set token ke header global axios
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                }
            } catch (e) {
                console.error("Gagal memuat token dari storage", e);
            } finally {
                setIsLoading(false);
            }
        };
        loadToken();
    }, []);

    const authContextValue = {
        signIn: async (token: string) => {
            setSession(token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            await AsyncStorage.setItem(TOKEN_KEY, token);
        },
        signOut: async () => {
            setSession(null);
            delete axios.defaults.headers.common['Authorization'];
            await AsyncStorage.removeItem(TOKEN_KEY);
        },
        session,
        isLoading,
    };

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
}