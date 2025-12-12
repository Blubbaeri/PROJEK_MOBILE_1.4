import React from 'react';
import { View, FlatList, ActivityIndicator, Text, StyleSheet } from 'react-native';
import EquipmentCard from './EquipmentCard'; // Komponen kartu satuan yang akan diulang-ulang

// --- DEFINISI TIPE PROPS (INTERFACE) ---
// Bagian ini adalah "Kontrak". Kita memberitahu komponen Induk (Home) bahwa:
// "Kalau mau pakai komponen ini, wajib kirim data, status loading, dan fungsi add to cart."
interface EquipmentListProps {
    data: any[];                    // Array data barang yang akan ditampilkan
    loading: boolean;               // Status apakah sedang loading atau tidak
    refreshing: boolean;            // Status apakah sedang refresh (tarik layar)
    onRefresh: () => void;          // Fungsi yang dijalankan saat layar ditarik
    cart?: any[];                   // Data keranjang (opsional, ditandai dengan tanda tanya)
    onAddToCart: (item: any) => void; // Fungsi yang wajib dikirim untuk menangani klik tombol tambah
}

export default function EquipmentList({
    data,
    loading,
    refreshing,
    onRefresh,
    onAddToCart
}: EquipmentListProps) {

    // --- KONDISI 1: SEDANG LOADING ---
    // Jika data belum siap (loading = true), tampilkan indikator putar-putar (spinner).
    // Kita return di sini agar kode bawahnya tidak dijalankan dulu.
    if (loading) {
        return (
            <View style={styles.center}>
                {/* ActivityIndicator adalah komponen bawaan React Native untuk loading spinner */}
                <ActivityIndicator size="large" color="white" />
            </View>
        );
    }

    // --- KONDISI 2: DATA KOSONG ---
    // Jika loading selesai TAPI datanya kosong atau null.
    // Tampilkan pesan teks agar user tidak bingung melihat layar kosong.
    if (!data || data.length === 0) {
        return (
            <View style={styles.center}>
                <Text style={{ color: 'white' }}>No equipment found.</Text>
            </View>
        );
    }

    // --- KONDISI 3: DATA ADA (RENDER LIST) ---
    // Menggunakan FlatList, komponen paling efisien untuk menampilkan banyak data.
    return (
        <FlatList
            data={data} // Sumber data array yang akan ditampilkan

            // keyExtractor: Memberi ID unik ke setiap item agar React tahu mana yang berubah.
            // Penting untuk performa agar tidak lag.
            keyExtractor={(item) => item.id.toString()}

            // numColumns={2}: Mengatur tampilan menjadi 2 kolom (Grid), bukan list ke bawah.
            numColumns={2}

            // contentContainerStyle: Mengatur jarak (padding) di sekeliling list.
            // paddingBottom: 100 diberikan agar item paling bawah tidak tertutup tombol navigasi.
            contentContainerStyle={{ padding: 10, paddingBottom: 100 }}

            // Fitur Tarik untuk Refresh (Pull to Refresh)
            refreshing={refreshing} // Indikator loading kecil di atas saat ditarik
            onRefresh={onRefresh}   // Fungsi yang dipanggil saat ditarik

            // renderItem: Ini adalah "Cetakan". Fungsi ini akan dijalankan berulang-ulang
            // sebanyak jumlah data yang ada.
            renderItem={({ item }) => (
                <EquipmentCard
                    data={item} // Kirim data detail barang ke komponen Kartu
                    // Saat tombol di kartu ditekan, panggil fungsi onAddToCart milik Induk
                    onAdd={() => onAddToCart(item)}
                />
            )}
        />
    );
}

const styles = StyleSheet.create({
    // Style untuk menengahkan konten (Loading / Pesan Kosong)
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50
    }
});