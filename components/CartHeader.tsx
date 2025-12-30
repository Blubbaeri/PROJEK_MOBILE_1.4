//components/cartHeader.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // 1. Tambahkan import router

type CartHeaderProps = {
    totalItems: number;
    onClearCart: () => void;
};

const CartHeader = ({ totalItems, onClearCart }: CartHeaderProps) => {

    // 2. Inisialisasi router
    const router = useRouter();

    // Fungsi dummy notifikasi
    const handleNotificationPress = () => {
        Alert.alert("Notifications", "You have items waiting in your cart.");
    };

    return (
        <View style={styles.headerContainer}>
            <View style={styles.headerTop}>
                {/* KIRI: Ikon Wrench & Judul Standar */}
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={styles.iconBox}>
                        <FontAwesome name="wrench" size={22} color="#5B4DBC" />
                    </View>
                    <View>
                        <Text style={styles.headerTitle}>Lab Equipment</Text>
                        {/* Subtitle tetap dinamis menampilkan jumlah item */}
                        <Text style={styles.headerSubtitle}>
                            {totalItems > 0 ? `${totalItems} Items in Cart` : 'Shopping Cart'}
                        </Text>
                    </View>
                </View>

                {/* KANAN: Lonceng & User (Standarisasi) */}
                <View style={styles.rightActions}>
                    {/* Tombol Notifikasi */}
                    <TouchableOpacity
                        style={[styles.avatarPlaceholder, { marginRight: 10 }]}
                        onPress={handleNotificationPress}
                    >
                        <FontAwesome name="bell" size={16} color="#5B4DBC" />
                        {/* Titik Merah jika ada item di keranjang */}
                        {totalItems > 0 && <View style={styles.notifDot} />}
                    </TouchableOpacity>

                    {/* 3. UBAH DISINI: Ikon User sekarang bisa diklik ke Profile */}
                    <TouchableOpacity
                        style={styles.avatarPlaceholder}
                        onPress={() => router.push('/profile')}
                        activeOpacity={0.7}
                    >
                        <FontAwesome name="user" size={18} color="#5B4DBC" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 30, // Konsisten dengan layout cart
        backgroundColor: '#5B4DBC',
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    // Style Bagian Kiri
    iconBox: {
        width: 45, height: 45,
        backgroundColor: 'white',
        borderRadius: 12,
        justifyContent: 'center', alignItems: 'center',
        marginRight: 12
    },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: 'white' },
    headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },

    // Style Bagian Kanan (Lonceng + User)
    rightActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarPlaceholder: {
        width: 35, height: 35,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
        justifyContent: 'center', alignItems: 'center',
        position: 'relative'
    },
    notifDot: {
        position: 'absolute',
        top: 8, right: 8,
        width: 6, height: 6,
        backgroundColor: '#FF5252',
        borderRadius: 3,
        borderWidth: 1, borderColor: '#5B4DBC'
    },
});

export default CartHeader;