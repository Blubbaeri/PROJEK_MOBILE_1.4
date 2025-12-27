import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    ScrollView,
    TouchableOpacity
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { TransactionStatus } from '../../components/TransactionCard';

export default function TransactionDetailScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    /* ================= PARSING PARAM ================= */
    const transactionId = String(params.id || '');
    const status = (params.status as TransactionStatus) || 'Diproses';
    const qrCode = String(params.qrCode || '');

    /* ================= PARSE ITEMS ================= */
    let items: any[] = [];
    try {
        if (typeof params.items === 'string') {
            items = JSON.parse(params.items);
        }
    } catch (error) {
        console.error('Gagal parse items:', error);
    }

    /* ================= LOGIC ================= */
    // Tombol pengembalian hanya muncul jika status Dipinjam
    const isActive = status === 'Dipinjam';

    /* ================= STATUS CONFIG ================= */
    const statusConfig: Record<TransactionStatus, {
        icon: any;
        color: string;
        label: string;
        description: string;
    }> = {
        Booked: {
            icon: 'calendar-check',
            color: '#FF9800',
            label: 'Booked',
            description: 'Peminjaman telah dibooking'
        },
        Diproses: {
            icon: 'clock',
            color: '#FFA000',
            label: 'Diproses',
            description: 'Peminjaman sedang diproses'
        },
        Dipinjam: {
            icon: 'running',
            color: '#2979FF',
            label: 'Dipinjam',
            description: 'Alat sedang dipinjam'
        },
        Ditolak: {
            icon: 'times-circle',
            color: '#F44336',
            label: 'Ditolak',
            description: 'Peminjaman ditolak'
        },
        Dikembalikan: {
            icon: 'undo-alt',
            color: '#4CAF50',
            label: 'Dikembalikan',
            description: 'Alat sudah dikembalikan'
        },
        Selesai: {
            icon: 'check-circle',
            color: '#757575',
            label: 'Selesai',
            description: 'Transaksi telah selesai'
        }
    };

    const currentStatus = statusConfig[status];

    /* ================= HANDLER ================= */
    const handleReturnPress = () => {
        // TODO: pastikan halaman return tersedia
        router.push({
            pathname: '/(tabs)/return' as any,
            params: { id: transactionId, qrCode }
        });
    };

    /* ================= UI ================= */
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#5B4DBC" />

            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.push('/(tabs)/transaction')}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Detail Transaksi</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }}>
                {/* INFO */}
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
                        <Text
                            style={[
                                styles.statusText,
                                { color: currentStatus.color }
                            ]}
                        >
                            {currentStatus.label}
                        </Text>
                    </View>

                    <Text style={styles.statusDescription}>
                        {currentStatus.description}
                    </Text>
                </View>

                {/* QR */}
                {qrCode !== '' && (
                    <View style={styles.card}>
                        <Text style={styles.label}>Kode QR</Text>
                        <View style={styles.qrRow}>
                            <FontAwesome5 name="qrcode" size={20} color="#5B4DBC" />
                            <Text style={styles.qrCode}>{qrCode}</Text>
                        </View>
                    </View>
                )}

                {/* ITEMS */}
                <Text style={styles.sectionTitle}>Daftar Barang</Text>
                {items.length > 0 ? (
                    items.map((item, index) => (
                        <View key={index} style={styles.itemCard}>
                            <FontAwesome5
                                name="box"
                                size={20}
                                color="#5B4DBC"
                                style={{ marginRight: 15 }}
                            />
                            <View>
                                <Text style={styles.itemName}>
                                    {item.equipmentName}
                                </Text>
                                <Text style={styles.itemQty}>
                                    Jumlah: {item.quantity} • Kondisi:{' '}
                                    {item.condition || 'Baik'}
                                </Text>
                            </View>
                        </View>
                    ))
                ) : (
                    <Text style={{ color: '#999' }}>
                        Tidak ada detail barang.
                    </Text>
                )}
            </ScrollView>

            {/* FOOTER */}
            <View style={styles.footer}>

                {isActive && (
                    <TouchableOpacity
                        style={styles.btnPrimary}
                        onPress={handleReturnPress}
                    >
                        <Text style={{ color: 'white', fontWeight: 'bold' }}>
                            Lanjut Pengembalian
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F7' },
    header: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        backgroundColor: '#5B4DBC',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: 'white' },
    card: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 12,
        marginBottom: 20
    },
    label: { color: '#888', fontSize: 12 },
    value: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    divider: { height: 1, backgroundColor: '#eee', marginVertical: 10 },
    statusRow: { flexDirection: 'row', alignItems: 'center' },
    statusText: { fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
    statusDescription: {
        fontSize: 13,
        color: '#666',
        marginTop: 5,
        fontStyle: 'italic'
    },
    qrRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
    qrCode: { marginLeft: 10, fontSize: 16, fontFamily: 'monospace' },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333'
    },
    itemCard: {
        backgroundColor: 'white',
        flexDirection: 'row',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        alignItems: 'center'
    },
    itemName: { fontSize: 14, fontWeight: 'bold' },
    itemQty: { fontSize: 12, color: '#666' },
    footer: {
        padding: 20,
        backgroundColor: 'white',
        flexDirection: 'row',
        justifyContent: 'center',
        borderTopWidth: 1,
        borderColor: '#eee'
    },
    btnOutline: {
        paddingVertical: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#5B4DBC',
        alignItems: 'center'
    },
    btnPrimary: {
        paddingVertical: 15,
        borderRadius: 10,
        backgroundColor: '#5B4DBC',
        width: '100%',
        alignItems: 'center'
    }
});
