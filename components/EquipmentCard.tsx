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
                        <FontAwesome name="flask" size={40} color="#E0E0E0" />
                    </View>
                )}
            </View>

            {/* Detail Produk */}
            <View style={styles.details}>
                {/* Judul Barang (Diperbesar) */}
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

                {/* Tombol Add (Diperbesar) */}
                <TouchableOpacity
                    style={[styles.button, displayAvailable <= 0 && styles.buttonDisabled]}
                    onPress={handleAddToCart}
                    disabled={displayAvailable <= 0}
                >
                    <Text style={styles.buttonText}>
                        {displayAvailable > 0 ? 'Add to Cart' : 'Empty'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        width: '100%', // Mengisi penuh wrapper dari parent
        backgroundColor: 'white',
        borderRadius: 20, // Radius lebih besar biar lebih modern
        padding: 15,      // Padding dalam lebih lega
        // Shadow Modern & Lebih Deep
        elevation: 4,
        shadowColor: '#5B4DBC',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        position: 'relative',
        alignItems: 'center',
        // Margin dihapus agar diatur oleh EquipmentList parent
    },
    // Badge Merah
    badge: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#FF5252',
        minWidth: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        borderWidth: 2,
        borderColor: 'white'
    },
    badgeText: {
        color: 'white',
        fontSize: 11,
        fontWeight: 'bold'
    },
    imageContainer: {
        width: '100%',
        height: 130, // Area gambar lebih tinggi
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        backgroundColor: '#FAFAFA', // Sedikit background biar gambar pop
        borderRadius: 15
    },
    image: {
        width: 110, // Gambar lebih besar
        height: 110,
    },
    imagePlaceholder: {
        width: 100,
        height: 100,
        backgroundColor: '#F0F0F0',
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    details: {
        width: '100%',
        alignItems: 'center'
    },
    title: {
        fontSize: 16, // Font Judul Lebih Besar
        fontWeight: '800', // Lebih Tebal
        color: '#2D2D2D',
        marginBottom: 8,
        textAlign: 'center',
        height: 44, // Tinggi area teks disesuaikan font baru
        lineHeight: 22
    },
    stockRow: {
        flexDirection: 'row',
        marginBottom: 12,
        alignItems: 'center',
        backgroundColor: '#F3F0FF', // Background ungu sangat muda
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 8
    },
    stockLabel: {
        fontSize: 12,
        color: '#666',
        marginRight: 6
    },
    stockValue: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: '#26C6DA',
        paddingVertical: 12, // Tombol lebih tinggi/tebal
        width: '100%',
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: "#26C6DA",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 2
    },
    buttonDisabled: {
        backgroundColor: '#E0E0E0',
        elevation: 0,
        shadowOpacity: 0
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14, // Teks tombol lebih besar
    },
});

export default EquipmentCard;