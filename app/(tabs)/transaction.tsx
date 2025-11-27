// file: app/(tabs)/transaction.tsx

import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, ActivityIndicator,
    RefreshControl, StatusBar, TouchableOpacity, Alert
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import { useFocusEffect, useRouter } from 'expo-router';

// --- CONFIG ---
const IP_ADDRESS = "192.168.1.11"; // IP Laptop kamu
const PORT = "5234";
const API_URL = `http://${IP_ADDRESS}:${PORT}/api/borrowing/user/1`;

// --- TYPES (Sesuai JSON kamu) ---
type TransactionStatus = 'pending' | 'BOOKING' | 'SEDANG_DIPINJAM' | 'SELESAI' | 'DITOLAK' | 'DIBATALKAN';

type TransactionItem = {
    equipmentName: string;
    quantity: number;
    condition: string;
};

type Transaction = {
    id: number;
    status: TransactionStatus;
    qrCode: string;
    borrowedAt?: string | null;
    returnedAt?: string | null;
    userName: string;
    items: TransactionItem[];
};

// --- COMPONENT CARD ---
const TransactionCard = ({ transaction }: { transaction: Transaction }) => {
    const router = useRouter();

    // Mapping Warna Status (Sesuai data JSON kamu)
    const statusStyles: any = {
        pending: { color: '#FFA000', backgroundColor: '#FFF8E1' }, // Kuning (Sama kayak Booking)
        BOOKING: { color: '#FFA000', backgroundColor: '#FFF8E1' },
        SEDANG_DIPINJAM: { color: '#2979FF', backgroundColor: '#E3F2FD' }, // Biru
        SELESAI: { color: '#4CAF50', backgroundColor: '#E8F5E9' },
        DITOLAK: { color: '#F44336', backgroundColor: '#FFEBEE' },
        DIBATALKAN: { color: '#9E9E9E', backgroundColor: '#F5F5F5' }
    };

    const safeStatus = transaction.status || 'DIBATALKAN';
    const currentStatusStyle = statusStyles[safeStatus] || statusStyles.DIBATALKAN;

    // Format Tanggal
    const displayDate = transaction.borrowedAt || new Date().toISOString();
    const formatDate = (dateString?: string | null) =>
        dateString ? new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        }) : '-';

    // Handle Items (Karena di JSON items kamu kosong [])
    const renderItems = (items: TransactionItem[]) => {
        if (!items || items.length === 0) return "No items details available";
        return items.map(item => `• ${item.equipmentName} (${item.quantity})`).join('\n');
    };

    const handleShowQR = () => {
        router.push({
            pathname: '/(tabs)/booking-qr',
            params: { txnId: `TXN-${transaction.id}`, qrCode: transaction.qrCode }
        });
    };

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.txnCode}>TXN-{String(transaction.id).padStart(4, '0')}</Text>
                    <Text style={styles.timestamp}>{formatDate(displayDate)}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: currentStatusStyle.backgroundColor }]}>
                    <Text style={[styles.statusText, { color: currentStatusStyle.color }]}>
                        {safeStatus.toUpperCase().replace('_', ' ')}
                    </Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.section}>
                <Text style={styles.label}>Items:</Text>
                {/* Style text agak miring kalau kosong */}
                <Text style={[styles.itemsText, transaction.items.length === 0 && { fontStyle: 'italic', color: '#aaa' }]}>
                    {renderItems(transaction.items)}
                </Text>
            </View>

            <View style={styles.footerContainer}>
                {/* Tampilkan tombol QR jika status pending */}
                {(safeStatus === 'pending' || safeStatus === 'BOOKING') ? (
                    <TouchableOpacity style={styles.actionButton} onPress={handleShowQR}>
                        <FontAwesome name="qrcode" size={16} color="white" style={{ marginRight: 8 }} />
                        <Text style={styles.actionButtonText}>Show QR Code</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.qrInfoOnly}>
                        <FontAwesome name="qrcode" size={14} color="#888" style={{ marginRight: 5 }} />
                        <Text style={styles.qrText}>{transaction.qrCode || 'No QR'}</Text>
                    </View>
                )}
            </View>
        </View>
    );
};

