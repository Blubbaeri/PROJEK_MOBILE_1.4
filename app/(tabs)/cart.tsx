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

    const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const y = event.nativeEvent.contentOffset.y;
        const index = Math.round(y / ITEM_HEIGHT);
        const actualSlots = timeSlots.filter(s => s !== '');
        if (actualSlots[index]) setSelectedTime(actualSlots[index]);
    };

    // --- LOGIC FINAL CHECKOUT (SUDAH DISESUAIKAN DENGAN DTO C#) ---
    const processCheckout = async () => {
        if (cartItems.length === 0) return;

        setIsBooking(true);
        try {
            // 1. Format Waktu untuk ScheduledTime (YYYY-MM-DDTHH:mm:ss)
            const scheduledTime = `${selectedDate.fullDate}T${selectedTime}:00`;
            const maxReturnTime = `${selectedDate.fullDate}T16:30:00`;

            // 2. Payload sesuai persis dengan CreateBorrowingRequest.cs
            const borrowingData = {
                MhsId: 1, // Pastikan tipe Integer (bukan String)
                Items: cartItems.map(item => ({
                    PerId: parseInt(item.id), // Gunakan PerId sesuai DTO lo
                    Quantity: item.quantity || 1
                })),
                ScheduledTime: scheduledTime, // Gunakan ScheduledTime sesuai DTO lo
                MaxReturnTime: maxReturnTime,
                Status: "booked",
                CreatedBy: "Mobile_User"
            };

            console.log("🚀 Payload dikirim ke Backend:", JSON.stringify(borrowingData, null, 2));

            // 3. Tembak ke API Borrowing
            const response = await api.post('/api/Borrowing/CreatePeminjaman', borrowingData);

            // 4. Ambil ID dari response untuk halaman QR
            // Cek apakah response backend kamu membungkus id dalam property 'data' atau langsung
            const newId = response.data.id || response.data.data?.id;

            if (newId) {
                clearCart();
                router.push({
                    pathname: '/(tabs)/booking-qr',
                    params: { id: newId.toString() }
                });
            } else {
                Alert.alert("Error", "Gagal mendapatkan ID transaksi dari server.");
            }
        } catch (error: any) {
            console.error("❌ Checkout Error:", error.response?.data || error.message);

            // Tampilkan pesan error spesifik dari Validation C# jika ada
            const serverErrors = error.response?.data?.errors;
            let errorMsg = "Gagal memproses booking.";

            if (serverErrors) {
                errorMsg = Object.values(serverErrors).flat().join("\n");
            } else if (error.response?.data?.message) {
                errorMsg = error.response.data.message;
            }

            Alert.alert("Gagal Peminjaman", errorMsg);
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

                            <View style={styles.dateRow}>
                                {dateOptions.map((item) => (
                                    <TouchableOpacity
                                        key={item.id}
                                        style={[styles.dateCard, selectedDate.id === item.id && styles.dateCardActive]}
                                        onPress={() => setSelectedDate(item)}
                                    >
                                        <Text style={[styles.dateLabel, selectedDate.id === item.id && styles.textWhite]}>{item.label}</Text>
                                        <Text style={[styles.dateDay, selectedDate.id === item.id && styles.textWhite]}>{item.dayName}</Text>
                                        <Text style={[styles.dateValue, selectedDate.id === item.id && styles.textWhite]}>{item.dateNum} {item.monthName}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

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
                                                <Text style={[styles.timeText, item === selectedTime ? styles.timeActive : styles.timeInactive]}>{item}</Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                    </View>

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
                                <Text style={styles.proceedBtnText}>{isBooking ? 'Memproses...' : 'Konfirmasi Booking'}</Text>
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
    dateRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    dateCard: { backgroundColor: 'white', width: '48%', padding: 15, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: '#EEE', elevation: 2 },
    dateCardActive: { backgroundColor: '#5B4DBC', borderColor: '#5B4DBC' },
    dateLabel: { fontSize: 12, color: '#999', marginBottom: 4 },
    dateDay: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    dateValue: { fontSize: 14, color: '#666' },
    textWhite: { color: 'white' },
    pickerContainer: { marginTop: 10 },
    subLabel: { fontSize: 14, color: '#666', marginBottom: 10, fontWeight: '600' },
    wheelWrapper: { backgroundColor: '#1C1C1E', borderRadius: 25, height: ITEM_HEIGHT * 5, overflow: 'hidden', justifyContent: 'center' },
    activeHighlight: { position: 'absolute', top: ITEM_HEIGHT * 2, left: 15, right: 15, height: ITEM_HEIGHT, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    timeRow: { height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center' },
    timeText: { fontSize: 20, fontWeight: '600' },
    timeActive: { color: 'white', fontSize: 24 },
    timeInactive: { color: '#48484A' },
    footerSummary: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 20 },
    summaryBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 10, borderRadius: 12, borderWidth: 1, borderColor: '#EEE' },
    summaryText: { marginLeft: 8, fontSize: 13, fontWeight: '600', color: '#5B4DBC' },
    proceedBtn: { backgroundColor: '#5B4DBC', padding: 18, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', elevation: 5 },
    proceedBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16, marginRight: 10 }
});