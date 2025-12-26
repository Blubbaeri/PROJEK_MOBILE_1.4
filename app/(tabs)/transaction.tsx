import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import axios from 'axios';
import { useFocusEffect } from 'expo-router';

import TransactionHeader from '../../components/TransactionHeader';
import TransactionList from '../../components/TransactionList';
import { Transaction } from '../../components/TransactionCard';

const IP_ADDRESS = "192.168.100.230";
const PORT = "5234";
const API_URL = `http://${IP_ADDRESS}:${PORT}/api/borrowing/user/1`;

const TransactionsScreen = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTab, setSelectedTab] = useState<'All' | 'Borrowing' | 'Returned'>('All');

    const fetchTransactions = async () => {
        if (!refreshing) setLoading(true);
        try {
            const response = await axios.get(API_URL, { timeout: 10000 });
            const apiResponse = response.data;

            let cleanData = [];
            if (Array.isArray(apiResponse)) {
                cleanData = apiResponse;
            } else if (apiResponse && Array.isArray(apiResponse.data)) {
                cleanData = apiResponse.data;
            }
            setTransactions(cleanData);
        } catch (error: any) {
            console.error("Gagal ambil data:", error.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchTransactions();
        }, [])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchTransactions();
    }, []);

    const filteredTransactions = useMemo(() => {
        if (!transactions) return [];

        return transactions.filter((item) => {
            const statusUpper = item.status ? item.status.toUpperCase() : '';

            // FILTER TAB
            let statusMatch = true;
            if (selectedTab === 'Borrowing') {
                // Menambahkan 'DIPINJAM' ke kategori Borrowing
                statusMatch = ['PENDING', 'BOOKING', 'SEDANG_DIPINJAM', 'BORROWED', 'APPROVED', 'DIPINJAM'].includes(statusUpper);
            } else if (selectedTab === 'Returned') {
                statusMatch = ['SELESAI', 'RETURNED', 'DITOLAK', 'REJECTED', 'DIBATALKAN', 'CANCELLED'].includes(statusUpper);
            }

            // FILTER SEARCH
            let searchMatch = true;
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const itemList = item.items || [];
                const itemNameMatch = itemList.some((i: any) => (i.equipmentName && i.equipmentName.toLowerCase().includes(query)));
                const qrMatch = item.qrCode && item.qrCode.toLowerCase().includes(query);
                const idMatch = item.id ? String(item.id).includes(query) : false;
                searchMatch = itemNameMatch || qrMatch || idMatch;
            }

            return statusMatch && searchMatch;
        });
    }, [transactions, selectedTab, searchQuery]);

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
    container: { flex: 1, backgroundColor: '#5B4DBC' },
});

export default TransactionsScreen;