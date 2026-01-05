import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    StatusBar
} from 'react-native';
import { FontAwesome, Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const ProfileScreen = () => {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const userData = {
        nama: 'Anna Avetisyan',
        nim: '22010100123',
        prodi: 'Teknik Informatika',
        semester: '5',
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <ScrollView bounces={false} showsVerticalScrollIndicator={false}>

                {/* --- HEADER --- */}
                <View style={styles.headerContainer}>
                    <LinearGradient colors={['#5B4DBC', '#8B80F8']} style={styles.headerBackground}>
                        <View style={[styles.topBar, { marginTop: insets.top + 15 }]}>
                            <Text style={styles.headerTitle}>Profil Mahasiswa</Text>
                        </View>
                    </LinearGradient>

                    <View style={styles.profileImageContainer}>
                        <View style={styles.imageWrapper}>
                            <FontAwesome name="user" size={60} color="#8B80F8" />
                        </View>
                    </View>
                </View>

                {/* --- KARTU UTAMA (NAMA & NIM) --- */}
                <View style={styles.mainInfoCard}>
                    <Text style={styles.mainName}>{userData.nama}</Text>
                    <View style={styles.nimBadge}>
                        <Text style={styles.nimText}>{userData.nim}</Text>
                    </View>
                </View>

                {/* --- GRID INFO (PRODI & SEMESTER) --- */}
                <View style={styles.gridRow}>
                    <View style={styles.gridCard}>
                        <View style={[styles.iconCircle, { backgroundColor: '#F0EEFF' }]}>
                            <FontAwesome name="graduation-cap" size={20} color="#5B4DBC" />
                        </View>
                        <Text style={styles.gridLabel}>Program Studi</Text>
                        <Text style={styles.gridValue}>{userData.prodi}</Text>
                    </View>

                    <View style={styles.gridCard}>
                        <View style={[styles.iconCircle, { backgroundColor: '#E8F5E9' }]}>
                            <MaterialCommunityIcons name="layers-outline" size={22} color="#2E7D32" />
                        </View>
                        <Text style={styles.gridLabel}>Semester</Text>
                        <Text style={styles.gridValue}>{userData.semester}</Text>
                    </View>
                </View>

                {/* --- MENU TAMBAHAN (BIAR GAK KOSONG) --- */}
                <Text style={styles.sectionTitle}>Layanan Akademik</Text>
                <View style={styles.menuGrid}>
                    <MenuBox icon="calendar-outline" label="Jadwal Kuliah" color="#5B4DBC" />
                    <MenuBox icon="document-text-outline" label="Transkrip Nilai" color="#FF9800" />
                    <MenuBox icon="time-outline" label="Presensi" color="#E91E63" />
                    <MenuBox icon="card-outline" label="Pembayaran" color="#2196F3" />
                </View>

                {/* --- TOMBOL KEMBALI --- */}
                <View style={styles.btnWrapper}>
                    <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={20} color="#5B4DBC" />
                        <Text style={styles.backButtonText}>Kembali</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 50 }} />
            </ScrollView>
        </View>
    );
};

// Komponen Kotak Menu Kecil
const MenuBox = ({ icon, label, color }: any) => (
    <TouchableOpacity style={styles.menuBoxItem}>
        <View style={[styles.menuIconBg, { backgroundColor: color + '15' }]}>
            <Ionicons name={icon} size={24} color={color} />
        </View>
        <Text style={styles.menuBoxLabel}>{label}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7F8FA' },
    headerContainer: { height: 250, alignItems: 'center' },
    headerBackground: {
        width: width * 1.6,
        height: 180,
        borderBottomLeftRadius: width,
        borderBottomRightRadius: width,
        alignItems: 'center',
    },
    topBar: { width: width, alignItems: 'center' },
    headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 },
    profileImageContainer: {
        position: 'absolute', bottom: 0, backgroundColor: 'white',
        borderRadius: 65, padding: 5, elevation: 8,
        shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10,
    },
    imageWrapper: {
        width: 100, height: 100, borderRadius: 50,
        backgroundColor: '#F3F2FF', justifyContent: 'center', alignItems: 'center',
    },
    // Main Info
    mainInfoCard: {
        alignItems: 'center', marginTop: 15, paddingHorizontal: 20,
    },
    mainName: { fontSize: 22, fontWeight: 'bold', color: '#333' },
    nimBadge: {
        backgroundColor: '#5B4DBC10', paddingHorizontal: 15, paddingVertical: 5,
        borderRadius: 20, marginTop: 5, borderWidth: 1, borderColor: '#5B4DBC20'
    },
    nimText: { color: '#5B4DBC', fontWeight: 'bold', fontSize: 14 },
    // Grid Row
    gridRow: {
        flexDirection: 'row', justifyContent: 'space-between',
        paddingHorizontal: 20, marginTop: 25
    },
    gridCard: {
        backgroundColor: 'white', width: (width - 55) / 2, padding: 15,
        borderRadius: 20, elevation: 3, shadowColor: '#000', shadowOpacity: 0.05,
        alignItems: 'flex-start'
    },
    iconCircle: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    gridLabel: { fontSize: 11, color: '#AAA', fontWeight: 'bold', textTransform: 'uppercase' },
    gridValue: { fontSize: 14, color: '#444', fontWeight: 'bold', marginTop: 2 },
    // Menu
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginLeft: 25, marginTop: 30, marginBottom: 15 },
    menuGrid: {
        flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between',
        paddingHorizontal: 20
    },
    menuBoxItem: {
        backgroundColor: 'white', width: (width - 60) / 2, padding: 15,
        borderRadius: 18, flexDirection: 'row', alignItems: 'center',
        marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOpacity: 0.03
    },
    menuIconBg: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    menuBoxLabel: { fontSize: 12, fontWeight: '600', color: '#444', flex: 1 },
    // Button
    btnWrapper: { marginHorizontal: 20, marginTop: 10 },
    backButton: {
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
        paddingVertical: 15, borderRadius: 15, backgroundColor: 'white',
        borderWidth: 1.5, borderColor: '#5B4DBC', marginTop: 10
    },
    backButtonText: { color: '#5B4DBC', fontWeight: 'bold', fontSize: 16, marginLeft: 8 }
});

export default ProfileScreen;