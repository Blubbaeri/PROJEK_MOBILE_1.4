//app/(tabs)/transaction-detail.tsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Alert,
    ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import TransactionDetailSkeleton from '../../components/skeletons/TransactionDetailSkeleton';
import { TransactionStatus } from '../../components/TransactionCard';
import { api } from '../../lib/api';

interface TransactionItem {
    equipmentName: string;
    quantity: number;
}

interface Transaction {
    id: number;
    qrCode?: string;
    status: TransactionStatus;
    items: TransactionItem[];
    [key: string]: any;
}

const statusConfig: Record<TransactionStatus, { icon: string; color: string; label: string; description: string }> = {
    Booked: { icon: 'calendar-check', color: '#FF9800', label: 'Booked', description: 'Peminjaman telah dibooking' },
    Diproses: { icon: 'clock', color: '#FFA000', label: 'Diproses', description: 'Peminjaman sedang diproses' },
    Dipinjam: { icon: 'running', color: '#2979FF', label: 'Dipinjam', description: 'Alat sedang dipinjam' },
    Ditolak: { icon: 'times-circle', color: '#F44336', label: 'Ditolak', description: 'Peminjaman ditolak' },
    Dikembalikan: { icon: 'undo-alt', color: '#4CAF50', label: 'Dikembalikan', description: 'Alat sudah dikembalikan' },
    Selesai: { icon: 'check-circle', color: '#757575', label: 'Selesai', description: 'Transaksi telah selesai' }
};

// Fungsi untuk mendapatkan status config dengan handling yang lebih baik
const getStatusConfig = (status: string) => {

    if (!status) {
        return {
            icon: 'question-circle',
            color: '#999',
            label: 'Unknown',
            description: 'Status tidak tersedia'
        };
    }

    // Cek secara eksplisit semua kemungkinan
    const statusLower = status.toLowerCase().trim();

    // Mapping status dengan case insensitive
    const statusMap: Record<string, TransactionStatus> = {
        'booked': 'Booked',
        'diproses': 'Diproses',
        'dipinjam': 'Dipinjam',
        'ditolak': 'Ditolak',
        'dikembalikan': 'Dikembalikan',
        'selesai': 'Selesai'
    };

    const normalizedStatus = statusMap[statusLower];

    if (normalizedStatus && normalizedStatus in statusConfig) {
        return statusConfig[normalizedStatus];
    }

    return {
        icon: 'question-circle',
        color: '#999',
        label: status || 'Unknown',
        description: `Status: ${status}`
    };
};

