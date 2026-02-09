import { Entypo, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { api } from '../../lib/api';

/* --- TYPES --- */
// Item Asli dari Backend (Satuan)
interface RawItem {
    id: number;
    equipmentName: string;
    status?: string; // Tambahkan status untuk filtering
    // properti lain gak terlalu penting buat logic ini
}

// Item Group buat Tampilan (UI)
interface GroupedItem {
    name: string;
    totalQty: number;      // Total pinjam (misal: 2)
    returnQty: number;     // Yang mau dibalikin (misal: 1)
    ids: number[];         // List ID asli: [101, 102]
}

export default function ReturnItemScreen() {
    const router = useRouter();
    const { borrowingId } = useLocalSearchParams<{ borrowingId: string }>();

    const [groupedList, setGroupedList] = useState<GroupedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const fetchBorrowedItems = useCallback(async () => {
        if (!borrowingId) return;

        try {
            setLoading(true);
            // 1. Fetch data SATUAN (biar dapet ID aslinya)
            const response = await api.get(`/api/BorrowingDetail/with-equipment/${borrowingId}?excludeReturned=true`);
            const rawData: RawItem[] = response.data.data || [];

            // 2. Logic GROUPING (Satuan -> Group)
            const groups: Record<string, GroupedItem> = {};

            rawData.forEach(item => {
                // FILTER: Hanya ambil yang statusnya "Dipinjam"
                // Kita perketat validasinya untuk cegah status "Dikembalikan" / "Pengajuan_Kembalian" muncul
                const currentStatus = item.status ? item.status.toLowerCase() : '';
                if (currentStatus !== 'dipinjam') {
                    return;
                }

                const name = item.equipmentName || "Alat";

                if (!groups[name]) {
                    groups[name] = {
                        name: name,
                        totalQty: 0,
                        returnQty: 0,  // Default 0 atau mau langsung max (totalQty) terserah
                        ids: []
                    };
                }
                groups[name].totalQty += 1;
                groups[name].returnQty += 1; // Default kita set langsung balikin semua (bisa diubah)
                groups[name].ids.push(item.id);
            });

            setGroupedList(Object.values(groups));

        } catch (error: any) {
            console.error("Fetch Error:", error);
            Alert.alert("Error", "Gagal data backend.");
        } finally {
            setLoading(false);
        }
    }, [borrowingId]);

    useEffect(() => {
        fetchBorrowedItems();
    }, [fetchBorrowedItems]);

    // Handle (+)
    const incrementQty = (name: string) => {
        setGroupedList(prev => prev.map(item =>
            (item.name === name && item.returnQty < item.totalQty)
                ? { ...item, returnQty: item.returnQty + 1 } : item
        ));
    };

    // Handle (-)
    const decrementQty = (name: string) => {
        setGroupedList(prev => prev.map(item =>
            (item.name === name && item.returnQty > 0)
                ? { ...item, returnQty: item.returnQty - 1 } : item
        ));
    };

    const handleConfirmReturn = async () => {
        // Ambil item yang quantity baliknya > 0
        const itemsToReturn = groupedList.filter(i => i.returnQty > 0);

        if (itemsToReturn.length === 0) {
            Alert.alert("Peringatan", "Pilih minimal satu barang.");
            return;
        }

        try {
            setSubmitting(true);

            // 3. Logic UNWRAP (Ambil ID secara acak/berurutan sejumlah returnQty)
            let allDetailIds: number[] = [];

            itemsToReturn.forEach(group => {
                // Ambil ID sebanyak returnQty (misal balikin 1, ambil index 0. Balikin 2, ambil index 0,1)
                const idsToSend = group.ids.slice(0, group.returnQty);
                allDetailIds = [...allDetailIds, ...idsToSend];
            });

            const payload = {
                borrowingId: Number(borrowingId),
                detailIds: allDetailIds, // Kirim list ID asli
                returnedBy: "user" // Opsional, backend udah handle via token biasanya
            };

            const response = await api.post('/api/BorrowingDetail/return-items', payload);

            if (response.status === 200 || response.status === 204) {
                // Siapin data buat QR (Grouped bentuknya)
                const itemsForQr = itemsToReturn.map(item => ({
                    equipmentName: item.name,
                    quantity: item.returnQty
                }));

                router.push({
                    pathname: '/(tabs)/pages-qr',
                    params: {
                        id: borrowingId,
                        type: 'return',
                        selectedItems: JSON.stringify(itemsForQr)
                    }
                });
            }
        } catch (error: any) {
            const msg = error.response?.data?.message || "Gagal proses.";
            Alert.alert("Gagal", msg);
        } finally {
            setSubmitting(false);
        }
    };

    const isAnySelected = groupedList.some(item => item.returnQty > 0);

    // ... (SISA RENDER UI SAMA KAYA SEBELUMNYA, CUMA GANTI VARIABLE STATE AJA)
    // Render item pake: item.name, item.totalQty, item.returnQty

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#5B4DBC" />
                <Text style={styles.loadingText}>Memuat data...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#5B4DBC" />
            {/* Header sama kayak sebelumnya */}
            <View style={styles.header}>
                <SafeAreaView>
                    <View style={styles.headerContent}>
                        <TouchableOpacity
                            onPress={() => router.push({
                                pathname: '/(tabs)/transaction-detail' as any,
                                params: { id: borrowingId }
                            })}
                            style={styles.headerBtnBox}
                        >
                            <Ionicons name="arrow-back" size={24} color="white" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Konfirmasi Kembali</Text>
                        {/* Tombol Refresh */}
                        <TouchableOpacity onPress={fetchBorrowedItems} style={styles.headerBtnBox}>
                            <Ionicons name="refresh" size={22} color="white" />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </View>

            <FlatList
                data={groupedList}
                keyExtractor={(item) => item.name}
                contentContainerStyle={{ padding: 20 }}
                ListHeaderComponent={() => (
                    <View style={{ marginBottom: 15 }}>
                        <Text style={styles.sectionTitle}>Barang yang Dipinjam</Text>
                        <Text style={styles.sectionSubtitle}>Atur jumlah barang yang dikembalikan</Text>
                    </View>
                )}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.cardContent}>
                            <View style={styles.iconBox}>
                                <FontAwesome5 name="tools" size={18} color="#5B4DBC" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.toolName}>{item.name}</Text>
                                <Text style={styles.toolQty}>Dipinjam: {item.totalQty} unit</Text>
                            </View>

                            <View style={styles.stepper}>
                                <TouchableOpacity
                                    onPress={() => decrementQty(item.name)}
                                    style={styles.stepBtn}
                                >
                                    <Entypo name="minus" size={18} color={item.returnQty === 0 ? "#CCC" : "#5B4DBC"} />
                                </TouchableOpacity>

                                <Text style={styles.qtyText}>{item.returnQty}</Text>

                                <TouchableOpacity
                                    onPress={() => incrementQty(item.name)}
                                    style={styles.stepBtn}
                                >
                                    <Entypo name="plus" size={18} color={item.returnQty >= item.totalQty ? "#CCC" : "#5B4DBC"} />
                                </TouchableOpacity>
                            </View>
                        </View>
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
                    {submitting ? <ActivityIndicator color="white" /> : (
                        <>
                            <Ionicons name="checkmark-circle-outline" size={22} color="white" style={{ marginRight: 8 }} />
                            <Text style={styles.mainButtonText}>Konfirmasi & QR</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

// ... styles sama kayak sebelumnya
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FE' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 10, color: '#666', fontSize: 14 },
    header: {
        backgroundColor: '#5B4DBC',
        paddingBottom: 20,
        paddingTop: Platform.OS === 'android' ? 40 : 10,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20
    },
    headerBtnBox: {
        backgroundColor: 'rgba(255, 255, 255, 0.18)',
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center'
    },
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