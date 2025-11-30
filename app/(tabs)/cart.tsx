// file: app/(tabs)/cart.tsx

import React, { useState } from 'react';
import { View, StyleSheet, Alert, StatusBar } from 'react-native';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'expo-router';
import { api } from "@/lib/api";
import axios from "axios";

// --- IMPORT COMPONENTS (Standarisasi) ---
import CartHeader from '@/components/CartHeader';
import CartList from '@/components/CartList';

const CartScreen = () => {
    const {
        cart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        totalItems,
        clearCart
    } = useCart();

    const router = useRouter();
    const [isBooking, setIsBooking] = useState(false);

    // --- LOGIC BOOKING ---
    const handleProceedToBooking = async () => {
        if (cart.length === 0) return;
        setIsBooking(true);

        const bookingData = {
            items: cart.map(item => ({
                equipment_id: item.id,
                quantity: item.quantity
            })),
            notes: 'Booking via Mobile App'
        };

        try {
            await api.post(`/api/bookings`, bookingData);

            Alert.alert(
                'Booking Berhasil!',
                'Permintaan peminjaman alat telah dikirim.',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            clearCart();
                            router.replace('/(tabs)/transaction');
                        }
                    }
                ]
            );
        } catch (error) {
            console.error('Error saat booking:', error);
            const errorMessage =
                axios.isAxiosError(error) && error.response?.data?.detail
                    ? error.response.data.detail
                    : 'Terjadi kesalahan. Silakan coba lagi.';
            Alert.alert('Booking Gagal', errorMessage);
        } finally {
            setIsBooking(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#5B4DBC" />

            {/* Header Komponen */}
            <CartHeader
                totalItems={totalItems}
                onClearCart={clearCart}
            />

            {/* List Komponen & Footer */}
            <CartList
                cart={cart}
                totalItems={totalItems}
                isBooking={isBooking}
                onRemove={removeFromCart}
                onIncrease={increaseQuantity}
                onDecrease={decreaseQuantity}
                onCheckout={handleProceedToBooking}
                onBrowse={() => router.push('/(tabs)')}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#5B4DBC' },
});

export default CartScreen;