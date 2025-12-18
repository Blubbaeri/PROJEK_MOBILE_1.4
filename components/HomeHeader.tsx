//components/homeHeader.tsx

import React from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons'; // Library ikon vektor

// --- DEFINISI TIPE PROPS ---
// Ini adalah "Kontrak". Komponen ini mewajibkan komponen Induk (Home)
// untuk mengirimkan data-data di bawah ini. Jika kurang, akan error (merah).
type HomeHeaderProps = {
    searchQuery: string;                    // Teks yang sedang dicari
    setSearchQuery: (text: string) => void; // Fungsi untuk mengubah teks pencarian
    categories: any[];                      // Array daftar kategori
    selectedCategory: string | null;        // Kategori yang sedang aktif (null = All)
    setSelectedCategory: (category: string | null) => void; // Fungsi saat kategori diklik
};
a
const HomeHeader = ({
    searchQuery,
    setSearchQuery,
    categories,
    selectedCategory,
    setSelectedCategory
}: HomeHeaderProps) => {

    // Fungsi sederhana untuk menangani klik tombol notifikasi
    // Saat ini hanya memunculkan Alert, nanti bisa diganti navigasi ke halaman Notifikasi.
    const handleNotificationPress = () => {
        Alert.alert("Notifications", "You have no new notifications.");
    };

    return (
        <View style={styles.headerContainer}>

            {/* --- BAGIAN 1: JUDUL DAN IKON ATAS --- */}
            <View style={styles.headerTop}>

                {/* KIRI: Logo Bengkel & Teks Judul */}
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={styles.iconBox}>
                        <FontAwesome name="wrench" size={22} color="#5B4DBC" />
                    </View>
                    <View>
                        <Text style={styles.headerTitle}>Lab Equipment</Text>
                        <Text style={styles.headerSubtitle}>Student Portal</Text>
                    </View>
                </View>

                {/* KANAN: Tombol Notifikasi & User Profile */}
                <View style={styles.rightActions}>

                    {/* Tombol Lonceng (TouchableOpacity agar bisa diklik) */}
                    <TouchableOpacity
                        style={[styles.avatarPlaceholder, { marginRight: 10 }]}
                        onPress={handleNotificationPress}
                    >
                        <FontAwesome name="bell" size={16} color="#5B4DBC" />

                        {/* Hiasan titik merah kecil (tanda ada notif belum dibaca) */}
                        <View style={styles.notifDot} />
                    </TouchableOpacity>

                    {/* Ikon User (Hiasan saja) */}
                    <View style={styles.avatarPlaceholder}>
                        <FontAwesome name="user" size={18} color="#5B4DBC" />
                    </View>
                </View>
            </View>

            {/* --- BAGIAN 2: KOLOM PENCARIAN (SEARCH BAR) --- */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#DDD" style={{ marginRight: 10 }} />

                {/* Input Teks:
                    value={searchQuery} -> Agar teks di layar sinkron dengan state di Home
                    onChangeText={setSearchQuery} -> Agar setiap ketikan user mengupdate state di Home
                */}
                <TextInput
                    placeholder="Search equipment..."
                    placeholderTextColor="#DDD"
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* --- BAGIAN 3: LIST KATEGORI (HORIZONTAL SCROLL) --- */}
            <View style={{ height: 40, marginTop: 5 }}>
                <ScrollView
                    horizontal // Mengaktifkan scroll ke samping
                    showsHorizontalScrollIndicator={false} // Menyembunyikan garis scrollbar bawah
                    contentContainerStyle={{ paddingRight: 20 }}
                >
                    {/* TOMBOL MANUAL 'ALL' */}
                    {/* Logic Style: Jika selectedCategory null (All), warnanya putih. Jika tidak, transparan. */}
                    <TouchableOpacity
                        style={[styles.catPill, selectedCategory === null && styles.catPillActive]}
                        onPress={() => setSelectedCategory(null)}
                    >
                        <Text style={[styles.catText, selectedCategory === null && styles.catTextActive]}>All</Text>
                    </TouchableOpacity>

                    {/* TOMBOL KATEGORI DARI ARRAY (MAPPING) */}
                    {/* Mengulang kode tombol sebanyak jumlah data di array 'categories' */}
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat.id} // Key wajib ada saat mapping list agar performa render bagus
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

// --- STYLING (Hiasan Tampilan) ---
const styles = StyleSheet.create({
    headerContainer: {
        paddingTop: 50, // Memberi jarak untuk Status Bar HP
        paddingHorizontal: 20,
        paddingBottom: 25,
        backgroundColor: '#5B4DBC', // Warna Ungu Utama
    },
    headerTop: {
        flexDirection: 'row', // Menyusun elemen ke samping (kiri ke kanan)
        justifyContent: 'space-between', // Jarak maksimal antara elemen kiri dan kanan
        alignItems: 'center',
        marginBottom: 20,
    },
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
    headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)' }, // Warna putih agak transparan

    avatarPlaceholder: {
        width: 35, height: 35,
        backgroundColor: 'rgba(255,255,255,0.2)', // Latar belakang semi-transparan
        borderRadius: 12,
        justifyContent: 'center', alignItems: 'center',
        position: 'relative'
    },
    notifDot: {
        position: 'absolute', // Posisi absolut agar bisa menumpuk di atas lonceng
        top: 8, right: 8,
        width: 6, height: 6,
        backgroundColor: '#FF5252', // Merah peringatan
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

    // Style Tombol Kategori (Pill)
    catPill: {
        paddingVertical: 8,
        paddingHorizontal: 18,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.1)', // Default transparan
        marginRight: 10,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    catPillActive: { backgroundColor: 'white' }, // Jika aktif, background jadi putih

    catText: { color: 'rgba(255,255,255,0.8)', fontWeight: '600', fontSize: 13 },
    catTextActive: { color: '#5B4DBC', fontWeight: 'bold' }, // Jika aktif, teks jadi ungu
});

export default HomeHeader;