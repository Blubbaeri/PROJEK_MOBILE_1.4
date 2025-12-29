import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // 1. Tambahkan import router

// Definisi Tipe Tab
type TabType = 'All' | 'Borrowing' | 'Returned';

type TransactionHeaderProps = {
    searchQuery: string;
    setSearchQuery: (text: string) => void;
    selectedTab: TabType;
    setSelectedTab: (tab: TabType) => void;
};

const TransactionHeader = ({
    searchQuery,
    setSearchQuery,
    selectedTab,
    setSelectedTab
}: TransactionHeaderProps) => {

    // 2. Inisialisasi router
    const router = useRouter();

    // Array tabs
    const tabs: TabType[] = ['All', 'Borrowing', 'Returned'];

    // Fungsi dummy notifikasi
    const handleNotificationPress = () => {
        Alert.alert("Notifications", "No new transaction updates.");
    };

    return (
        <View style={styles.headerContainer}>
            {/* Bagian Judul & Icon */}
            <View style={styles.headerTop}>
                {/* KIRI: Ikon Bengkel & Judul */}
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={styles.iconBox}>
                        {/* Ikon Kunci Inggris */}
                        <FontAwesome name="wrench" size={22} color="#5B4DBC" />
                    </View>
                    <View>
                        <Text style={styles.headerTitle}>Lab Equipment</Text>
                        <Text style={styles.headerSubtitle}>Student Portal</Text>
                    </View>
                </View>

                {/* KANAN: Lonceng & User */}
                <View style={styles.rightActions}>
                    {/* Tombol Notifikasi */}
                    <TouchableOpacity
                        style={[styles.avatarPlaceholder, { marginRight: 10 }]}
                        onPress={handleNotificationPress}
                    >
                        <FontAwesome name="bell" size={16} color="#5B4DBC" />
                        {/* Titik Merah Notifikasi */}
                        <View style={styles.notifDot} />
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

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#DDD" style={{ marginRight: 10 }} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search transaction..."
                    placeholderTextColor="#DDD"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* Tabs Filter */}
            <View style={{ height: 40, marginTop: 5 }}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingRight: 20 }}
                >
                    {tabs.map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.catPill, selectedTab === tab && styles.catPillActive]}
                            onPress={() => setSelectedTab(tab)}
                        >
                            <Text style={[styles.catText, selectedTab === tab && styles.catTextActive]}>
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 25,
        backgroundColor: '#5B4DBC',
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    // Container untuk Lonceng + User
    rightActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 45, height: 45,
        backgroundColor: 'white',
        borderRadius: 12,
        justifyContent: 'center', alignItems: 'center',
        marginRight: 12
    },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: 'white' },
    headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },

    // Style Placeholder untuk Lonceng & User
    avatarPlaceholder: {
        width: 35, height: 35,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
        justifyContent: 'center', alignItems: 'center',
        position: 'relative'
    },
    // Titik merah notifikasi
    notifDot: {
        position: 'absolute',
        top: 8, right: 8,
        width: 6, height: 6,
        backgroundColor: '#FF5252',
        borderRadius: 3,
        borderWidth: 1, borderColor: '#5B4DBC'
    },

    searchContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 12,
        paddingHorizontal: 15,
        alignItems: 'center',
        height: 50,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)'
    },
    searchInput: { flex: 1, color: 'white', fontSize: 16 },

    // Style Tabs
    catPill: {
        paddingVertical: 8,
        paddingHorizontal: 18,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginRight: 10,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    catPillActive: { backgroundColor: 'white' },
    catText: { color: 'rgba(255,255,255,0.8)', fontWeight: '600', fontSize: 13 },
    catTextActive: { color: '#5B4DBC', fontWeight: 'bold' },
});

export default TransactionHeader;