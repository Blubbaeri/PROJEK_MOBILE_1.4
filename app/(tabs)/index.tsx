import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import axios from 'axios'; // Library untuk melakukan request HTTP ke Backend
import { useFocusEffect } from 'expo-router'; // Hook untuk mendeteksi saat layar aktif/fokus
import { useCart } from '../../context/CartContext'; // Mengambil fungsi keranjang dari Global State
import Toast from 'react-native-toast-message'; // Library untuk menampilkan notifikasi pop-up

// --- IMPORT KOMPONEN TAMPILAN ---
// Memisahkan komponen Header dan List agar kode di file ini tidak terlalu panjang
import HomeHeader from '../../components/HomeHeader';
import EquipmentList from '../../components/EquipmentList';

// --- KONFIGURASI SERVER ---
// IP Address dipisahkan ke variabel agar mudah diganti jika pindah jaringan Wi-Fi.
const IP_ADDRESS = "192.168.100.2";
const PORT = "5234";
const API_URL = `http://${IP_ADDRESS}:${PORT}/api/equipment`;

// --- DATA KATEGORI STATIS ---
// Daftar kategori ini digunakan hanya untuk tampilan tombol filter.
const CATEGORY_CHIPS = [
    { id: 1, name: 'Administrative' },
    { id: 2, name: 'Caliper' },
    { id: 3, name: 'Cutting Tools' },
    { id: 4, name: 'Measuring' },
    { id: 5, name: 'Hand Tools' }
];

export default function HomeScreen() {
    // Mengambil fungsi addToCart dari Context agar bisa dipakai di sini
    const { addToCart } = useCart();

    // --- STATE MANAGEMENT (Penyimpanan Data Sementara) ---

    // equipment: Array untuk menyimpan data barang yang diambil dari API
    const [equipment, setEquipment] = useState<any[]>([]);

    // selectedCategory: Menyimpan nama kategori yang sedang dipilih user (null artinya All)
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    // searchQuery: Menyimpan teks yang diketik user di kolom pencarian
    const [searchQuery, setSearchQuery] = useState('');

    // State untuk indikator loading (saat ambil data) dan refreshing (saat tarik layar)
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // --- FUNGSI 1: MENGAMBIL DATA DARI SERVER (FETCH DATA) ---
    const fetchData = async (categoryName: string | null) => {
        setIsLoading(true); // Aktifkan indikator loading sebelum request dimulai
        try {
            let url = API_URL; // Gunakan URL default (ambil semua data)

            // Logika untuk mengubah URL jika ada kategori yang dipilih
            if (categoryName && categoryName !== 'All') {
                // encodeURIComponent digunakan untuk mengamankan teks URL (misal spasi jadi %20)
                const encodedName = encodeURIComponent(categoryName);
                url = `${API_URL}/category/${encodedName}`;
                console.log("Request ke URL Kategori:", url);
            } else {
                console.log("Request ke URL Semua Data:", url);
            }

            // Melakukan request GET ke Backend menggunakan Axios
            const response = await axios.get(url);

            // Validasi Data: Memastikan response adalah Array. 
            // Jika bukan array (misal error), gunakan array kosong [] agar aplikasi tidak crash.
            const data = Array.isArray(response.data) ? response.data : (response.data.data || []);

            // Simpan data yang didapat ke dalam State equipment
            setEquipment(data);

        } catch (error) {
            console.error("Gagal mengambil data:", error);
            setEquipment([]); // Kosongkan data jika terjadi error
        } finally {
            // Matikan indikator loading baik sukses maupun gagal
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    // --- FUNGSI 2: PEMICU OTOMATIS (TRIGGER) ---
    // useFocusEffect akan menjalankan kode di dalamnya setiap kali layar ini menjadi aktif.
    useFocusEffect(
        useCallback(() => {
            // Panggil fetchData setiap kali variabel selectedCategory berubah
            fetchData(selectedCategory);
        }, [selectedCategory])
    );

    // --- FUNGSI 3: FILTER PENCARIAN (CLIENT SIDE) ---
    // Memfilter data yang sudah ada di memori berdasarkan teks pencarian.
    // Ini dilakukan di sisi aplikasi (bukan request baru) agar responsif.
    const filteredData = equipment.filter(item =>
        item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // --- FUNGSI 4: MENAMBAH KE KERANJANG ---
    const handleAddToCart = (item: any) => {
        // Validasi: Cek apakah stok barang masih ada
        if (item.stock <= 0) {
            Toast.show({ type: 'error', text1: 'Stok Habis!', text2: 'Barang ini sudah tidak tersedia.' });
            return;
        }

        // Langkah 1: Masukkan data barang ke Global Context (Cart)
        addToCart({
            id: item.id,
            name: item.name,
            price: item.price || 0,
            quantity: 1,
            image: item.image,
            stock: item.stock
        });

        // Langkah 2: Update Tampilan Stok Secara Langsung (Optimistic Update)
        // Kita mengurangi stok di tampilan user tanpa menunggu respon server
        // agar aplikasi terasa cepat.
        setEquipment(currentData =>
            currentData.map(eq => {
                if (eq.id === item.id) {
                    return { ...eq, stock: eq.stock - 1 }; // Kurangi stok sebanyak 1
                }
                return eq; // Barang lain tidak berubah
            })
        );

        // Tampilkan notifikasi sukses
        Toast.show({ type: 'success', text1: 'Berhasil', text2: `${item.name} masuk keranjang` });
    };

    // Fungsi yang dijalankan saat user menarik layar ke bawah (Refresh)
    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchData(selectedCategory);
    };

    // --- STRUKTUR TAMPILAN (UI) ---
    return (
        <View style={styles.mainContainer}>
            <StatusBar barStyle="light-content" backgroundColor="#5B4DBC" />

            {/* HEADER: Berisi kolom pencarian dan tombol kategori */}
            <HomeHeader
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery} // Mengirim fungsi untuk update teks pencarian
                categories={CATEGORY_CHIPS}
                selectedCategory={selectedCategory}

                // Callback saat kategori diklik
                setSelectedCategory={(catName) => {
                    setSelectedCategory(catName); // State berubah -> useFocusEffect jalan -> fetchData jalan
                }}
            />

            {/* BODY: Berisi daftar barang */}
            <View style={styles.bodyContainer}>
                <EquipmentList
                    data={filteredData} // Data yang ditampilkan adalah hasil filter
                    loading={isLoading}
                    refreshing={isRefreshing}
                    onRefresh={handleRefresh}
                    onAddToCart={handleAddToCart} // Mengirim fungsi keranjang ke komponen anak
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: '#5B4DBC' },
    bodyContainer: {
        flex: 1,
        backgroundColor: '#F5F5F7',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        overflow: 'hidden',
        paddingTop: 10
    }
});