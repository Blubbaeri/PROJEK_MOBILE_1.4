// app/(tabs)/cart.tsx
import React, { useState, useMemo } from 'react';
import {
    View,
    StyleSheet,
    StatusBar,
    Alert,
    Text,
    TouchableOpacity,
    FlatList,
    ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCart } from '../../context/CartContext';
import CartHeader from '../../components/CartHeader';
import CartList from '../../components/CartList';
import { api } from '../../lib/api';
import { Ionicons } from '@expo/vector-icons';

export default function CartScreen() {
    const router = useRouter();
    const { cartItems, totalItems, removeFromCart, increaseQuantity, decreaseQuantity, clearCart } = useCart();

    const [isBooking, setIsBooking] = useState(false);
    const [selectedTime, setSelectedTime] = useState('07:30');

    // --- LOGIC TANGGAL ---
    const dateOptions = useMemo(() => {
        const options = [];
        for (let i = 0; i < 2; i++) {
            const d = new Date();
            d.setDate(d.getDate() + i);
            options.push({
                id: i,
                fullDate: d.toISOString().split('T')[0],
                dayName: d.toLocaleDateString('id-ID', { weekday: 'long' }),
                dateNum: d.toLocaleDateString('id-ID', { day: 'numeric' }),
                monthName: d.toLocaleDateString('id-ID', { month: 'short' }),
                year: d.getFullYear(),
                label: i === 0 ? 'Hari Ini' : 'Besok'
            });
        }
        return options;
    }, []);

    const [selectedDate, setSelectedDate] = useState(dateOptions[0]);

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
        return slots;
    }, []);

    const processCheckout = async () => {
        if (cartItems.length === 0) return;
        setIsBooking(true);
        try {
            const borrowingData = {
                mhsId: 1,
                items: cartItems.map(item => ({ psaId: item.id, quantity: item.quantity })),
                pickupTime: selectedTime,
                bookingDate: selectedDate.fullDate
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

    // Data untuk FlatList sections
    const renderItem = ({ item }: { item: any }) => {
        if (item.type === 'cart-items') {
            return (
                <CartList
                    cart={cartItems}
                    onRemove={removeFromCart}
                    onIncrease={increaseQuantity}
                    onDecrease={decreaseQuantity}
                    onBrowse={() => router.push('/(tabs)')}
                    hideFooter={true}
                />
            );
        } else if (item.type === 'booking-section') {
            return (
                <View style={styles.bookingSection}>
                    <Text style={styles.sectionTitle}>Pilih Hari & Waktu</Text>

                    {/* Date Picker */}
                    <View style={styles.dateRow}>
                        {dateOptions.map((dateItem) => (
                            <TouchableOpacity
                                key={dateItem.id}
                                style={[
                                    styles.dateCard,
                                    selectedDate.id === dateItem.id && styles.dateCardActive
                                ]}
                                onPress={() => setSelectedDate(dateItem)}
                            >
                                <Text style={[styles.dateLabel, selectedDate.id === dateItem.id && styles.textWhite]}>
                                    {dateItem.label}
                                </Text>
                                <Text style={[styles.dateDay, selectedDate.id === dateItem.id && styles.textWhite]}>
                                    {dateItem.dayName}
                                </Text>
                                <Text style={[styles.dateValue, selectedDate.id === dateItem.id && styles.textWhite]}>
                                    {dateItem.dateNum} {dateItem.monthName}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Modern Time Picker with Chips */}
                    <View style={styles.pickerContainer}>
                        <View style={styles.timeHeaderRow}>
                            <Text style={styles.subLabel}>Waktu Pengambilan</Text>
                            <View style={styles.selectedTimeBadge}>
                                <Ionicons name="time" size={14} color="#5B4DBC" />
                                <Text style={styles.selectedTimeText}>{selectedTime}</Text>
                            </View>
                        </View>

                        <ScrollView
                            style={styles.timeScrollContainer}
                            contentContainerStyle={styles.timeGridContainer}
                            showsVerticalScrollIndicator={false}
                            nestedScrollEnabled={true}
                        >
                            <View style={styles.timeGrid}>
                                {timeSlots.map((time) => (
                                    <TouchableOpacity
                                        key={time}
                                        style={[
                                            styles.timeChip,
                                            selectedTime === time && styles.timeChipActive
                                        ]}
                                        onPress={() => setSelectedTime(time)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[
                                            styles.timeChipText,
                                            selectedTime === time && styles.timeChipTextActive
                                        ]}>
                                            {time}
                                        </Text>
                                        {selectedTime === time && (
                                            <View style={styles.checkmarkCircle}>
                                                <Ionicons name="checkmark" size={12} color="white" />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                    </View>

                    {/* Summary & Button */}
                    <View style={styles.footerSummary}>
                        <View style={styles.summaryBox}>
                            <View style={styles.iconCircle}>
                                <Ionicons name="calendar" size={18} color="#5B4DBC" />
                            </View>
                            <Text style={styles.summaryText}>{selectedDate.dayName}, {selectedDate.dateNum} {selectedDate.monthName}</Text>
                        </View>
                        <View style={styles.summaryBox}>
                            <View style={styles.iconCircle}>
                                <Ionicons name="time" size={18} color="#5B4DBC" />
                            </View>
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
            );
        }
        return null;
    };

    // Data sections untuk FlatList
    const sectionsData = useMemo(() => {
        if (cartItems.length === 0) {
            return [{ type: 'empty' }];
        }
        return [
            { type: 'cart-items' },
            { type: 'booking-section' }
        ];
    }, [cartItems.length]);

    // Render untuk cart kosong
    const renderEmptyCart = () => (
        <View style={styles.emptyCart}>
            <Ionicons name="cart-outline" size={80} color="#CCC" />
            <Text style={styles.emptyText}>Keranjang Kosong</Text>
            <TouchableOpacity
                style={styles.browseBtn}
                onPress={() => router.push('/(tabs)')}
            >
                <Text style={styles.browseBtnText}>Telusuri Alat</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#5B4DBC" />
            <CartHeader totalItems={totalItems} onClearCart={clearCart} />

            <View style={styles.bodyContainer}>
                {cartItems.length === 0 ? (
                    renderEmptyCart()
                ) : (
                    <FlatList
                        data={sectionsData}
                        renderItem={renderItem}
                        keyExtractor={(item, index) => index.toString()}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 40 }}
                        nestedScrollEnabled={true}
                    />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#5B4DBC'
    },
    bodyContainer: {
        flex: 1,
        backgroundColor: '#F5F5F7',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30
    },
    emptyCart: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60
    },
    emptyText: {
        fontSize: 18,
        color: '#999',
        marginTop: 10,
        marginBottom: 20
    },
    browseBtn: {
        backgroundColor: '#5B4DBC',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 25
    },
    browseBtnText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16
    },
    bookingSection: {
        padding: 20
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15
    },
    // Date Card Styles
    dateRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20
    },
    dateCard: {
        backgroundColor: 'white',
        width: '48%',
        padding: 15,
        borderRadius: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#EEE',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 5
    },
    dateCardActive: {
        backgroundColor: '#5B4DBC',
        borderColor: '#5B4DBC'
    },
    dateLabel: {
        fontSize: 12,
        color: '#999',
        marginBottom: 4
    },
    dateDay: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333'
    },
    dateValue: {
        fontSize: 14,
        color: '#666'
    },
    textWhite: {
        color: 'white'
    },
    // Modern Time Picker Styles with Chips
    pickerContainer: {
        marginTop: 10,
        marginBottom: 10
    },
    timeHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12
    },
    subLabel: {
        fontSize: 15,
        color: '#333',
        fontWeight: '600',
        letterSpacing: 0.3
    },
    selectedTimeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0EDFF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#5B4DBC'
    },
    selectedTimeText: {
        marginLeft: 6,
        fontSize: 14,
        fontWeight: '700',
        color: '#5B4DBC',
        letterSpacing: 0.5
    },
    timeScrollContainer: {
        maxHeight: 280,
        backgroundColor: 'white',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E5E5EA',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8
    },
    timeGridContainer: {
        padding: 12
    },
    timeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8
    },
    timeChip: {
        backgroundColor: '#F8F8F8',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#E5E5EA',
        minWidth: '30%',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        elevation: 1,
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 2
    },
    timeChipActive: {
        backgroundColor: '#5B4DBC',
        borderColor: '#5B4DBC',
        elevation: 3,
        shadowColor: '#5B4DBC',
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6
    },
    timeChipText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#666',
        letterSpacing: 0.5
    },
    timeChipTextActive: {
        color: 'white',
        fontWeight: '700'
    },
    checkmarkCircle: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 6
    },
    footerSummary: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 20,
        paddingHorizontal: 5
    },
    summaryBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E5EA',
        flex: 1,
        marginHorizontal: 5,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8
    },
    iconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F0EDFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8
    },
    summaryText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
        flex: 1
    },
    proceedBtn: {
        backgroundColor: '#5B4DBC',
        padding: 18,
        borderRadius: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#5B4DBC',
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 10 },
        shadowRadius: 20
    },
    proceedBtnText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        marginRight: 10
    }
}); 