import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, SafeAreaView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Import komponen modular
import BookingStatus from '../../components/BookingStatus';
import QrCodeDisplay from '../../components/QrCodeDisplay';
import BookingItemList from '../../components/BookingItemList';

export default function BookingQr() {
    const router = useRouter();
    const { data } = useLocalSearchParams();

    // Parsing Data dengan Safety
    let borrowingData = null;
    if (data) {
        try { borrowingData = JSON.parse(data as string); } catch (e) { console.error("Parse Error", e); }
    }

    const handleBack = () => {
        // Karena transaksi selesai, lebih baik balik ke Home atau Transaction History
        router.replace('/(tabs)');
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

    // --- OPTIMASI QR CODE BIAR GAMPANG DISCAN DESKTOP ---

    // 1. Saring data items. Ambil ID dan Quantity aja.
    // Hapus 'image', 'description', dll biar QR ga padet.
    const cleanItems = borrowingData.items.map((item: any) => ({
        id: item.equipmentId || item.id, // ID Barang
        qty: item.quantity               // Jumlah
    }));

    // 2. Bungkus jadi JSON seringkas mungkin
    const qrPayload = JSON.stringify({
        // Kirim ID Transaksi (Penting buat Admin cek di DB)
        trxId: borrowingData.id,

        // Kirim NIM Mahasiswa
        nim: borrowingData.studentId,

        // Kirim List Barang (Versi Ringkas)
        items: cleanItems
    });

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
                        <View style={{ width: 24 }} />
                    </View>
                </SafeAreaView>
            </View>

            {/* BODY SCROLL */}
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* 1. Status */}
                <BookingStatus status={borrowingData.status} />

                {/* 2. QR Code (Membawa Data Items) */}
                <QrCodeDisplay qrValue={qrPayload} readableCode={borrowingData.qrCode || borrowingData.id} />

                {/* 3. List Barang */}
                <BookingItemList items={borrowingData.items} />

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

    scrollContent: { padding: 20, paddingBottom: 50 },

    doneButton: {
        marginTop: 25,
        backgroundColor: '#5B4DBC',
        paddingVertical: 15, borderRadius: 15,
        alignItems: 'center',
        elevation: 4, shadowColor: "#5B4DBC", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5,
    },
    doneButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});