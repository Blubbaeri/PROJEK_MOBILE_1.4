import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, SafeAreaView, StatusBar, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, FontAwesome5, Entypo } from '@expo/vector-icons';

interface AlatItem {
    id: string;
    nama: string;
    jumlahPinjam: number; // Total yang dipinjam awal
    jumlahKembali: number; // Yang akan dikembalikan (input user)
}

export default function ReturnItemScreen() {
    const router = useRouter();

    // Inisialisasi data dummy dengan jumlahKembali mulai dari 0
    const [daftarAlat, setDaftarAlat] = useState<AlatItem[]>([
        { id: '1', nama: 'Bor Listrik', jumlahPinjam: 5, jumlahKembali: 0 },
        { id: '2', nama: 'Obeng Set', jumlahPinjam: 1, jumlahKembali: 0 },
    ]);

    // Fungsi Tambah Jumlah
    const incrementQty = (id: string) => {
        setDaftarAlat(prev =>
            prev.map(item => {
                if (item.id === id && item.jumlahKembali < item.jumlahPinjam) {
                    return { ...item, jumlahKembali: item.jumlahKembali + 1 };
                }
                return item;
            })
        );
    };

    // Fungsi Kurang Jumlah
    const decrementQty = (id: string) => {
        setDaftarAlat(prev =>
            prev.map(item => {
                if (item.id === id && item.jumlahKembali > 0) {
                    return { ...item, jumlahKembali: item.jumlahKembali - 1 };
                }
                return item;
            })
        );
    };

    // Button aktif jika ada minimal 1 barang yang jumlahKembali > 0
    const isAnySelected = daftarAlat.some(item => item.jumlahKembali > 0);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#5B4DBC" />

            {/* HEADER */}
            <View style={styles.header}>
                <SafeAreaView>
                    <View style={styles.headerContent}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="white" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Pilih Barang Kembali</Text>
                        <View style={{ width: 24 }} />
                    </View>
                </SafeAreaView>
            </View>

            {/* DAFTAR BARANG */}
            <View style={{ flex: 1 }}>
                <View style={{ padding: 20 }}>
                    <Text style={styles.sectionTitle}>Tentukan Jumlah Pengembalian</Text>
                    <Text style={styles.sectionSubtitle}>Klik + atau - untuk mengatur jumlah barang</Text>
                </View>

                <FlatList
                    data={daftarAlat}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={styles.cardContent}>
                                <View style={styles.iconContainer}>
                                    <FontAwesome5 name="box" size={20} color="#5B4DBC" />
                                </View>

                                <View style={styles.textContainer}>
                                    <Text style={styles.toolName}>{item.nama}</Text>
                                    <Text style={styles.toolQty}>Total Dipinjam: {item.jumlahPinjam}</Text>
                                </View>

                                {/* STEPPER CONTROLLER */}
                                <View style={styles.stepperContainer}>
                                    <TouchableOpacity
                                        onPress={() => decrementQty(item.id)}
                                        style={[styles.stepButton, item.jumlahKembali === 0 && styles.stepButtonDisabled]}
                                    >
                                        <Entypo name="minus" size={18} color={item.jumlahKembali === 0 ? "#CCC" : "#5B4DBC"} />
                                    </TouchableOpacity>

                                    <Text style={styles.qtyText}>{item.jumlahKembali}</Text>

                                    <TouchableOpacity
                                        onPress={() => incrementQty(item.id)}
                                        style={[styles.stepButton, item.jumlahKembali === item.jumlahPinjam && styles.stepButtonDisabled]}
                                    >
                                        <Entypo name="plus" size={18} color={item.jumlahKembali === item.jumlahPinjam ? "#CCC" : "#5B4DBC"} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    )}
                    contentContainerStyle={{ paddingHorizontal: 20 }}
                />
            </View>

            {/* FOOTER BUTTON */}
            <View style={styles.footer}>
                <TouchableOpacity
                    disabled={!isAnySelected}
                    style={[styles.button, !isAnySelected && styles.buttonDisabled]}
                    onPress={() => {
                        // Ambil hanya barang yang jumlahnya > 0
                        const selectedItems = daftarAlat.filter(i => i.jumlahKembali > 0);
                        router.push({
                            pathname: '/(tabs)/return-qr' as any,
                            params: { items: JSON.stringify(selectedItems) }
                        });
                    }}
                >
                    <Text style={styles.buttonText}>Tampilkan QR Pengembalian</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FE' },
    header: {
        backgroundColor: '#5B4DBC',
        paddingBottom: 15,
        paddingTop: Platform.OS === 'android' ? 10 : 0
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginTop: Platform.OS === 'android' ? 30 : 10
    },
    backButton: { padding: 5 },
    headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    sectionSubtitle: { fontSize: 12, color: '#888', marginTop: 2 },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3
    },
    cardContent: { flexDirection: 'row', alignItems: 'center' },
    iconContainer: {
        backgroundColor: '#F0EFFF',
        padding: 10,
        borderRadius: 10,
        marginRight: 12
    },
    textContainer: { flex: 1 },
    toolName: { fontSize: 15, fontWeight: 'bold', color: '#333' },
    toolQty: { fontSize: 12, color: '#666', marginTop: 2 },

    // Stepper Styles
    stepperContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        padding: 4
    },
    stepButton: {
        width: 32,
        height: 32,
        backgroundColor: 'white',
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 1
    },
    stepButtonDisabled: {
        backgroundColor: '#F9F9F9',
        elevation: 0
    },
    qtyText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginHorizontal: 15,
        minWidth: 20,
        textAlign: 'center'
    },

    footer: {
        padding: 20,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderColor: '#EEE'
    },
    button: {
        backgroundColor: '#5B4DBC',
        height: 55,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonDisabled: { backgroundColor: '#CCC' },
    buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});