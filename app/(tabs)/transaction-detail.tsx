import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Alert,
    ActivityIndicator,
    Platform,
    SafeAreaView
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { TransactionStatus } from '../../components/TransactionCard';
import { api } from '../../lib/api';

/* --- TYPES --- */
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
    mhsId?: number;
    userName?: string;
    [key: string]: any;
}

/* --- CONFIGURATION --- */
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
        return { icon: 'question-circle', color: '#999', label: 'Unknown', description: 'Status tidak tersedia' };
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

    return { icon: 'question-circle', color: '#999', label: status || 'Unknown', description: `Status: ${status}` };
};

/* --- SCREEN --- */
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

    const fetchData = useCallback(async () => {
        if (!transactionId) return;
        try {
            setLoading(true);
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

            if (transactionData.status === 'Booked') {
                startPolling(transactionData.id);
            }
        } catch (err: any) {
            console.error(err);
            Alert.alert('Error', 'Gagal mengambil data transaksi');
        } finally {
            setLoading(false);
        }
    }, [transactionId, startPolling]);

    useEffect(() => {
        fetchData();
        return () => stopPolling();
    }, [fetchData, stopPolling]);

    const handleBack = () => {
        stopPolling();
        router.back();
    };

    const handleRefresh = () => fetchData();

    const handleGoToQr = () => {
        router.push({
            pathname: '/(tabs)/pages-qr' as any,
            params: { id: transactionId }
        });
    };

    const handleReturnPress = () => {
        router.push({
            pathname: '/(tabs)/return-item' as any,
            params: { borrowingId: transactionId }
        });
    };

    const goToTransactionList = () => {
        stopPolling();
        router.push('/(tabs)/transaction');
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#5B4DBC" />
                <Text style={{ marginTop: 10 }}>Memuat data detail...</Text>
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

    const currentStatusConfig = getStatusConfig(transaction.status);
    const statusLower = transaction.status.toLowerCase();

    const canShowQr = ['booked', 'diproses', 'dikembalikan'].includes(statusLower);
    const isDipinjam = statusLower === 'dipinjam';

    const items = transaction.items || [];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#5B4DBC" />

            {/* --- HEADER UPDATE (DIBIKIN SAMAAN) --- */}
            <View style={styles.header}>
                <SafeAreaView>
                    <View style={styles.headerContent}>
                        <TouchableOpacity onPress={goToTransactionList} style={styles.headerBtnBox}>
                            <Ionicons name="arrow-back" size={24} color="white" />
                        </TouchableOpacity>

                        <Text style={styles.headerTitle}>Detail Transaksi</Text>

                        <TouchableOpacity onPress={handleRefresh} style={styles.headerBtnBox}>
                            <Ionicons name="refresh" size={22} color="white" />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }}>
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View>
                            <Text style={styles.label}>Transaction ID</Text>
                            <Text style={styles.value}>TXN-{transactionId}</Text>
                        </View>
                        <FontAwesome5 name="receipt" size={24} color="#E0E0E0" />
                    </View>

                    <View style={styles.divider} />

                    <Text style={styles.label}>Status Peminjaman</Text>
                    <View style={styles.statusRow}>
                        <FontAwesome5 name={currentStatusConfig.icon} size={18} color={currentStatusConfig.color} />
                        <Text style={[styles.statusText, { color: currentStatusConfig.color }]}>
                            {currentStatusConfig.label}
                        </Text>
                    </View>
                    <Text style={styles.statusDescription}>{currentStatusConfig.description}</Text>
                </View>

                <Text style={styles.sectionTitle}>Daftar Barang</Text>
                {items.length > 0 ? items.map((item, idx) => (
                    <View key={idx} style={styles.itemCard}>
                        <View style={styles.itemIconBox}>
                            <FontAwesome5 name="box" size={18} color="#5B4DBC" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.itemName}>{item.equipmentName}</Text>
                            <View style={styles.itemBadgeRow}>
                                <View style={styles.qtyBadge}>
                                    <Text style={styles.qtyText}>Jumlah: {item.quantity}</Text>
                                </View>
                                {item.status && (
                                    <Text style={styles.itemStatusLine}> � {item.status}</Text>
                                )}
                            </View>
                        </View>
                    </View>
                )) : (
                    <View style={styles.emptyBox}>
                        <Text style={{ color: '#999' }}>Tidak ada detail barang.</Text>
                    </View>
                )}
            </ScrollView>

            <View style={styles.footer}>
                {canShowQr && (
                    <TouchableOpacity
                        style={[styles.btnOutline, isDipinjam && { marginBottom: 12 }]}
                        onPress={handleGoToQr}
                    >
                        <Ionicons name="qr-code-outline" size={20} color="#5B4DBC" style={{ marginRight: 8 }} />
                        <Text style={styles.btnOutlineText}>Tampilkan QR E-Ticket</Text>
                    </TouchableOpacity>
                )}

                {isDipinjam && (
                    <TouchableOpacity style={styles.btnPrimary} onPress={handleReturnPress}>
                        <FontAwesome5 name="undo-alt" size={18} color="white" style={{ marginRight: 10 }} />
                        <Text style={styles.btnPrimaryText}>Lanjut Pengembalian</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F7' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    // --- STYLES HEADER (DIBIKIN IDENTIK) ---
    header: {
        backgroundColor: '#5B4DBC',
        paddingBottom: 20,
        paddingTop: Platform.OS === 'android' ? 40 : 10,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        width: '100%'
    },
    headerBtnBox: {
        backgroundColor: 'rgba(255, 255, 255, 0.18)',
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    // --- END HEADER STYLES ---
    card: { backgroundColor: 'white', padding: 20, borderRadius: 15, marginBottom: 25, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    label: { color: '#888', fontSize: 12, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
    value: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 15 },
    statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
    statusText: { fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
    statusDescription: { fontSize: 13, color: '#666', marginTop: 6, fontStyle: 'italic' },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15, color: '#333', marginLeft: 5 },
    itemCard: { backgroundColor: 'white', flexDirection: 'row', padding: 16, borderRadius: 12, marginBottom: 12, alignItems: 'center', elevation: 1 },
    itemIconBox: { width: 40, height: 40, backgroundColor: '#F0EFFF', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    itemName: { fontSize: 15, fontWeight: 'bold', color: '#333' },
    itemBadgeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    qtyBadge: { backgroundColor: '#F5F5F5', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
    qtyText: { fontSize: 11, color: '#5B4DBC', fontWeight: '700' },
    itemStatusLine: { fontSize: 12, color: '#888' },
    emptyBox: { padding: 20, alignItems: 'center' },
    footer: { padding: 20, backgroundColor: 'white', borderTopWidth: 1, borderColor: '#EEE', paddingBottom: Platform.OS === 'ios' ? 30 : 20 },
    btnOutline: {
        flexDirection: 'row',
        paddingVertical: 15,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#5B4DBC',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(91, 77, 188, 0.05)'
    },
    btnOutlineText: { color: '#5B4DBC', fontWeight: 'bold', fontSize: 15 },
    btnPrimary: {
        flexDirection: 'row',
        paddingVertical: 16,
        borderRadius: 12,
        backgroundColor: '#5B4DBC',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
        shadowColor: '#5B4DBC',
        shadowOpacity: 0.3,
        shadowRadius: 5
    },
    btnPrimaryText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});