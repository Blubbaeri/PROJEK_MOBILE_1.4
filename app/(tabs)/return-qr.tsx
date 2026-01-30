import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import QrCodeDisplay from '../../components/QrCodeDisplay';
import BookingItemList from '../../components/BookingItemList';

export default function ReturnQrScreen() {
    const router = useRouter();
    const { id, items } = useLocalSearchParams();
    const selectedItems = items ? JSON.parse(items as string) : [];

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: "E-Ticket Kembali", headerStyle: { backgroundColor: '#5B4DBC' }, headerTintColor: '#fff' }} />

            <ScrollView contentContainerStyle={{ padding: 20 }}>
                {/* Header Card */}
                <View style={styles.statusCard}>
                    <Ionicons name="checkmark-circle" size={40} color="#4CAF50" />
                    <Text style={styles.statusTitle}>SIAP DIKEMBALIKAN</Text>
                    <Text style={styles.statusSub}>Tunjukkan QR ini ke Admin Lab</Text>
                </View>

                {/* QR DISPLAY (Pakai komponen asli lu) */}
                <QrCodeDisplay
                    qrValue={`RET-${id}-${new Date().getTime()}`}
                    readableCode={`RETURN-TXN-${id}`}
                />

                <Text style={styles.sectionTitle}>Barang yang akan dikembalikan:</Text>
                {/* LIST BARANG (Pakai komponen asli lu) */}
                <BookingItemList items={selectedItems} />

                <TouchableOpacity
                    style={styles.btnHome}
                    onPress={() => router.replace('/(tabs)/transaction')}
                >
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Selesai</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F7' },
    statusCard: { backgroundColor: 'white', padding: 20, borderRadius: 15, alignItems: 'center', marginBottom: 20, elevation: 2 },
    statusTitle: { fontSize: 18, fontWeight: 'bold', color: '#4CAF50', marginTop: 10 },
    statusSub: { color: '#666', fontSize: 13 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', marginVertical: 15 },
    btnHome: { backgroundColor: '#5B4DBC', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 30 }
});