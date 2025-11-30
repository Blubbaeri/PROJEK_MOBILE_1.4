import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import CartItemCard from './CartItemCard';

type CartListProps = {
    cart: any[];
    totalItems: number;
    isBooking: boolean;
    onRemove: (id: number) => void;
    onIncrease: (id: number) => void;
    onDecrease: (id: number) => void;
    onCheckout: () => void;
    onBrowse: () => void;
};

const CartList = ({
    cart, totalItems, isBooking,
    onRemove, onIncrease, onDecrease, onCheckout, onBrowse
}: CartListProps) => {

    return (
        <View style={styles.whiteSheet}>
            <FlatList
                data={cart}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconCircle}>
                            <FontAwesome name="shopping-basket" size={50} color="#CCC" />
                        </View>
                        <Text style={styles.emptyText}>Keranjang Kosong</Text>
                        <Text style={styles.emptySubText}>Belum ada alat yang ditambahkan.</Text>
                        <TouchableOpacity style={styles.browseButton} onPress={onBrowse}>
                            <Text style={styles.browseButtonText}>Cari Alat</Text>
                        </TouchableOpacity>
                    </View>
                }
                renderItem={({ item }) => (
                    <CartItemCard
                        item={item}
                        onRemove={onRemove}
                        onIncrease={onIncrease}
                        onDecrease={onDecrease}
                    />
                )}
            />

            {/* FOOTER CHECKOUT */}
            {cart.length > 0 && (
                <View style={styles.footerContainer}>
                    <View style={styles.totalInfo}>
                        <Text style={styles.totalLabel}>Total Items</Text>
                        <Text style={styles.totalValue}>{totalItems} pcs</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.checkoutButton, isBooking && styles.buttonDisabled]}
                        onPress={onCheckout}
                        disabled={isBooking}
                    >
                        {isBooking ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <Text style={styles.checkoutButtonText}>Proceed Booking</Text>
                                <FontAwesome name="arrow-right" size={14} color="white" style={{ marginLeft: 8 }} />
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    whiteSheet: {
        flex: 1, backgroundColor: '#F5F5F7', borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: 'hidden',
    },
    listContent: { padding: 20, paddingBottom: 100 },

    // Empty State
    emptyContainer: { alignItems: 'center', marginTop: 60 },
    emptyIconCircle: {
        width: 100, height: 100, backgroundColor: '#E8E6F3', borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 20
    },
    emptyText: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    emptySubText: { fontSize: 14, color: '#999', marginTop: 5, marginBottom: 30 },
    browseButton: {
        paddingVertical: 12, paddingHorizontal: 25, backgroundColor: '#5B4DBC', borderRadius: 25, elevation: 3
    },
    browseButtonText: { color: 'white', fontWeight: 'bold' },

    // Footer
    footerContainer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: 'white', paddingVertical: 15, paddingHorizontal: 20,
        borderTopLeftRadius: 25, borderTopRightRadius: 25,
        flexDirection: 'row', alignItems: 'center',
        shadowColor: "#000", shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 15
    },
    totalInfo: { flex: 1 },
    totalLabel: { fontSize: 12, color: '#888' },
    totalValue: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    checkoutButton: {
        flex: 1.5, backgroundColor: '#5B4DBC', borderRadius: 14, paddingVertical: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center'
    },
    buttonDisabled: { backgroundColor: '#B0B0B0' },
    checkoutButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});

export default CartList;