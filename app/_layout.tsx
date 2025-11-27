// file: src/app/_layout.tsx 

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { PaperProvider, MD3LightTheme as DefaultTheme } from 'react-native-paper';
import { Slot, useRouter, useSegments, Href } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View, StatusBar } from 'react-native';
import Toast from 'react-native-toast-message';

// Tema untuk React Native Paper (Opsional, biar konsisten)
const theme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: '#5B4DBC', // Ungu Utama
        secondary: '#26C6DA', // Tosca
    },
};

const InitialLayout = () => {
    const { session, isLoading } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;
        const inTabsGroup = segments[0] === '(tabs)';

        if (session && !inTabsGroup) {
            // Arahkan ke (tabs) karena struktur folder kamu pakai (tabs)
            router.replace('/(tabs)' as Href);
        } else if (!session && inTabsGroup) {
            router.replace('/login' as Href);
        }
    }, [session, isLoading, segments, router]);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F7' }}>
                <ActivityIndicator size="large" color="#5B4DBC" />
            </View>
        );
    }

    return <Slot />;
};

export default function RootLayout() {
    return (
        <AuthProvider>
            <CartProvider>
                <PaperProvider theme={theme}>
                    {/* Status Bar Global: Tulisan Putih, Background Ungu */}
                    <StatusBar barStyle="light-content" backgroundColor="#5B4DBC" />

                    <InitialLayout />
                    <Toast />
                </PaperProvider>
            </CartProvider>
        </AuthProvider>
    );
}