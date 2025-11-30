import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import TransactionCard, { Transaction } from './TransactionCard';

type TransactionListProps = {
    data: Transaction[];
    loading: boolean;
    refreshing: boolean;
    onRefresh: () => void;
    searchQuery: string;
};

const TransactionList = ({ data, loading, refreshing, onRefresh, searchQuery }: TransactionListProps) => {
    return (
        <View style={styles.whiteSheet}>
            {loading && !refreshing ? (
                <View style={styles.centerLoading}>
                    <ActivityIndicator size="large" color="#5B4DBC" />
                </View>
            ) : (
                <FlatList
                    data={data}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => <TransactionCard transaction={item} />}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#5B4DBC']} />
                    }
                    ListEmptyComponent={
                        <View style={styles.centerLoading}>
                            <FontAwesome name="inbox" size={40} color="#ddd" />
                            <Text style={styles.emptyText}>
                                {searchQuery ? "No transaction found" : "No transaction history"}
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    whiteSheet: {
        flex: 1, backgroundColor: '#F5F5F7', borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: 'hidden',
    },
    listContent: { padding: 20, paddingBottom: 80 },
    centerLoading: {
        flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50
    },
    emptyText: { color: '#999', marginTop: 10, fontSize: 14 },
});

export default TransactionList;