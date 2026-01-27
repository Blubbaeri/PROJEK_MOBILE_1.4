// components/TransactionHeader.tsx

import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Definisi Tipe Tab dengan semua status
type TabType = 'All' | 'Booked' | 'Diproses' | 'Dipinjam' | 'Dikembalikan' | 'Selesai' | 'Ditolak';

type TransactionHeaderProps = {
    searchQuery: string;
    setSearchQuery: (text: string) => void;
    selectedTab: TabType;
    setSelectedTab: (tab: TabType) => void;
    onTabChange?: (tab: TabType) => void;
};

const TransactionHeader = ({
    searchQuery,
    setSearchQuery,
    selectedTab,
    setSelectedTab,
    onTabChange
}: TransactionHeaderProps) => {

    // Array semua tabs
    const tabs: TabType[] = ['All', 'Booked', 'Diproses', 'Dipinjam', 'Dikembalikan', 'Selesai', 'Ditolak'];

    const router = useRouter();

    // Fungsi dummy notifikasi
    const handleNotificationPress = () => {
        Alert.alert("Notifications", "No new transaction updates.");
    };

    // Handler untuk tab press
    const handleTabPress = (tab: TabType) => {
        setSelectedTab(tab);
        if (onTabChange) {
            onTabChange(tab);
        }
    };

    return (
        <LinearGradient
            colors={['#5B4DBC', '#7B68D4']}
            style={styles.headerContainer}
        >
            {/* Bagian Judul & Icon */}
            <View style={styles.headerTop}>
                {/* KIRI: Ikon Bengkel & Judul */}
                <View style={styles.leftSection}>
                    <LinearGradient
                        colors={['#26C6DA', '#00ACC1']}
                        style={styles.iconBox}
                    >
                        <FontAwesome name="wrench" size={22} color="white" />
                    </LinearGradient>
                    <View style={styles.titleContainer}>
                        <Text style={styles.headerTitle}>Equipment Manager</Text>
                        <Text style={styles.headerSubtitle}>Management System</Text>
                    </View>
                </View>

                {/* KANAN: Lonceng & User */}
                <View style={styles.rightActions}>
                    {/* Tombol Notifikasi */}
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={handleNotificationPress}
                        activeOpacity={0.7}
                    >
                        <View style={styles.iconWrapper}>
                            <FontAwesome name="bell" size={18} color="white" />
                            {/* Titik Merah Notifikasi */}
                            <View style={styles.notifDot} />
                        </View>
                    </TouchableOpacity>

                    {/* Ikon User */}
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

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchIconWrapper}>
                    <Ionicons name="search" size={20} color="white" />
                </View>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search transaction..."
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* Tabs Filter */}
            <View style={styles.categoryWrapper}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryScrollContent}
                >
                    {tabs.map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.catPill, selectedTab === tab && styles.catPillActive]}
                            onPress={() => handleTabPress(tab)}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.catText, selectedTab === tab && styles.catTextActive]}>
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
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
        marginBottom: 20,
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
    notifDot: {
        position: 'absolute',
        top: -6,
        right: -6,
        width: 8,
        height: 8,
        backgroundColor: '#FF5252',
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#5B4DBC',
    },

    // Search Bar
    searchContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 14,
        paddingHorizontal: 15,
        alignItems: 'center',
        height: 52,
        marginBottom: 18,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.25)',
        elevation: 3,
    },
    searchIconWrapper: {
        width: 32,
        height: 32,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        color: 'white',
        fontSize: 16,
        letterSpacing: 0.3,
    },

    // Categories/Tabs
    categoryWrapper: {
        height: 42,
        marginBottom: 10,
    },
    categoryScrollContent: {
        paddingRight: 20,
        alignItems: 'center',
    },
    catPill: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.15)',
        marginRight: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        minWidth: 70,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    catPillActive: {
        backgroundColor: 'white',
        borderColor: 'white',
        shadowColor: '#26C6DA',
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    catText: {
        color: 'rgba(255,255,255,0.85)',
        fontWeight: '600',
        fontSize: 13,
        textAlign: 'center',
        letterSpacing: 0.3,
    },
    catTextActive: {
        color: '#5B4DBC',
        fontWeight: 'bold',
        fontSize: 13,
    },

});

export default TransactionHeader;