// file: app/success.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

export default function SuccessScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    // Parsing data items (karena dikirim sebagai string JSON)
    const items = params.items ? JSON.parse(params.items as string) : [];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#5B4DBC" />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>Borrow Confirmed</Text>
                <FontAwesome name="check-square-o" size={24} color="white" />
            </View>

            <View style={styles.whiteSheet}>
                <ScrollView contentContainerStyle={{ padding: 25 }}>

                    <View style={styles.checkIcon}>
                        <FontAwesome name="check" size={30} color="#5B4DBC" />
                    </View>

                    <Text style={styles.mainTitle}>Equipment Successfully Borrowed!</Text>
                    <Text style={styles.subTitle}>Please wait for admin confirmation.</Text>

                    {/* List Barang */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <FontAwesome name="clipboard" size={16} color="#F57C00" />
                            <Text style={styles.sectionTitle}>Borrowed Items</Text>
                        </View>
                        {items.map((item: any, index: number) => (
                            <View key={index} style={styles.itemRow}>
                                <FontAwesome name="flask" size={14} color="#888" style={{ marginRight: 8 }} />
                                <Text style={styles.itemText}>{item.name} (Qty: {item.quantity})</Text>
                            </View>
                        ))}
                    </View>

                    {/* Info Penting */}
                    <View style={[styles.section, { backgroundColor: '#FFF3E0' }]}>
                        <View style={styles.sectionHeader}>
                            <FontAwesome name="exclamation-circle" size={16} color="#E65100" />
                            <Text style={[styles.sectionTitle, { color: '#E65100' }]}>Important Information</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <FontAwesome name="calendar" size={14} color="#E65100" />
                            <Text style={styles.infoText}>Borrowed On: Today</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <FontAwesome name="clock-o" size={14} color="#E65100" />
                            <Text style={styles.infoText}>Return By: Tomorrow, 5:00 PM</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.btnPrimary}
                        onPress={() => router.replace('/(tabs)/transaction')}
                    >
                        <Text style={styles.btnText}>View My Transactions</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.btnSecondary}
                        onPress={() => router.replace('/(tabs)')}
                    >
                        <Text style={[styles.btnText, { color: '#666' }]}>Continue Browsing</Text>
                    </TouchableOpacity>

                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#5B4DBC' },
    header: { height: 100, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', padding: 25, paddingBottom: 25 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: 'white' },
    whiteSheet: { flex: 1, backgroundColor: '#F5F5F7', borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: 'hidden' },

    checkIcon: { marginBottom: 15 },
    mainTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 5 },
    subTitle: { fontSize: 14, color: '#888', marginBottom: 25 },

    section: { backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 15 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    sectionTitle: { fontWeight: 'bold', color: '#333', marginLeft: 8 },
    itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    itemText: { color: '#555', fontSize: 14 },

    infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5, marginLeft: 24 },
    infoText: { color: '#E65100', marginLeft: 8, fontSize: 13 },

    btnPrimary: { backgroundColor: '#5B4DBC', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
    btnSecondary: { padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 5 },
    btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});