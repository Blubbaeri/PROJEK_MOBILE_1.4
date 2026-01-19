// app/(tabs)/booking-qr.tsx

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

/*  SCREEN */
export default function BookingQr() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const borrowingId = Number(id);

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
                // Ganti ke /api/Borrowing (Huruf B Besar sesuai Controller lo)
                const headerRes = await api.get(`/api/Borrowing/DetailPeminjaman/${borrowId}`);
                const newData = headerRes.data;

                if (!newData || !newData.status) return;

                if (borrowingDataRef.current?.status !== newData.status) {
                    setBorrowingData(prev => {
                        if (!prev) return null;
                        return {
                            ...prev,
                            ...newData,
                            items: prev.items || [],
                            semuaAlatHabis: newData.semuaAlatHabis || false,
                            alatHabisList: newData.alatHabisList || []
                        };
                    });

                    const currentStatus = newData.status.toLowerCase();

                    if (currentStatus === 'selesai' && newData.semuaAlatHabis) {
                        Alert.alert('Alat Habis', `Maaf, semua alat yang anda booking sudah habis.`, [
                            { text: 'OK', onPress: () => { stopPolling(); setShowCompletionAlert(false); } }
                        ]);
                        stopPolling();
                        return;
                    }

                    const continuePollingStatuses = ['booked', 'diproses', 'dipinjam', 'dikembalikan'];
                    if (!continuePollingStatuses.includes(currentStatus)) {
                        if (currentStatus === 'selesai') {
                            setShowCompletionAlert(true);
                            setTimeout(() => setShowCompletionAlert(false), 5000);
                        }
                        stopPolling();
                    }
                }
            } catch (error) {
                console.log('Polling error:', error);
            }
        }, 3000); // Polling 3 detik sekali saja biar server gak berat
    }, [stopPolling]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            const response = await api.get(`/api/Borrowing/DetailPeminjaman/${borrowingId}`);
            const data = response.data;

            if (data) {
                setBorrowingData({
                    ...data,
                    semuaAlatHabis: data.semuaAlatHabis || false,
                    alatHabisList: data.alatHabisList || []
                });
                if (data.status.toLowerCase() === 'booked') startPolling(data.id);
            }
        } catch (error) {
            Alert.alert('Error', 'Gagal refresh data');
        } finally {
            setRefreshing(false);
        }
    }, [borrowingId, stopPolling, startPolling]);

    useEffect(() => {
        if (!borrowingId) return;

        const fetchData = async () => {
            try {
                const response = await api.get(`/api/Borrowing/DetailPeminjaman/${borrowingId}`);
                const data = response.data; 

                if (!data) {
                    Alert.alert('Error', 'Data booking tidak ditemukan');
                    return;
                }

                setBorrowingData({
                    ...data,
                    semuaAlatHabis: data.semuaAlatHabis || false,
                    alatHabisList: data.alatHabisList || []
                });

                if (data.status.toLowerCase() === 'booked') {
                    startPolling(data.id);
                }
            } catch (error) {
                console.error('Error:', error);
                Alert.alert('Error', 'Gagal mengambil data booking');
            }
        };

        fetchData();
        return () => stopPolling();
    }, [borrowingId, startPolling, stopPolling]);

    const handleBack = () => {
        stopPolling();
        router.replace('/(tabs)/transaction'); // Arahkan ke list transaksi
    };

    const refreshStatus = () => onRefresh();

    if (!borrowingData) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#5B4DBC" />
                <Text style={styles.loadingText}>Memuat data booking...</Text>
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
                        <Text style={styles.headerTitle}>E-Ticket</Text>
                        <TouchableOpacity onPress={refreshStatus} style={styles.iconBtn}>
                            <Ionicons name="refresh" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </View>

            {showCompletionAlert && (
                <View style={styles.completionAlert}>
                    <View style={styles.completionAlertContent}>
                        <Ionicons name="checkmark-circle" size={30} color="#4CAF50" />
                        <View style={styles.completionAlertText}>
                            <Text style={styles.completionAlertTitle}>Selesai!</Text>
                            <Text style={styles.completionAlertDesc}>Transaksi telah diperbarui.</Text>
                        </View>
                    </View>
                </View>
            )}

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#5B4DBC']} />}
            >
                <BookingStatus status={borrowingData.status} />

                {isPolling && (
                    <View style={styles.pollingBox}>
                        <Ionicons name="sync" size={14} color="#5B4DBC" />
                        <Text style={styles.pollingText}>Memantau status...</Text>
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
    pollingText: { marginLeft: 6, fontSize: 12, color: '#5B4DBC', fontWeight: '500' },
    completionAlert: { position: 'absolute', top: 100, left: 20, right: 20, backgroundColor: 'white', borderRadius: 15, padding: 15, elevation: 5, zIndex: 1000 },
    completionAlertContent: { flexDirection: 'row', alignItems: 'center' },
    completionAlertText: { flex: 1, marginLeft: 12 },
    completionAlertTitle: { fontSize: 16, fontWeight: 'bold', color: '#2E7D32' },
    completionAlertDesc: { fontSize: 14, color: '#666' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 20, fontSize: 16, color: '#666' }
});