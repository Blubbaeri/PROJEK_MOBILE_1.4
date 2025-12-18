//components/QrCodeDisplay.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

export default function QrCodeDisplay({ qrValue, readableCode }: { qrValue: string, readableCode: string }) {
    return (
        <View style={styles.card}>
            <Text style={styles.title}>Kode Peminjaman</Text>

            <View style={styles.qrContainer}>
                {qrValue ? (
                    <QRCode value={qrValue} size={180} />
                ) : (
                    <Text>Loading...</Text>
                )}
            </View>

            <Text style={styles.codeText}>{readableCode}</Text>
            <Text style={styles.hint}>Tunjukkan QR code ini ke admin laboratorium</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 25,
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 3,
    },
    title: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 20 },
    qrContainer: {
        padding: 10,
        backgroundColor: 'white', // Pastikan background putih biar QR kebaca
        borderRadius: 10,
        marginBottom: 10,
    },
    codeText: { fontSize: 20, fontWeight: 'bold', color: '#333', marginTop: 10, letterSpacing: 0.5 },
    hint: { fontSize: 12, color: '#999', marginTop: 8, textAlign: 'center' },
});