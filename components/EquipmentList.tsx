//components/EquipmentList.tsx

import React from 'react';
import { View, FlatList, ActivityIndicator, Text, StyleSheet } from 'react-native';
import EquipmentCard from './EquipmentCard';

interface EquipmentListProps {
    data: any[];
    loading: boolean;
    refreshing: boolean;
    onRefresh: () => void;
    cart?: any[];
    onAddToCart: (item: any) => void;
}

export default function EquipmentList({
    data,
    loading,
    refreshing,
    onRefresh,
    onAddToCart
}: EquipmentListProps) {

    // ========== PERBAIKAN: PROSES DATA DULU ==========
    // Data dari backend mungkin tidak punya field "stock"
    // Kita harus normalisasi data sebelum dikirim ke EquipmentCard

    const processedData = React.useMemo(() => {
        if (!data || data.length === 0) return [];

        return data.map(item => {
            // Cari field stock dengan berbagai kemungkinan nama
            const stockValue =
                item.stock !== undefined ? item.stock :
                    item.quantity !== undefined ? item.quantity :
                        item.available !== undefined ? item.available :
                            item.totalStock !== undefined ? item.totalStock :
                                item.stok !== undefined ? item.stok : // alternatif ejaan
                                    0;

            // DEBUG: Log jika stock tidak ditemukan
            if (stockValue === 0) {
                console.log(`Item ${item.id} - ${item.name} has no stock field`);
                console.log('Item keys:', Object.keys(item));
            }

            // Return data dengan field stock yang sudah dipastikan ada
            return {
                ...item,
                stock: stockValue
            };
        });
    }, [data]);

    // ========== REST OF THE CODE ==========

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="white" />
            </View>
        );
    }

    // Gunakan processedData, bukan data langsung
    if (!processedData || processedData.length === 0) {
        return (
            <View style={styles.center}>
                <Text style={{ color: 'white' }}>No equipment found.</Text>
            </View>
        );
    }

    return (
        <FlatList
            data={processedData} // <-- GUNAKAN processedData, bukan data
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            contentContainerStyle={{ padding: 10, paddingBottom: 100 }}
            refreshing={refreshing}
            onRefresh={onRefresh}
            renderItem={({ item }) => (
                <EquipmentCard
                    data={item} // Sekarang item sudah punya field stock
                    onAdd={() => onAddToCart(item)}
                />
            )}
        />
    );
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50
    }
});