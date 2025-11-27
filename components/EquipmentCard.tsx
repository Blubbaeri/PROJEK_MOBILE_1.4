// components/EquipmentCard.tsx

import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { FontAwesome } from "@expo/vector-icons";
import { Equipment, useCart } from "@/context/CartContext";
import Toast from 'react-native-toast-message';

interface EquipmentCardProps {
    item: Equipment;
    quantityInCart: number;
}

const EquipmentCard: React.FC<EquipmentCardProps> = ({ item, quantityInCart }) => {
    const { addToCart } = useCart();

    // Hitung stok yang tersedia untuk ditampilkan
    const displayAvailable = item.stock - quantityInCart;

    const handleAddToCart = () => {
        if (displayAvailable > 0) {
            addToCart(item);
            Toast.show({
                type: 'success',
                text1: 'Ditambahkan ke Keranjang',
                text2: `${item.name} berhasil ditambahkan.`,
                position: 'bottom',
                visibilityTime: 2000,
            });
        } else {
            Toast.show({
                type: 'error',
                text1: 'Stok Habis',
                text2: `Stok untuk ${item.name} sudah tidak tersedia.`,
                position: 'bottom'
            });
        }
    };

    return (
        <View style={styles.card}>
            {/* Badge Merah (Jika item ada di keranjang) */}
            {quantityInCart > 0 && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{quantityInCart}</Text>
                </View>
            )}

            {/* Gambar Produk */}
            <View style={styles.imageContainer}>
                {item.image ? (
                    <Image
                        source={{ uri: item.image }}
                        style={styles.image}
                        resizeMode="contain"
                    />
                ) : (
                    <View style={styles.imagePlaceholder}>
                        <FontAwesome name="flask" size={30} color="#E0E0E0" />
                    </View>
                )}
            </View>

            {/* Detail Produk */}
            <View style={styles.details}>
                <Text style={styles.title} numberOfLines={2}>{item.name}</Text>

                {/* Stok Info */}
                <View style={styles.stockRow}>
                    <Text style={styles.stockLabel}>Available:</Text>
                    <Text style={[
                        styles.stockValue,
                        displayAvailable === 0 ? { color: '#FF5252' } : { color: '#5B4DBC' }
                    ]}>
                        {displayAvailable}
                    </Text>
                </View>

                {/* Tombol Add */}
                <TouchableOpacity
                    style={[styles.button, displayAvailable <= 0 && styles.buttonDisabled]}
                    onPress={handleAddToCart}
                    disabled={displayAvailable <= 0}
                >
                    <Text style={styles.buttonText}>
                        {displayAvailable > 0 ? 'Add' : 'Empty'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        flex: 1,
        margin: 8,
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 12,
        // Shadow Modern
        elevation: 3,
        shadowColor: '#5B4DBC', // Shadow agak ungu
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        maxWidth: '46%', // Agar pas 2 kolom
        position: 'relative',
        alignItems: 'center'
    },
    // Badge Merah di Pojok
    badge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#FF5252',
        minWidth: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        borderWidth: 1.5,
        borderColor: 'white'
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold'
    },
    imageContainer: {
        width: '100%',
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    image: {
        width: 90,
        height: 90,
    },
    imagePlaceholder: {
        width: 80,
        height: 80,
        backgroundColor: '#F5F5F7',
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    details: {
        width: '100%',
        alignItems: 'center'
    },
    title: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 6,
        textAlign: 'center',
        height: 40, // Fixed height untuk judul 2 baris
    },
    stockRow: {
        flexDirection: 'row',
        marginBottom: 10,
        alignItems: 'center',
        backgroundColor: '#F5F5F7',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6
    },
    stockLabel: {
        fontSize: 10,
        color: '#888',
        marginRight: 4
    },
    stockValue: {
        fontSize: 11,
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: '#26C6DA', // Warna Cyan/Tosca (Tema Baru)
        paddingVertical: 8,
        width: '100%',
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#E0E0E0',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 13,
    },
});

export default EquipmentCard;