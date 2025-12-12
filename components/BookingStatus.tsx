import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function BookingStatus({ status }: { status: string }) {
    const isApproved = status === 'approved';

    return (
        <View style={styles.card}>
            <Text style={styles.label}>Status Peminjaman</Text>
            <View style={[styles.badge, isApproved ? styles.bgGreen : styles.bgOrange]}>
                <Text style={[styles.statusText, isApproved ? styles.textGreen : styles.textOrange]}>
                    {status ? status.toUpperCase() : 'UNKNOWN'}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        borderRadius: 16, // Sudut membulat
        padding: 20,
        alignItems: 'center',
        marginBottom: 16,
        // Efek Shadow biar timbul
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 3,
    },
    label: { fontSize: 14, color: '#888', marginBottom: 8 },
    badge: {
        paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20,
    },
    statusText: { fontSize: 18, fontWeight: '800', letterSpacing: 1 },

    // Warna Status
    bgOrange: { backgroundColor: '#FFF4E5' },
    textOrange: { color: '#FF9800' },
    bgGreen: { backgroundColor: '#E8F5E9' },
    textGreen: { color: '#4CAF50' },
});