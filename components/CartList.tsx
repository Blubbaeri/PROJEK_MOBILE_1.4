import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import CartItemCard from './CartItemCard'; // <--- KITA PANGGIL KARTU YANG KAMU BUAT

interface CartListProps {
    cart: any[];
    totalItems: number;
    isBooking: boolean;
    onRemove: (id: any) => void;
    onIncrease: (id: any) => void;
    onDecrease: (id: any) => void;
    onCheckout: () => void;
    onBrowse: () => void;
}

export default function CartList({
    cart,
    totalItems, // Ambil props totalItems
    onRemove,
    onIncrease,
    onDecrease,
    onCheckout,
    onBrowse
}: CartListProps) {

    // 1. KALO KOSONG
    if (!cart || cart.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <FontAwesome name="shopping-basket" size={60} color="#ccc" />
                <Text style={styles.emptyText}>Your cart is empty</Text>
                <TouchableOpacity style={styles.browseButton} onPress={onBrowse}>
                    <Text style={styles.browseText}>Browse Equipment</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // 2. KALO ADA ISINYA
    return (
        <View style={{ flex: 1 }}>
            <FlatList
                data={cart}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                renderItem={({ item }) => (
                    // PANGGIL COMPONENT CARD DI SINI
                    <CartItemCard
                        item={item}
                        onRemove={onRemove}
                        onIncrease={onIncrease}
                        onDecrease={onDecrease}
                    />
                )}
            />

            {/* FOOTER CHECKOUT */}
            <View style={styles.footer}>
                <View style={styles.totalInfo}>
                    <Text style={styles.totalText}>Total Items:</Text>
                    {/* Pakai props totalItems biar ga hitung ulang */}
                    <Text style={styles.totalValue}>{totalItems} pcs</Text>
                </View>
                <TouchableOpacity style={styles.checkoutBtn} onPress={onCheckout}>
                    <Text style={styles.checkoutText}>Proceed Booking</Text>
                    <FontAwesome name="arrow-right" size={16} color="white" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { marginTop: 10, fontSize: 16, color: '#888', marginBottom: 20 },
    browseButton: { backgroundColor: '#5B4DBC', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 8 },
    browseText: { color: 'white', fontWeight: 'bold' },

    footer: { padding: 20, backgroundColor: 'white', borderTopWidth: 1, borderColor: '#eee', position: 'absolute', bottom: 0, left: 0, right: 0 },
    totalInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    totalText: { color: '#888' },
    totalValue: { fontWeight: 'bold', fontSize: 16, color: '#333' },
    checkoutBtn: { backgroundColor: '#5B4DBC', padding: 15, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    checkoutText: { color: 'white', fontWeight: 'bold', marginRight: 10 }
});