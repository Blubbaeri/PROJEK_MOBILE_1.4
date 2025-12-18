import React from 'react';
import { View, Text, StyleSheet, StatusBar, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

export default function TransactionDetailScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    // Parsing data
    const transactionId = params.id;
    const status = params.status as string || 'Diproses';
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

    // --- PERBAIKAN 1: Logic isActive sesuai status baru ---
    // Tombol "Lanjut Pengembalian" hanya muncul jika status DIPINJAM
    const isActive = status === 'Dipinjam';

    // --- PERBAIKAN 2: Config untuk tiap status ---
    const statusConfig = {
        Diproses: {
            icon: 'clock' as const,
            color: '#FFA000',
            label: 'Diproses',
            description: 'Peminjaman sedang diproses'
        },
        Dipinjam: {
            icon: 'running' as const,
            color: '#2979FF',
            label: 'Dipinjam',
            description: 'Alat sedang dipinjam'
        },
        Ditolak: {
            icon: 'times-circle' as const,
            color: '#F44336',
            label: 'Ditolak',
            description: 'Peminjaman ditolak'
        },
        Dikembalikan: {
            icon: 'undo-alt' as const,
            color: '#4CAF50',
            label: 'Dikembalikan',
            description: 'Alat sudah dikembalikan'
        },
        Selesai: {
            icon: 'check-circle' as const,
            color: '#757575',
            label: 'Selesai',
            description: 'Transaksi selesai'
        }
    };

    const currentStatus = statusConfig[status as keyof typeof statusConfig] || statusConfig.Diproses;

    // --- PERBAIKAN 3: Handler untuk tombol pengembalian ---
    const handleReturnPress = () => {
        // Periksa apakah route return ada, jika tidak, gunakan back atau alert
        try {
            // Jika ada halaman return, redirect ke sana
            router.push({
                pathname: '/(tabs)/return' as any, // Type assertion untuk bypass error
                params: { id: transactionId, qrCode: qrCode }
            });
        } catch (error) {
            console.log('Return page not available, going back');
            router.back();
        }
    };

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
                        <FontAwesome5
                            name={currentStatus.icon}
                            size={16}
                            color={currentStatus.color}
                        />
                        <Text style={[styles.statusText, { color: currentStatus.color }]}>
                            {currentStatus.label}
                        </Text>
                    </View>

                    {/* Status Description */}
                    <Text style={styles.statusDescription}>{currentStatus.description}</Text>
                </View>

                {/* QR Code Info */}
                {qrCode && (
                    <View style={[styles.card, { marginTop: 10 }]}>
                        <Text style={styles.label}>Kode QR</Text>
                        <View style={styles.qrRow}>
                            <FontAwesome5 name="qrcode" size={20} color="#5B4DBC" />
                            <Text style={styles.qrCode}>{qrCode}</Text>
                        </View>
                    </View>
                )}

                {/* List Barang */}
                <Text style={styles.sectionTitle}>Daftar Barang</Text>
                {items.length > 0 ? (
                    items.map((item: any, index: number) => (
                        <View key={index} style={styles.itemCard}>
                            <FontAwesome5 name="box" size={20} color="#5B4DBC" style={{ marginRight: 15 }} />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.itemName}>{item.equipmentName}</Text>
                                <Text style={styles.itemQty}>
                                    Jumlah: {item.quantity} • Kondisi: {item.condition || 'Baik'}
                                </Text>
                            </View>
                        </View>
                    ))
                ) : (
                    <Text style={{ color: '#999' }}>Tidak ada detail barang.</Text>
                )}
            </ScrollView>

            {/* FOOTER */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.btnOutline, { width: isActive ? '40%' : '100%' }]}
                    onPress={() => router.back()}
                >
                    <Text style={{ color: '#5B4DBC', fontWeight: 'bold' }}>Kembali</Text>
                </TouchableOpacity>

                {/* TOMBOL KHUSUS: LANJUT PENGEMBALIAN */}
                {isActive && (
                    <TouchableOpacity
                        style={styles.btnPrimary}
                        onPress={handleReturnPress}
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
    statusDescription: { fontSize: 13, color: '#666', marginTop: 5, fontStyle: 'italic' },
    qrRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
    qrCode: { fontSize: 16, fontFamily: 'monospace', marginLeft: 10, color: '#333' },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#333' },
    itemCard: {
        backgroundColor: 'white', flexDirection: 'row', padding: 15, borderRadius: 12, marginBottom: 10,
        alignItems: 'center', elevation: 1
    },
    itemName: { fontSize: 14, fontWeight: 'bold', color: '#333' },
    itemQty: { fontSize: 12, color: '#666', marginTop: 2 },
    footer: {
        padding: 20, backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-between',
        borderTopWidth: 1, borderColor: '#eee'
    },
    btnOutline: {
        paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: '#5B4DBC',
        alignItems: 'center'  // width diatur inline berdasarkan isActive
    },
    btnPrimary: {
        paddingVertical: 12, borderRadius: 8, backgroundColor: '#5B4DBC',
        width: '55%', alignItems: 'center'
    }
});