// --- MAIN SCREEN ---
const TransactionsScreen = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const fetchTransactions = async () => {
        setErrorMsg(null);
        try {
            console.log(`Connecting to: ${API_URL}`);

            // Timeout 15 detik biar aman
            const response = await axios.get(API_URL, { timeout: 15000 });

            // ⚠️ KUNCI SUKSES: Ambil data dari response.data.data
            // Karena JSON kamu: { "message": "...", "data": [...] }
            const apiResponse = response.data;

            if (apiResponse && Array.isArray(apiResponse.data)) {
                console.log("Data loaded:", apiResponse.data.length, "items");
                setTransactions(apiResponse.data);
            } else {
                console.log("Format data tidak sesuai, set empty.");
                setTransactions([]);
            }

        } catch (error: any) {
            console.log("Error Fetching:", error.message);

            if (error.code === 'ECONNABORTED') {
                setErrorMsg("Koneksi Timeout. Server lambat merespon.");
            } else if (error.code === 'ERR_NETWORK') {
                setErrorMsg(`Gagal Terhubung ke ${IP_ADDRESS}. Cek Wifi.`);
            } else {
                setErrorMsg("Terjadi kesalahan saat mengambil data.");
            }
            setTransactions([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            fetchTransactions();
        }, [])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchTransactions();
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#5B4DBC" />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Transactions</Text>
                <FontAwesome name="list-alt" size={24} color="rgba(255,255,255,0.8)" />
            </View>
            <View style={styles.whiteSheet}>
                {loading ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color="#5B4DBC" />
                        <Text style={{ marginTop: 10, color: '#888' }}>Sedang mengambil data...</Text>
                    </View>
                ) : errorMsg ? (
                    <View style={styles.centerContainer}>
                        <FontAwesome name="exclamation-circle" size={40} color="#FF5252" />
                        <Text style={{ marginTop: 10, color: '#666', textAlign: 'center', marginHorizontal: 20 }}>{errorMsg}</Text>
                        <TouchableOpacity onPress={fetchTransactions} style={{ marginTop: 20, backgroundColor: '#5B4DBC', padding: 10, borderRadius: 8 }}>
                            <Text style={{ color: 'white' }}>Coba Lagi</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <FlatList
                        data={transactions}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => <TransactionCard transaction={item} />}
                        contentContainerStyle={{ padding: 20, paddingBottom: 50 }}
                        ListEmptyComponent={
                            <View style={styles.centerContainer}>
                                <FontAwesome name="inbox" size={50} color="#ccc" />
                                <Text style={styles.emptyText}>Tidak ada transaksi.</Text>
                            </View>
                        }
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#5B4DBC']} />
                        }
                    />
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#5B4DBC' },
    header: { height: 120, paddingHorizontal: 20, paddingTop: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerTitle: { fontSize: 26, fontWeight: 'bold', color: 'white' },
    whiteSheet: { flex: 1, backgroundColor: '#F5F5F7', borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: 'hidden' },
    card: { backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 3 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
    txnCode: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    timestamp: { fontSize: 12, color: '#888', marginTop: 2 },
    statusBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8 },
    statusText: { fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' },
    divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 10 },
    section: { marginBottom: 10 },
    label: { fontSize: 12, color: '#888', marginBottom: 4 },
    itemsText: { fontSize: 14, color: '#333', lineHeight: 20 },
    footerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F5F5F5' },
    actionButton: { backgroundColor: '#5B4DBC', flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, elevation: 2 },
    actionButtonText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
    qrInfoOnly: { flexDirection: 'row', alignItems: 'center' },
    qrText: { fontSize: 12, fontWeight: 'bold', color: '#888', fontFamily: 'monospace' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
    emptyText: { marginTop: 10, color: '#999', fontSize: 16 },
});

export default TransactionsScreen;