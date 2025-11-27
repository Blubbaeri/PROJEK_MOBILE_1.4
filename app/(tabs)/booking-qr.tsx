// file: app/booking-qr.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

export default function BookingQRScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    // Ambil data dari parameter navigasi
    const txnId = params.txnId || 'TXN-0000';
    const qrCode = params.qrCode || 'NO-QR';

    // Kita pakai API QR Server biar gampang generate QR tanpa library tambahan
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${qrCode}`;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#5B4DBC" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <FontAwesome name="arrow-left" size={20} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Booking QR Code</Text>
                <View style={{ width: 20 }} />
            </View>

            {/* White Container */}
            <View style={styles.whiteSheet}>
                <View style={styles.content}>
                    <Text style={styles.title}>Your Booking Code</Text>
                    <Text style={styles.subtitle}>Transaction ID: {txnId}</Text>

                    <View style={styles.qrContainer}>
                        {/* QR Code Image */}
                        <Image
                            source={{ uri: qrImageUrl }}
                            style={styles.qrImage}
                        />
                    </View>

                    <Text style={styles.instruction}>
                        Show this QR code to the lab assistant to pick up your equipment.
                    </Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#5B4DBC' },
    header: {
        height: 100, flexDirection: 'row', alignItems: 'flex-end',
        justifyContent: 'space-between', padding: 20, paddingBottom: 25
    },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: 'white' },
    backBtn: { padding: 5 },

    whiteSheet: {
        flex: 1, backgroundColor: '#F5F5F7',
        borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 30
    },
    content: { alignItems: 'center', marginTop: 20 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 10 },
    subtitle: { fontSize: 16, color: '#888', marginBottom: 30 },

    qrContainer: {
        padding: 20, backgroundColor: 'white', borderRadius: 20,
        elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10,
        marginBottom: 30
    },
    qrImage: { width: 220, height: 220 },

    instruction: { textAlign: 'center', color: '#666', lineHeight: 22, paddingHorizontal: 20 }
});