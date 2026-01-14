import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Key constants
const TOKEN_KEY = 'user-token';
const PERMISSIONS_KEY = 'user-permissions';

interface AuthContextType {
    signIn: (token: string, permissions: string[]) => Promise<void>;
    signOut: () => Promise<void>;
    session: string | null;
    permissions: string[];
    isLoading: boolean;
    hasPermission: (permission: string) => boolean;
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
    const [permissions, setPermissions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadAuthData = async () => {
            try {
                // Load token
                const token = await AsyncStorage.getItem(TOKEN_KEY);
                if (token) {
                    setSession(token);
                }

                // Load permissions
                const permissionsJson = await AsyncStorage.getItem(PERMISSIONS_KEY);
                if (permissionsJson) {
                    const perms = JSON.parse(permissionsJson);
                    setPermissions(perms || []);
                }
            } catch (e) {
                console.error("Gagal memuat auth data dari storage", e);
            } finally {
                setIsLoading(false);
            }
        };
        loadAuthData();
    }, []);

    const hasPermission = (permission: string): boolean => {
        return permissions.includes(permission);
    };

    const authContextValue: AuthContextType = {
        signIn: async (token: string, permissionsList: string[] = []) => {
            // Simpan ke state
            setSession(token);
            setPermissions(permissionsList);

            // Simpan ke AsyncStorage
            await AsyncStorage.setItem(TOKEN_KEY, token);
            await AsyncStorage.setItem(PERMISSIONS_KEY, JSON.stringify(permissionsList));

            console.log('Auth: Token saved, permissions:', permissionsList);
        },
        signOut: async () => {
            setSession(null);
            setPermissions([]);
            await AsyncStorage.removeItem(TOKEN_KEY);
            await AsyncStorage.removeItem(PERMISSIONS_KEY);
        },
        session,
        permissions,
        isLoading,
        hasPermission
    };

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
}