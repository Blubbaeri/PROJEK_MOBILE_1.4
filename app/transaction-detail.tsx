import React from 'react';
import { View, Text, StyleSheet, StatusBar, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

export default function TransactionDetailScreen() {
    const router = useRouter();
    const params = useLocalSearchParams(); 

    // Parsing data
    const transactionId = params.id;
    const status = params.status as string;
    const qrCode = params.qrCode as string;
    
    // Parse Items dari JSON string
    let items = [];
    try {
        if (typeof params.items === 'string') {
            items = JSON.parse(params.items);
        }
    } catch (e) {
        console.error("Gagal parse items", e);
    }

    // Logic: Tombol Lanjut hanya muncul jika status 'SEDANG_DIPINJAM' atau 'Active'
    // Sesuaikan string ini dengan apa yang dikirim dari Backend
    const isActive = status === 'SEDANG_DIPINJAM' || status === 'Active' || status === 'BOOKING';

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#5B4DBC" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={{ padding: 5 }}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Detail Transaksi</Text>
                <View style={{ width: 24 }} /> 
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }}>
                {/* Info Card */}
                <View style={styles.card}>
                    <Text style={styles.label}>Transaction ID</Text>
                    <Text style={styles.value}>TXN-{transactionId}</Text>
                    
                    <View style={styles.divider} />
                    
                    <Text style={styles.label}>Status</Text>
                    <View style={styles.statusRow}>
                        <FontAwesome5 name={isActive ? "clock" : "check-circle"} size={16} color={isActive ? "#1E88E5" : "#43A047"} />
                        <Text style={[styles.statusText, { color: isActive ? "#1E88E5" : "#43A047" }]}>
                            {status}
                        </Text>
                    </View>
                </View>

                {/* List Barang */}
                <Text style={styles.sectionTitle}>Daftar Barang</Text>
                {items.length > 0 ? (
                    items.map((item: any, index: number) => (
                        <View key={index} style={styles.itemCard}>
                            <FontAwesome5 name="box" size={20} color="#5B4DBC" style={{ marginRight: 15 }} />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.itemName}>{item.equipmentName}</Text>
                                <Text style={styles.itemQty}>Jumlah: {item.quantity} • Kondisi: {item.condition || 'Baik'}</Text>
                            </View>
                        </View>
                    ))
                ) : (
                    <Text style={{ color: '#999' }}>Tidak ada detail barang.</Text>
                )}
            </ScrollView>

            {/* FOOTER */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.btnOutline} onPress={() => router.back()}>
                    <Text style={{ color: '#5B4DBC', fontWeight: 'bold' }}>Kembali</Text>
                </TouchableOpacity>

                {/* TOMBOL KHUSUS: LANJUT PENGEMBALIAN */}
                {isActive && (
                    <TouchableOpacity 
                        style={styles.btnPrimary}
                        onPress={() => {
                            // Arahkan ke halaman QR
                            router.push({
                                pathname: '/(tabs)/return',
                                params: { id: transactionId, qrCode: qrCode }
                            });
                        }}
                    >
                        <Text style={{ color: 'white', fontWeight: 'bold' }}>Lanjut Pengembalian</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F7' },
    header: {
        paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20,
        backgroundColor: '#5B4DBC', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
    },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: 'white' },
    card: { backgroundColor: 'white', padding: 20, borderRadius: 12, marginBottom: 20, elevation: 1 },
    label: { color: '#888', fontSize: 12, marginBottom: 4 },
    value: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    divider: { height: 1, backgroundColor: '#eee', marginVertical: 10 },
    statusRow: { flexDirection: 'row', alignItems: 'center' },
    statusText: { fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#333' },
    itemCard: {
        backgroundColor: 'white', flexDirection: 'row', padding: 15, borderRadius: 12, marginBottom: 10, alignItems: 'center', elevation: 1
    },
    itemName: { fontSize: 14, fontWeight: 'bold', color: '#333' },
    itemQty: { fontSize: 12, color: '#666', marginTop: 2 },
    footer: {
        padding: 20, backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-between',
        borderTopWidth: 1, borderColor: '#eee'
    },
    btnOutline: {
        paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: '#5B4DBC', 
        width: '40%', alignItems: 'center'
    },
    btnPrimary: {
        paddingVertical: 12, borderRadius: 8, backgroundColor: '#5B4DBC', 
        width: '55%', alignItems: 'center'
    }
});