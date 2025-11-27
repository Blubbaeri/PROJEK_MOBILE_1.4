import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
    StatusBar
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'expo-router';
import { api } from "@/lib/api";
import axios from "axios";

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

    // --- LOGIC BOOKING (TIDAK BERUBAH) ---
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
                'Data peminjaman Anda telah berhasil dikirim.',
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
                    : 'Terjadi kesalahan saat mengirim data. Coba lagi.';
            Alert.alert('Booking Gagal', errorMessage);
        } finally {
            setIsBooking(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#5B4DBC" />

            {/* --- HEADER UNGU --- */}
            <View style={styles.header}>
                {/* Tombol Back (Opsional jika ini Tab utama, bisa dihapus) */}
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <FontAwesome name="arrow-left" size={20} color="white" />
                </TouchableOpacity>

                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Shopping Cart</Text>
                    <Text style={styles.headerSubtitle}>{totalItems} Items in Cart</Text>
                </View>
            </View>

            {/* --- CONTAINER PUTIH MELENGKUNG --- */}
            <View style={styles.whiteSheet}>
                <FlatList
                    data={cart}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <FontAwesome name="shopping-basket" size={60} color="#DDD" />
                            <Text style={styles.emptyText}>Keranjang Anda masih kosong.</Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <View style={styles.cartCard}>
                            {/* Gambar Item */}
                            {item.image ? (
                                <Image source={{ uri: item.image }} style={styles.itemImage} />
                            ) : (
                                <View style={[styles.itemImage, styles.imagePlaceholder]}>
                                    <FontAwesome name="camera" size={20} color="#ccc" />
                                </View>
                            )}

                            {/* Info & Kontrol */}
                            <View style={styles.cardInfo}>
                                <View style={styles.cardHeaderRow}>
                                    <Text style={styles.itemName} numberOfLines={1}>
                                        {item.name}
                                    </Text>
                                    <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                                        <FontAwesome name="times-circle" size={22} color="#FF5252" />
                                    </TouchableOpacity>
                                </View>

                                <Text style={styles.itemCategory}>Lab Equipment</Text>

                                {/* Quantity Row */}
                                <View style={styles.qtyContainer}>
                                    <TouchableOpacity
                                        onPress={() => decreaseQuantity(item.id)}
                                        style={styles.qtyButton}
                                    >
                                        <FontAwesome name="minus" size={12} color="white" />
                                    </TouchableOpacity>

                                    <Text style={styles.qtyText}>{item.quantity}</Text>

                                    <TouchableOpacity
                                        onPress={() => increaseQuantity(item.id)}
                                        style={[styles.qtyButton, { backgroundColor: '#5B4DBC' }]} // Warna Ungu Utama
                                    >
                                        <FontAwesome name="plus" size={12} color="white" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    )}
                />

                {/* --- FOOTER CHECKOUT --- */}
                {cart.length > 0 && (
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[styles.checkoutButton, isBooking && styles.buttonDisabled]}
                            onPress={handleProceedToBooking}
                            disabled={isBooking}
                        >
                            {isBooking ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={styles.checkoutButtonText}>
                                    Proceed to Booking ({totalItems})
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    // Layout Utama
    container: {
        flex: 1,
        backgroundColor: '#5B4DBC' // Background Ungu Utama
    },

    // Header Styles
    header: {
        height: 140, // Tinggi header ungu
        paddingHorizontal: 20,
        paddingTop: 50, // Untuk status bar
        justifyContent: 'flex-start',
    },
    backButton: {
        marginBottom: 10,
        width: 30,
    },
    headerContent: {
        marginTop: 5,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white'
    },
    headerSubtitle: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        marginTop: 5
    },

    // Area Putih Melengkung
    whiteSheet: {
        flex: 1,
        backgroundColor: '#F5F5F7', // Abu-abu sangat muda
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        overflow: 'hidden',
    },

    // Empty State
    emptyContainer: {
        alignItems: 'center',
        marginTop: 80
    },
    emptyText: {
        marginTop: 15,
        fontSize: 16,
        color: '#999'
    },

    // Card Styles
    cartCard: {
        flexDirection: 'row',
        backgroundColor: 'white',
        padding: 12,
        borderRadius: 16,
        marginBottom: 15,
        alignItems: 'center',
        // Shadow effect
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
    },
    itemImage: {
        width: 70,
        height: 70,
        borderRadius: 12,
        marginRight: 15,
        backgroundColor: '#F0F0F0'
    },
    imagePlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardInfo: {
        flex: 1,
        height: 70,
        justifyContent: 'space-between',
        paddingVertical: 2
    },
    cardHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        maxWidth: '85%'
    },
    itemCategory: {
        fontSize: 12,
        color: '#888',
        marginTop: -5
    },

    // Quantity Controls
    qtyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 15 // Jarak antar elemen
    },
    qtyButton: {
        backgroundColor: '#9FA8DA', // Ungu muda
        width: 28,
        height: 28,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center'
    },
    qtyText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        minWidth: 20,
        textAlign: 'center'
    },

    // Footer
    footer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        elevation: 10
    },
    checkoutButton: {
        backgroundColor: '#5B4DBC', // Ungu Utama
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        shadowColor: '#5B4DBC',
        shadowOpacity: 0.4,
        shadowOffset: { width: 0, height: 4 }
    },
    checkoutButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold'
    },
    buttonDisabled: {
        backgroundColor: '#B0B0B0'
    }
});

export default CartScreen;