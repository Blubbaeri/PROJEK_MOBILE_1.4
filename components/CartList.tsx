import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import CartItemCard from './CartItemCard';

interface CartListProps {
    cart: any[];
    onRemove: (id: any) => void;
    onIncrease: (id: any) => void;
    onDecrease: (id: any) => void;
    onBrowse: () => void;
    hideFooter?: boolean;
}

export default function CartList({
    cart,
    onRemove,
    onIncrease,
    onDecrease,
    onBrowse,
    hideFooter = false
}: CartListProps) {

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

    return (
        <View style={styles.container}>
            {/* Menggunakan .map agar scroll lancar di parent ScrollView */}
            {cart.map((item) => (
                <CartItemCard
                    key={item.id.toString()}
                    item={item}
                    onRemove={onRemove}
                    onIncrease={onIncrease}
                    onDecrease={onDecrease}
                />
            ))}

            {!hideFooter && (
                <TouchableOpacity style={styles.addMoreBtn} onPress={onBrowse}>
                    <Text style={styles.addMoreText}>+ Add More Items</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 80 },
    emptyText: { marginTop: 10, fontSize: 16, color: '#888', marginBottom: 20 },
    browseButton: { backgroundColor: '#5B4DBC', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 8 },
    browseText: { color: 'white', fontWeight: 'bold' },
    addMoreBtn: { alignSelf: 'center', marginTop: 10, marginBottom: 20 },
    addMoreText: { color: '#5B4DBC', fontWeight: '600' }
});