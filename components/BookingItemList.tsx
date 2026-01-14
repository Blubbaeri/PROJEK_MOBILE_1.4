//components/BookingItemList.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BookingItemListProps {
    items: Array<{
        equipmentName?: string;
        name?: string;
        quantity: number;
        isHabis?: boolean; // ⬅️ TAMBAH INI
    }>;
    alatHabisList?: string[]; // ⬅️ TAMBAH INI
}

export default function BookingItemList({ items, alatHabisList = [] }: BookingItemListProps) {
    // ⭐ CEK APAKAH ITEM INI HABIS
    const isItemHabis = (itemName: string) => {
        return alatHabisList.some(habis =>
            habis.includes(itemName) ||
            itemName?.includes(habis)
        );
    };

    return (
        <View style={styles.card}>
            <Text style={styles.headerTitle}>Detail Alat ({items?.length || 0})</Text>

            {/* ⭐ TAMPILKAN WARNING JIKA ADA ALAT HABIS */}
            {alatHabisList.length > 0 && (
                <View style={styles.warningBox}>
                    <Ionicons name="warning" size={18} color="#FF9800" />
                    <Text style={styles.warningText}>
                        {alatHabisList.length === items.length
                            ? 'Semua alat habis'
                            : `${alatHabisList.length} alat habis`}
                    </Text>
                </View>
            )}

            {items && items.map((item, index) => {
                const itemName = item.equipmentName || item.name || '';
                const habis = isItemHabis(itemName) || item.isHabis;

                return (
                    <View
                        key={index}
                        style={[
                            styles.row,
                            index !== items.length - 1 && styles.borderBottom,
                            habis && styles.rowHabis // ⬅️ STYLE KHUSUS JIKA HABIS
                        ]}
                    >
                        <View style={styles.itemInfo}>
                            {/* ⭐ ICON BERBEDA UNTUK ALAT HABIS */}
                            {habis ? (
                                <Ionicons name="close-circle" size={22} color="#F44336" />
                            ) : (
                                <Ionicons name="cube-outline" size={22} color="#5B4DBC" />
                            )}

                            <View style={{ marginLeft: 10 }}>
                                {/* ⭐ TEXT CROSS OUT JIKA HABIS */}
                                <Text style={[
                                    styles.itemName,
                                    habis && styles.itemNameHabis
                                ]}>
                                    {itemName}
                                </Text>

                                {/* ⭐ TAMBAH LABEL "HABIS" */}
                                {habis && (
                                    <Text style={styles.habisLabel}>HABIS</Text>
                                )}
                            </View>
                        </View>

                        <View style={[
                            styles.qtyBadge,
                            habis && styles.qtyBadgeHabis
                        ]}>
                            <Text style={[
                                styles.itemQty,
                                habis && styles.itemQtyHabis
                            ]}>
                                x{item.quantity}
                            </Text>
                        </View>
                    </View>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12
    },
    rowHabis: {
        backgroundColor: '#FFEBEE',
        borderRadius: 8,
        paddingHorizontal: 10,
        marginVertical: 4,
    },
    borderBottom: {
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F7'
    },
    itemInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1
    },
    itemName: {
        fontSize: 15,
        color: '#333',
        fontWeight: '500'
    },
    itemNameHabis: {
        color: '#F44336',
        textDecorationLine: 'line-through',
    },
    qtyBadge: {
        backgroundColor: '#F0EFFB',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8
    },
    qtyBadgeHabis: {
        backgroundColor: '#FFCDD2',
    },
    itemQty: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#5B4DBC'
    },
    itemQtyHabis: {
        color: '#F44336',
    },
    // ⭐ STYLE BARU UNTUK WARNING
    warningBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF3E0',
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#FF9800',
    },
    warningText: {
        marginLeft: 8,
        color: '#E65100',
        fontWeight: '600',
        fontSize: 14,
    },
    // ⭐ STYLE BARU UNTUK LABEL HABIS
    habisLabel: {
        fontSize: 12,
        color: '#F44336',
        fontWeight: 'bold',
        marginTop: 2,
        backgroundColor: '#FFCDD2',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        alignSelf: 'flex-start',
    },
});