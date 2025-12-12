import { AuthProvider, useAuth } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { PaperProvider, MD3LightTheme as DefaultTheme } from 'react-native-paper';
import { Slot, useRouter, useSegments, Href } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View, StatusBar } from 'react-native';
import Toast from 'react-native-toast-message';

const theme = {
    ...DefaultTheme,
    colors: { ...DefaultTheme.colors, primary: '#5B4DBC', secondary: '#26C6DA' },
};

const InitialLayout = () => {
    const { session, isLoading } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;

        // Cek user sedang di halaman mana
        const inAuthGroup = segments[0] === 'login' || segments[0] === 'register';

        if (session && inAuthGroup) {
            // KALAU SUDAH LOGIN: Tendang ke halaman Utama (Tabs)
            router.replace('/(tabs)' as Href);
        } else if (!session && !inAuthGroup) {
            // KALAU BELUM LOGIN: Tendang balik ke Login
            router.replace('/login' as Href); // Pastikan nama file login kamu 'login.tsx'
        }
    }, [session, isLoading, segments, router]);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
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
                    <StatusBar barStyle="light-content" backgroundColor="#5B4DBC" />
                    <InitialLayout />
                    <Toast />
                </PaperProvider>
            </CartProvider>
        </AuthProvider>
    );
}