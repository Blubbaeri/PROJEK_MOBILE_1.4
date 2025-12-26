

//app/(tabs)/transaction.tsx

    import React, { useState, useCallback, useMemo } from 'react';
    import { View, StyleSheet, StatusBar } from 'react-native';
    import axios from 'axios';
    import { useFocusEffect } from 'expo-router';

    // Import Komponen
    import TransactionHeader from '../../components/TransactionHeader';
    import TransactionList from '../../components/TransactionList';
    import { Transaction, TransactionStatus } from '../../components/TransactionCard';

    // --- KONFIGURASI SERVER ---
    //const IP_ADDRESS = "192.168.100.4";
    const IP_ADDRESS = "10.1.6.125";
    const PORT = "5234";
    const API_URL = `http://${IP_ADDRESS}:${PORT}/api/borrowing/user/1`;

    // --- KONSTANTA STATUS ---
    // ⭐ PERUBAHAN: Tambahkan "BOOKED" ke status yang ada
    const BORROWING_STATUSES: TransactionStatus[] = ['Booked', 'Diproses', 'Dipinjam'];
    const RETURNED_STATUSES: TransactionStatus[] = ['Ditolak', 'Dikembalikan', 'Selesai'];

    const TransactionsScreen = () => {
        // --- STATE MANAGEMENT ---
        const [transactions, setTransactions] = useState<Transaction[]>([]);
        const [loading, setLoading] = useState(true);
        const [refreshing, setRefreshing] = useState(false);
        const [searchQuery, setSearchQuery] = useState('');
        const [selectedTab, setSelectedTab] = useState<'All' | 'Borrowing' | 'Returned'>('All');

        // --- FUNGSI 1: MENGAMBIL DATA (FETCHING) ---
        const fetchTransactions = async () => {
            if (!refreshing) setLoading(true);

            try {
                console.log(`[Transaction] Mulai request ke: ${API_URL}`);
                const response = await axios.get(API_URL, { timeout: 15000 });
                console.log("[Transaction] Data diterima");

                const apiResponse = response.data;

                // LOGIKA PEMBERSIHAN DATA (SAFETY CHECK)
                let cleanData = [];
                if (Array.isArray(apiResponse)) {
                    cleanData = apiResponse;
                } else if (apiResponse && Array.isArray(apiResponse.data)) {
                    cleanData = apiResponse.data;
                } else {
                    console.warn("Format data backend tidak dikenali, menampilkan list kosong.");
                }

                // ⭐ PERUBAHAN: Normalisasi status (case-insensitive)
                const normalizedData = cleanData.map((item: any) => ({
                    ...item,
                    status: item.status ? String(item.status).trim() : 'BOOKED'
                }));

                setTransactions(normalizedData);

            } catch (error: any) {
                console.error("[Transaction] Gagal ambil data:", error.message);
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        };

        // --- FUNGSI 2: PEMICU SAAT LAYAR DIBUKA ---
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

        // --- FUNGSI 3: LOGIKA FILTERING ---
        const filteredTransactions = useMemo(() => {
            // Jika data masih kosong, kembalikan array kosong
            if (!transactions || transactions.length === 0) return [];

            return transactions.filter((item) => {
                // Ambil status transaksi
                const status = item.status || '';

                // A. LOGIKA FILTER TAB (KATEGORI STATUS)
                let statusMatch = true;
                if (selectedTab === 'Borrowing') {
                    // Tab Peminjaman menampilkan status yang masih berjalan
                    // ⭐ SEKARANG: BOOKED, Diproses, Dipinjam
                    statusMatch = BORROWING_STATUSES.includes(status as TransactionStatus);
                } else if (selectedTab === 'Returned') {
                    // Tab Pengembalian menampilkan status yang sudah selesai atau batal
                    statusMatch = RETURNED_STATUSES.includes(status as TransactionStatus);
                }
                // Jika 'All', semua status ditampilkan

                // B. LOGIKA PENCARIAN (SEARCH)
                let searchMatch = true;
                if (searchQuery) {
                    const query = searchQuery.toLowerCase();

                    const itemList = item.items || [];
                    const itemNameMatch = itemList.some((i: any) =>
                        (i.equipmentName && i.equipmentName.toLowerCase().includes(query))
                    );
                    const qrMatch = item.qrCode && item.qrCode.toLowerCase().includes(query);
                    const idMatch = item.id ? String(item.id).includes(query) : false;
                    const statusMatchSearch = status.toLowerCase().includes(query);

                    searchMatch = itemNameMatch || qrMatch || idMatch || statusMatchSearch;
                }

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