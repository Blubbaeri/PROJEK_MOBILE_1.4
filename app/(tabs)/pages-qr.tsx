import React, { useState, useEffect, useRef, useCallback } from 'react';
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
    semuaAlatHabis?: boolean;
    alatHabisList?: string[];
}

export default function PagesQr() {
    const router = useRouter();
    const { id, type } = useLocalSearchParams<{ id: string, type?: string }>();
    const borrowingId = Number(id);
    const isReturn = type === 'return';

    const [borrowingData, setBorrowingData] = useState<BorrowingData | null>(null);
    const [isPolling, setIsPolling] = useState(false);
    const [showCompletionAlert, setShowCompletionAlert] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const borrowingDataRef = useRef<BorrowingData | null>(null);

    useEffect(() => {
        borrowingDataRef.current = borrowingData;
    }, [borrowingData]);

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
                        setShowCompletionAlert(true);
                        setTimeout(() => setShowCompletionAlert(false), 5000);
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
                // Polling jika status masih dalam proses
                if (status === 'booked' || (isReturn && status === 'dipinjam')) {
                    startPolling(data.id);
                }
            }
        } catch (error) {
            Alert.alert('Error', 'Gagal menyambung ke server IP: 192.168.100.230');
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
                        {/* JUDUL HEADER DINAMIS */}
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

                {isPolling && (
                    <View style={styles.pollingBox}>
                        <Ionicons name="sync" size={14} color="#5B4DBC" />
                        <Text style={styles.pollingText}>
                            {isReturn ? 'Tunjukkan QR ke petugas untuk scan pengembalian' : 'Menunggu verifikasi petugas...'}
                        </Text>
                    </View>
                )}

                <QrCodeDisplay
                    qrValue={borrowingData.qrCode || borrowingData.id.toString()}
                    readableCode={borrowingData.qrCode || borrowingData.id.toString()}
                />

                <BookingItemList items={borrowingData.items || []} />
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
    pollingBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E8EAF6', padding: 10, borderRadius: 10, marginVertical: 15 },
    pollingText: { marginLeft: 6, fontSize: 12, color: '#5B4DBC', fontWeight: '500', textAlign: 'center', flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 20, fontSize: 16, color: '#666' }
});