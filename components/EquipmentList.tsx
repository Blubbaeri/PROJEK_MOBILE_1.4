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

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="white" />
            </View>
        );
    }

    // Data sudah di-normalize di HomeScreen, jadi langsung cek saja
    if (!data || data.length === 0) {
        return (
            <View style={styles.center}>
                <Text style={{ color: 'white' }}>No equipment found.</Text>
            </View>
        );
    }

    return (
        <FlatList
            data={data} // ← GUNAKAN DATA LANGSUNG (sudah dinormalize)
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            contentContainerStyle={{ padding: 10, paddingBottom: 100 }}
            refreshing={refreshing}
            onRefresh={onRefresh}
            renderItem={({ item }) => (
                <EquipmentCard
                    data={item} // ← Item sudah punya field id, name, stock
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