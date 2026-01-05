import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

interface EquipmentCardProps {
    data: any;
    onAdd: () => void;
}

export default function EquipmentCard({ data, onAdd }: EquipmentCardProps) {
    const isAvailable = data.stock > 0;

    return (
        <View style={styles.card}>
            {/* --- BAGIAN 1: GAMBAR BARANG --- */}
            <View style={styles.imageContainer}>
                <Image
                    source={data.image ? { uri: data.image } : { uri: 'https://via.placeholder.com/150' }}
                    style={styles.image}
                />
            </View>

            <Text style={styles.name} numberOfLines={2}>{data.name}</Text>

            {/* --- SOLUSI: STOCK DIPISAH --- */}
            <View style={styles.stockRow}>
                <Text style={styles.stockLabel}>Stock:</Text>
                <Text style={styles.stockValue}> {data.stock ?? 0}</Text>
            </View>

            {/* --- BAGIAN 3: TOMBOL ADD --- */}
            <TouchableOpacity
                style={[styles.addButton, { backgroundColor: isAvailable ? '#26C6DA' : '#ccc' }]}
                onPress={onAdd}
                disabled={!isAvailable}
            >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>
                    {isAvailable ? 'Add to Cart' : 'Habis'}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

// --- STYLING ---
const styles = StyleSheet.create({
    card: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 10,
        margin: 5,
        alignItems: 'center',
        elevation: 2
    },
    imageContainer: {
        width: 80,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        backgroundColor: '#f5f5f5',
        borderRadius: 40
    },
    image: {
        width: 50,
        height: 50,
        resizeMode: 'contain'
    },
    name: {
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 5,
        height: 40
    },
    // === INI STYLING BARU UNTUK STOCK ROW ===
    stockRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10
    },
    stockLabel: {
        fontSize: 12,
        color: '#888'
    },
    stockValue: {
        fontSize: 12,
        color: '#333',        // Warna lebih gelap untuk angka
        fontWeight: 'bold'    // Bold untuk angka
    },
    addButton: {
        width: '100%',
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: 'center'
    }
});