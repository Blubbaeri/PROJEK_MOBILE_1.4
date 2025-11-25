// file: src/app/_layout.tsx 

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { PaperProvider } from 'react-native-paper';
import { Slot, useRouter, useSegments, Href } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import Toast from 'react-native-toast-message';

const InitialLayout = () => {
    const { session, isLoading } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;
        const inTabsGroup = segments[0] === '(tabs)';

        if (session && !inTabsGroup) {
            router.replace('/dashboard' as Href);
        } else if (!session && inTabsGroup) {
            router.replace('/login' as Href);
        }
    }, [session, isLoading, segments, router]);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#6A5AE0" />
            </View>
        );
    }

    return <Slot />;
};

export default function RootLayout() {
    return (
        <AuthProvider>
            <CartProvider>
                <PaperProvider>
                    <InitialLayout />
                    <Toast />
                </PaperProvider>
            </CartProvider>
        </AuthProvider>
    );
}