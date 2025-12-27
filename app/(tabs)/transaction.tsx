import React, { useState, useCallback, useMemo } from 'react';
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
   KONSTANTA STATUS UNTUK FILTER TAB
   ========================================================= */
const BORROWING_STATUS: TransactionStatus[] = [
    'Booked',
    'Diproses',
    'Dipinjam'
];

const RETURNED_STATUS: TransactionStatus[] = [
    'Ditolak',
    'Dikembalikan',
    'Selesai'
];

const TransactionsScreen = () => {
    /* ================= STATE ================= */
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTab, setSelectedTab] =
        useState<'All' | 'Borrowing' | 'Returned'>('All');

    /* ================= FETCH DATA ================= */
    const fetchTransactions = async () => {
        if (!refreshing) setLoading(true);

        try {
            console.log('[Transaction] Request API...');

            const response = await api.get(
                '/api/borrowing/user/1'
                // TODO: userId masih hardcoded, nanti ambil dari auth context
            );

            const apiResponse = response.data;

            let cleanData: any[] = [];
            if (Array.isArray(apiResponse)) {
                cleanData = apiResponse;
            } else if (apiResponse?.data && Array.isArray(apiResponse.data)) {
                cleanData = apiResponse.data;
            }

            /* ===== NORMALISASI & TYPE SAFETY ===== */
            const normalizedData: Transaction[] = cleanData.map((item) => ({
                id: item.id,
                status: normalizeStatus(item.status),
                qrCode: item.qrCode || '',
                borrowedAt: item.borrowedAt ?? null,
                returnedAt: item.returnedAt ?? null,
                userName: item.userName || '',
                items: item.items || []
            }));

            setTransactions(normalizedData);

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
            fetchTransactions();
        }, [])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchTransactions();
    }, []);

    /* ================= FILTERING ================= */
    const filteredTransactions = useMemo(() => {
        return transactions.filter((item) => {

            /* FILTER TAB */
            let statusMatch = true;
            if (selectedTab === 'Borrowing') {
                statusMatch = BORROWING_STATUS.includes(item.status);
            } else if (selectedTab === 'Returned') {
                statusMatch = RETURNED_STATUS.includes(item.status);
            }

            /* FILTER SEARCH */
            let searchMatch = true;
            if (searchQuery) {
                const query = searchQuery.toLowerCase();

                const searchFields = [
                    item.qrCode,
                    String(item.id),
                    item.status,
                    ...(item.items || []).map(i => i.equipmentName)
                ];

                searchMatch = searchFields.some(text =>
                    String(text).toLowerCase().includes(query)
                );
            }

            return statusMatch && searchMatch;
        });
    }, [transactions, selectedTab, searchQuery]);

    /* ================= UI ================= */
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#5B4DBC" />

            <TransactionHeader
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedTab={selectedTab}
                setSelectedTab={setSelectedTab}
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
