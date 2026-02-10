import { Feather, FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Alert,
    Dimensions,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const ProfileScreen = () => {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { signOut } = useAuth();

    const handleLogout = () => {
        Alert.alert(
            "Konfirmasi Logout",
            "Apakah Anda yakin ingin keluar?",
            [
                { text: "Batal", style: "cancel" },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => {
                        await signOut();
                    }
                }
            ]
        );
    };

    // Data Statis (Karena fitur edit dihapus)
    const userData = {
        nama: 'Anna Avetisyan',
        nim: '22010100123',
        prodi: 'Teknik Informatika',
        semester: '5'
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <ScrollView bounces={false} showsVerticalScrollIndicator={false}>

                {/* --- HEADER --- */}
                <View style={styles.headerContainer}>
                    <LinearGradient
                        colors={['#5B4DBC', '#8B80F8']}
                        style={styles.headerBackground}
                    >
                        <View style={[styles.topBar, { marginTop: insets.top + 15 }]}>
                            <Text style={styles.headerTitle}>Profil Mahasiswa</Text>
                        </View>
                    </LinearGradient>

                    {/* FOTO PROFIL (Tanpa Icon Kamera) */}
                    <View style={styles.profileImageContainer}>
                        <View style={styles.imageWrapper}>
                            <FontAwesome name="user" size={60} color="#8B80F8" />
                        </View>
                    </View>
                </View>

                {/* --- INFORMASI USER (VIEW ONLY) --- */}
                <View style={styles.infoSection}>
                    <InfoItem label="NAMA LENGKAP" icon="user" value={userData.nama} />
                    <InfoItem label="NIM" icon="hash" value={userData.nim} />
                    <InfoItem label="PROGRAM STUDI" icon="book-open" value={userData.prodi} />
                    <InfoItem label="SEMESTER" icon="layers" value={userData.semester} />
                </View>

                {/* --- TOMBOL AKSI --- */}
                <View style={styles.btnWrapper}>
                    {/* TOMBOL KEMBALI */}
                    <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8} style={{ marginBottom: 12 }}>
                        <LinearGradient
                            colors={['#5B4DBC', '#8B80F8']}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            style={styles.gradientButton}
                        >
                            <Text style={styles.buttonText}>Kembali</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* TOMBOL LOGOUT */}
                    <TouchableOpacity onPress={handleLogout} activeOpacity={0.8}>
                        <LinearGradient
                            colors={['#FF5252', '#FF867A']}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            style={styles.gradientButton}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Feather name="log-out" size={18} color="white" style={{ marginRight: 8 }} />
                                <Text style={styles.buttonText}>Logout</Text>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 50 }} />
            </ScrollView>
        </View>
    );
};

// Komponen Item Informasi (Lebih sederhana karena tidak ada input)
const InfoItem = ({ icon, value, label }: any) => (
    <View style={{ marginBottom: 20 }}>
        <Text style={styles.sectionLabel}>{label}</Text>
        <View style={styles.itemContainer}>
            <View style={styles.iconBox}>
                <Feather name={icon} size={18} color="#8B80F8" />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.itemText}>{value}</Text>
            </View>
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    headerContainer: { height: 280, alignItems: 'center' },
    headerBackground: {
        width: width * 1.6,
        height: 220,
        borderBottomLeftRadius: width,
        borderBottomRightRadius: width,
        alignItems: 'center',
    },
    topBar: {
        width: width,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
    profileImageContainer: {
        position: 'absolute', bottom: 10, backgroundColor: 'white',
        borderRadius: 75, padding: 5, elevation: 5,
        shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10,
    },
    imageWrapper: {
        width: 120, height: 120, borderRadius: 60,
        backgroundColor: '#F3F2FF', justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: '#F0EEFF'
    },
    infoSection: { marginTop: 20, paddingHorizontal: 25 },
    sectionLabel: {
        fontSize: 11,
        color: '#AAA',
        marginBottom: 5,
        marginLeft: 40,
        fontWeight: 'bold',
        textTransform: 'uppercase'
    },
    itemContainer: {
        flexDirection: 'row', alignItems: 'center',
        paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#F8F8F8',
    },
    iconBox: { width: 40 },
    itemText: { color: '#444', fontSize: 16, fontWeight: '500' },
    btnWrapper: { marginHorizontal: 40, marginTop: 10 },
    gradientButton: {
        paddingVertical: 15,
        borderRadius: 30,
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 5
    },
    buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});

export default ProfileScreen;