import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    SafeAreaView,
    StatusBar,
    Platform,
    ActivityIndicator,
    Alert
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, FontAwesome5, Entypo } from '@expo/vector-icons';
import { api } from '../../lib/api';

/* --- DATA TYPE INTERFACE --- */
interface AlatItem {
    id: string;
    nama: string;
    jumlahPinjam: number;
    jumlahKembali: number;
}

export default function ReturnItemScreen() {
    const router = useRouter();
    const { borrowingId } = useLocalSearchParams<{ borrowingId: string }>();

    const [daftarAlat, setDaftarAlat] = useState<AlatItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const fetchBorrowedItems = useCallback(async () => {
        if (!borrowingId) {
            Alert.alert("Error", "ID Transaksi tidak ditemukan.");
            router.back();
            return;
        }

        try {
            setLoading(true);
            const response = await api.get(`/api/Borrowing/DetailPeminjaman/${borrowingId}`);

            if (response.data && response.data.items) {
                const mappedData = response.data.items.map((item: any, index: number) => {
                    const detailId = item.id || item.Id || item.borrowingDetailId || index;
                    const equipmentName = item.equipmentName || item.EquipmentName || "Alat";
                    const quantity = item.quantity || item.Quantity || 0;

                    return {
                        id: detailId.toString(),
                        nama: equipmentName,
                        jumlahPinjam: quantity,
                        jumlahKembali: 0,
                    };
                });
                setDaftarAlat(mappedData);
            }
        } catch (error: any) {
            console.error("Fetch Error:", error);
            Alert.alert("Error", "Gagal menyambung ke server Backend.");
        } finally {
            setLoading(false);
        }
    }, [borrowingId]);

    useEffect(() => {
        fetchBorrowedItems();
    }, [fetchBorrowedItems]);

    const incrementQty = (id: string) => {
        setDaftarAlat(prev => prev.map(item =>
            (item.id === id && item.jumlahKembali < item.jumlahPinjam)
                ? { ...item, jumlahKembali: item.jumlahKembali + 1 } : item
        ));
    };

    const decrementQty = (id: string) => {
        setDaftarAlat(prev => prev.map(item =>
            (item.id === id && item.jumlahKembali > 0)
                ? { ...item, jumlahKembali: item.jumlahKembali - 1 } : item
        ));
    };

    /* --- LOGIKA KIRIM DATA (SUDAH DIPERBAIKI) --- */
    const handleConfirmReturn = async () => {
        const selectedItems = daftarAlat.filter(i => i.jumlahKembali > 0);

        if (selectedItems.length === 0) {
            Alert.alert("Peringatan", "Pilih minimal satu barang untuk dikembalikan.");
            return;
        }

        try {
            setSubmitting(true);

            const payload = {
                borrowingId: Number(borrowingId),
                detailIds: selectedItems.map(item => Number(item.id))
            };

            // 1. Kirim data ke backend untuk memproses status pengembalian
            const response = await api.post('/api/BorrowingDetail/return-items', payload);

            if (response.status === 200 || response.status === 204) {

                // 2. Siapkan data item yang dipilih untuk ditampilkan di halaman QR
                // Struktur harus sama dengan yang diekspektasi PagesQr (equipmentName & quantity)
                const itemsForQr = selectedItems.map(item => ({
                    equipmentName: item.nama,
                    quantity: item.jumlahKembali
                }));

                // 3. Pindah ke halaman QR dengan membawa 'selectedItems'
                router.push({
                    pathname: '/(tabs)/pages-qr' as any,
                    params: {
                        id: borrowingId,
                        type: 'return',
                        selectedItems: JSON.stringify(itemsForQr) // <--- INI KUNCINYA
                    }
                });
            }
        } catch (error: any) {
            console.error("Submit Error:", error);
            const msg = error.response?.data?.message || "Gagal memproses pengembalian.";
            Alert.alert("Gagal", msg);
        } finally {
            setSubmitting(false);
        }
    };

    const isAnySelected = daftarAlat.some(item => item.jumlahKembali > 0);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#5B4DBC" />
                <Text style={styles.loadingText}>Sinkronisasi data backend...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#5B4DBC" />

            <View style={styles.header}>
                <SafeAreaView>
                    <View style={styles.headerContent}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
                            <Ionicons name="arrow-back" size={24} color="white" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Konfirmasi Kembali</Text>
                        <TouchableOpacity onPress={fetchBorrowedItems} style={styles.iconBtn}>
                            <Ionicons name="refresh" size={22} color="white" />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </View>

            <FlatList
                data={daftarAlat}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 20 }}
                ListHeaderComponent={() => (
                    <View style={{ marginBottom: 15 }}>
                        <Text style={styles.sectionTitle}>Barang yang Dipinjam</Text>
                        <Text style={styles.sectionSubtitle}>Tentukan jumlah barang yang akan dikembalikan</Text>
                    </View>
                )}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.cardContent}>
                            <View style={styles.iconBox}>
                                <FontAwesome5 name="tools" size={18} color="#5B4DBC" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.toolName}>{item.nama}</Text>
                                <Text style={styles.toolQty}>Batas Kembali: {item.jumlahPinjam} unit</Text>
                            </View>

                            <View style={styles.stepper}>
                                <TouchableOpacity
                                    onPress={() => decrementQty(item.id)}
                                    style={styles.stepBtn}
                                >
                                    <Entypo name="minus" size={18} color={item.jumlahKembali === 0 ? "#CCC" : "#5B4DBC"} />
                                </TouchableOpacity>

                                <Text style={styles.qtyText}>{item.jumlahKembali}</Text>

                                <TouchableOpacity
                                    onPress={() => incrementQty(item.id)}
                                    style={styles.stepBtn}
                                >
                                    <Entypo name="plus" size={18} color={item.jumlahKembali === item.jumlahPinjam ? "#CCC" : "#5B4DBC"} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}
                ListEmptyComponent={() => (
                    <View style={styles.center}>
                        <Text style={{ color: '#999' }}>Tidak ada barang untuk dikembalikan.</Text>
                    </View>
                )}
            />

            <View style={styles.footer}>
                <TouchableOpacity
                    disabled={!isAnySelected || submitting}
                    style={[
                        styles.mainButton,
                        (!isAnySelected || submitting) && { backgroundColor: '#CCC', elevation: 0 }
                    ]}
                    onPress={handleConfirmReturn}
                >
                    {submitting ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <Ionicons name="checkmark-circle-outline" size={22} color="white" style={{ marginRight: 8 }} />
                            <Text style={styles.mainButtonText}>Konfirmasi & Tampilkan QR</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FE' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 10, color: '#666', fontSize: 14 },
    header: {
        backgroundColor: '#5B4DBC',
        paddingBottom: 15,
        paddingTop: Platform.OS === 'android' ? 35 : 0,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20
    },
    headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
    iconBtn: { padding: 5 },
    headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    sectionSubtitle: { fontSize: 13, color: '#888', marginTop: 4 },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 15,
        padding: 16,
        marginBottom: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5
    },
    cardContent: { flexDirection: 'row', alignItems: 'center' },
    iconBox: { backgroundColor: '#F0EFFF', padding: 10, borderRadius: 12, marginRight: 15 },
    toolName: { fontSize: 15, fontWeight: 'bold', color: '#333' },
    toolQty: { fontSize: 12, color: '#666', marginTop: 3 },
    stepper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 10,
        padding: 4
    },
    stepBtn: {
        width: 34,
        height: 34,
        backgroundColor: 'white',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 1
    },
    qtyText: { fontSize: 16, fontWeight: 'bold', marginHorizontal: 15, minWidth: 20, textAlign: 'center' },
    footer: {
        padding: 20,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderColor: '#EEE',
        paddingBottom: Platform.OS === 'ios' ? 35 : 20
    },
    mainButton: {
        backgroundColor: '#5B4DBC',
        height: 55,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4
    },
    mainButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});