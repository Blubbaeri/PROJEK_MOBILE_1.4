import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Dimensions } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import EquipmentCard from '@/components/EquipmentCard'; // Pastikan path ini benar
import { Equipment } from '@/context/CartContext';

// Logic Ukuran Layar dipindah ke sini
const { width } = Dimensions.get('window');
const CARD_MARGIN = 6;
const CONTAINER_PADDING = 10;
const CARD_WIDTH = (width - (CONTAINER_PADDING * 2)) / 2;

type EquipmentListProps = {
    data: Equipment[];
    loading: boolean;
    refreshing: boolean;
    onRefresh: () => void;
    cart: any[];
};

const EquipmentList = ({ data, loading, refreshing, onRefresh, cart }: EquipmentListProps) => {
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
                    numColumns={2}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    renderItem={({ item }) => {
                        const itemInCart = cart.find((c) => c.id === item.id);
                        const quantityInCart = itemInCart ? itemInCart.quantity : 0;
                        return (
                            <View style={{ width: CARD_WIDTH, padding: CARD_MARGIN / 2, marginBottom: 5 }}>
                                <EquipmentCard item={item} quantityInCart={quantityInCart} />
                            </View>
                        );
                    }}
                    ListEmptyComponent={
                        <View style={styles.centerLoading}>
                            <FontAwesome name="search" size={40} color="#ddd" />
                            <Text style={{ marginTop: 10, color: '#999' }}>No equipment found.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    whiteSheet: {
        flex: 1,
        backgroundColor: '#F5F5F7',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        overflow: 'hidden',
    },
    listContent: {
        paddingTop: 20,
        paddingBottom: 80,
        paddingHorizontal: CONTAINER_PADDING,
    },
    centerLoading: {
        marginTop: 50,
        alignItems: 'center',
        justifyContent: 'center'
    }
});

export default EquipmentList;