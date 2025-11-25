// file: app/(tabs)/_layout.tsx 

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { CartProvider, useCart } from '@/context/CartContext';
import { PaperProvider } from 'react-native-paper'; // Dihapus Snackbar karena tidak dipakai di sini
import Toast, { BaseToast, BaseToastProps, ErrorToast } from 'react-native-toast-message';

const toastConfig = { /* ... Konfigurasi Toast tidak berubah ... */ };

function AppTabsLayout() {
  const { totalItems } = useCart();

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#6A5AE0',
          tabBarShowLabel: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
          }}
        />

        {/* --- PERBAIKAN UTAMA DI SINI --- */}
        <Tabs.Screen
          name="transaction" // <-- HAPUS 's' agar cocok dengan nama file
          options={{
            title: 'Transactions',
            tabBarIcon: ({ color }) => <FontAwesome size={24} name="list-alt" color={color} />,
          }}
        />

        <Tabs.Screen
          name="cart"
          options={{
            title: 'Cart',
            tabBarIcon: ({ color }) => (
              <View>
                <FontAwesome size={28} name="shopping-cart" color={color} />
                {totalItems > 0 && (
                  <View style={styles.badge}><Text style={styles.badgeText}>{totalItems}</Text></View>
                )}
              </View>
            ),
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

// StyleSheet tidak diubah
const styles = StyleSheet.create({
  badge: { position: 'absolute', top: -5, right: -10, backgroundColor: '#E91E63', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
});