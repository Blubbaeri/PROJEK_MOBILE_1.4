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
    status?: string;        // Tambah ini
    categoryName?: string;  // Tambah ini  
    locationName?: string;  // Tambah ini
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
            console.log('🛑 Stopping polling...');
            clearInterval(pollingRef.current);
            pollingRef.current = null;
        }
    }, []);

    const startPolling = useCallback((id: number) => {
        console.log(`🔄 Starting polling for transaction ${id}`);

        // Stop polling sebelumnya jika ada
        stopPolling();

        // Mulai polling baru
        pollingRef.current = setInterval(async () => {
            try {
                console.log(`📡 Polling transaction ${id}...`);

                // ⭐ PAKAI ENDPOINT YANG SAMA DENGAN FETCH DATA
                const res = await api.get(`/api/Borrowing/DetailPeminjaman/${id}`);
                console.log('📡 Polling response:', {
                    status: res.status,
                    data: res.data ? 'received' : 'empty'
                });

                const borrowingData = res.data;

                if (!borrowingData) {
                    console.log('⚠️ Polling: No data received');
                    return;
                }

                // Process items
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

                console.log(`📊 Polling: Status ${currentStatus} → ${newStatus}`);

                // Cek jika status berubah
                if (currentStatus !== newStatus) {
                    console.log('🔄 Status changed! Updating transaction...');

                    setTransaction(prev => {
                        if (!prev) return prev;

                        return {
                            ...prev,
                            status: newStatus,
                            items: groupedItems,
                            // Update semua field dari response
                            qrCode: borrowingData.qrCode || prev.qrCode,
                            borrowedAt: borrowingData.borrowedAt || prev.borrowedAt,
                            returnedAt: borrowingData.returnedAt || prev.returnedAt,
                            isQrVerified: borrowingData.isQrVerified ?? prev.isQrVerified,
                            isFaceVerified: borrowingData.isFaceVerified ?? prev.isFaceVerified,
                            scheduledTime: borrowingData.scheduledTime || prev.scheduledTime,
                            maxReturnTime: borrowingData.maxReturnTime || prev.maxReturnTime
                        };
                    });

                    // Jika status bukan "Booked" lagi, stop polling
                    if (newStatus.toLowerCase() !== 'booked') {
                        console.log('🛑 Stopping polling - status is no longer "Booked"');
                        stopPolling();

                        // Notify user jika perlu
                        Alert.alert(
                            'Status Berubah',
                            `Status peminjaman berubah menjadi: ${newStatus}`,
                            [{ text: 'OK' }]
                        );
                    }
                } else {
                    console.log('✅ Status unchanged');
                }

            } catch (err: any) {
                console.error('❌ Polling error:', {
                    message: err.message,
                    status: err.response?.status,
                    url: err.config?.url
                });

                // Jika error 404 atau 401, stop polling
                if (err.response?.status === 404 || err.response?.status === 401) {
                    console.log('🛑 Stopping polling due to error');
                    stopPolling();
                }
            }
        }, 5000); // Poll setiap 5 detik

        console.log('✅ Polling started');
    }, [stopPolling]);

    // transaction-detail.tsx
    useEffect(() => {
        if (!transactionId) return;

        const fetchData = async () => {
            try {
                console.log(`Fetching transaction ID: ${transactionId}`);

                // ⭐ PAKAI ENDPOINT YANG BENAR
                const response = await api.get(`/api/Borrowing/DetailPeminjaman/${transactionId}`);
                console.log('API Response:', response.data);

                // PERHATIAN: Response langsung object, bukan {data: ...}
                const borrowingData = response.data;

                if (!borrowingData) {
                    Alert.alert('Error', 'Data transaksi tidak ditemukan');
                    setTransaction(null);
                    setLoading(false);
                    return;
                }

                // ⭐ ITEMS SUDAH ADA DI RESPONSE INI!
                const apiItems = borrowingData.items || [];
                console.log('Items dari API:', apiItems);

                // Transform items
                const groupedItems: TransactionItem[] = apiItems.map((item: any) => ({
                    equipmentName: item.equipmentName || 'Alat',
                    quantity: item.quantity || 1,
                    status: item.status,
                    categoryName: item.categoryName,
                    locationName: item.locationName
                }));

                // Buat transaction object
                const transactionData: Transaction = {
                    id: transactionId,
                    status: borrowingData.status as TransactionStatus,
                    qrCode: borrowingData.qrCode || '',
                    items: groupedItems, // ⭐ PAKAI INI
                    mhsId: borrowingData.mhsId,
                    userName: borrowingData.userName || '',
                    borrowedAt: borrowingData.borrowedAt,
                    returnedAt: borrowingData.returnedAt,
                    isQrVerified: borrowingData.isQrVerified,
                    isFaceVerified: borrowingData.isFaceVerified,
                    scheduledTime: borrowingData.scheduledTime,
                    maxReturnTime: borrowingData.maxReturnTime
                };

                console.log('Transaction data loaded:', transactionData);
                setTransaction(transactionData);

                if (transactionData.status === 'Booked') {
                    startPolling(transactionData.id);
                }

            } catch (err: any) {
                console.error('ERROR DETAIL:', {
                    message: err.message,
                    response: err.response?.data,
                    status: err.response?.status,
                    url: err.config?.url
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
            const res = await api.get(`/api/Borrowing/DetailPeminjaman/${transaction.id}`);
            console.log('🔄 Manual refresh response:', res.data);

            const data = res.data;
            if (data) {
                const apiItems = data.items || [];
                const groupedItems: TransactionItem[] = apiItems.map((item: any) => ({
                    equipmentName: item.equipmentName || 'Alat',
                    quantity: item.quantity || 1,
                    status: item.status,
                    categoryName: item.categoryName,
                    locationName: item.locationName
                }));

                setTransaction(prev => prev ? {
                    ...prev,
                    status: data.status,
                    items: groupedItems,
                    qrCode: data.qrCode || prev.qrCode,
                    borrowedAt: data.borrowedAt || prev.borrowedAt,
                    returnedAt: data.returnedAt || prev.returnedAt,
                    isQrVerified: data.isQrVerified ?? prev.isQrVerified,
                    isFaceVerified: data.isFaceVerified ?? prev.isFaceVerified,
                    scheduledTime: data.scheduledTime || prev.scheduledTime,
                    maxReturnTime: data.maxReturnTime || prev.maxReturnTime
                } : prev);

                Alert.alert(
                    'Status Diperbarui',
                    `Status: ${data.status}\nBarang: ${groupedItems.length} item`,
                    [{ text: 'OK' }]
                );
            }
        } catch (error: any) {
            console.error('Refresh error:', error.message);
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

    // Pengecekan untuk QR dan aktif status
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