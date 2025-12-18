    //components/cartItemCard.tsx

    import React from 'react';
    import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
    import { FontAwesome } from '@expo/vector-icons';

    type CartItemProps = {
        item: any; // Atau import tipe Equipment dari context
        onRemove: (id: number) => void;
        onIncrease: (id: number) => void;
        onDecrease: (id: number) => void;
    };

    const CartItemCard = ({ item, onRemove, onIncrease, onDecrease }: CartItemProps) => {
        return (
            <View style={styles.cartCard}>
                {/* Gambar Item */}
                <View style={styles.imageContainer}>
                    {item.image ? (
                        <Image source={{ uri: item.image }} style={styles.itemImage} />
                    ) : (
                        <FontAwesome name="image" size={24} color="#ccc" />
                    )}
                </View>

                {/* Info Item */}
                <View style={styles.cardInfo}>
                    <View style={styles.titleRow}>
                        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                        <TouchableOpacity onPress={() => onRemove(item.id)} hitSlop={10}>
                            <FontAwesome name="trash" size={16} color="#FF5252" />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.itemCategory}>Lab Equipment</Text>

                    {/* Quantity Controls */}
                    <View style={styles.qtyContainer}>
                        <TouchableOpacity
                            style={[styles.qtyBtn, styles.qtyBtnMinus]}
                            onPress={() => onDecrease(item.id)}
                        >
                            <FontAwesome name="minus" size={10} color="#5B4DBC" />
                        </TouchableOpacity>

                        <Text style={styles.qtyText}>{item.quantity}</Text>

                        <TouchableOpacity
                            style={[styles.qtyBtn, styles.qtyBtnPlus]}
                            onPress={() => onIncrease(item.id)}
                        >
                            <FontAwesome name="plus" size={10} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    const styles = StyleSheet.create({
        cartCard: {
            flexDirection: 'row', backgroundColor: 'white', borderRadius: 16, padding: 12, marginBottom: 15,
            elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4
        },
        imageContainer: {
            width: 70, height: 70, backgroundColor: '#F7F7F7', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15
        },
        itemImage: { width: '100%', height: '100%', borderRadius: 12 },
        cardInfo: { flex: 1, justifyContent: 'space-between', paddingVertical: 2 },
        titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
        itemName: { fontSize: 15, fontWeight: 'bold', color: '#333', flex: 1, marginRight: 10 },
        itemCategory: { fontSize: 12, color: '#999', marginBottom: 5 },
        qtyContainer: {
            flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F7', alignSelf: 'flex-start', borderRadius: 8, padding: 2
        },
        qtyBtn: { width: 26, height: 26, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
        qtyBtnMinus: { backgroundColor: 'white', borderWidth: 1, borderColor: '#E0E0E0' },
        qtyBtnPlus: { backgroundColor: '#5B4DBC' },
        qtyText: { marginHorizontal: 12, fontWeight: 'bold', fontSize: 14, color: '#333' },
    });

    export default CartItemCard;