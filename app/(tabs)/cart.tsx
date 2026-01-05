//app/(tabs)/cart.tsx

import React, { useState } from 'react';
import { View, StyleSheet, StatusBar, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useCart } from '../../context/CartContext';
import CartHeader from '../../components/CartHeader';
import CartList from '../../components/CartList';

import { api } from '../../lib/api'; 

// Helper function untuk handle unknown error
const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    return 'Unknown error occurred';
};

export default function CartScreen() {
    const router = useRouter();
    const {
        cartItems,
        totalItems,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart
    } = useCart();

    const [isBooking, setIsBooking] = useState(false);

    const handleBrowse = () => router.push('/(tabs)');

    const handleCheckout = () => {
        Alert.alert(
            "Konfirmasi Checkout",
            `Pinjam ${totalItems} alat ini sekarang?`,
            [
                { text: "Tidak", style: "cancel" },
                { text: "Iya", onPress: processCheckout }
            ]
        );
    };

    // ===== FUNGSI CHECKOUT UTAMA =====
    const processCheckout = async () => {
        setIsBooking(true);

        try {
            if (cartItems.length === 0) {
                throw new Error('Keranjang kosong');
            }

            // ⭐ FORMAT YANG BENAR SESUAI SWAGGER
            const borrowingData = {
                mhsId: 1, // Hardcode 
                items: cartItems.map(item => ({
                    psaId: item.id,  
                    quantity: item.quantity
                }))
       
            };


            const response = await api.post('/api/borrowing', borrowingData, {
                timeout: 10000
            });

            console.log('Response dari backend:', response.data);

            const result = response.data;

            // Handle response
            if (!result.data) {
                throw new Error(result.message || 'Invalid response from server');
            }

            // Navigasi ke QR screen
            router.push({
                pathname: '/(tabs)/booking-qr',
                params: {
                    id: result.data.id  
                }
            });

        } catch (error: any) {
            console.error("Checkout error:", error);

            // ⭐ DETAILED ERROR LOGGING
            if (error.response) {
                console.log('Error details:', {
                    status: error.response.status,
                    data: error.response.data,
                    requestData: JSON.parse(error.config?.data || '{}')
                });

                // Tampilkan error yang lebih informatif
                const errorMsg = error.response.data?.message ||
                    error.response.data?.errors?.join(', ') ||
                    'Unknown error';

                Alert.alert(
                    `Error ${error.response.status}`,
                    `Server error: ${errorMsg}`
                );
            } else {
                Alert.alert("Gagal Checkout", error.message || 'Unknown error');
            }

        } finally {
            setIsBooking(false);
            clearCart();
        }
    };

    // ===== RENDER =====
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#5B4DBC" />

            <CartHeader
                totalItems={totalItems}
                onClearCart={clearCart}
            />

            <View style={styles.bodyContainer}>
                <CartList
                    cart={cartItems}
                    totalItems={totalItems}
                    isBooking={isBooking}
                    onRemove={removeFromCart}
                    onIncrease={increaseQuantity}
                    onDecrease={decreaseQuantity}
                    onCheckout={handleCheckout}
                    onBrowse={handleBrowse}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#5B4DBC' },
    bodyContainer: {
        flex: 1,
        backgroundColor: '#F5F5F7',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        overflow: 'hidden'
    }
});