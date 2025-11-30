import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// --- TYPES (Diexport agar bisa dipakai di file lain) ---
export type TransactionStatus = 'pending' | 'BOOKING' | 'SEDANG_DIPINJAM' | 'SELESAI' | 'DITOLAK' | 'DIBATALKAN';

export type TransactionItem = {
    equipmentName: string;
    quantity: number;
    condition: string;
};

export type Transaction = {
    id: number;
    status: TransactionStatus;
    qrCode: string;
    borrowedAt?: string | null;
    returnedAt?: string | null;
    userName: string;
    items: TransactionItem[];
};

const TransactionCard = ({ transaction }: { transaction: Transaction }) => {
    const router = useRouter();

    const statusStyles: any = {
        pending: { color: '#FFA000', backgroundColor: '#FFF8E1', label: 'Pending' },
        BOOKING: { color: '#FFA000', backgroundColor: '#FFF8E1', label: 'Booked' },
        SEDANG_DIPINJAM: { color: '#2979FF', backgroundColor: '#E3F2FD', label: 'Active' },
        SELESAI: { color: '#4CAF50', backgroundColor: '#E8F5E9', label: 'Returned' },
        DITOLAK: { color: '#F44336', backgroundColor: '#FFEBEE', label: 'Rejected' },
        DIBATALKAN: { color: '#9E9E9E', backgroundColor: '#F5F5F5', label: 'Cancelled' }
    };

    const safeStatus = transaction.status || 'DIBATALKAN';
    const currentStatusStyle = statusStyles[safeStatus] || statusStyles.DIBATALKAN;

    const displayDate = transaction.borrowedAt || new Date().toISOString();
    const formatDate = (dateString?: string | null) =>
        dateString ? new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric'
        }) : '-';

    const renderItems = (items: TransactionItem[]) => {
        if (!items || items.length === 0) return "No items details";
        return items.map(item => `${item.equipmentName} (${item.quantity})`).join(', ');
    };

    const handleShowQR = () => {
        router.push({
            pathname: '/(tabs)/booking-qr',
            params: { txnId: `TXN-${transaction.id}`, qrCode: transaction.qrCode }
        });
    };

    const showQRButton = ['pending', 'BOOKING'].includes(safeStatus);

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                    <FontAwesome name="exchange" size={18} color="#5B4DBC" />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.txnCode}>TXN-{String(transaction.id).padStart(4, '0')}</Text>
                    <Text style={styles.itemsText} numberOfLines={1}>{renderItems(transaction.items)}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: currentStatusStyle.backgroundColor }]}>
                    <Text style={[styles.statusText, { color: currentStatusStyle.color }]}>
                        {currentStatusStyle.label}
                    </Text>
                </View>
            </View>

            <View style={styles.cardFooter}>
                <View style={styles.dateContainer}>
                    <FontAwesome name="calendar" size={12} color="#888" style={{ marginRight: 5 }} />
                    <Text style={styles.timestamp}>{formatDate(displayDate)}</Text>
                </View>

                {showQRButton ? (
                    <TouchableOpacity style={styles.smallBtn} onPress={handleShowQR}>
                        <Text style={styles.smallBtnText}>Show QR</Text>
                    </TouchableOpacity>
                ) : (
                    <Text style={styles.qrText}>{transaction.qrCode || '-'}</Text>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 12,
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    iconContainer: {
        width: 36, height: 36, backgroundColor: '#F3F0FF', borderRadius: 10, justifyContent: 'center', alignItems: 'center'
    },
    txnCode: { fontSize: 14, fontWeight: 'bold', color: '#333' },
    itemsText: { fontSize: 12, color: '#666', marginTop: 2 },
    statusBadge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6 },
    statusText: { fontSize: 10, fontWeight: 'bold' },
    cardFooter: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        borderTopWidth: 1, borderTopColor: '#F7F7F7', paddingTop: 10
    },
    dateContainer: { flexDirection: 'row', alignItems: 'center' },
    timestamp: { fontSize: 12, color: '#999' },
    smallBtn: { backgroundColor: '#5B4DBC', paddingVertical: 5, paddingHorizontal: 12, borderRadius: 6 },
    smallBtnText: { color: 'white', fontSize: 11, fontWeight: 'bold' },
    qrText: { fontSize: 11, color: '#aaa', fontFamily: 'monospace' }
});

export default TransactionCard;