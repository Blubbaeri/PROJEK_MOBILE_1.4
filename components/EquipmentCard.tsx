// components/EquipmentCard.tsx
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

interface EquipmentCardProps {
    data: any;
    onAdd: () => void;
}

export default function EquipmentCard({ data, onAdd }: EquipmentCardProps) {
    const isAvailable = (data.stock || 0) > 0;

    return (
        <View style={styles.card}>
            {/* IMAGE - KOTAK (SQUARE) */}
            <View style={styles.imageContainer}>
                {data.image ? (
                    <Image
                        source={{ uri: data.image }}
                        style={styles.image}
                        resizeMode="contain" // atau "cover" untuk fill kotak
                    />
                ) : (
                    <View style={styles.placeholderImage}>
                        <Text style={styles.placeholderText}>🔧</Text>
                    </View>
                )}
            </View>

            {/* NAME */}
            <Text style={styles.name} numberOfLines={2}>
                {data.name || 'Unnamed Equipment'}
            </Text>

            {/* INFO CONTAINER */}
            <View style={styles.infoContainer}>
                {/* STOCK */}
                <View style={styles.stockRow}>
                    <Text style={styles.stockLabel}>Stock:</Text>
                    <Text style={[
                        styles.stockValue,
                        { color: isAvailable ? '#2E7D32' : '#D32F2F' }
                    ]}>
                        {data.stock || 0}
                    </Text>
                </View>

                {/* LOCATION */}
                {data.locationName && (
                    <Text style={styles.locationText} numberOfLines={1}>
                        📍 {data.locationName}
                    </Text>
                )}
            </View>

            {/* ADD BUTTON */}
            <TouchableOpacity
                style={[
                    styles.addButton,
                    { backgroundColor: isAvailable ? '#5B4DBC' : '#BDBDBD' }
                ]}
                onPress={onAdd}
                disabled={!isAvailable}
                activeOpacity={0.7}
            >
                <Text style={styles.buttonText}>
                    {isAvailable ? 'Add to Cart' : 'Out of Stock'}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 12,
        marginHorizontal: 4,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        height: 260, // Sedikit lebih tinggi untuk image kotak
        justifyContent: 'space-between'
    },
    imageContainer: {
        width: '100%',
        height: 100, // TINGGI SAMA DENGAN LEBAR UNTUK KOTAK
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E9ECEF'
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 6
    },
    placeholderImage: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#E9ECEF',
        borderRadius: 8
    },
    placeholderText: {
        fontSize: 40,
        opacity: 0.6,
        color: '#6C757D'
    },
    name: {
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#212529',
        marginBottom: 8,
        height: 40,
        width: '100%',
        lineHeight: 18
    },
    infoContainer: {
        width: '100%',
        marginBottom: 12,
        alignItems: 'center'
    },
    stockRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6
    },
    stockLabel: {
        fontSize: 12,
        color: '#6C757D',
        fontWeight: '500'
    },
    stockValue: {
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 4
    },
    locationText: {
        fontSize: 11,
        color: '#6C757D',
        textAlign: 'center',
        width: '100%',
        fontStyle: 'italic'
    },
    addButton: {
        width: '100%',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 13
    }
});