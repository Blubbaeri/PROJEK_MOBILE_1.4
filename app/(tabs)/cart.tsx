    // app/(tabs)/cart.tsx

    import React, { useState } from 'react';
    import { View, StyleSheet, StatusBar, Alert } from 'react-native';
    import { useRouter } from 'expo-router';
    import { useCart } from '../../context/CartContext';
    import CartHeader from '../../components/CartHeader';
    import CartList from '../../components/CartList';
    import { api } from '../../lib/api';

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

                const borrowingData = {
                    mhsId: 1,
                    items: cartItems.map(item => ({
                        perId: item.perId,
                        quantity: item.quantity
                    }))
                };

                console.log('Sending to backend:', borrowingData);

                const response = await api.post('/api/borrowing', borrowingData, {
                    timeout: 10000
                });

                console.log('Response dari backend:', response.data);


                router.push({
                    pathname: '/(tabs)/booking-qr',
                    params: {
                        id: response.data.data.id,
                        qrCode: response.data.data.qrCode,
                        status: response.data.data.status
                    }
                });

                clearCart();

            } catch (error: any) {
                console.error("Checkout error:", error.message);
                Alert.alert("Gagal Checkout", error.message || 'Unknown error');
            } finally {
                setIsBooking(false);
            }
        };


        // ===== RENDER =====
        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="#5B4DBC" />

                <CartHeader
                    totalItems={totalItems}
                    onClearCart={() => {
                        Alert.alert(
                            "Hapus Keranjang",
                            "Yakin hapus semua item di keranjang?",
                            [
                                { text: "Batal", style: "cancel" },
                                { text: "Hapus", onPress: clearCart }
                            ]
                        );
                    }}
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