import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, SafeAreaView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import BookingStatus from '../../components/BookingStatus';
import QrCodeDisplay from '../../components/QrCodeDisplay';
import BookingItemList from '../../components/BookingItemList';

export default function BookingQr() {
    const router = useRouter();
    const { data } = useLocalSearchParams();

    let borrowingData = null;
    try {
        if (data) borrowingData = JSON.parse(data as string);
    } catch (e) { console.error(e); }

    if (!borrowingData) {
        return (
            <View style={styles.center}>
                <Ionicons name="alert-circle-outline" size={50} color="#FF5252" />
                <Text>Data Tidak Ditemukan</Text>
                <TouchableOpacity onPress={() => router.back()}><Text>Kembali</Text></TouchableOpacity>
            </View>
        );
    }

    const isReturn = borrowingData.isReturn === true;
    const displayId = borrowingData.id || borrowingData.Id; // Menangani camelCase atau PascalCase

    const qrPayload = JSON.stringify({
        trxId: displayId,
        action: isReturn ? 'RETURN' : 'BORROW',
        items: borrowingData.items?.map((item: any) => ({
            id: item.equipmentId || item.PsaId,
            qty: item.quantity || 1
        }))
    });

    return (
        <View style={styles.mainContainer}>
            <StatusBar barStyle="light-content" backgroundColor="#5B4DBC" />
            <View style={styles.header}>
                <SafeAreaView><View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => router.replace('/(tabs)/transaction')}><Ionicons name="close" size={24} color="white" /></TouchableOpacity>
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>{isReturn ? 'E-Ticket Pengembalian' : 'E-Ticket Peminjaman'}</Text>
                    <View style={{ width: 24 }} />
                </View></SafeAreaView>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }}>
                <BookingStatus status={isReturn ? "PROSES KEMBALI" : (borrowingData.status || "PENDING")} />
                <View style={styles.infoBox}>
                    <Text style={{ color: '#1976D2', textAlign: 'center' }}>
                        Tunjukkan QR ini ke petugas lab untuk proses {isReturn ? 'pengembalian' : 'peminjaman'}.
                    </Text>
                </View>

                <QrCodeDisplay qrValue={qrPayload} readableCode={`TRX-${displayId}`} />

                <Text style={{ fontWeight: 'bold', marginTop: 20, marginBottom: 10 }}>Rincian Barang:</Text>
                <BookingItemList items={borrowingData.items} />

                <TouchableOpacity style={styles.btn} onPress={() => router.replace('/(tabs)/transaction')}>
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Selesai</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: '#F5F5F7' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { backgroundColor: '#5B4DBC', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
    headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
    infoBox: { backgroundColor: '#E3F2FD', padding: 15, borderRadius: 10, marginVertical: 15 },
    btn: { marginTop: 25, backgroundColor: '#5B4DBC', padding: 15, borderRadius: 15, alignItems: 'center' }
});