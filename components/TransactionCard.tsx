import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// --- TYPES ---
export type TransactionStatus = 'pending' | 'BOOKING' | 'SEDANG_DIPINJAM' | 'dipinjam' | 'SELESAI' | 'DITOLAK' | 'DIBATALKAN';

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

    // Pemetaan Style Status (Mendukung huruf kecil 'dipinjam')
    const getStatusStyle = (status: string) => {
        const s = status ? status.toLowerCase() : '';

        if (s === 'pending' || s === 'booking')
            return { color: '#FFA000', backgroundColor: '#FFF8E1', label: 'Booked' };

        if (s === 'sedang_dipinjam' || s === 'dipinjam' || s === 'active')
            return { color: '#2979FF', backgroundColor: '#E3F2FD', label: 'Active' };

        if (s === 'selesai' || s === 'returned')
            return { color: '#4CAF50', backgroundColor: '#E8F5E9', label: 'Returned' };

        if (s === 'ditolak' || s === 'rejected')
            return { color: '#F44336', backgroundColor: '#FFEBEE', label: 'Rejected' };

        return { color: '#9E9E9E', backgroundColor: '#F5F5F5', label: 'Cancelled' };
    };

    const currentStatusStyle = getStatusStyle(transaction.status);

    const displayDate = transaction.borrowedAt || new Date().toISOString();

    const formatDate = (dateString?: string | null) =>
        dateString ? new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric'
        }) : '-';

    // Menampilkan preview barang (maksimal 2 nama)
    const renderItemsPreview = (items: TransactionItem[]) => {
        if (!items || items.length === 0) return "No items details";
        // Cek apakah data barang ada di properti equipmentName atau name
        const preview = items.slice(0, 2).map(item =>
            `${item.equipmentName || 'Barat'} (${item.quantity})`
        ).join(', ');
        return items.length > 2 ? `${preview}, +${items.length - 2} more` : preview;
    };

    // --- LOGIKA PINDAH KE DETAIL ---
    const handlePressCard = () => {
        router.push({
            pathname: '/transaction-detail',
            params: {
                id: transaction.id,
                status: transaction.status, // Kirim status asli (misal: "dipinjam")
                qrCode: transaction.qrCode,
                // Kirim data item sebagai string JSON agar bisa diparsing di Detail
                items: JSON.stringify(transaction.items || [])
            }
        });
    };

    return (
        <TouchableOpacity style={styles.card} onPress={handlePressCard} activeOpacity={0.7}>
            {/* Header: Icon, ID, Status */}
            <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                    <FontAwesome name="exchange" size={18} color="#5B4DBC" />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.txnCode}>TXN-{String(transaction.id).padStart(4, '0')}</Text>
                    <Text style={styles.itemsText} numberOfLines={1}>
                        {renderItemsPreview(transaction.items)}
                    </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: currentStatusStyle.backgroundColor }]}>
                    <Text style={[styles.statusText, { color: currentStatusStyle.color }]}>
                        {currentStatusStyle.label}
                    </Text>
                </View>
            </View>

            {/* Footer: Tanggal & Label QR */}
            <View style={styles.cardFooter}>
                <View style={styles.dateContainer}>
                    <FontAwesome name="calendar" size={12} color="#888" style={{ marginRight: 5 }} />
                    <Text style={styles.timestamp}>{formatDate(displayDate)}</Text>
                </View>
                <Text style={styles.qrText}>{transaction.qrCode || '-'}</Text>
            </View>
        </TouchableOpacity>
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
    itemsText: { fontSize: 12, color: '#666', marginTop: 2, maxWidth: 180 },
    statusBadge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6 },
    statusText: { fontSize: 10, fontWeight: 'bold' },
    cardFooter: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        borderTopWidth: 1, borderTopColor: '#F7F7F7', paddingTop: 10
    },
    dateContainer: { flexDirection: 'row', alignItems: 'center' },
    timestamp: { fontSize: 12, color: '#999' },
    qrText: { fontSize: 11, color: '#aaa', fontFamily: 'monospace' }
});

export default TransactionCard;