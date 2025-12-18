// components/bookingStatus.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function BookingStatus({ status }: { status: string }) {
    // ⭐ UPDATE LOGIC STATUS BARU
    const getStatusConfig = (status: string) => {
        const statusLower = status?.toLowerCase() || '';

        switch (statusLower) {
            case 'booked':
                return {
                    bgColor: '#FFF4E5',  // Orange light
                    textColor: '#FF9800', // Orange
                    displayText: 'BOOKED',
                    icon: '📋' // atau pakai icon library
                };
            case 'diproses':
                return {
                    bgColor: '#E8F5E9',   // Green light  
                    textColor: '#4CAF50',  // Green
                    displayText: 'DIPROSES',
                    icon: '⏳'
                };
            case 'dipinjam':
                return {
                    bgColor: '#E3F2FD',   // Blue light
                    textColor: '#2196F3',  // Blue
                    displayText: 'DIPINJAM',
                    icon: '✅'
                };
            case 'ditolak':
                return {
                    bgColor: '#FFEBEE',   // Red light
                    textColor: '#F44336',  // Red
                    displayText: 'DITOLAK',
                    icon: '❌'
                };
            case 'selesai':
                return {
                    bgColor: '#F5F5F5',   // Gray light
                    textColor: '#757575',  // Gray
                    displayText: 'SELESAI',
                    icon: '🏁'
                };
            case 'dikembalikan':
                return {
                    bgColor: '#FFF8E1',   // Yellow light
                    textColor: '#FFC107',  // Yellow
                    displayText: 'DIKEMBALIKAN',
                    icon: '↩️'
                };
            default:
                return {
                    bgColor: '#F5F5F5',
                    textColor: '#757575',
                    displayText: status?.toUpperCase() || 'UNKNOWN',
                    icon: '❓'
                };
        }
    };

    const statusConfig = getStatusConfig(status);

    return (
        <View style={styles.card}>
            <Text style={styles.label}>Status Peminjaman</Text>
            <View style={[styles.badge, { backgroundColor: statusConfig.bgColor }]}>
                <Text style={styles.icon}>{statusConfig.icon}</Text>
                <Text style={[styles.statusText, { color: statusConfig.textColor }]}>
                    {statusConfig.displayText}
                </Text>
            </View>

            {/* ⭐ TAMBAH DESKRIPSI STATUS */}
            <Text style={styles.description}>
                {status === 'Booked' ? 'Menunggu scan QR di lab' :
                    status === 'Diproses' ? 'Sedang diproses admin' :
                        status === 'Dipinjam' ? 'Alat sudah bisa diambil' :
                            'Transaksi selesai'}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 3,
    },
    label: {
        fontSize: 14,
        color: '#888',
        marginBottom: 8,
        fontFamily: 'System'
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
        marginBottom: 10,
    },
    icon: {
        fontSize: 20,
        marginRight: 8,
    },
    statusText: {
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: 1,
        fontFamily: 'System'
    },
    description: {
        fontSize: 13,
        color: '#666',
        textAlign: 'center',
        marginTop: 5,
        fontFamily: 'System'
    },
});