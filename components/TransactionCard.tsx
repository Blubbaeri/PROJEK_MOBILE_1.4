//components/transactionCard.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// --- TYPES (UBAH DISINI SAJA) ---
// Ganti dengan status Indonesia yang fix
export type TransactionStatus = 'Booked'|'Diproses' | 'Dipinjam' | 'Ditolak' | 'Dikembalikan' | 'Selesai';

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

    // --- UBAH DISINI: Mapping status Indonesia ---
    const statusStyles: any = {
        // Status untuk Tab "Peminjaman" (Borrowing)
        Diproses: { color: '#FFA000', backgroundColor: '#FFF8E1', label: 'Diproses' },
        Dipinjam: { color: '#2979FF', backgroundColor: '#E3F2FD', label: 'Dipinjam' },
        Booked: { color: '#FF9800', backgroundColor: '#FFF4E5', label: 'Booked' },

        // Status untuk Tab "Pengembalian" (Returned)
        Dikembalikan: { color: '#4CAF50', backgroundColor: '#E8F5E9', label: 'Dikembalikan' },
        Selesai: { color: '#4CAF50', backgroundColor: '#E8F5E9', label: 'Selesai' },
        Ditolak: { color: '#F44336', backgroundColor: '#FFEBEE', label: 'Ditolak' }
    };

    // Default ke 'Diproses' jika tidak ada status
    const safeStatus = transaction.status || 'Diproses';
    const currentStatusStyle = statusStyles[safeStatus] || statusStyles.Diproses;

    const displayDate = transaction.borrowedAt || new Date().toISOString();
    const formatDate = (dateString?: string | null) =>
        dateString ? new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric'
        }) : '-';

    // Menampilkan preview barang (maksimal 2 nama) - TIDAK DIUBAH
    const renderItems = (items: TransactionItem[]) => {
        if (!items || items.length === 0) return "Tidak ada detail barang";
        const preview = items.slice(0, 2).map(item => `${item.equipmentName} (${item.quantity})`).join(', ');
        return items.length > 2 ? `${preview}, +${items.length - 2} lagi` : preview;
    };

    // --- LOGIKA UTAMA: PINDAH KE DETAIL - TIDAK DIUBAH ---
    const handlePressCard = () => {
        router.push({
            pathname: '/transaction-detail',
            params: {
                id: transaction.id,
                status: safeStatus,
                qrCode: transaction.qrCode,
                items: JSON.stringify(transaction.items)
            }
        });
    };

    return (
        <TouchableOpacity style={styles.card} onPress={handlePressCard} activeOpacity={0.7}>
            {/* Header: Icon, ID, Status - TIDAK DIUBAH STRUKTUR */}
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

            {/* Footer: Tanggal & Label QR - TIDAK DIUBAH */}
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

// --- STYLES - TIDAK DIUBAH ---
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