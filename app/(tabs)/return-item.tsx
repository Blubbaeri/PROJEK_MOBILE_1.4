import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, SafeAreaView, StatusBar, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

interface AlatItem {
    id: string;
    nama: string;
    jumlah: number;
    isSelected: boolean;
}

export default function ReturnItemScreen() {
    const router = useRouter();

    // Data dummy - nanti bisa disesuaikan dengan data asli
    const [daftarAlat, setDaftarAlat] = useState<AlatItem[]>([
        { id: '1', nama: 'Bor Listrik', jumlah: 2, isSelected: false },
        { id: '2', nama: 'Obeng Set', jumlah: 1, isSelected: false },
    ]);

    const toggleSelect = (id: string) => {
        setDaftarAlat(prev =>
            prev.map(item => item.id === id ? { ...item, isSelected: !item.isSelected } : item)
        );
    };

    const isAnySelected = daftarAlat.some(item => item.isSelected);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#5B4DBC" />

            {/* HEADER UNGU (Sama persis dengan Detail Transaksi lu) */}
            <View style={styles.header}>
                <SafeAreaView>
                    <View style={styles.headerContent}>
                        <TouchableOpacity
                            onPress={() => router.back()}
                            style={styles.backButton}
                        >
                            <Ionicons name="arrow-back" size={24} color="white" />
                        </TouchableOpacity>

                        <Text style={styles.headerTitle}>Pilih Barang Kembali</Text>

                        {/* Spacer biar judul tetep di tengah */}
                        <View style={{ width: 24 }} />
                    </View>
                </SafeAreaView>
            </View>

            {/* DAFTAR BARANG */}
            <View style={{ flex: 1 }}>
                <View style={{ padding: 20 }}>
                    <Text style={styles.sectionTitle}>Daftar Barang yang Dipinjam</Text>
                </View>

                <FlatList
                    data={daftarAlat}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => toggleSelect(item.id)}
                            style={styles.card}
                        >
                            <View style={styles.cardContent}>
                                <View style={styles.iconContainer}>
                                    <FontAwesome5 name="box" size={20} color="#5B4DBC" />
                                </View>
                                <View style={styles.textContainer}>
                                    <Text style={styles.toolName}>{item.nama}</Text>
                                    <Text style={styles.toolQty}>Jumlah: {item.jumlah}</Text>
                                </View>
                                <Ionicons
                                    name={item.isSelected ? "checkbox" : "square-outline"}
                                    size={26}
                                    color="#5B4DBC"
                                />
                            </View>
                        </TouchableOpacity>
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
                        const selectedItems = daftarAlat.filter(i => i.isSelected);
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

    // Header Style (Flat Purple)
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
    backButton: {
        padding: 5,
    },
    headerTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center'
    },

    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 5 },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
    },
    cardContent: { flexDirection: 'row', alignItems: 'center' },
    iconContainer: {
        backgroundColor: '#F0EFFF',
        padding: 10,
        borderRadius: 10,
        marginRight: 15
    },
    textContainer: { flex: 1 },
    toolName: { fontSize: 15, fontWeight: 'bold', color: '#333' },
    toolQty: { fontSize: 13, color: '#666', marginTop: 2 },

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