import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator
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
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                    <FontAwesome name="arrow-left" size={24} color="white" />
                </TouchableOpacity>

                <View>
                    <Text style={styles.headerTitle}>Shopping Cart</Text>
                    <Text style={styles.headerSubtitle}>{totalItems} items</Text>
                </View>

                <View style={styles.headerButton} />
            </View>

            {/* LIST CART */}
            <FlatList
                data={cart}
                keyExtractor={(item) => item.id.toString()} 
                contentContainerStyle={{ padding: 20 }}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <FontAwesome name="shopping-basket" size={50} color="#ccc" />
                        <Text style={styles.emptyText}>Keranjang Anda masih kosong.</Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <View style={styles.cartItem}>
                        {/* Item Image */}
                        {item.image ? (
                            <Image source={{ uri: item.image }} style={styles.itemImage} />
                        ) : (
                            <View style={[styles.itemImage, styles.imagePlaceholder]}>
                                <FontAwesome name="camera" size={24} color="#ccc" />
                            </View>
                        )}

                        {/* Item Details */}
                        <View style={styles.itemDetailsContainer}>
                            <View style={styles.itemInfo}>
                                <Text style={styles.itemName} numberOfLines={2}>
                                    {item.name}
                                </Text>
                            </View>

                            {/* Quantity Controls */}
                            <View style={styles.quantityControl}>
                                <TouchableOpacity
                                    onPress={() => decreaseQuantity(item.id)}
                                    style={styles.quantityButton}
                                >
                                    <FontAwesome name="minus" size={16} color="white" />
                                </TouchableOpacity>

                                <Text style={styles.quantityText}>{item.quantity}</Text>

                                <TouchableOpacity
                                    onPress={() => increaseQuantity(item.id)}
                                    style={styles.quantityButton}
                                >
                                    <FontAwesome name="plus" size={16} color="white" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Remove Button */}
                        <TouchableOpacity
                            onPress={() => removeFromCart(item.id)}
                            style={styles.removeButton}
                        >
                            <FontAwesome name="times-circle" size={24} color="#E91E63" />
                        </TouchableOpacity>
                    </View>
                )}
            />

            {/* FOOTER */}
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
                                Proceed to Booking ({totalItems} items)
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F6F8' },

    header: {
        backgroundColor: '#6A5AE0',
        paddingVertical: 20,
        paddingHorizontal: 20,
        paddingTop: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },

    headerButton: { width: 24, height: 24 },

    headerTitle: { fontSize: 24, fontWeight: 'bold', color: 'white', textAlign: 'center' },

    headerSubtitle: { color: 'rgba(255,255,255,0.8)', textAlign: 'center' },

    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },

    emptyText: { marginTop: 15, fontSize: 16, color: '#888' },

    cartItem: {
        flexDirection: 'row',
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 16,
        marginBottom: 15,
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4
    },

    itemImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
        marginRight: 15,
        backgroundColor: '#eee'
    },

    imagePlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0'
    },

    itemDetailsContainer: { flex: 1, justifyContent: 'space-between', height: 80 },

    itemInfo: {},

    itemName: { fontSize: 15, fontWeight: 'bold', color: '#333' },

    quantityControl: { flexDirection: 'row', alignItems: 'center', alignSelf: 'center' },

    quantityButton: {
        backgroundColor: '#6A5AE0',
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center'
    },

    quantityText: { fontSize: 18, fontWeight: 'bold', marginHorizontal: 55, color: '#333' },

    removeButton: { position: 'absolute', top: 10, right: 10 },

    footer: { padding: 20, borderTopWidth: 1, borderColor: '#eee', backgroundColor: 'white' },

    checkoutButton: {
        backgroundColor: '#6A5AE0',
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 56
    },

    checkoutButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },

    buttonDisabled: { backgroundColor: '#A9A9A9' }
});

export default CartScreen;
