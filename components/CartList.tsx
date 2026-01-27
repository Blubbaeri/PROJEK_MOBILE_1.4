// components/CartList.tsx
import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CartItemCard from './CartItemCard';

interface CartListProps {
    cart: any[];
    totalItems?: number; // ✅ TAMBAHKAN INI (optional)
    onRemove: (id: any) => void;
    onIncrease: (id: any) => void;
    onDecrease: (id: any) => void;
    onBrowse: () => void;
    hideFooter?: boolean;
}

export default function CartList({
    cart,
    totalItems, // ✅ SEKARANG ADA (tapi optional)
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
            {/* Header dengan total items */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>
                    Keranjang ({totalItems !== undefined ? totalItems : cart.length} item)
                </Text>
                <TouchableOpacity onPress={onBrowse}>
                    <Text style={styles.browseLink}>+ Tambah Item</Text>
                </TouchableOpacity>
            </View>

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
    container: {
        paddingHorizontal: 20,
        paddingTop: 10
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE'
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333'
    },
    browseLink: {
        fontSize: 14,
        color: '#5B4DBC',
        fontWeight: '600'
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 80
    },
    emptyText: {
        marginTop: 10,
        fontSize: 16,
        color: '#888',
        marginBottom: 20
    },
    browseButton: {
        backgroundColor: '#5B4DBC',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 8
    },
    browseText: {
        color: 'white',
        fontWeight: 'bold'
    },
    addMoreBtn: {
        alignSelf: 'center',
        marginTop: 10,
        marginBottom: 20
    },
    addMoreText: {
        color: '#5B4DBC',
        fontWeight: '600'
    }
});