//app/(tabs)/booking-qr.tsx

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
    RefreshControl  
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
    items: any[];
    borrowedAt?: string;
    semuaAlatHabis?: boolean; // ⬅️ TAMBAH INI
    alatHabisList?: string[]; // ⬅️ TAMBAH INI
}

interface DetailItem {
    equipmentName?: string;
    name?: string;
    quantity?: number;
    [key: string]: any; // Untuk property lain
}

/*  SCREEN */
export default function BookingQr() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const borrowingId = Number(id);

    const [borrowingData, setBorrowingData] = useState<BorrowingData | null>(null);
    const [isPolling, setIsPolling] = useState(false);
    const [showCompletionAlert, setShowCompletionAlert] = useState(false);
    const [refreshing, setRefreshing] = useState(false); // ← STATE UNTUK REFRESH

    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const borrowingDataRef = useRef<BorrowingData | null>(null);

    useEffect(() => {
        borrowingDataRef.current = borrowingData;
    }, [borrowingData]);

    /* STOP POLLING*/
    const stopPolling = useCallback(() => {
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
        }
        setIsPolling(false);
    }, []);

    /* START POLLING */
    /* START POLLING */
    const startPolling = useCallback((borrowId: number) => {
        if (pollingRef.current) clearInterval(pollingRef.current);

        setIsPolling(true);

        pollingRef.current = setInterval(async () => {
            try {
                const headerRes = await api.get(`/api/borrowing/${borrowId}`);
                const newData = headerRes.data?.data;

                if (!newData || !newData.status) return;

                // ⭐ CEK APAKAH STATUS BERUBAH
                if (borrowingDataRef.current?.status !== newData.status) {
                    setBorrowingData(prev => {
                        if (!prev) return null;
                        return {
                            ...prev,
                            ...newData,
                            items: prev.items,
                            semuaAlatHabis: newData.semuaAlatHabis || false,
                            alatHabisList: newData.alatHabisList || []
                        };
                    });

                    // ⭐ LOGIC STATUS DENGAN CEK ALAT HABIS
                    const currentStatus = newData.status.toLowerCase();

                    // ⭐ KALAU SELESAI KARENA ALAT HABIS
                    if (currentStatus === 'selesai' && newData.semuaAlatHabis) {
                        // TAMPILKAN ALERT KHUSUS
                        Alert.alert(
                            'Alat Habis',
                            `Maaf, semua alat yang anda booking sudah habis:\n\n${newData.alatHabisList?.join('\n') || 'Tidak ada info alat'
                            }`,
                            [
                                {
                                    text: 'OK',
                                    onPress: () => {
                                        stopPolling();
                                        setShowCompletionAlert(false);
                                    }
                                }
                            ]
                        );
                        stopPolling();
                        return;
                    }

                    // ⭐ KALAU BEBERAPA ALAT HABIS TAPI MASIH ADA YANG BERHASIL
                    if (newData.alatHabisList && newData.alatHabisList.length > 0) {
                        Alert.alert(
                            'Beberapa Alat Habis',
                            `Alat berikut sudah habis:\n\n${newData.alatHabisList.join('\n')
                            }\n\nStatus: ${newData.status}`,
                            [{ text: 'OK' }]
                        );
                    }

                    const continuePollingStatuses = ['booked', 'diproses', 'dipinjam', 'dikembalikan'];

                    if (continuePollingStatuses.includes(currentStatus)) {
                        console.log(`Status ${currentStatus} - Lanjut polling...`);
                    } else {
                        if (currentStatus === 'selesai') {
                            setShowCompletionAlert(true);
                            setTimeout(() => setShowCompletionAlert(false), 5000);
                        }
                        stopPolling();
                        console.log(`Status ${currentStatus} - Stop polling`);
                    }
                }
            } catch (error) {
                console.log('Polling error:', error);
            }
        }, 500);
    }, [stopPolling]);

    /*  PULL TO REFRESH */
    /*  PULL TO REFRESH */
    const onRefresh = useCallback(async () => {
        setRefreshing(true);

        try {
            // 1. Ambil header data terbaru
            const headerRes = await api.get(`/api/borrowing/${borrowingId}`);
            const headerData = headerRes.data?.data;

            if (!headerData) {
                Alert.alert('Error', 'Data booking tidak ditemukan');
                return;
            }

            // 2. Ambil detail items terbaru
            const detailRes = await api.get(`/api/borrowing-detail/borrowing/${borrowingId}`);
            const detailData = detailRes.data?.data || [];

            // 3. Gabungkan data dengan GROUPING
            const itemMap = new Map<string, number>();
            detailData.forEach((item: any) => {
                const name = item.equipmentName || item.name || 'Unknown';
                itemMap.set(name, (itemMap.get(name) || 0) + 1);
            });

            const groupedItems = Array.from(itemMap.entries()).map(([equipmentName, quantity]) => ({
                equipmentName,
                quantity
            }));

            const fullData = {
                ...headerData,
                items: groupedItems,
                semuaAlatHabis: headerData.semuaAlatHabis || false,
                alatHabisList: headerData.alatHabisList || []
            };

            setBorrowingData(fullData);

            // ⭐ TAMPILKAN ALERT JIKA ALAT HABIS
            if (headerData.semuaAlatHabis) {
                Alert.alert(
                    'Alat Habis',
                    `Maaf, semua alat sudah habis:\n\n${headerData.alatHabisList?.join('\n') || 'Tidak ada info'
                    }`,
                    [{ text: 'OK' }]
                );
            } else if (headerData.alatHabisList && headerData.alatHabisList.length > 0) {
                Alert.alert(
                    'Beberapa Alat Habis',
                    `Alat berikut habis:\n${headerData.alatHabisList.join('\n')}`,
                    [{ text: 'OK' }]
                );
            }

            // Jika status Booked, restart polling
            if (headerData.status === 'Booked') {
                stopPolling();
                startPolling(headerData.id);
            } else {
                stopPolling();
            }

            Alert.alert('Diperbarui', `Status: ${headerData.status}`);
        } catch (error) {
            console.error('Refresh error:', error);
            Alert.alert('Error', 'Gagal refresh data');
        } finally {
            setRefreshing(false);
        }
    }, [borrowingId, stopPolling, startPolling]);


    /* FETCH INITIAL DATA */
    useEffect(() => {
        if (!borrowingId) return;

        const fetchData = async () => {
            try {
                // 1. AMBIL DATA HEADER
                const headerRes = await api.get(`/api/borrowing/${borrowingId}`);
                const headerData = headerRes.data?.data;

                if (!headerData) {
                    Alert.alert('Error', 'Data booking tidak ditemukan');
                    return;
                }

                // ⭐ CEK APAKAH ADA INFO ALAT HABIS LANGSUNG DARI HEADER
                const semuaAlatHabis = headerData.semuaAlatHabis || false;
                const alatHabisList = headerData.alatHabisList || [];

                // ⭐ TAMPILKAN ALERT JIKA ALAT HABIS
                if (semuaAlatHabis) {
                    Alert.alert(
                        'Alat Habis',
                        `Maaf, semua alat yang anda booking sudah habis:\n\n${alatHabisList.join('\n') || 'Tidak ada info'
                        }`,
                        [{ text: 'OK' }]
                    );
                } else if (alatHabisList.length > 0) {
                    Alert.alert(
                        'Beberapa Alat Habis',
                        `Alat berikut sudah habis:\n\n${alatHabisList.join('\n')}`,
                        [{ text: 'OK' }]
                    );
                }

                // 2. AMBIL DATA DETAIL ITEMS
                const detailRes = await api.get(`/api/borrowing-detail/borrowing/${borrowingId}`);
                const detailData = detailRes.data?.data || [];

                console.log('📦 Detail data from API:', detailData);

                // 3. GABUNGKAN DATA DENGAN GROUPING
                const itemMap = new Map<string, number>();
                detailData.forEach((item: any) => {
                    const name = item.equipmentName || item.name || 'Unknown';
                    itemMap.set(name, (itemMap.get(name) || 0) + 1);
                });

                const groupedItems = Array.from(itemMap.entries()).map(([equipmentName, quantity]) => ({
                    equipmentName,
                    quantity
                }));

                const fullData = {
                    ...headerData,
                    items: groupedItems,
                    semuaAlatHabis, // ⬅️ SIMPAN DATA INI
                    alatHabisList   // ⬅️ SIMPAN DATA INI
                };

                console.log('✅ Full data prepared:', fullData);
                setBorrowingData(fullData);

                if (headerData.status === 'Booked') {
                    startPolling(headerData.id);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                Alert.alert('Error', 'Gagal mengambil data booking');
            }
        };

        fetchData();

        return () => stopPolling();
    }, [borrowingId, startPolling, stopPolling]);

    /* HANDLERS */
    const handleBack = () => {
        stopPolling();
        router.back();
        // atau router.push("/(tabs)"); untuk balik ke home
    };

    const refreshStatus = async () => {
        if (!borrowingData) return;

        try {
            const res = await api.get(`/api/borrowing/${borrowingData.id}`);
            const data = res.data?.data;

            if (data) {
                setBorrowingData(data);
                Alert.alert('Status Diperbarui', `Status: ${data.status}`);
            }
        } catch {
            Alert.alert('Error', 'Gagal refresh status');
        }
    };

    /* EMPTY STATE */
    if (!borrowingData) {
        return (
            <View style={styles.center}>
                <Ionicons name="alert-circle-outline" size={50} color="#FF5252" />
                <Text style={{ marginTop: 10 }}>Data Booking Tidak Ditemukan</Text>
                <TouchableOpacity onPress={handleBack} style={{ marginTop: 20 }}>
                    <Text style={{ color: '#5B4DBC', fontWeight: 'bold' }}>
                        Kembali
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    /* UI */
    return (
        <View style={styles.mainContainer}>
            <StatusBar barStyle="light-content" backgroundColor="#5B4DBC" />

            {/* HEADER */}
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

            {/* ALERT PENGEMBALIAN SELESAI */}
            {showCompletionAlert && (
                <View style={styles.completionAlert}>
                    <View style={styles.completionAlertContent}>
                        <Ionicons name="checkmark-circle" size={30} color="#4CAF50" />
                        <View style={styles.completionAlertText}>
                            <Text style={styles.completionAlertTitle}>Pengembalian Selesai!</Text>
                            <Text style={styles.completionAlertDesc}>
                                Alat telah dikembalikan dengan selamat.
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => setShowCompletionAlert(false)}
                            style={styles.completionAlertClose}
                        >
                            <Ionicons name="close" size={20} color="#666" />
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#5B4DBC']}
                        tintColor="#5B4DBC"
                        title="Tarik untuk refresh..."
                        titleColor="#5B4DBC"
                    />
                }
            >
                <BookingStatus status={borrowingData.status} />

                {isPolling && (
                    <View style={styles.pollingBox}>
                        <Ionicons name="sync" size={14} color="#5B4DBC" />
                        <Text style={styles.pollingText}>Memantau status booking...</Text>
                    </View>
                )}

                <QrCodeDisplay
                    qrValue={borrowingData.qrCode}
                    readableCode={borrowingData.qrCode}
                />

                <BookingItemList items={borrowingData.items} />

            </ScrollView>
        </View>
    );
}

/* STYLES */
const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: '#F5F5F7' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    header: {
        backgroundColor: '#5B4DBC',
        paddingTop: Platform.OS === 'android'
            ? (StatusBar.currentHeight || 0) + 10
            : 10,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    iconBtn: {
        padding: 6,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 10
    },

    content: { padding: 20, paddingBottom: 40 },

    pollingBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E8EAF6',
        padding: 10,
        borderRadius: 10,
        marginVertical: 15,
    },
    pollingText: {
        marginLeft: 6,
        fontSize: 12,
        color: '#5B4DBC',
        fontWeight: '500'
    },

    detailButton: {
        marginTop: 25,
        backgroundColor: '#5B4DBC',
        paddingVertical: 15,
        borderRadius: 15,
        alignItems: 'center'
    },
    detailButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16
    },

    // === TAMBAHAN STYLES UNTUK ALERT ===
    completionAlert: {
        position: 'absolute',
        top: 100,
        left: 20,
        right: 20,
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 1000,
    },
    completionAlertContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    completionAlertText: {
        flex: 1,
        marginLeft: 12,
    },
    completionAlertTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2E7D32',
    },
    completionAlertDesc: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    completionAlertClose: {
        padding: 5,
    },
});