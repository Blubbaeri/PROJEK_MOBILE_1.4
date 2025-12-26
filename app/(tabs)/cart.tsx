import React, { useState } from 'react';
import { View, StyleSheet, StatusBar, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';

// --- IMPORT CONTEXT ---
import { useCart } from '../../context/CartContext';

// --- IMPORT KOMPONEN TAMPILAN ---
import CartHeader from '../../components/CartHeader';
import CartList from '../../components/CartList';

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

    // KONFIGURASI API
    const IP_ADDRESS = "192.168.100.230";
    const PORT = "5234";
    const API_URL = `http://${IP_ADDRESS}:${PORT}/api/borrowing`;

    const handleBrowse = () => router.push('/(tabs)');

    const handleCheckout = () => {
        if (cartItems.length === 0) {
            Alert.alert("Keranjang Kosong", "Silakan pilih barang terlebih dahulu.");
            return;
        }

        Alert.alert(
            "Konfirmasi Checkout",
            `Pinjam ${totalItems} alat ini sekarang?`,
            [
                { text: "Nanti Dulu", style: "cancel" },
                { text: "Gas, Pinjam!", onPress: processCheckout }
            ]
        );
    };

    const processCheckout = async () => {
        setIsBooking(true);

        const payload = {
            userId: 1,
            items: cartItems.map(item => ({
                equipmentId: item.id,
                quantity: item.quantity
            }))
        };

        try {
            console.log("Mengirim data checkout ke:", API_URL);
            const response = await axios.post(API_URL, payload);

            if (response.status === 200 || response.status === 201) {
                const backendResult = response.data;

                // MENGGABUNGKAN ID BACKEND DENGAN DATA LOKAL CART
                // Ini supaya di halaman QR data barangnya tidak kosong/undefined
                const bookingData = {
                    id: backendResult.id || backendResult.borrowingId || "000",
                    status: backendResult.status || "PENDING",
                    items: cartItems.map(item => ({
                        equipmentId: item.id,
                        equipmentName: item.name,
                        quantity: item.quantity,
                        image: item.image
                    }))
                };

                clearCart();

                router.push({
                    pathname: '/(tabs)/booking-qr',
                    params: { data: JSON.stringify(bookingData) }
                });
            }
        } catch (error: any) {
            console.error("Error Checkout:", error.response?.data || error.message);
            Alert.alert("Gagal Checkout", "Pastikan server backend Anda berjalan.");
        } finally {
            setIsBooking(false);
        }
    };

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