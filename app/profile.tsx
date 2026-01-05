//app/profile.

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    TextInput,
    Alert,
    StatusBar
} from 'react-native';
import { FontAwesome, MaterialIcons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const ProfileScreen = () => {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [isEditing, setIsEditing] = useState(false);
    const [userName, setUserName] = useState('Anna Avetisyan');
    const [birthday, setBirthday] = useState('12 January 1998');
    const [phone, setPhone] = useState('818 123 4567');
    const [instagram, setInstagram] = useState('@anna_avet');
    const [email, setEmail] = useState('info@uaplusdesign.co');
    const [password, setPassword] = useState('********');

    const handleSave = () => {
        setIsEditing(false);
        Alert.alert("Success", "Profile updated successfully!");
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <ScrollView bounces={false} showsVerticalScrollIndicator={false}>

                {/* --- HEADER (Tanpa Tombol Kembali di Atas) --- */}
                <View style={styles.headerContainer}>
                    <LinearGradient
                        colors={['#5B4DBC', '#8B80F8']}
                        style={styles.headerBackground}
                    >
                        <View style={[styles.topBar, { marginTop: insets.top + 15 }]}>
                            {/* Judul sekarang di tengah karena tidak ada tombol di kiri */}
                            <Text style={styles.headerTitle}>{isEditing ? "Edit Mode" : "User Profile"}</Text>
                        </View>
                    </LinearGradient>

                    {/* FOTO PROFIL */}
                    <View style={styles.profileImageContainer}>
                        <View style={styles.imageWrapper}>
                            <FontAwesome name="user" size={60} color="#8B80F8" />
                        </View>
                        {isEditing && (
                            <TouchableOpacity style={styles.cameraIcon}>
                                <FontAwesome name="camera" size={14} color="white" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* --- INFORMASI USER --- */}
                <View style={styles.infoSection}>
                    <Text style={styles.sectionLabel}>Full Name</Text>
                    <EditableItem icon="user" value={userName} onChange={setUserName} editable={isEditing} />

                    <Text style={styles.sectionLabel}>Birthday</Text>
                    <EditableItem icon="calendar" value={birthday} onChange={setBirthday} editable={isEditing} />

                    <Text style={styles.sectionLabel}>Phone Number</Text>
                    <EditableItem icon="phone" value={phone} onChange={setPhone} editable={isEditing} />

                    <Text style={styles.sectionLabel}>Instagram</Text>
                    <EditableItem icon="instagram" value={instagram} onChange={setInstagram} editable={isEditing} />

                    <Text style={styles.sectionLabel}>Email Address</Text>
                    <EditableItem icon="mail" value={email} onChange={setEmail} editable={isEditing} />

                    <Text style={styles.sectionLabel}>Password</Text>
                    <EditableItem icon="lock" value={password} onChange={setPassword} editable={isEditing} secure />
                </View>

                {/* --- TOMBOL AKSI (BERTUMPUK) --- */}
                <View style={styles.btnWrapper}>

                    {/* TOMBOL 1: EDIT / SAVE */}
                    {isEditing ? (
                        <TouchableOpacity onPress={handleSave} activeOpacity={0.8}>
                            <LinearGradient
                                colors={['#27ae60', '#2ecc71']}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                style={styles.gradientButton}
                            >
                                <Text style={styles.buttonText}>Save Changes</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity onPress={() => setIsEditing(true)} activeOpacity={0.8}>
                            <LinearGradient
                                colors={['#5B4DBC', '#8B80F8']}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                style={styles.gradientButton}
                            >
                                <Text style={styles.buttonText}>Edit profile</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    )}

                    {/* JARAK ANTAR TOMBOL */}
                    <View style={{ height: 15 }} />

                    <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8}>
                        <LinearGradient
                            colors={['#5B4DBC', '#8B80F8']}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            style={styles.gradientButton}
                        >
                            <Text style={styles.buttonText}>Kembali</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                </View>

                <View style={{ height: 50 }} />
            </ScrollView>
        </View>
    );
};

// Komponen Input
const EditableItem = ({ icon, value, onChange, editable, secure }: any) => (
    <View style={[styles.itemContainer, editable && styles.itemContainerEdit]}>
        <View style={styles.iconBox}>
            <Feather name={icon} size={18} color="#8B80F8" />
        </View>
        <View style={{ flex: 1 }}>
            {editable ? (
                <TextInput
                    style={styles.inputStyle}
                    value={value}
                    onChangeText={onChange}
                    secureTextEntry={secure}
                />
            ) : (
                <Text style={styles.itemText}>{value}</Text>
            )}
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
    cameraIcon: {
        position: 'absolute', bottom: 5, right: 5,
        backgroundColor: '#5B4DBC', width: 30, height: 30,
        borderRadius: 15, justifyContent: 'center', alignItems: 'center',
        borderWidth: 2, borderColor: 'white'
    },
    infoSection: { marginTop: 20, paddingHorizontal: 25 },
    sectionLabel: { fontSize: 11, color: '#AAA', marginBottom: -5, marginTop: 15, marginLeft: 40, textTransform: 'uppercase' },
    itemContainer: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F8F8F8',
    },
    itemContainerEdit: { borderBottomColor: '#8B80F8', borderBottomWidth: 1.5 },
    iconBox: { width: 40 },
    itemText: { color: '#444', fontSize: 16 },
    inputStyle: { color: '#5B4DBC', fontSize: 16, fontWeight: '600', paddingVertical: 0 },
    btnWrapper: { marginHorizontal: 40, marginTop: 30 },
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