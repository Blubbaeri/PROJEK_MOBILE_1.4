// components/bookingStatus.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function BookingStatus({ status }: { status: string }) {

    // ✅ NORMALIZED STATUS DI LEVEL COMPONENT
    const s = status?.toLowerCase() || '';

    const getStatusConfig = (statusLower: string) => {
        switch (statusLower) {
            case 'booked':
                return {
                    bgColor: '#FFF4E5',
                    textColor: '#FF9800',
                    displayText: 'BOOKED',
                    icon: '📋'
                };
            case 'diproses':
                return {
                    bgColor: '#E8F5E9',
                    textColor: '#4CAF50',
                    displayText: 'DIPROSES',
                    icon: '⏳'
                };
            case 'dipinjam':
                return {
                    bgColor: '#E3F2FD',
                    textColor: '#2196F3',
                    displayText: 'DIPINJAM',
                    icon: '✅'
                };
            case 'ditolak':
                return {
                    bgColor: '#FFEBEE',
                    textColor: '#F44336',
                    displayText: 'DITOLAK',
                    icon: '❌'
                };
            case 'dikembalikan':
                return {
                    bgColor: '#FFF8E1',
                    textColor: '#FFC107',
                    displayText: 'DIKEMBALIKAN',
                    icon: '↩️'
                };
            case 'selesai':
                return {
                    bgColor: '#F5F5F5',
                    textColor: '#757575',
                    displayText: 'SELESAI',
                    icon: '🏁'
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

    const statusConfig = getStatusConfig(s);

    return (
        <View style={styles.card}>
            <Text style={styles.label}>Status Peminjaman</Text>

            <View style={[styles.badge, { backgroundColor: statusConfig.bgColor }]}>
                <Text style={styles.icon}>{statusConfig.icon}</Text>
                <Text style={[styles.statusText, { color: statusConfig.textColor }]}>
                    {statusConfig.displayText}
                </Text>
            </View>

            <Text style={styles.description}>
                {s === 'booked' ? 'Menunggu scan QR di lab' :
                    s === 'diproses' ? 'Sedang diproses admin' :
                        s === 'dipinjam' ? 'Alat sudah bisa diambil' :
                            s === 'dikembalikan' ? 'Menunggu konfirmasi selesai' :
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