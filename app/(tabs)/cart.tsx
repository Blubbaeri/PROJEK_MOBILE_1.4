import React, { useState, useMemo } from 'react';
import { View, StyleSheet, StatusBar, Alert, Text, ScrollView, TouchableOpacity, FlatList, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useRouter } from 'expo-router';
import { useCart } from '../../context/CartContext';
import CartHeader from '../../components/CartHeader';
import CartList from '../../components/CartList';
import { api } from '../../lib/api';
import { Ionicons } from '@expo/vector-icons';

const ITEM_HEIGHT = 50;

export default function CartScreen() {
    const router = useRouter();
    const { cartItems, totalItems, removeFromCart, increaseQuantity, decreaseQuantity, clearCart } = useCart();

    const [isBooking, setIsBooking] = useState(false);
    const [selectedTime, setSelectedTime] = useState('07:30');

    // --- LOGIC TANGGAL ---
    // Kita buat 2 pilihan: Hari Ini dan Besok
    const dateOptions = useMemo(() => {
        const options = [];
        for (let i = 0; i < 2; i++) { // i=0 itu hari ini, i=1 itu besok
            const d = new Date();
            d.setDate(d.getDate() + i);
            options.push({
                id: i,
                fullDate: d.toISOString().split('T')[0], // format YYYY-MM-DD buat database
                dayName: d.toLocaleDateString('id-ID', { weekday: 'long' }),
                dateNum: d.toLocaleDateString('id-ID', { day: 'numeric' }),
                monthName: d.toLocaleDateString('id-ID', { month: 'short' }),
                year: d.getFullYear(),
                label: i === 0 ? 'Hari Ini' : 'Besok'
            });
        }
        return options;
    }, []);

    const [selectedDate, setSelectedDate] = useState(dateOptions[0]); // Default hari ini

    // --- LOGIC JAM ---
    const timeSlots = useMemo(() => {
        const slots = [];
        let start = new Date();
        start.setHours(7, 30, 0);
        const end = new Date();
        end.setHours(16, 30, 0);
        while (start <= end) {
            slots.push(start.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }).replace('.', ':'));
            start.setMinutes(start.getMinutes() + 5);
        }
        return ['', '', ...slots, '', ''];
    }, []);

    const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const y = event.nativeEvent.contentOffset.y;
        const index = Math.round(y / ITEM_HEIGHT);
        const actualSlots = timeSlots.filter(s => s !== '');
        if (actualSlots[index]) setSelectedTime(actualSlots[index]);
    };

    const processCheckout = async () => {
        if (cartItems.length === 0) return;
        setIsBooking(true);
        try {
            const borrowingData = {
                mhsId: 1,
                items: cartItems.map(item => ({ psaId: item.id, quantity: item.quantity })),
                pickupTime: selectedTime,
                bookingDate: selectedDate.fullDate // Mengirim tanggal yang dipilih
            };

            const response = await api.post('/api/borrowing', borrowingData);
            if (response.data.data) {
                router.push({ pathname: '/(tabs)/booking-qr', params: { id: response.data.data.id } });
                clearCart();
            }
        } catch (error) {
            Alert.alert("Error", "Gagal memproses booking.");
        } finally {
            setIsBooking(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#5B4DBC" />
            <CartHeader totalItems={totalItems} onClearCart={clearCart} />

            <View style={styles.bodyContainer}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

                    <CartList
                        cart={cartItems}
                        totalItems={totalItems}
                        onRemove={removeFromCart}
                        onIncrease={increaseQuantity}
                        onDecrease={decreaseQuantity}
                        onBrowse={() => router.push('/(tabs)')}
                        hideFooter={true}
                    />

                    {cartItems.length > 0 && (
                        <View style={styles.bookingSection}>

                            <Text style={styles.sectionTitle}>Pilih Hari & Waktu</Text>

                            {/* 1. HORIZONTAL DATE PICKER (HARI & TANGGAL) */}
                            <View style={styles.dateRow}>
                                {dateOptions.map((item) => (
                                    <TouchableOpacity
                                        key={item.id}
                                        style={[
                                            styles.dateCard,
                                            selectedDate.id === item.id && styles.dateCardActive
                                        ]}
                                        onPress={() => setSelectedDate(item)}
                                    >
                                        <Text style={[styles.dateLabel, selectedDate.id === item.id && styles.textWhite]}>
                                            {item.label}
                                        </Text>
                                        <Text style={[styles.dateDay, selectedDate.id === item.id && styles.textWhite]}>
                                            {item.dayName}
                                        </Text>
                                        <Text style={[styles.dateValue, selectedDate.id === item.id && styles.textWhite]}>
                                            {item.dateNum} {item.monthName}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* 2. WHEEL PICKER JAM (Sama seperti sebelumnya) */}
                            <View style={styles.pickerContainer}>
                                <Text style={styles.subLabel}>Jam Pengambilan ({selectedTime}):</Text>
                                <View style={styles.wheelWrapper}>
                                    <View style={styles.activeHighlight} />
                                    <FlatList
                                        data={timeSlots}
                                        keyExtractor={(_, i) => i.toString()}
                                        showsVerticalScrollIndicator={false}
                                        snapToInterval={ITEM_HEIGHT}
                                        decelerationRate="fast"
                                        onMomentumScrollEnd={handleScrollEnd}
                                        renderItem={({ item }) => (
                                            <View style={styles.timeRow}>
                                                <Text style={[
                                                    styles.timeText,
                                                    item === selectedTime ? styles.timeActive : styles.timeInactive
                                                ]}>
                                                    {item}
                                                </Text>
                                            </View>
                                        )}
                                        style={{ height: ITEM_HEIGHT * 5 }}
                                    />
                                </View>
                            </View>

                            {/* 3. RINGKASAN & TOMBOL */}
                            <View style={styles.footerSummary}>
                                <View style={styles.summaryBox}>
                                    <Ionicons name="calendar" size={16} color="#5B4DBC" />
                                    <Text style={styles.summaryText}>{selectedDate.dayName}, {selectedDate.dateNum} {selectedDate.monthName}</Text>
                                </View>
                                <View style={styles.summaryBox}>
                                    <Ionicons name="time" size={16} color="#5B4DBC" />
                                    <Text style={styles.summaryText}>Jam {selectedTime}</Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={styles.proceedBtn}
                                onPress={processCheckout}
                                disabled={isBooking}
                            >
                                <Text style={styles.proceedBtnText}>
                                    {isBooking ? 'Memproses...' : 'Konfirmasi Booking'}
                                </Text>
                                <Ionicons name="checkmark-circle" size={22} color="white" />
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#5B4DBC' },
    bodyContainer: { flex: 1, backgroundColor: '#F5F5F7', borderTopLeftRadius: 30, borderTopRightRadius: 30 },
    bookingSection: { padding: 20 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },

    // Date Card Styles
    dateRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    dateCard: {
        backgroundColor: 'white', width: '48%', padding: 15, borderRadius: 20,
        alignItems: 'center', borderWidth: 1, borderColor: '#EEE',
        elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 5
    },
    dateCardActive: { backgroundColor: '#5B4DBC', borderColor: '#5B4DBC' },
    dateLabel: { fontSize: 12, color: '#999', marginBottom: 4 },
    dateDay: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    dateValue: { fontSize: 14, color: '#666' },
    textWhite: { color: 'white' },

    // Wheel Picker Styles
    pickerContainer: { marginTop: 10 },
    subLabel: { fontSize: 14, color: '#666', marginBottom: 10, fontWeight: '600' },
    wheelWrapper: { backgroundColor: '#1C1C1E', borderRadius: 25, height: ITEM_HEIGHT * 5, overflow: 'hidden', justifyContent: 'center' },
    activeHighlight: {
        position: 'absolute', top: ITEM_HEIGHT * 2, left: 15, right: 15, height: ITEM_HEIGHT,
        backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)'
    },
    timeRow: { height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center' },
    timeText: { fontSize: 20, fontWeight: '600' },
    timeActive: { color: 'white', fontSize: 24 },
    timeInactive: { color: '#48484A' },

    footerSummary: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 20 },
    summaryBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 10, borderRadius: 12, borderWidth: 1, borderColor: '#EEE' },
    summaryText: { marginLeft: 8, fontSize: 13, fontWeight: '600', color: '#5B4DBC' },

    proceedBtn: {
        backgroundColor: '#5B4DBC', padding: 18, borderRadius: 20,
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
        elevation: 5, shadowColor: '#5B4DBC', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 10 }, shadowRadius: 20
    },
    proceedBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16, marginRight: 10 }
});