// app/(tabs)/transaction.tsx
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { useFocusEffect } from 'expo-router';

import { api } from '../../lib/api';
import TransactionHeader from '../../components/TransactionHeader';
import TransactionList from '../../components/TransactionList';
import { Transaction, TransactionStatus } from '../../components/TransactionCard';

/* HELPER: NORMALISASI STATUS DARI BACKEND */
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
            return 'Booked';
    }
};

/* TIPE TAB - SESUAI STATUS YANG ADA */
type TabType = 'All' | 'Booked' | 'Diproses' | 'Dipinjam' | 'Dikembalikan' | 'Selesai' | 'Ditolak';

const TransactionsScreen = () => {
    /* STATE */
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTab, setSelectedTab] = useState<TabType>('All');
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    /* FETCH DATA DENGAN FILTER STATUS */
    const fetchTransactions = async (statusFilter?: TabType) => {
        if (!refreshing) setLoading(true);
        try {
            let response;
            const statusMap: Record<TabType, string> = {
                'All': '',
                'Booked': 'booked',
                'Diproses': 'diproses',
                'Dipinjam': 'dipinjam',
                'Dikembalikan': 'dikembalikan',
                'Selesai': 'selesai',
                'Ditolak': 'ditolak'
            };

            console.log(`[Transaction] Fetching for tab: ${statusFilter}`);

            if (statusFilter && statusFilter !== 'All') {
                // Gunakan endpoint GetPeminjamanByStatus
                const apiStatus = statusMap[statusFilter];
                response = await api.get(`/api/Borrowing/GetPeminjamanByStatus/${apiStatus}`);
                console.log(`✅ GetPeminjamanByStatus/${apiStatus} success`);
            } else {
                // Untuk "All", gunakan GetAllPeminjaman
                response = await api.get('/api/Borrowing/GetAllPeminjaman');
                console.log('✅ GetAllPeminjaman success');
            }

            console.log('[Transaction] API Response structure:', {
                status: response?.status,
                dataType: typeof response?.data,
                isArray: Array.isArray(response?.data),
                dataKeys: Object.keys(response?.data || {})
            });

            let cleanData: any[] = [];

            // Handle response structure
            if (Array.isArray(response.data)) {
                // Direct array (GetPeminjamanByStatus, GetPeminjamanActive)
                cleanData = response.data;
            } else if (response.data?.data && Array.isArray(response.data.data)) {
                // Object with data property (GetAllPeminjaman)
                cleanData = response.data.data;
            }

            console.log(`[Transaction] Clean data: ${cleanData.length} items`);

            /* NORMALISASI KE TRANSACTION FORMAT */
            const normalizedData: Transaction[] = cleanData.map((item) => ({
                id: item.id,
                status: normalizeStatus(item.status),
                qrCode: item.qrCode || '',
                borrowedAt: item.borrowedAt || null,
                returnedAt: item.returnedAt || null,
                userName: item.userName || `User ${item.mhsId || 'Unknown'}`,
                items: [], // ⭐ KOSONGKAN SAJA - akan di-fetch di detail
                borrowingDetails: [], // ⭐ TAMBAH FIELD INI (optional)
                originalStatus: item.status || '',
                mhsId: item.mhsId,
                isQrVerified: item.isQrVerified || false,
                isFaceVerified: item.isFaceVerified || false,
                scheduledTime: item.scheduledTime || null,
                maxReturnTime: item.maxReturnTime || null
            }));

            setTransactions(normalizedData);
            setIsInitialLoad(false);

        } catch (error: any) {
            console.error('[Transaction] Error:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                url: error.config?.url
            });
            setTransactions([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    /* SCREEN FOCUS */
    useFocusEffect(
        useCallback(() => {
            fetchTransactions('All');
        }, [])
    );

    /* EFFECT UNTUK TAB CHANGE */
    useEffect(() => {
        if (!isInitialLoad) {
            fetchTransactions(selectedTab);
        }
    }, [selectedTab]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchTransactions(selectedTab);
    }, [selectedTab]);

    /* FILTERING DENGAN SEARCH */
    const filteredTransactions = useMemo(() => {
        if (!searchQuery) return transactions;

        const query = searchQuery.toLowerCase();
        return transactions.filter((item) => {
            const searchFields = [
                item.qrCode,
                `TXN-${item.id}`,
                String(item.id),
                item.status,
                item.userName,
                ...(item.items || []).map((i: any) => i.equipmentName || '')
            ];

            return searchFields.some(text =>
                String(text).toLowerCase().includes(query)
            );
        });
    }, [transactions, searchQuery]);

    /* UI */
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
                }}
            />

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
    container: {
        flex: 1,
        backgroundColor: '#5B4DBC'
    }
});

export default TransactionsScreen;