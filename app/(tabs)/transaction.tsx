// app/(tabs)/transaction.tsx

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { useFocusEffect } from 'expo-router';

import { api } from '../../lib/api';

import TransactionHeader from '../../components/TransactionHeader';
import TransactionList from '../../components/TransactionList';
import { Transaction, TransactionStatus } from '../../components/TransactionCard';

/* =========================================================
   HELPER: NORMALISASI STATUS DARI BACKEND
   ========================================================= */
const normalizeStatus = (raw: any): TransactionStatus => {
    const value = String(raw || '').toLowerCase();

    switch (value) {
        case 'booked':
            return 'Booked';
        case 'diproses':
            return 'Diproses';
        case 'dipinjam':
            return 'Dipinjam';
        case 'ditolak':
            return 'Ditolak';
        case 'dikembalikan':
            return 'Dikembalikan';
        case 'selesai':
            return 'Selesai';
        default:
            return 'Booked'; // fallback aman
    }
};

/* =========================================================
   TIPE TAB BARU
   ========================================================= */
type TabType = 'All' | 'Booked' | 'Diproses' | 'Dipinjam' | 'Dikembalikan' | 'Selesai' | 'Ditolak';

const TransactionsScreen = () => {
    /* ================= STATE ================= */
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTab, setSelectedTab] = useState<TabType>('All');
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    /* ================= FETCH DATA DENGAN FILTER STATUS ================= */
    const fetchTransactions = async (statusFilter?: TabType) => {
        if (!refreshing) setLoading(true);
        try {
            let url = '/api/borrowing/user/1';

            // Jika bukan "All", gunakan endpoint filter by status
            if (statusFilter && statusFilter !== 'All') {
                // Map UI Tab ke API status (lowercase)
                const statusMap: Record<TabType, string> = {
                    'All': '',
                    'Booked': 'booked',
                    'Diproses': 'diproses',
                    'Dipinjam': 'dipinjam',
                    'Dikembalikan': 'dikembalikan',
                    'Selesai': 'selesai',
                    'Ditolak': 'ditolak'
                };

                const apiStatus = statusMap[statusFilter];
                if (apiStatus) {
                    url = `/api/borrowing/status/${apiStatus}`;
                    console.log(`🔍 Filter by status: ${apiStatus}`);
                }
            }

            console.log(`[Transaction] Request API: ${url}`);

            const response = await api.get(url);
            const apiResponse = response.data;

            let cleanData: any[] = [];
            if (Array.isArray(apiResponse)) {
                cleanData = apiResponse;
            } else if (apiResponse?.data && Array.isArray(apiResponse.data)) {
                cleanData = apiResponse.data;
            }

            console.log(`📊 Received ${cleanData.length} transactions`);

            /* ===== NORMALISASI & TYPE SAFETY ===== */
            const normalizedData: Transaction[] = cleanData.map((item) => ({
                id: item.id,
                status: normalizeStatus(item.status),
                qrCode: item.qrCode || '',
                borrowedAt: item.borrowedAt ?? null,
                returnedAt: item.returnedAt ?? null,
                userName: item.userName || `User ${item.mhsId}`,
                items: item.items || [],
                // Simpan data asli untuk debugging
                originalStatus: item.status,
                mhsId: item.mhsId,
                isQrVerified: item.isQrVerified || false,
                isFaceVerified: item.isFaceVerified || false
            }));

            setTransactions(normalizedData);
            setIsInitialLoad(false);

        } catch (error: any) {
            console.error('[Transaction] Error:', error.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    /* ================= SCREEN FOCUS ================= */
    useFocusEffect(
        useCallback(() => {
            fetchTransactions('All'); // Load semua data pertama kali
        }, [])
    );

    /* ================= EFFECT UNTUK TAB CHANGE ================= */
    useEffect(() => {
        if (!isInitialLoad) {
            fetchTransactions(selectedTab);
        }
    }, [selectedTab]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchTransactions(selectedTab);
    }, [selectedTab]);

    /* ================= FILTERING (FALLBACK JIKA API FILTER TIDAK BEKERJA) ================= */
    const filteredTransactions = useMemo(() => {
        if (selectedTab === 'All') {
            return transactions; // Tampilkan semua
        }

        // Filter di frontend sebagai fallback
        return transactions.filter(item => {
            const itemStatus = item.status.toLowerCase();
            const tabStatus = selectedTab.toLowerCase();

            // Handle "Dikembalikan" vs "Returned" jika perlu
            if (selectedTab === 'Dikembalikan') {
                return itemStatus === 'dikembalikan' || itemStatus === 'returned';
            }

            return itemStatus === tabStatus;
        });
    }, [transactions, selectedTab, searchQuery]);

    /* ================= FINAL FILTER DENGAN SEARCH ================= */
    const finalFilteredTransactions = useMemo(() => {
        if (!searchQuery) return filteredTransactions;

        const query = searchQuery.toLowerCase();
        return filteredTransactions.filter((item) => {
            const searchFields = [
                item.qrCode,
                `TXN-${item.id}`,
                String(item.id),
                item.status,
                item.userName,
                ...(item.items || []).map(i => i.equipmentName || '')
            ];

            return searchFields.some(text =>
                String(text).toLowerCase().includes(query)
            );
        });
    }, [filteredTransactions, searchQuery]);

    /* ================= UI ================= */
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#5B4DBC" />

            <TransactionHeader
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedTab={selectedTab}
                setSelectedTab={setSelectedTab}
                onTabChange={(tab) => {
                    setSelectedTab(tab);
                    // Tidak perlu fetchTransactions di sini karena sudah ada useEffect
                }}
            />

            <TransactionList
                data={finalFilteredTransactions}
                loading={loading}
                refreshing={refreshing}
                onRefresh={onRefresh}
                searchQuery={searchQuery}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#5B4DBC'
    }
});

export default TransactionsScreen;