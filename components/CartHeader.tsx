//components/CartHeader.tsx

import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type CartHeaderProps = {
    totalItems: number;
    onClearCart: () => void;
};

const CartHeader = ({ totalItems, onClearCart }: CartHeaderProps) => {
    const router = useRouter();

    const handleNotificationPress = () => {
        Alert.alert("Notifications", "You have items waiting in your cart.");
    };

    return (
        <LinearGradient
            colors={['#5B4DBC', '#7B68D4']}
            style={styles.headerContainer}
        >
            <View style={styles.headerTop}>
                {/* KIRI: Ikon Wrench & Judul */}
                <View style={styles.leftSection}>
                    <LinearGradient
                        colors={['#26C6DA', '#00ACC1']}
                        style={styles.iconBox}
                    >
                        <FontAwesome name="wrench" size={22} color="white" />
                    </LinearGradient>
                    <View style={styles.titleContainer}>
                        <Text style={styles.headerTitle}>Equipment Manager</Text>
                        <Text style={styles.headerSubtitle}>
                            {totalItems > 0 ? `${totalItems} Items in Cart` : 'Management System'}
                        </Text>
                    </View>
                </View>

                {/* KANAN: Lonceng & User */}
                <View style={styles.rightActions}>

                    {/* Tombol User Profile */}
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => router.push('/profile')}
                        activeOpacity={0.7}
                    >
                        <View style={styles.iconWrapper}>
                            <FontAwesome name="user" size={18} color="white" />
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Decorative Bottom Line */}
            <View style={styles.decorativeLine}>
                <View style={styles.activeLine} />
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    // Left Section
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconBox: {
        width: 50,
        height: 50,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
        shadowColor: '#26C6DA',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    titleContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
        letterSpacing: 0.5,
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    headerSubtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.85)',
        marginTop: 2,
        letterSpacing: 0.3,
    },

    // Right Actions
    rightActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    actionButton: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    iconWrapper: {
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    notifBadge: {
        position: 'absolute',
        top: -8,
        right: -8,
        minWidth: 18,
        height: 18,
        backgroundColor: '#FF5252',
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
        borderWidth: 2,
        borderColor: '#5B4DBC',
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },

    // Decorative Line
    decorativeLine: {
        height: 3,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 2,
        marginTop: 15,
        overflow: 'hidden',
    },
    activeLine: {
        height: '100%',
        width: '30%',
        backgroundColor: '#26C6DA',
        borderRadius: 2,
    },
});

export default CartHeader;