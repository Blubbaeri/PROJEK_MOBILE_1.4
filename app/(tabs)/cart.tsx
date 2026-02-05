// app/(tabs)/cart.tsx
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import CartHeader from '../../components/CartHeader';
import CartList from '../../components/CartList';
import { useCart } from '../../context/CartContext';
import { api } from '../../lib/api';

export default function CartScreen() {
    const router = useRouter();
    const { cartItems, totalItems, removeFromCart, increaseQuantity, decreaseQuantity, clearCart } = useCart();

    const [isBooking, setIsBooking] = useState(false);

    // State untuk Tanggal & Jam
    const [date, setDate] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);
    const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');

    // --- LOGIKA VALIDASI TANGGAL (Hanya Hari Ini & Besok) ---
    const minDate = new Date();
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 1); // Set ke Besok

    // Format tampilan Tanggal
    const formatDisplayDate = (d: Date) => {
        return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    };

    // Format tampilan Jam
    const formatDisplayTime = (d: Date) => {
        return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }).replace('.', ':');
    };

    const onPickerChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        if (Platform.OS === 'android') setShowPicker(false);
        if (selectedDate) {
            setDate(selectedDate);
        }
    };

    const togglePicker = (mode: 'date' | 'time') => {
        setPickerMode(mode);
        setShowPicker(true);
    };

    // ✅ PROSES CHECKOUT (Logic formatting tetap sama)
    const processCheckout = async () => {
        if (cartItems.length === 0) {
            Alert.alert("Keranjang Kosong", "Silakan pilih alat terlebih dahulu.");
            return;
        }

        setIsBooking(true);
        try {
            const token = await AsyncStorage.getItem('user-token');
            if (!token) {
                Alert.alert("Login", "Silakan login terlebih dahulu");
                setIsBooking(false);
                return;
            }

            const HARDCODED_MHS_ID = "12345678";

            const formatLocalDateTime = (d: Date): string => {
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                const hours = String(d.getHours()).padStart(2, '0');
                const minutes = String(d.getMinutes()).padStart(2, '0');
                const seconds = String(d.getSeconds()).padStart(2, '0');
                return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
            };

                return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
            };

            const payload = {
                mhsId: HARDCODED_MHS_ID,
                items: cartItems.map(item => ({
                    perId: item.perId,
                    quantity: item.quantity || 1
                })),
                scheduledTime: formatLocalDateTime(date)
            };

            console.log("📤 Booking payload:", JSON.stringify(payload, null, 2));
            console.log("🕐 Selected date:", date);
            console.log("🕐 Formatted time:", formatLocalDateTime(date));

            const response = await api.post('/api/Borrowing/CreatePeminjaman', payload, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            console.log("📥 Response:", response.data);

            if (response.data.id) {
                Alert.alert(
                    "Berhasil! 🎉",
                    "Booking berhasil dibuat. QR Code akan muncul.",
                    [
                        {
                            text: "OK",
                            onPress: () => {
                                clearCart();
                                router.push({
                                    pathname: '/pages-qr',
                                    params: {
                                        id: response.data.id.toString(),
                                        type: 'borrow'
                                    }
                                });
                            }
                        }
                    ]
                );
            }
        } catch (error: any) {
            console.error("❌ Checkout error:", error);
            Alert.alert("Gagal Booking", "Terjadi kesalahan saat memproses booking.");
        } finally {
            setIsBooking(false);
        }
    };

    const renderSection = ({ item }: { item: { type: string } }) => {
        if (item.type === 'cart-items') {
            return (
                <CartList
                    cart={cartItems}
                    totalItems={totalItems}
                    onRemove={removeFromCart}
                    onIncrease={increaseQuantity}
                    onDecrease={decreaseQuantity}
                    onBrowse={() => router.push('/')}
                    hideFooter={true}
                />
            );
        }

        if (item.type === 'booking-section') {
            return (
                <View style={styles.bookingSection}>
                    <Text style={styles.sectionTitle}>Tentukan Jadwal</Text>

                    <TouchableOpacity style={styles.selectorBtn} onPress={() => togglePicker('date')}>
                        <View style={styles.selectorLeft}>
                            <Ionicons name="calendar" size={22} color="#5B4DBC" />
                            <Text style={styles.selectorLabel}>Tanggal Pengambilan</Text>
                        </View>
                        <Text style={styles.selectedVal}>{formatDisplayDate(date)}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.selectorBtn} onPress={() => togglePicker('time')}>
                        <View style={styles.selectorLeft}>
                            <Ionicons name="time" size={22} color="#5B4DBC" />
                            <Text style={styles.selectorLabel}>Jam Pengambilan</Text>
                        </View>
                        <Text style={styles.selectedVal}>{formatDisplayTime(date)} WIB</Text>
                    </TouchableOpacity>

                    {showPicker && (
                        <View style={styles.pickerWrapper}>
                            <View style={styles.pickerHeader}>
                                <Text style={styles.pickerHeaderText}>Pilih {pickerMode === 'date' ? 'Tanggal' : 'Jam'}</Text>
                                <TouchableOpacity onPress={() => setShowPicker(false)}>
                                    <Text style={styles.doneText}>Selesai</Text>
                                </TouchableOpacity>
                            </View>
                            <DateTimePicker
                                value={date}
                                mode={pickerMode}
                                is24Hour={true}
                                // --- UPDATE: Tampilan Kalender (Inline untuk iOS, Calendar untuk Android) ---
                                display={
                                    Platform.OS === 'ios'
                                        ? (pickerMode === 'date' ? 'inline' : 'spinner')
                                        : 'default'
                                }
                                onChange={onPickerChange}
                                minuteInterval={5}
                                // --- UPDATE: Validasi Hari Ini & Besok Saja ---
                                minimumDate={minDate}
                                maximumDate={maxDate}
                                textColor="black"
                                themeVariant="light"
                                style={Platform.OS === 'ios' && pickerMode === 'date' ? { height: 330, marginTop: 10 } : null}
                            />
                        </View>
                    )}

                    <View style={styles.infoBox}>
                        <Ionicons name="information-circle" size={18} color="#888" />
                        <Text style={styles.infoText}>Hanya tersedia untuk pengambilan hari ini atau besok.</Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.confirmBtn, isBooking && { opacity: 0.7 }]}
                        onPress={processCheckout}
                        disabled={isBooking}
                    >
                        {isBooking ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <Text style={styles.confirmBtnText}>Konfirmasi Booking</Text>
                                <Ionicons name="checkmark-circle" size={24} color="white" />
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="cart-outline" size={100} color="#DDD" />
                <Text style={styles.emptyTitle}>Keranjang Kosong</Text>
                <TouchableOpacity style={styles.browseBtn} onPress={() => router.push('/')}>
                    <Text style={styles.browseBtnText}>Cari Peralatan</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#5B4DBC" />
            <CartHeader totalItems={totalItems} onClearCart={clearCart} />
            <View style={styles.body}>
                <FlatList
                    data={cartItems.length > 0 ? [{ type: 'cart-items' }, { type: 'booking-section' }] : [{ type: 'empty' }]}
                    renderItem={renderSection}
                    keyExtractor={(item) => item.type}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#5B4DBC' },
    body: { flex: 1, backgroundColor: '#F8F9FA', borderTopLeftRadius: 30, borderTopRightRadius: 30 },
    bookingSection: { padding: 20 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
    selectorBtn: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: 'white', padding: 16, borderRadius: 16, marginBottom: 12,
        borderWidth: 1, borderColor: '#EEE', elevation: 2,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3
    },
    selectorLeft: { flexDirection: 'row', alignItems: 'center' },
    selectorLabel: { marginLeft: 10, fontSize: 14, color: '#666', fontWeight: '500' },
    selectedVal: { fontSize: 14, fontWeight: 'bold', color: '#5B4DBC' },
    pickerWrapper: {
        backgroundColor: '#FFFFFF', borderRadius: 20, marginBottom: 20,
        padding: 10, borderWidth: 1, borderColor: '#DDD', overflow: 'hidden',
        elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2, shadowRadius: 5
    },
    pickerHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 15, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#EEE'
    },
    pickerHeaderText: { fontWeight: 'bold', color: '#333' },
    doneText: { color: '#5B4DBC', fontWeight: 'bold' },
    infoBox: { flexDirection: 'row', alignItems: 'center', marginBottom: 25, paddingHorizontal: 5 },
    infoText: { fontSize: 12, color: '#888', marginLeft: 6 },
    confirmBtn: {
        backgroundColor: '#5B4DBC', padding: 18, borderRadius: 18,
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center', elevation: 5
    },
    confirmBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold', marginRight: 10 },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 100 },
    emptyTitle: { fontSize: 20, color: '#CCC', fontWeight: 'bold', marginTop: 10, marginBottom: 20 },
    browseBtn: { backgroundColor: '#5B4DBC', paddingHorizontal: 40, paddingVertical: 14, borderRadius: 30 },
    browseBtnText: { color: 'white', fontWeight: 'bold' }
});