export default function TransactionDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const transactionId = Number(id);

    const [transaction, setTransaction] = useState<Transaction | null>(null);
    const [loading, setLoading] = useState(true);
    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const transactionRef = useRef<Transaction | null>(null);

    useEffect(() => {
        transactionRef.current = transaction;
    }, [transaction]);

    const stopPolling = useCallback(() => {
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
        }
    }, []);

    const startPolling = useCallback((id: number) => {
        stopPolling();

        pollingRef.current = setInterval(async () => {
            try {
                // ⭐ PAKAI ENDPOINT YANG SAMA DENGAN FETCH DATA
                const res = await api.get(`/api/borrowing/${id}`);
                const borrowingData = res.data?.data;

                if (!borrowingData) return;

                const apiItems = borrowingData.items || [];
                const groupedItems: TransactionItem[] = apiItems.map((item: any) => ({
                    equipmentName: item.equipmentName || item.EquipmentName || 'Alat',
                    quantity: item.quantity || 1
                }));

                const newStatus = borrowingData.status;

                if (transactionRef.current?.status !== newStatus) {
                    setTransaction(prev => prev ? {
                        ...prev,
                        status: newStatus,
                        items: groupedItems
                    } : prev);

                    if (newStatus !== 'Booked') {
                        stopPolling();
                    }
                }
            } catch (err) {
                console.log('Polling error:', err);
            }
        }, 2000);
    }, [stopPolling]);

    // transaction-detail.tsx
    useEffect(() => {
        if (!transactionId) return;

        const fetchData = async () => {
            try {
                console.log(`🔍 Fetching transaction ID: ${transactionId}`);

                // ⭐ PAKAI ENDPOINT YANG BENAR: /api/borrowing/{id}
                const response = await api.get(`/api/borrowing/${transactionId}`);
                console.log('📦 API Response:', response.data);

                const borrowingData = response.data?.data;

                if (!borrowingData) {
                    Alert.alert('Error', 'Data transaksi tidak ditemukan');
                    setTransaction(null);
                    setLoading(false);
                    return;
                }

                // ⭐ ITEMS SUDAH ADA DI RESPONSE INI!
                const apiItems = borrowingData.items || [];
                console.log('📋 Items dari API:', apiItems);

                // Transform items
                const groupedItems: TransactionItem[] = apiItems.map((item: any) => ({
                    equipmentName: item.equipmentName || item.EquipmentName || 'Alat',
                    quantity: item.quantity || 1
                }));

                // Buat transaction object
                const transactionData: Transaction = {
                    id: transactionId,
                    status: borrowingData.status as TransactionStatus,
                    qrCode: borrowingData.qrCode || '',
                    items: groupedItems,
                    mhsId: borrowingData.mhsId,
                    borrowedAt: borrowingData.borrowedAt,
                    returnedAt: borrowingData.returnedAt,
                    isQrVerified: borrowingData.isQrVerified,
                    isFaceVerified: borrowingData.isFaceVerified
                };

                console.log('✅ Data berhasil di-load:', transactionData);
                setTransaction(transactionData);

                if (transactionData.status === 'Booked') {
                    startPolling(transactionData.id);
                }

            } catch (err: any) {
                console.error('❌ ERROR DETAIL:', {
                    message: err.message,
                    response: err.response?.data,
                    status: err.response?.status
                });

                Alert.alert('Error', 'Gagal mengambil data transaksi');
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        return () => stopPolling();
    }, [transactionId, startPolling, stopPolling]);

    const handleBack = () => {
        stopPolling();
        router.back();
    };

    const refreshStatus = async () => {
        if (!transaction) return;
        try {
            const res = await api.get(`api/borrowing-detail/borrowing/${transaction.id}`);
            const data: Transaction = res.data?.data;
            if (data) {
                setTransaction(data);
                Alert.alert('Status Diperbarui', `Status: ${data.status}`);
            }
        } catch {
            Alert.alert('Error', 'Gagal refresh status');
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <Text>Memuat data transaksi...</Text>
                <ActivityIndicator size="large" color="#5B4DBC" />
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={{ marginTop: 20 }}
                >
                    <Text style={{ color: '#5B4DBC' }}>Kembali</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (!transaction) {
        return (
            <View style={styles.center}>
                <Ionicons name="alert-circle-outline" size={50} color="#FF5252" />
                <Text style={{ marginTop: 10 }}>Data Transaksi Tidak Ditemukan</Text>
                <TouchableOpacity onPress={handleBack} style={{ marginTop: 20 }}>
                    <Text style={{ color: '#5B4DBC', fontWeight: 'bold' }}>Kembali</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Dapatkan status config dengan fallback
    const currentStatus = getStatusConfig(transaction.status);

    // Pengecekan untuk QR dan aktif status (case insensitive)
    const statusLower = transaction.status.toLowerCase();
    const canShowQr = ['booked', 'diproses', 'dipinjam','dikembalikan',].includes(statusLower);
    const isActive = statusLower === 'dipinjam';
    const items = transaction.items || [];

    const handleGoToQr = () => router.push({ pathname: '/booking-qr', params: { id: transactionId } });
    const handleReturnPress = () => router.push({ pathname: '/(tabs)/booking-qr' as any, params: { id: transactionId } });
    const goToTransaction = () => {
        router.push('/(tabs)/transaction');
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#5B4DBC" />

            <View style={styles.header}>
                <TouchableOpacity onPress={goToTransaction}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Detail Transaksi</Text>
                <TouchableOpacity onPress={refreshStatus}>
                    <Ionicons name="refresh" size={24} color="white" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }}>
                <View style={styles.card}>
                    <Text style={styles.label}>Transaction ID</Text>
                    <Text style={styles.value}>TXN-{transactionId}</Text>
                    <View style={styles.divider} />

                    <Text style={styles.label}>Status</Text>
                    <View style={styles.statusRow}>
                        <FontAwesome5 name={currentStatus.icon} size={16} color={currentStatus.color} />
                        <Text style={[styles.statusText, { color: currentStatus.color }]}>{currentStatus.label}</Text>
                    </View>
                    <Text style={styles.statusDescription}>{currentStatus.description}</Text>
                </View>

                <Text style={styles.sectionTitle}>Daftar Barang</Text>
                {items.length > 0 ? items.map((item, idx) => (
                    <View key={idx} style={styles.itemCard}>
                        <FontAwesome5 name="box" size={20} color="#5B4DBC" style={{ marginRight: 15 }} />
                        <View>
                            <Text style={styles.itemName}>{item.equipmentName}</Text>
                            <Text style={styles.itemQty}>Jumlah: {item.quantity}</Text>
                        </View>
                    </View>
                )) : <Text style={{ color: '#999' }}>Tidak ada detail barang.</Text>}
            </ScrollView>

            <View style={styles.footer}>
                {canShowQr && (
                    <TouchableOpacity style={[styles.btnOutline, { marginBottom: 10 }]} onPress={handleGoToQr}>
                        <Text style={{ color: '#5B4DBC', fontWeight: 'bold' }}>Tampilkan QR Booking</Text>
                    </TouchableOpacity>
                )}
                {isActive && (
                    <TouchableOpacity style={styles.btnPrimary} onPress={handleReturnPress}>
                        <Text style={{ color: 'white', fontWeight: 'bold' }}>Lanjut Pengembalian</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F7' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20,
        backgroundColor: '#5B4DBC', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
    },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: 'white' },
    card: { backgroundColor: 'white', padding: 20, borderRadius: 12, marginBottom: 20 },
    label: { color: '#888', fontSize: 12 },
    value: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    divider: { height: 1, backgroundColor: '#eee', marginVertical: 10 },
    statusRow: { flexDirection: 'row', alignItems: 'center' },
    statusText: { fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
    statusDescription: { fontSize: 13, color: '#666', marginTop: 5, fontStyle: 'italic' },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#333' },
    itemCard: { backgroundColor: 'white', flexDirection: 'row', padding: 15, borderRadius: 12, marginBottom: 10, alignItems: 'center' },
    itemName: { fontSize: 14, fontWeight: 'bold' },
    itemQty: { fontSize: 12, color: '#666' },
    footer: { padding: 20, backgroundColor: 'white', borderTopWidth: 1, borderColor: '#eee' },
    btnOutline: { paddingVertical: 15, borderRadius: 8, borderWidth: 1, borderColor: '#5B4DBC', alignItems: 'center' },
    btnPrimary: { paddingVertical: 15, borderRadius: 10, backgroundColor: '#5B4DBC', width: '100%', alignItems: 'center' }
});