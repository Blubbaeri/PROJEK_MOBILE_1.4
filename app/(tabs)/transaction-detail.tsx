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
    status?: string;
    categoryName?: string;
    locationName?: string;
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

const getStatusConfig = (status: string) => {
    if (!status) {
        return {
            icon: 'question-circle',
            color: '#999',
            label: 'Unknown',
            description: 'Status tidak tersedia'
        };
    }

    const statusLower = status.toLowerCase().trim();
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
                const res = await api.get(`/api/Borrowing/DetailPeminjaman/${id}`);
                const borrowingData = res.data;
                if (!borrowingData) return;

                const apiItems = borrowingData.items || [];
                const groupedItems: TransactionItem[] = apiItems.map((item: any) => ({
                    equipmentName: item.equipmentName || 'Alat',
                    quantity: item.quantity || 1,
                    status: item.status,
                    categoryName: item.categoryName,
                    locationName: item.locationName
                }));

                const newStatus = borrowingData.status;
                const currentStatus = transactionRef.current?.status;

                if (currentStatus !== newStatus) {
                    setTransaction(prev => {
                        if (!prev) return prev;
                        return {
                            ...prev,
                            status: newStatus,
                            items: groupedItems,
                            qrCode: borrowingData.qrCode || prev.qrCode,
                        };
                    });

                    if (newStatus.toLowerCase() !== 'booked') {
                        stopPolling();
                        Alert.alert('Status Berubah', `Status peminjaman berubah menjadi: ${newStatus}`);
                    }
                }
            } catch (err: any) {
                if (err.response?.status === 404 || err.response?.status === 401) stopPolling();
            }
        }, 5000);
    }, [stopPolling]);

    useEffect(() => {
        if (!transactionId) return;
        const fetchData = async () => {
            try {
                const response = await api.get(`/api/Borrowing/DetailPeminjaman/${transactionId}`);
                const borrowingData = response.data;
                if (!borrowingData) {
                    setLoading(false);
                    return;
                }

                const apiItems = borrowingData.items || [];
                const groupedItems: TransactionItem[] = apiItems.map((item: any) => ({
                    equipmentName: item.equipmentName || 'Alat',
                    quantity: item.quantity || 1,
                    status: item.status,
                    categoryName: item.categoryName,
                    locationName: item.locationName
                }));

                const transactionData: Transaction = {
                    id: transactionId,
                    status: borrowingData.status as TransactionStatus,
                    qrCode: borrowingData.qrCode || '',
                    items: groupedItems,
                    mhsId: borrowingData.mhsId,
                    userName: borrowingData.userName || '',
                };

                setTransaction(transactionData);
                if (transactionData.status === 'Booked') startPolling(transactionData.id);
            } catch (err: any) {
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
            const res = await api.get(`/api/Borrowing/DetailPeminjaman/${transaction.id}`);
            const data = res.data;
            if (data) {
                const apiItems = data.items || [];
                const groupedItems: TransactionItem[] = apiItems.map((item: any) => ({
                    equipmentName: item.equipmentName || 'Alat',
                    quantity: item.quantity || 1,
                    status: item.status,
                }));

                setTransaction(prev => prev ? {
                    ...prev,
                    status: data.status,
                    items: groupedItems,
                } : prev);

                Alert.alert('Status Diperbarui', `Status: ${data.status}`);
            }
        } catch (error: any) {
            Alert.alert('Error', 'Gagal refresh status');
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#5B4DBC" />
                <Text style={{ marginTop: 10 }}>Memuat data...</Text>
            </View>
        );
    }

    if (!transaction) {
        return (
            <View style={styles.center}>
                <Ionicons name="alert-circle-outline" size={50} color="#FF5252" />
                <Text>Data Transaksi Tidak Ditemukan</Text>
                <TouchableOpacity onPress={handleBack} style={{ marginTop: 20 }}>
                    <Text style={{ color: '#5B4DBC', fontWeight: 'bold' }}>Kembali</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const currentStatus = getStatusConfig(transaction.status);
    const statusLower = transaction.status.toLowerCase();
    const canShowQr = ['booked', 'diproses', 'dipinjam', 'dikembalikan'].includes(statusLower);
    const isActive = statusLower === 'dipinjam';
    const items = transaction.items || [];

    const handleGoToQr = () => router.push({ pathname: '/booking-qr', params: { id: transactionId } });

    // LOGIC TOMBOL BARU: Mengarah ke return-item dengan mengirimkan ID Transaksi
    const handleReturnPress = () => {
        router.push({
            pathname: '/(tabs)/return-item' as any,
            params: { id: transactionId } // Kirim ID transaksi ke halaman pilih barang
        });
    };

    const goToTransaction = () => router.push('/(tabs)/transaction');

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