// components/EquipmentList.tsx
import React from 'react';
import {
    View,
    FlatList,
    ActivityIndicator,
    Text,
    StyleSheet,
    RefreshControl,
    Dimensions
} from 'react-native';
import EquipmentCard from './EquipmentCard';

const { width } = Dimensions.get('window');
const CARD_MARGIN = 8;
const CARD_WIDTH = (width - (CARD_MARGIN * 3)) / 2;

interface EquipmentListProps {
    data: any[];
    loading: boolean;
    refreshing: boolean;
    onRefresh: () => void;
    onAddToCart: (item: any) => void;
}

export default function EquipmentList({
    data,
    loading,
    refreshing,
    onRefresh,
    onAddToCart
}: EquipmentListProps) {

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#5B4DBC" />
                <Text style={styles.loadingText}>Loading equipment...</Text>
            </View>
        );
    }

    if (!data || data.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No equipment found</Text>
                <Text style={styles.emptySubtext}>Try another category or search</Text>
            </View>
        );
    }

    return (
        <FlatList
            data={data}
            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.listContainer}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={['#5B4DBC']}
                    tintColor="#5B4DBC"
                />
            }
            renderItem={({ item }) => (
                <View style={styles.cardWrapper}>
                    <EquipmentCard
                        data={item}
                        onAdd={() => onAddToCart(item)}
                    />
                </View>
            )}
            showsVerticalScrollIndicator={false}
        />
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 50
    },
    loadingText: {
        marginTop: 10,
        color: '#666',
        fontSize: 16
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100
    },
    emptyText: {
        fontSize: 18,
        color: '#333',
        fontWeight: '600',
        marginBottom: 8
    },
    emptySubtext: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center'
    },
    listContainer: {
        paddingHorizontal: CARD_MARGIN,
        paddingTop: 5,
        paddingBottom: 100
    },
    columnWrapper: {
        justifyContent: 'space-between',
        marginBottom: CARD_MARGIN
    },
    cardWrapper: {
        width: CARD_WIDTH,
    }
});