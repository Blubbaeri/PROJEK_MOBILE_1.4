//app/(tabs)/cart.tsx

import React, { useState } from 'react';
import { View, StyleSheet, StatusBar, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useCart } from '../../context/CartContext';
import CartHeader from '../../components/CartHeader';
import CartList from '../../components/CartList';

//const IP_ADDRESS = "192.168.100.4";
const IP_ADDRESS = "10.1.6.125";
const PORT = "5234";
const API_URL = `http://${IP_ADDRESS}:${PORT}/api/borrowing`;

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
                { text: "Nanti Dulu", style: "cancel" },
                { text: "Gas, Pinjam!", onPress: processCheckout }
            ]
        );
    };

    // ===== FUNGSI CHECKOUT UTAMA =====
    const processCheckout = async () => {
        setIsBooking(true);

        // Setup timeout dengan AbortController
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        try {
            // 1. Validasi cart tidak kosong
            if (cartItems.length === 0) {
                throw new Error('Keranjang kosong');
            }

            // 2. Format data untuk backend
            const borrowingData = {
                mhsId: 1, // ⚠️ Hardcode dulu, nanti ganti dengan user login
                items: cartItems.map(item => ({
                    equipmentId: item.id,
                    quantity: item.quantity
                })),
                status: "Booked"
            };

            console.log('Mengirim data:', borrowingData);

            // 3. POST ke API menggunakan fetch dengan timeout
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(borrowingData),
                signal: controller.signal // Untuk timeout handling
            });

            clearTimeout(timeoutId); // Clear timeout jika sukses

            // 4. Cek jika response OK
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error ${response.status}: ${errorText}`);
            }

            // 5. Parse response JSON
            const result = await response.json();
            console.log('Response dari server:', result);

            // 6. ✅ PERBAIKAN PENTING: Backend tidak kirim field "success"
            // Format backend: { data: {...}, message: "..." }
            // BUKAN: { success: true, data: {...}, message: "..." }
            if (!result.data) {
                // Jika tidak ada data, tapi ada message success, anggap success
                if (result.message && result.message.includes("success")) {
                    console.log("Success berdasarkan message:", result.message);
                    // Lanjutkan tanpa data (optional)
                } else {
                    throw new Error(result.message || 'Invalid response from server');
                }
            }

            // 7. Navigasi ke QR dengan data REAL dari backend
            router.push({
                pathname: '/(tabs)/booking-qr',
                params: {
                    data: JSON.stringify({
                        id: result.data?.id || Date.now(), // gunakan data.id jika ada
                        studentId: borrowingData.mhsId,
                        qrCode: result.data?.qrCode || `QR-${Date.now()}`,
                        status: result.data?.status || "Booked",
                        items: cartItems.map(item => ({
                            equipmentId: item.id,
                            equipmentName: item.name,
                            quantity: item.quantity,
                            image: item.image
                        })),
                        qrExpiry: result.data?.qrExpiry || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                        timestamp: new Date().toISOString()
                    })
                }
            });

        } catch (error: any) {
            clearTimeout(timeoutId); // Clear timeout jika error

            console.error("Checkout error:", error);

            // Handle error dengan helper function
            const errorMessage = getErrorMessage(error);

            // Special handling untuk timeout/AbortError
            if (error.name === 'AbortError' || errorMessage.includes('timeout')) {
                Alert.alert(
                    "Timeout",
                    "Request timeout. Coba lagi atau periksa koneksi internet."
                );
            }
            // 🚨 PERBAIKAN: Jika error message adalah "Borrowing created successfully"
            else if (errorMessage.includes('Borrowing created successfully')) {
                console.log('✅ Backend success, but frontend parsed as error');

                // Try to extract data from error message if possible
                Alert.alert(
                    "Booking Berhasil!",
                    "Peminjaman berhasil dibuat. Silakan cek halaman transaksi.",
                    [
                        {
                            text: "OK",
                            onPress: () => {
                                // Navigate to transactions page
                                router.push('/(tabs)/transaction');
                            }
                        }
                    ]
                );
            }
            else {
                Alert.alert("Gagal Checkout", errorMessage);
            }
        } finally {
            setIsBooking(false);
            clearCart(); // Kosongkan keranjang setelah proses selesai
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