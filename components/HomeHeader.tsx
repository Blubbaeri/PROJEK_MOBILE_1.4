//components/HomeHeader.tsx

import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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

    const handleNotificationPress = () => {
        Alert.alert("Notifications", "You have no new notifications.");
    };

    return (
        <LinearGradient
            colors={['#5B4DBC', '#7B68D4']}
            style={styles.headerContainer}
        >
            {/* --- BAGIAN 1: JUDUL DAN IKON ATAS --- */}
            <View style={styles.headerTop}>

                {/* KIRI: Logo Bengkel & Teks Judul */}
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

                {/* KANAN: Tombol Notifikasi & User Profile */}
                <View style={styles.rightActions}>

                    {/* Tombol Lonceng */}
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={handleNotificationPress}
                        activeOpacity={0.7}
                    >
                        <View style={styles.iconWrapper}>
                            <FontAwesome name="bell" size={18} color="white" />
                            {/* Hiasan titik merah kecil */}
                            <View style={styles.notifDot} />
                        </View>
                    </TouchableOpacity>

                    {/* Ikon User (Klik untuk ke Profile) */}
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

            {/* --- BAGIAN 2: KOLOM PENCARIAN (SEARCH BAR) --- */}
            <View style={styles.searchContainer}>
                <View style={styles.searchIconWrapper}>
                    <Ionicons name="search" size={20} color="#26C6DA" />
                </View>

                <TextInput
                    placeholder="Search equipment..."
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* --- BAGIAN 3: LIST KATEGORI (HORIZONTAL SCROLL) --- */}
            <View style={styles.categoryWrapper}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryScrollContent}
                >
                    {/* TOMBOL MANUAL 'ALL' */}
                    <TouchableOpacity
                        style={[styles.catPill, selectedCategory === null && styles.catPillActive]}
                        onPress={() => setSelectedCategory(null)}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.catText, selectedCategory === null && styles.catTextActive]}>
                            All
                        </Text>
                    </TouchableOpacity>

                    {/* TOMBOL KATEGORI DARI ARRAY */}
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat.id}
                            style={[styles.catPill, selectedCategory === cat.name && styles.catPillActive]}
                            onPress={() => setSelectedCategory(cat.name)}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.catText, selectedCategory === cat.name && styles.catTextActive]}>
                                {cat.name}
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    searchIconWrapper: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.2)',
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

    // Categories
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
        paddingHorizontal: 20,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.15)',
        marginRight: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
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
        fontSize: 14,
        letterSpacing: 0.3,
    },
    catTextActive: {
        color: '#5B4DBC',
        fontWeight: 'bold',
    },


});

export default HomeHeader;