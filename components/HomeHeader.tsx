import React from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';

// Tipe data props yang diterima komponen ini
type HomeHeaderProps = {
    searchQuery: string;
    setSearchQuery: (text: string) => void;
    categories: any[];
    selectedCategory: string | null;
    setSelectedCategory: (category: string | null) => void;
};

const HomeHeader = ({
    searchQuery,
    setSearchQuery,
    categories,
    selectedCategory,
    setSelectedCategory
}: HomeHeaderProps) => {

    // Fungsi dummy untuk simulasi buka notifikasi
    const handleNotificationPress = () => {
        Alert.alert("Notifications", "You have no new notifications.");
    };

    return (
        <View style={styles.headerContainer}>
            {/* Bagian Judul & Icon */}
            <View style={styles.headerTop}>
                {/* KIRI: Ikon Bengkel & Judul */}
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={styles.iconBox}>
                        {/* Ganti Icon jadi Wrench (Kunci Inggris) */}
                        <FontAwesome name="wrench" size={22} color="#5B4DBC" />
                    </View>
                    <View>
                        <Text style={styles.headerTitle}>Lab Equipment</Text>
                        <Text style={styles.headerSubtitle}>Student Portal</Text>
                    </View>
                </View>

                {/* KANAN: Lonceng & User */}
                <View style={styles.rightActions}>
                    {/* Tombol Notifikasi (Bisa Diklik) */}
                    <TouchableOpacity 
                        style={[styles.avatarPlaceholder, { marginRight: 10 }]} 
                        onPress={handleNotificationPress}
                    >
                        <FontAwesome name="bell" size={16} color="#5B4DBC" />
                        {/* Titik Merah Notifikasi (Hiasan) */}
                        <View style={styles.notifDot} />
                    </TouchableOpacity>

                    {/* Ikon User */}
                    <View style={styles.avatarPlaceholder}>
                        <FontAwesome name="user" size={18} color="#5B4DBC" />
                    </View>
                </View>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#DDD" style={{ marginRight: 10 }} />
                <TextInput
                    placeholder="Search equipment..."
                    placeholderTextColor="#DDD"
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* Kategori (Horizontal Scroll) */}
            <View style={{ height: 40, marginTop: 5 }}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingRight: 20 }}
                >
                    <TouchableOpacity
                        style={[styles.catPill, selectedCategory === null && styles.catPillActive]}
                        onPress={() => setSelectedCategory(null)}
                    >
                        <Text style={[styles.catText, selectedCategory === null && styles.catTextActive]}>All</Text>
                    </TouchableOpacity>

                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat.id}
                            style={[styles.catPill, selectedCategory === cat.name && styles.catPillActive]}
                            onPress={() => setSelectedCategory(cat.name)}
                        >
                            <Text style={[styles.catText, selectedCategory === cat.name && styles.catTextActive]}>
                                {cat.name}
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
    // Style Container untuk icon kanan (Lonceng + User)
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
        backgroundColor: 'rgba(255,255,255,0.2)', // Semi transparan putih
        borderRadius: 12, // Sedikit kotak rounded (squircle) agar modern
        justifyContent: 'center', alignItems: 'center',
        position: 'relative'
    },
    // Titik merah kecil di lonceng
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

export default HomeHeader;