// file: app/(tabs)/transaction.tsx

import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import axios from 'axios';
import { useFocusEffect } from 'expo-router';

// --- IMPORTS COMPONENTS (STANDARDIZED) ---
import TransactionHeader from '@/components/TransactionHeader';
import TransactionList from '@/components/TransactionList';
import { Transaction } from '@/components/TransactionCard';

// --- CONFIG ---
const IP_ADDRESS = "10.1.8.33";
const PORT = "5234";
const API_URL = `http://${IP_ADDRESS}:${PORT}/api/borrowing/user/1`;

const TransactionsScreen = () => {
    // --- STATE ---
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // --- FILTER STATE ---
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTab, setSelectedTab] = useState<'All' | 'Borrowing' | 'Returned'>('All');

    // --- FETCH LOGIC ---
    const fetchTransactions = async () => {
        if (!refreshing) setLoading(true);
        try {
            console.log(`Fetching: ${API_URL}`);
            const response = await axios.get(API_URL, { timeout: 15000 });
            const apiResponse = response.data;

            if (apiResponse && Array.isArray(apiResponse.data)) {
                setTransactions(apiResponse.data);
            } else {
                setTransactions([]);
            }
        } catch (error: any) {
            console.log("Error:", error.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Auto load saat layar dibuka
    useFocusEffect(
        useCallback(() => {
            fetchTransactions();
        }, [])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchTransactions();
    }, []);

    // --- FILTER LOGIC ---
    const filteredTransactions = useMemo(() => {
        return transactions.filter((item) => {
            // 1. Filter Tab
            let statusMatch = true;
            if (selectedTab === 'Borrowing') {
                statusMatch = ['pending', 'BOOKING', 'SEDANG_DIPINJAM'].includes(item.status);
            } else if (selectedTab === 'Returned') {
                statusMatch = ['SELESAI', 'DITOLAK', 'DIBATALKAN'].includes(item.status);
            }

            // 2. Filter Search
            let searchMatch = true;
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const itemNameMatch = item.items.some(i => i.equipmentName.toLowerCase().includes(query));
                const qrMatch = item.qrCode && item.qrCode.toLowerCase().includes(query);
                const idMatch = String(item.id).includes(query);
                searchMatch = itemNameMatch || qrMatch || idMatch;
            }

            return statusMatch && searchMatch;
        });
    }, [transactions, selectedTab, searchQuery]);

    // --- RENDER ---
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