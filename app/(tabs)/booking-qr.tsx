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
        Alert
    } from 'react-native';
    import { useLocalSearchParams, useRouter } from 'expo-router';
    import { Ionicons } from '@expo/vector-icons';

    import { api } from '../../lib/api';

    // COMPONENTS
    import BookingStatus from '../../components/BookingStatus';
    import QrCodeDisplay from '../../components/QrCodeDisplay';
    import BookingItemList from '../../components/BookingItemList';

    /* =====================
        TYPES
    ===================== */
    interface BorrowingData {
        id: number;
        qrCode: string;
        status: string;
        items: any[];
        borrowedAt?: string;
    }

    /* =====================
        SCREEN
    ===================== */
    export default function BookingQr() {
        const router = useRouter();
        const { id } = useLocalSearchParams<{ id: string }>();
        const borrowingId = Number(id);

        const [borrowingData, setBorrowingData] = useState<BorrowingData | null>(null);
        const [isPolling, setIsPolling] = useState(false);

        const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
        const borrowingDataRef = useRef<BorrowingData | null>(null);

        useEffect(() => {
            borrowingDataRef.current = borrowingData;
        }, [borrowingData]);

        /* =====================
            STOP POLLING
        ===================== */
        const stopPolling = useCallback(() => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
                pollingRef.current = null;
            }
            setIsPolling(false);
        }, []);

        /* =====================
            START POLLING
        ===================== */
        const startPolling = useCallback((borrowId: number) => {
            if (pollingRef.current) clearInterval(pollingRef.current);

            setIsPolling(true);

            pollingRef.current = setInterval(async () => {
                try {
                    // AMBIL HEADER SAJA (sama kayak fetchData)
                    const headerRes = await api.get(`/api/borrowing/${borrowId}`);
                    const newData = headerRes.data?.data;

                    if (!newData || !newData.status) return;

                    if (borrowingDataRef.current?.status !== newData.status) {
                        setBorrowingData(prev => {
                            if (!prev) return null;
                            return {
                                ...prev,           // Pertahankan semua data lama (termasuk items)
                                ...newData,        // Update header fields (status, qrCode, dll)
                                items: prev.items  // Items tetap yang lama
                            };
                        });

                        if (newData.status !== 'Booked') {
                            stopPolling();
                        }
                    }
                } catch (error) {
                    console.log('Polling error:', error);
                }
            }, 2000);
        }, [stopPolling]);

        /* =====================
            FETCH INITIAL DATA
        ===================== */
        useEffect(() => {
            if (!borrowingId) return;

            const fetchData = async () => {
                try {
                    // 1. AMBIL DATA HEADER (qrCode, status, dll)
                    const headerRes = await api.get(`/api/borrowing/${borrowingId}`);
                    const headerData = headerRes.data?.data;

                    if (!headerData) {
                        Alert.alert('Error', 'Data booking tidak ditemukan');
                        return;
                    }

                    // 2. AMBIL DATA DETAIL ITEMS
                    const detailRes = await api.get(`api/borrowing-detail/borrowing/${borrowingId}`);
                    const detailData = detailRes.data?.data || [];

                    // 3. GABUNGKAN DATA
                    const fullData = {
                        ...headerData,
                        items: Array.isArray(detailData)
                            ? detailData.map(item => ({
                                equipmentName: item.equipmentName || item.name,
                                quantity: 0
                            }))
                            : []
                    };

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

        /* =====================
            HANDLERS
        ===================== */
        const handleBack = () => {
            stopPolling();
            router.back();
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

        /* =====================
            EMPTY STATE
        ===================== */
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

        /* =====================
            UI
        ===================== */
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

                <ScrollView contentContainerStyle={styles.content}>
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

    /* =====================
        STYLES
    ===================== */
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
        }
    });
