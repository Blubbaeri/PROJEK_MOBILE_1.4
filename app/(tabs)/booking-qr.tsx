// app/(tabs)/booking-qr.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    StatusBar, SafeAreaView, Platform, Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { api } from '../../lib/api';

// Import komponen modular
import BookingStatus from '../../components/BookingStatus';
import QrCodeDisplay from '../../components/QrCodeDisplay';
import BookingItemList from '../../components/BookingItemList';

// DEFINE INTERFACE
interface BorrowingData {
    id: number;
    qrCode: string;
    status: string;
    items?: any[];
    mhsId?: number;
    borrowedAt?: string;
}

export default function BookingQr() {
    const router = useRouter();
    const { data } = useLocalSearchParams();

    // ⭐ STATE
    const [borrowingData, setBorrowingData] = useState<BorrowingData | null>(null);
    const [isPolling, setIsPolling] = useState(false);
    const pollingRef = useRef<number | null>(null);
    const borrowingDataRef = useRef<BorrowingData | null>(null);

    useEffect(() => {
        borrowingDataRef.current = borrowingData;
    }, [borrowingData]);

    // STOP POLLING
    const stopStatusPolling = useCallback(() => {
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
        }
        setIsPolling(false);
        console.log("Polling stopped");
    }, []);

    //FUNGSI POLLING - PAKAI api.get()
    const startStatusPolling = useCallback((borrowingId: number) => {
        console.log(`Start polling for ID: ${borrowingId}`);
        setIsPolling(true);

        if (pollingRef.current) {
            clearInterval(pollingRef.current);
        }

        pollingRef.current = setInterval(async () => {
            try {
                console.log(`Polling status for ID: ${borrowingId}`);

                // PAKAI api.get() BUKAN fetch()
                const response = await api.get(`/api/borrowing/${borrowingId}`);
                const result = response.data;

                const currentStatus = borrowingDataRef.current?.status;

                if (result.data && result.data.status !== currentStatus) {
                    console.log(`✅ Status changed: ${currentStatus} → ${result.data.status}`);

                    setBorrowingData(prev => {
                        if (!prev) return prev;
                        return {
                            ...prev,
                            status: result.data.status
                        };
                    });

                    if (result.data.status === "Diproses") {
                        Alert.alert(
                            "Status Diperbarui",
                            "Booking Anda sedang diproses oleh admin.\nSilakan tunggu approval.",
                            [{ text: "OK" }]
                        );
                    }

                    if (result.data.status !== "Booked") {
                        stopStatusPolling();
                    }
                }
            } catch (error) {
                console.error("❌ Polling error:", error);
            }
        }, 2000);
    }, [stopStatusPolling]);

    // PARSING DATA AWAL 
    useEffect(() => {
        if (data) {
            try {
                const parsed = JSON.parse(data as string) as BorrowingData;
                setBorrowingData(parsed);

                // JIKA STATUS MASIH "Booked", START POLLING
                if (parsed.status === "Booked" && parsed.id) {
                    startStatusPolling(parsed.id);
                }
            } catch (e) {
                console.error("Parse Error", e);
                Alert.alert("Error", "Data tidak valid");
            }
        }
    }, [data, startStatusPolling]);

    // CLEANUP SAAT KOMPONEN UNMOUNT 
    useEffect(() => {
        return () => {
            stopStatusPolling();
        };
    }, [stopStatusPolling]);

    // HANDLE BACK FUNCTION
    const handleBack = () => {
        stopStatusPolling();
        router.replace('/(tabs)/transaction');
    };

    // REFRESH STATUS MANUAL - PAKAI api.get()
    const refreshStatus = async () => {
        if (!borrowingData?.id) return;

        try {
            // PAKAI api.get()
            const response = await api.get(`/api/borrowing/${borrowingData.id}`);
            const result = response.data;

            if (result.data) {
                setBorrowingData(prev => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        status: result.data.status
                    };
                });

                Alert.alert("Status Diperbarui", `Status saat ini: ${result.data.status}`);
            }
        } catch (error) {
            Alert.alert("Error", "Gagal memperbarui status");
        }
    };

    if (!borrowingData) {
        return (
            <View style={styles.center}>
                <Ionicons name="alert-circle-outline" size={50} color="#FF5252" />
                <Text style={{ marginTop: 10, color: '#555' }}>Data Booking Tidak Ditemukan</Text>
                <TouchableOpacity onPress={handleBack} style={{ marginTop: 20 }}>
                    <Text style={{ color: '#5B4DBC', fontWeight: 'bold' }}>Kembali ke Home</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const qrPayload = borrowingData.qrCode;

    return (
        <View style={styles.mainContainer}>
            <StatusBar barStyle="light-content" backgroundColor="#5B4DBC" />

            {/* HEADER */}
            <View style={styles.header}>
                <SafeAreaView>
                    <View style={styles.headerContent}>
                        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                            <Ionicons name="close" size={24} color="white" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>E-Ticket</Text>

                        {/* ⭐ TAMBAH REFRESH BUTTON */}
                        <TouchableOpacity onPress={refreshStatus} style={styles.refreshButton}>
                            <Ionicons name="refresh" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* 1. Status */}
                <BookingStatus status={borrowingData.status} />

                {/* ⭐ POLLING INDICATOR */}
                {isPolling && (
                    <View style={styles.pollingIndicator}>
                        <Ionicons name="sync" size={16} color="#5B4DBC" style={{ marginRight: 5 }} />
                        <Text style={styles.pollingText}>Memantau perubahan status...</Text>
                    </View>
                )}

                {/* 2. QR Code */}
                <QrCodeDisplay qrValue={qrPayload} readableCode={borrowingData.qrCode || String(borrowingData.id)} />

                {/* 3. List Barang */}
                {borrowingData.items && <BookingItemList items={borrowingData.items} />}

                {/* Tombol Selesai */}
                <TouchableOpacity style={styles.doneButton} onPress={handleBack}>
                    <Text style={styles.doneButtonText}>Selesai & Kembali</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: '#F5F5F7' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    header: {
        backgroundColor: '#5B4DBC',
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 0,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        elevation: 5, zIndex: 10,
    },
    headerContent: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingVertical: 15,
    },
    headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    backButton: { padding: 5, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10 },
    refreshButton: { padding: 5 },

    scrollContent: { padding: 20, paddingBottom: 50 },

    // ⭐ POLLING STYLES
    pollingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E8EAF6',
        padding: 10,
        borderRadius: 10,
        marginBottom: 15,
    },
    pollingText: {
        fontSize: 12,
        color: '#5B4DBC',
        fontWeight: '500',
    },

    doneButton: {
        marginTop: 25,
        backgroundColor: '#5B4DBC',
        paddingVertical: 15, borderRadius: 15,
        alignItems: 'center',
        elevation: 4, shadowColor: "#5B4DBC", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5,
    },
    doneButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});