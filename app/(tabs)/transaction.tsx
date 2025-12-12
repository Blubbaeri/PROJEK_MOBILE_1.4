import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, StatusBar, Alert } from 'react-native';
import axios from 'axios';
import { useFocusEffect } from 'expo-router';

// --- IMPORT KOMPONEN ---
// Komponen dipisah agar kode utama tetap bersih
import TransactionHeader from '../../components/TransactionHeader';
import TransactionList from '../../components/TransactionList';
import { Transaction } from '../../components/TransactionCard';

// --- KONFIGURASI SERVER ---
// Pastikan IP Address sama dengan yang ada di HomeScreen
const IP_ADDRESS = "172.20.10.2";
const PORT = "5234";

// Endpoint API
// Perhatikan: Di sini ada hardcode '/user/1', artinya kita mengambil data milik User ID 1.
// Nanti jika sudah ada fitur Login, angka '1' ini harus diganti dengan ID user yang sedang login.
const API_URL = `http://${IP_ADDRESS}:${PORT}/api/borrowing/user/1`;

const TransactionsScreen = () => {
    // --- STATE MANAGEMENT ---

    // transactions: Menyimpan semua data riwayat yang diambil dari database
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    // Loading state: Untuk menampilkan indikator putar-putar saat data sedang diambil
    const [loading, setLoading] = useState(true);

    // Refreshing state: Untuk indikator saat user menarik layar ke bawah
    const [refreshing, setRefreshing] = useState(false);

    // --- STATE FILTER ---
    // searchQuery: Menyimpan teks yang diketik di kolom cari
    const [searchQuery, setSearchQuery] = useState('');

    // selectedTab: Menyimpan status Tab mana yang aktif (All / Borrowing / Returned)
    const [selectedTab, setSelectedTab] = useState<'All' | 'Borrowing' | 'Returned'>('All');

    // --- FUNGSI 1: MENGAMBIL DATA (FETCHING) ---
    const fetchTransactions = async () => {
        // Hanya tampilkan loading penuh jika bukan sedang refresh (tarik layar)
        if (!refreshing) setLoading(true);

        try {
            console.log(`[Transaction] Mulai request ke: ${API_URL}`);

            // Timeout 15000ms (15 detik) agar aplikasi tidak bengong selamanya jika server mati
            const response = await axios.get(API_URL, { timeout: 15000 });

            console.log("[Transaction] Data diterima");

            const apiResponse = response.data;

            // LOGIKA PEMBERSIHAN DATA (SAFETY CHECK)
            // Kadang backend mengirim Array langsung: [{}, {}]
            // Kadang backend mengirim Object: { data: [{}, {}], status: 200 }
            // Kode di bawah ini menangani kedua format tersebut agar aplikasi tidak error.
            let cleanData = [];
            if (Array.isArray(apiResponse)) {
                cleanData = apiResponse;
            } else if (apiResponse && Array.isArray(apiResponse.data)) {
                cleanData = apiResponse.data;
            } else {
                console.warn("Format data backend tidak dikenali, menampilkan list kosong.");
            }

            setTransactions(cleanData);

        } catch (error: any) {
            console.error("[Transaction] Gagal ambil data:", error.message);
            // Alert opsional, bisa diaktifkan jika ingin memberitahu user
            // Alert.alert("Error", "Gagal mengambil data transaksi.");
        } finally {
            // Matikan loading baik sukses maupun gagal
            setLoading(false);
            setRefreshing(false);
        }
    };

    // --- FUNGSI 2: PEMICU SAAT LAYAR DIBUKA ---
    // useFocusEffect menjamin data selalu baru setiap kali user masuk ke halaman ini
    useFocusEffect(
        useCallback(() => {
            fetchTransactions();
        }, [])
    );

    // Fungsi khusus untuk menangani Refresh (Tarik Layar)
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchTransactions();
    }, []);

    // --- FUNGSI 3: LOGIKA FILTERING (PENTING) ---
    // useMemo digunakan untuk OPTIMALISASI KINERJA.
    // Kode di dalam useMemo hanya akan dijalankan ulang jika 'transactions', 'selectedTab', atau 'searchQuery' berubah.
    // Jika user menekan tombol lain yang tidak berhubungan, filter ini tidak akan dihitung ulang (hemat baterai/CPU).
    const filteredTransactions = useMemo(() => {
        // Jika data masih kosong, kembalikan array kosong
        if (!transactions) return [];

        return transactions.filter((item) => {
            // Ambil status transaksi, ubah ke Huruf Besar agar pencocokan tidak gagal karena huruf kecil/besar
            const statusUpper = item.status ? item.status.toUpperCase() : '';

            // A. LOGIKA FILTER TAB (KATEGORI STATUS)
            let statusMatch = true;
            if (selectedTab === 'Borrowing') {
                // Tab Peminjaman menampilkan status yang masih berjalan
                statusMatch = ['PENDING', 'BOOKING', 'SEDANG_DIPINJAM', 'BORROWED', 'APPROVED'].includes(statusUpper);
            } else if (selectedTab === 'Returned') {
                // Tab Pengembalian menampilkan status yang sudah selesai atau batal
                statusMatch = ['SELESAI', 'RETURNED', 'DITOLAK', 'REJECTED', 'DIBATALKAN', 'CANCELLED'].includes(statusUpper);
            }

            // B. LOGIKA PENCARIAN (SEARCH)
            let searchMatch = true;
            if (searchQuery) {
                const query = searchQuery.toLowerCase(); // Ubah input user ke huruf kecil

                // Cek nama barang di dalam daftar item (Array nested)
                // item.items mungkin kosong, jadi kita kasih default [] agar tidak error
                const itemList = item.items || [];

                // some() mengecek apakah "ADA SALAH SATU" barang yang namanya cocok
                const itemNameMatch = itemList.some((i: any) =>
                    (i.equipmentName && i.equipmentName.toLowerCase().includes(query))
                );

                // Cek juga kecocokan kode QR
                const qrMatch = item.qrCode && item.qrCode.toLowerCase().includes(query);

                // Cek juga kecocokan ID Transaksi
                const idMatch = item.id ? String(item.id).includes(query) : false;

                // Tampilkan jika salah satu kriteria pencarian terpenuhi
                searchMatch = itemNameMatch || qrMatch || idMatch;
            }

            // Item akan ditampilkan hanya jika Status COCOK (dan) Pencarian COCOK
            return statusMatch && searchMatch;
        });
    }, [transactions, selectedTab, searchQuery]);

    // --- TAMPILAN UI ---
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#5B4DBC" />

            {/* HEADER: Berisi Judul, Search Bar, dan Tab Pilihan */}
            <TransactionHeader
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedTab={selectedTab}
                setSelectedTab={setSelectedTab}
            />

            {/* LIST: Menampilkan daftar hasil filter */}
            {/* Kita mengoper 'filteredTransactions' bukan 'transactions' asli */}
            <TransactionList
                data={filteredTransactions}
                loading={loading}
                refreshing={refreshing}
                onRefresh={onRefresh}
                searchQuery={searchQuery}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#5B4DBC' },
});

export default TransactionsScreen;