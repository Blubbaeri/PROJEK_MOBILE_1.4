//components/BookingItemList.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BookingItemListProps {
    items: Array<{
        equipmentName?: string;
        name?: string;
        quantity: number;
    }>;
}

export default function BookingItemList({ items }: BookingItemListProps) {
    return (
        <View style={styles.card}>
            <Text style={styles.headerTitle}>Detail Alat ({items?.length || 0})</Text>

            {items && items.map((item, index) => (
                <View key={index} style={[styles.row, index !== items.length - 1 && styles.borderBottom]}>
                    <View style={styles.itemInfo}>
                        <Ionicons name="cube-outline" size={20} color="#5B4DBC" />
                        <View style={{ marginLeft: 10 }}>
                            {/* Handle nama variabel yang mungkin beda (equipmentName vs name) */}
                            <Text style={styles.itemName}>{item.equipmentName || item.name}</Text>
                        </View>
                    </View>
                    <View style={styles.qtyBadge}>
                        <Text style={styles.itemQty}>x{item.quantity}</Text>
                    </View>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white', borderRadius: 16, padding: 20,
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
    },
    headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
    borderBottom: { borderBottomWidth: 1, borderBottomColor: '#F5F5F7' },
    itemInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    itemName: { fontSize: 15, color: '#333', fontWeight: '500' },
    qtyBadge: { backgroundColor: '#F0EFFB', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    itemQty: { fontSize: 14, fontWeight: 'bold', color: '#5B4DBC' },
});