import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import Checkbox from 'expo-checkbox';
import axios from 'axios';

export default function TransactionDetailScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const [loading, setLoading] = useState(true);
    const [borrowingData, setBorrowingData] = useState<any>(null);
    const [itemList, setItemList] = useState<any[]>([]);

    const API_URL = `http://192.168.100.230:5234/api/borrowing/${params.id}`;

    // --- FETCH DETAIL DARI BACKEND ---
    useEffect(() => {
        const fetchDetail = async () => {
            try {
                setLoading(true);
                const response = await axios.get(API_URL);
                const result = response.data.data; // Mengambil object 'data' dari backend

                setBorrowingData(result);

                // Mapping items dari backend DTO (EquipmentName & Status)
                if (result.items) {
                    setItemList(result.items.map((item: any) => ({
                        ...item,
                        selected: true // Default untuk dikembalikan
                    })));
                }
            } catch (error) {
                console.error("Gagal mengambil detail:", error);
                Alert.alert("Error", "Gagal memuat rincian barang dari server.");
            } finally {
                setLoading(false);
            }
        };

        if (params.id) fetchDetail();
    }, [params.id]);

    if (loading) {
        return (
            <View style={styles.center}><ActivityIndicator size="large" color="#5B4DBC" /></View>
        );
    }

    // LOGIKA STATUS SESUAI BACKEND (lowercase)
    const status = borrowingData?.status?.toLowerCase() || "";
    const isDipinjam = status === 'dipinjam';
    const isBooked = status === 'booked';

    const handleReturn = () => {
        const selectedItems = itemList.filter(i => i.selected);
        if (selectedItems.length === 0) return Alert.alert("Pilih Barang", "Pilih barang yang mau dikembalikan.");

        // Kirim data ke QR Pengembalian
        router.push({
            pathname: '/(tabs)/booking-qr',
            params: {
                data: JSON.stringify({
                    id: borrowingData.id,
                    items: selectedItems,
                    isReturn: true,
                    status: 'dikembalikan'
                })
            }
        });
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#5B4DBC" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color="white" /></TouchableOpacity>
                <Text style={styles.headerTitle}>Detail Transaksi</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }}>
                {/* Info Card */}
                <View style={styles.card}>
                    <Text style={styles.label}>Transaction ID</Text>
                    <Text style={styles.value}>TXN-{String(borrowingData?.id).padStart(4, '0')}</Text>
                    <View style={styles.divider} />
                    <Text style={styles.label}>Status Saat Ini</Text>
                    <View style={styles.statusRow}>
                        <FontAwesome5
                            name={isDipinjam ? "box-open" : "clock"}
                            size={16}
                            color={isDipinjam ? "#43A047" : "#FFA000"}
                        />
                        <Text style={[styles.statusText, { color: isDipinjam ? "#43A047" : "#FFA000" }]}>
                            {status.toUpperCase()}
                        </Text>
                    </View>
                </View>

                {isBooked && (
                    <View style={styles.infoWarning}>
                        <Ionicons name="information-circle" size={18} color="#E65100" />
                        <Text style={styles.infoWarningText}>Barang belum diambil. Silakan scan QR booking di petugas lab.</Text>
                    </View>
                )}

                <Text style={styles.sectionTitle}>Rincian Barang</Text>
                {itemList.length > 0 ? (
                    itemList.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            disabled={!isDipinjam}
                            onPress={() => {
                                const newItems = [...itemList];
                                newItems[index].selected = !newItems[index].selected;
                                setItemList(newItems);
                            }}
                            style={[styles.itemCard, item.selected && isDipinjam && styles.selectedCard]}
                        >
                            <FontAwesome5 name="box" size={20} color="#5B4DBC" style={{ marginRight: 15 }} />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.itemName}>{item.equipmentName}</Text>
                                <Text style={styles.itemQty}>Status: {item.status}</Text>
                            </View>
                            {isDipinjam && (
                                <Checkbox
                                    value={item.selected}
                                    onValueChange={() => {
                                        const newItems = [...itemList];
                                        newItems[index].selected = !newItems[index].selected;
                                        setItemList(newItems);
                                    }}
                                    color={item.selected ? '#5B4DBC' : undefined}
                                />
                            )}
                        </TouchableOpacity>
                    ))
                ) : (
                    <Text style={styles.emptyText}>Tidak ada barang dalam transaksi ini.</Text>
                )}
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.btnOutline} onPress={() => router.back()}><Text style={{ color: '#5B4DBC', fontWeight: 'bold' }}>Kembali</Text></TouchableOpacity>
                {isDipinjam && (
                    <TouchableOpacity style={styles.btnPrimary} onPress={handleReturn}><Text style={{ color: 'white', fontWeight: 'bold' }}>Lanjut Pengembalian</Text></TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F7' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, backgroundColor: '#5B4DBC', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: 'white' },
    card: { backgroundColor: 'white', padding: 20, borderRadius: 12, marginBottom: 15, elevation: 1 },
    label: { color: '#888', fontSize: 11, marginBottom: 4 },
    value: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    divider: { height: 1, backgroundColor: '#eee', marginVertical: 10 },
    statusRow: { flexDirection: 'row', alignItems: 'center' },
    statusText: { fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
    infoWarning: { backgroundColor: '#FFF3E0', padding: 12, borderRadius: 10, flexDirection: 'row', alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#FFE0B2' },
    infoWarningText: { color: '#E65100', fontSize: 12, marginLeft: 10, flex: 1 },
    sectionTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 10, color: '#333' },
    itemCard: { backgroundColor: 'white', flexDirection: 'row', padding: 15, borderRadius: 12, marginBottom: 10, alignItems: 'center', elevation: 1, borderWidth: 1, borderColor: 'transparent' },
    selectedCard: { borderColor: '#5B4DBC', backgroundColor: '#F3F0FF' },
    itemName: { fontSize: 14, fontWeight: 'bold' },
    itemQty: { fontSize: 12, color: '#666' },
    emptyText: { textAlign: 'center', marginTop: 20, color: '#999' },
    footer: { padding: 20, backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderColor: '#eee' },
    btnOutline: { paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: '#5B4DBC', width: '40%', alignItems: 'center' },
    btnPrimary: { paddingVertical: 12, borderRadius: 8, backgroundColor: '#5B4DBC', width: '55%', alignItems: 'center' }
});