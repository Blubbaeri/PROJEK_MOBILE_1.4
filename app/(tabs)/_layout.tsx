// file: app/(tabs)/_layout.tsx 

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { CartProvider, useCart } from '../../context/CartContext';
import { PaperProvider } from 'react-native-paper';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';

// Konfigurasi Toast
const toastConfig = {
    success: (props: any) => (
        <BaseToast
            {...props}
            style={{ borderLeftColor: '#4CAF50' }}
            contentContainerStyle={{ paddingHorizontal: 15 }}
            text1Style={{ fontSize: 15, fontWeight: 'bold' }}
        />
    ),
    error: (props: any) => (
        <ErrorToast
            {...props}
            style={{ borderLeftColor: '#FF5252' }}
            text1Style={{ fontSize: 15, fontWeight: 'bold' }}
        />
    ),
};

function AppTabsLayout() {
    const { totalItems } = useCart();

    return (
        <>
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarActiveTintColor: '#5B4DBC',
                    tabBarInactiveTintColor: '#A0A0A0',
                    tabBarShowLabel: true,
                    tabBarStyle: {
                        height: 70,
                        paddingBottom: 10,
                        paddingTop: 10,
                        borderTopWidth: 0,
                        backgroundColor: 'white',
                        elevation: 20,
                        shadowColor: '#5B4DBC',
                        shadowOffset: { width: 0, height: -5 },
                        shadowOpacity: 0.1,
                        shadowRadius: 10,
                    },
                    tabBarLabelStyle: {
                        fontSize: 12,
                        fontWeight: '600',
                        marginBottom: 0
                    }
                }}
            >
                <Tabs.Screen
                    name="index" // <-- Sesuaikan dengan nama file kamu
                    options={{
                        title: 'Equipment', // Judul tab tetap Equipment
                        tabBarIcon: ({ color }) => <FontAwesome size={24} name="flask" color={color} />,
                    }}
                />

                {/* 2. TRANSACTION (Pastikan nama file transaction.tsx TANPA 's') */}
                <Tabs.Screen
                    name="transaction"
                    options={{
                        title: 'Transactions',
                        tabBarIcon: ({ color }) => <FontAwesome size={24} name="list-alt" color={color} />,
                    }}
                />

                {/* 3. CART (Pastikan ada file cart.tsx) */}
                <Tabs.Screen
                    name="cart"
                    options={{
                        title: 'Cart',
                        tabBarIcon: ({ color }) => (
                            <View>
                                <FontAwesome size={24} name="shopping-cart" color={color} />
                                {totalItems > 0 && (
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText}>
                                            {totalItems > 99 ? '99+' : totalItems}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        ),
                    }}
                />

                {/* --- HALAMAN TERSEMBUNYI (Hidden Tabs) --- */}
                {/* Agar navigasi router.push('/(tabs)/booking-qr') berhasil */}

                <Tabs.Screen
                    name="booking-qr"
                    options={{
                        href: null, // Sembunyikan dari menu bawah
                        tabBarStyle: { display: 'none' }, // Sembunyikan tab bar saat di halaman ini
                    }}
                />

                <Tabs.Screen
                    name="success"
                    options={{
                        href: null, // Sembunyikan dari menu bawah
                        tabBarStyle: { display: 'none' },
                    }}
                />

            </Tabs>
            <Toast config={toastConfig} />
        </>
    );
}

export default function TabLayout() {
    return (
        <PaperProvider>
            <CartProvider>
                <AppTabsLayout />
            </CartProvider>
        </PaperProvider>
    );
}

const styles = StyleSheet.create({
    badge: {
        position: 'absolute',
        top: -8,
        right: -12,
        backgroundColor: '#FF5252',
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
        borderWidth: 1.5,
        borderColor: 'white'
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold'
    },
});