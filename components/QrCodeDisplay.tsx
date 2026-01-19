import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

export default function QrCodeDisplay({ qrValue, readableCode }: { qrValue: string, readableCode: string }) {
    return (
        <View style={styles.card}>
            <Text style={styles.title}>Kode Peminjaman</Text>

            <View style={styles.qrContainer}>
                {qrValue ? (
                    /* QR Code akan digenerate dari string qrValue */
                    <QRCode
                        value={qrValue}
                        size={180}
                        color="black"
                        backgroundColor="white"
                    />
                ) : (
                    <View style={styles.loadingBox}>
                        <ActivityIndicator color="#5B4DBC" />
                        <Text style={styles.loadingText}>Generating QR...</Text>
                    </View>
                )}
            </View>

            <Text style={styles.codeText}>{readableCode || "------"}</Text>
            <Text style={styles.hint}>Tunjukkan QR code ini ke admin laboratorium</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
        marginBottom: 16,
        // Shadow biar kelihatan premium
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    title: { fontSize: 16, fontWeight: '600', color: '#666', marginBottom: 20 },
    qrContainer: {
        padding: 15,
        backgroundColor: 'white',
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        marginBottom: 10,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 200,
        minWidth: 200
    },
    codeText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#5B4DBC',
        marginTop: 10,
        letterSpacing: 2 // Biar kode lebih enak dibaca
    },
    hint: { fontSize: 13, color: '#999', marginTop: 10, textAlign: 'center', paddingHorizontal: 20 },
    loadingBox: { alignItems: 'center' },
    loadingText: { marginTop: 10, color: '#999', fontSize: 12 }
});