import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    SafeAreaView,
    Platform,
    Alert,
    RefreshControl,
    ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { api } from '../../lib/api';

// COMPONENTS
import BookingStatus from '../../components/BookingStatus';
import QrCodeDisplay from '../../components/QrCodeDisplay';
import BookingItemList from '../../components/BookingItemList';

/*  TYPES */
interface BorrowingData {
    id: number;
    qrCode: string;
    status: string;
    items: Array<{
        equipmentName: string;
        quantity: number;
        status: string;
        categoryName: string;
        locationName: string;
    }>;
    mhsId: number;
    userName: string;
    borrowedAt?: string;
    returnedAt?: string | null;
    isQrVerified: boolean;
    isFaceVerified: boolean;
    scheduledTime: string;
    maxReturnTime: string;
    qrExpiry: string | null;
    verifiedDate: string | null;
}

export default function PagesQr() {
    const router = useRouter();
    // Menambahkan 'selectedItems' untuk menangkap data pilihan dari halaman Konfirmasi
    const { id, type, selectedItems } = useLocalSearchParams<{
        id: string,
        type?: string,
        selectedItems?: string
    }>();

    const borrowingId = Number(id);
    const isReturn = type === 'return';

    const [borrowingData, setBorrowingData] = useState<BorrowingData | null>(null);
    const [isPolling, setIsPolling] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const borrowingDataRef = useRef<BorrowingData | null>(null);

    useEffect(() => {
        borrowingDataRef.current = borrowingData;
    }, [borrowingData]);

    /**
     * LOGIKA FILTERING BARANG
     * Memastikan hanya barang yang dipilih (jumlah > 0) yang muncul di E-Ticket
     */
    const displayedItems = useMemo(() => {
        if (!borrowingData || !borrowingData.items) return [];

        // Jika ini mode pengembalian dan user membawa data pilihan barang
        if (isReturn && selectedItems) {
            try {
                const parsedSelected = JSON.parse(selectedItems); // Berisi array barang yang diproses user

                return borrowingData.items
                    .map(item => {
                        // Cari apakah barang ini ada di daftar yang dipilih user
                        const selected = parsedSelected.find((s: any) => s.equipmentName === item.equipmentName);
                        return {
                            ...item,
                            quantity: selected ? selected.quantity : 0 // Update jumlahnya sesuai input user
                        };
                    })
                    .filter(item => item.quantity > 0); // Buang barang yang jumlah kembalinya 0
            } catch (e) {
                console.error("Error parsing selected items:", e);
                return borrowingData.items;
            }
        }

        // Jika mode pinjam biasa, tampilkan semua
        return borrowingData.items;
    }, [borrowingData, isReturn, selectedItems]);

    const stopPolling = useCallback(() => {
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
        }
        setIsPolling(false);
    }, []);

    const startPolling = useCallback((borrowId: number) => {
        if (pollingRef.current) clearInterval(pollingRef.current);
        setIsPolling(true);

        pollingRef.current = setInterval(async () => {
            try {
                const headerRes = await api.get(`/api/Borrowing/DetailPeminjaman/${borrowId}`);
                const newData = headerRes.data;

                if (!newData || !newData.status) return;

                if (borrowingDataRef.current?.status !== newData.status) {
                    setBorrowingData(prev => {
                        if (!prev) return null;
                        return { ...prev, ...newData };
                    });

                    const currentStatus = newData.status.toLowerCase();
                    const endStatuses = ['selesai', 'dibatalkan', 'ditolak'];

                    if (endStatuses.includes(currentStatus)) {
                        stopPolling();
                    }
                }
            } catch (error) {
                console.log('Polling error:', error);
            }
        }, 3000);
    }, [stopPolling]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            const response = await api.get(`/api/Borrowing/DetailPeminjaman/${borrowingId}`);
            const data = response.data;

            if (data) {
                setBorrowingData(data);
                const status = data.status.toLowerCase();
                if (status === 'booked' || (isReturn && status === 'dipinjam')) {
                    startPolling(data.id);
                }
            }
        } catch (error) {
            Alert.alert('Error', 'Gagal memuat data terbaru');
        } finally {
            setRefreshing(false);
        }
    }, [borrowingId, isReturn, startPolling]);

    useEffect(() => {
        if (!borrowingId) return;
        onRefresh();
        return () => stopPolling();
    }, [borrowingId]);

    const handleBack = () => {
        stopPolling();
        router.replace('/(tabs)/transaction');
    };

    if (!borrowingData) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#5B4DBC" />
                <Text style={styles.loadingText}>Menghubungkan ke server...</Text>
            </View>
        );
    }

    return (
        <View style={styles.mainContainer}>
            <StatusBar barStyle="light-content" backgroundColor="#5B4DBC" />

            <View style={styles.header}>
                <SafeAreaView>
                    <View style={styles.headerContent}>
                        <TouchableOpacity onPress={handleBack} style={styles.iconBtn}>
                            <Ionicons name="close" size={22} color="white" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>{isReturn ? 'E-Ticket Kembali' : 'E-Ticket Pinjam'}</Text>
                        <TouchableOpacity onPress={onRefresh} style={styles.iconBtn}>
                            <Ionicons name="refresh" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#5B4DBC']} />}
            >
                <BookingStatus status={borrowingData.status} />

                <View style={styles.pollingBox}>
                    <Ionicons name="information-circle" size={16} color="#5B4DBC" />
                    <Text style={styles.pollingText}>
                        {isReturn
                            ? 'Tunjukkan QR ke petugas untuk scan pengembalian barang'
                            : 'Tunjukkan QR ke petugas untuk verifikasi pengambilan alat'}
                    </Text>
                </View>

                <QrCodeDisplay
                    qrValue={borrowingData.qrCode || borrowingData.id.toString()}
                    readableCode={borrowingData.qrCode || borrowingData.id.toString()}
                />

                <View style={styles.detailHeader}>
                    <Text style={styles.detailTitle}>
                        {isReturn ? 'Detail Alat yang Dikembalikan' : 'Detail Alat yang Dipinjam'}
                    </Text>
                    <Text style={styles.itemCount}>({displayedItems.length} Alat)</Text>
                </View>

                {/* Menggunakan data yang sudah difilter */}
                <BookingItemList items={displayedItems} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: '#F5F5F7' },
    header: { backgroundColor: '#5B4DBC', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
    headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, marginTop: Platform.OS === 'android' ? 30 : 0 },
    headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    iconBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10 },
    content: { padding: 20, paddingBottom: 40 },
    pollingBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E8EAF6', padding: 12, borderRadius: 10, marginVertical: 15 },
    pollingText: { marginLeft: 8, fontSize: 13, color: '#5B4DBC', fontWeight: '500', textAlign: 'center', flex: 1 },
    detailHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, marginTop: 10, paddingHorizontal: 5 },
    detailTitle: { fontSize: 15, fontWeight: 'bold', color: '#333' },
    itemCount: { fontSize: 13, color: '#666', marginLeft: 5 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 20, fontSize: 16, color: '#666' }
});