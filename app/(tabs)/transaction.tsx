// file: app/(tabs)/transactions.tsx

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import { useFocusEffect } from 'expo-router';
    
type TransactionStatus = 'BOOKING' | 'SEDANG_DIPINJAM' | 'SELESAI' | 'DITOLAK' | 'DIBATALKAN';

type TransactionItem = {
    equipmentName: string;
    quantity: number;
    condition: string;
};

type Transaction = {
    id: number;
    status: TransactionStatus;
    qrCode: string;
    borrowedAt?: string | null;
    returnedAt?: string | null;
    createdAt: string;
    userName: string;
    items: TransactionItem[];
};

const API_BASE_URL = "http://localhost:5234/api";

const TransactionCard = ({ transaction }: { transaction: Transaction }) => {
    const statusStyles = {
        BOOKING: { color: '#FFA500', backgroundColor: '#FFF7E6' },
        SEDANG_DIPINJAM: { color: '#3498DB', backgroundColor: '#EAF4FB' },
        SELESAI: { color: '#2ECC71', backgroundColor: '#E9F9EE' },
        DITOLAK: { color: '#E74C3C', backgroundColor: '#FDECEA' },
        DIBATALKAN: { color: '#95A5A6', backgroundColor: '#F4F6F7' }
    };

    const currentStatusStyle = statusStyles[transaction.status] || statusStyles.DIBATALKAN;

    const formatDate = (dateString?: string | null) =>
        dateString ? new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }) : '';

    const renderItems = (items: TransactionItem[]) =>
        items.map(item => `${item.equipmentName} (${item.quantity})`).join(', ');

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.txnCode}>{`TXN-${String(transaction.id).padStart(4, '0')}`}</Text>
                <Text style={styles.timestamp}>{formatDate(transaction.createdAt)}</Text>
            </View>

            <View style={[styles.statusBadge, { backgroundColor: currentStatusStyle.backgroundColor }]}>
                <Text style={[styles.statusText, { color: currentStatusStyle.color }]}>
                    {transaction.status.replace('_', ' ')}
                </Text>
            </View>

            <Text style={styles.userText}>User: {transaction.userName}</Text>
            <Text style={styles.qrText}>QR: {transaction.qrCode}</Text>
            <Text style={styles.itemsText}>{renderItems(transaction.items)}</Text>

            {transaction.borrowedAt && (
                <Text style={styles.detailText}>Borrowed: {formatDate(transaction.borrowedAt)}</Text>
            )}
            {transaction.returnedAt && (
                <Text style={styles.detailText}>Returned: {formatDate(transaction.returnedAt)}</Text>
            )}
        </View>
    );
};

const TransactionsScreen = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    const fetchTransactions = async () => {
        try {
            // PAKAI ENDPOINT YANG UDAH ADA
            const response = await axios.get(`${API_BASE_URL}/api/borrowing/user/1`); // Hardcode user ID 1 dulu
            setTransactions(response.data);
        } catch (error) {
            console.error("Gagal mengambil data transaksi:", error);
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                console.log("Token expired, please login again");
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            fetchTransactions();
        }, [])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchTransactions();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            {/* Header Halaman */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Transactions</Text>
                <TouchableOpacity>
                    <FontAwesome name="clipboard" size={24} color="white" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.emptyContainer}>
                    <ActivityIndicator size="large" color="#6A5AE0" />
                </View>
            ) : (
                <FlatList
                    data={transactions}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => <TransactionCard transaction={item} />}
                    contentContainerStyle={{ padding: 16 }}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text>No transactions found.</Text>
                        </View>
                    }
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                />
            )}
        </SafeAreaView>
    );
};

// UPDATE STYLES - Tambahkan style baru
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F6F8' },
    header: {
        backgroundColor: '#6A5AE0',
        paddingVertical: 20,
        paddingHorizontal: 20,
        paddingTop: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: 'white' },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 5
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8
    },
    txnCode: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    timestamp: { fontSize: 12, color: '#888' },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 6,
        marginBottom: 8
    },
    statusText: { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
    userText: { fontSize: 14, color: '#555', marginBottom: 4 },
    qrText: { fontSize: 12, color: '#777', marginBottom: 8, fontFamily: 'monospace' },
    itemsText: { fontSize: 14, color: '#555', lineHeight: 22, marginBottom: 8 },
    detailText: { fontSize: 13, color: '#666', marginBottom: 4 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default TransactionsScreen;