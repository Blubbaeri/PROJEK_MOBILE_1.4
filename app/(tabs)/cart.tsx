// app/(tabs)/cart.tsx
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Alert,
    FlatList,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Platform,
    ScrollView,
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

const ITEM_HEIGHT = 50; // Tinggi per baris jam

export default function CartScreen() {
    const router = useRouter();
    const { cartItems, totalItems, removeFromCart, increaseQuantity, decreaseQuantity, clearCart } = useCart();

    const [isBooking, setIsBooking] = useState(false);
    const [selectedTime, setSelectedTime] = useState('07:30');

    // REF HARUS DI DALAM COMPONENT
    const timeScrollViewRef = useRef<ScrollView>(null);
    const timeFlatListRef = useRef<FlatList>(null);
    const mainFlatListRef = useRef<FlatList>(null);

    // SCROLL KE 07:30 SAAT PERTAMA KALI RENDER 
    useEffect(() => {
        const scrollToInitialTime = () => {
            // Cari index dari jam 07:30 di array 
            const targetTime = '07:30';
            const index = timeSlots.findIndex(slot => slot === targetTime);

            if (index !== -1) {
                // Delay sedikit biar UI sudah render
                setTimeout(() => {
                    if (Platform.OS === 'ios' && timeFlatListRef.current) {
                        // Untuk FlatList iOS
                        timeFlatListRef.current.scrollToIndex({
                            index: index,
                            animated: false,
                            viewPosition: 0.5
                        });
                    } else if (Platform.OS === 'android' && timeScrollViewRef.current) {
                        // Untuk ScrollView Android
                        timeScrollViewRef.current.scrollTo({
                            y: index * ITEM_HEIGHT,
                            animated: false
                        });
                    }
                }, 100);
            }
        };

        scrollToInitialTime();
    }, []);

    // LOGIC TANGGAL
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
                label: i === 0 ? 'Hari Ini ' : 'Besok '
            });
        }
        return options;
    }, []);

    const [selectedDate, setSelectedDate] = useState(dateOptions[0]);

    // LOGIC JAM 
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
        // Tambah padding di awal dan akhir 
        return ['', '', ...slots, '', ''];
    }, []);

    // HANDLER SCROLL JAM 
    const handleTimeScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const y = event.nativeEvent.contentOffset.y;
        const rawIndex = Math.round(y / ITEM_HEIGHT);

        // Batasi index agar tidak keluar dari range
        const adjustedIndex = Math.max(0, Math.min(rawIndex - 2, timeSlots.filter(s => s !== '').length - 1));

        const actualSlots = timeSlots.filter(s => s !== '');
        if (adjustedIndex >= 0 && actualSlots[adjustedIndex] && actualSlots[adjustedIndex] !== selectedTime) {
            setSelectedTime(actualSlots[adjustedIndex]);
        }
    };

    const testConnection = async () => {
        try {
            console.log("🔗 Testing connection to:", api.defaults.baseURL);
            const response = await api.get('/api/Borrowing');
            console.log("✅ Connection OK!");
            return true;
        } catch (error: any) {  
            console.error("❌ Checkout Error:", error.response?.data || error.message);
            console.log("   BaseURL:", api.defaults.baseURL);
            return false;
        }
    };

    // Panggil di processCheckout
    const processCheckout = async () => {
        if (cartItems.length === 0) return;

        setIsBooking(true);
        try {
            // 1. CEK TOKEN DULU
            const token = await AsyncStorage.getItem('user-token');
            console.log("🔑 Token check:", token ? "✅ ADA" : "❌ TIDAK ADA");

            if (!token) {
                Alert.alert(
                    "Login Required",
                    "Anda harus login terlebih dahulu untuk booking",
                    [
                        { text: "Login", onPress: () => router.push('/login') },
                        { text: "Cancel", style: "cancel" }
                    ]
                );
                setIsBooking(false);
                return;
            }

            // 2. DEBUG API CONNECTION
            console.log("🌐 API BaseURL:", api.defaults.baseURL);
            console.log("🔗 Full endpoint:", `${api.defaults.baseURL}/api/Borrowing/CreatePeminjaman`);

            // 3. TEST CONNECTION DULU
            try {
                const testResponse = await api.get('/api/Borrowing');
                console.log("✅ Connection test OK:", testResponse.status);
            } catch (testError: any) {
                console.log("⚠️ Connection test warning:", testError.message);
            }

            // 4. BUILD PAYLOAD
            const scheduledTime = `${selectedDate.fullDate}T${selectedTime}:00`;
            const maxReturnTime = `${selectedDate.fullDate}T16:30:00`;

            const borrowingData = {
                mhsId: 1,
                items: cartItems.map(item => ({
                    perId: item.perId,
                    quantity: item.quantity || 1
                })),
                scheduledTime: scheduledTime,
                maxReturnTime: maxReturnTime,
                status: "booked",
                createdBy: "Mobile_User"
            };

            console.log("🚀 Payload to API:", JSON.stringify(borrowingData, null, 2));

            // 5. SEND REQUEST DENGAN EXTRA HEADER 
            console.log("📤 Sending request...");

            const response = await api.post('/api/Borrowing/CreatePeminjaman', borrowingData, {
                headers: {
                    'Authorization': `Bearer ${token}`, 
                    'Content-Type': 'application/json'
                }
            });

            console.log("✅ API Response:", {
                status: response.status,
                data: response.data
            });

            const newId = response.data.id;

            if (newId) {
                clearCart();
                router.push({
                    pathname: '/(tabs)/booking-qr',
                    params: {
                        id: newId.toString(),
                        qrCode: response.data.data?.qrCode || '',
                        scheduledTime: scheduledTime
                    }
                });
            } else {
                Alert.alert("Error", "Gagal mendapatkan ID transaksi.");
            }
        } catch (error: any) {
            console.error("❌ Checkout Error Details:", {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                url: error.config?.url,
                method: error.config?.method,
                data: error.response?.data
            });

            let errorMsg = "Gagal memproses booking.";

            if (error.response?.status === 401) {
                errorMsg = "Session expired. Silakan login kembali.";
                router.push('/login');
            } else if (error.response?.status === 404) {
                errorMsg = `Endpoint tidak ditemukan:\n${error.config?.url}\n\nPastikan backend berjalan di port 5234`;
            } else if (error.response?.data?.message) {
                errorMsg = error.response.data.message;
            } else if (error.message.includes('Network Error')) {
                errorMsg = `Tidak bisa terhubung ke server:\n${api.defaults.baseURL}\n\nPastikan:\n1. Backend berjalan\n2. Device dalam WiFi yang sama`;
            }

            Alert.alert("Gagal Peminjaman", errorMsg);
        } finally {
            setIsBooking(false);
        }
    };

    // RENDER ITEM UNTUK MAIN FLATLIST 
    const renderSection = ({ item }: { item: { type: string } }) => {
        if (item.type === 'cart-items') {
            return (
                <CartList
                    cart={cartItems}
                    totalItems={totalItems}
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

                    {/* Pilihan Tanggal */}
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

                    {/* Time Picker Wheel */}
                    <View style={styles.pickerContainer}>
                        <Text style={styles.subLabel}>Jam Pengambilan ({selectedTime}):</Text>
                        <View style={styles.wheelWrapper}>
                            <View style={styles.activeHighlight} />

                            {Platform.OS === 'ios' ? (
                                // UNTUK iOS: PAKAI FLATLIST 
                                <FlatList
                                    ref={timeFlatListRef}
                                    data={timeSlots}
                                    keyExtractor={(_, i) => i.toString()}
                                    showsVerticalScrollIndicator={false}
                                    snapToInterval={ITEM_HEIGHT}
                                    snapToAlignment="center"
                                    decelerationRate="fast"
                                    onMomentumScrollEnd={handleTimeScroll}
                                    onScrollEndDrag={handleTimeScroll}
                                    getItemLayout={(_, index) => ({
                                        length: ITEM_HEIGHT,
                                        offset: ITEM_HEIGHT * index,
                                        index,
                                    })}
                                    renderItem={({ item }) => (
                                        <View style={[styles.timeRow, { height: ITEM_HEIGHT }]}>
                                            <Text style={[
                                                styles.timeText,
                                                item === selectedTime ? styles.timeActive : styles.timeInactive
                                            ]}>
                                                {item}
                                            </Text>
                                        </View>
                                    )}
                                    style={{ height: ITEM_HEIGHT * 5 }}
                                    nestedScrollEnabled={true}
                                />
                            ) : (
                                // UNTUK ANDROID: PAKAI SCROLLVIEW
                                <ScrollView
                                    ref={timeScrollViewRef}
                                    showsVerticalScrollIndicator={false}
                                    style={{ height: ITEM_HEIGHT * 5 }}
                                    contentContainerStyle={{
                                        paddingVertical: ITEM_HEIGHT * 2,
                                        alignItems: 'center'
                                    }}
                                    snapToInterval={ITEM_HEIGHT}
                                    decelerationRate="fast"
                                    onMomentumScrollEnd={handleTimeScroll}
                                    onScrollEndDrag={handleTimeScroll}
                                    nestedScrollEnabled={true}
                                >
                                    {timeSlots.map((item, index) => (
                                        <View
                                            key={index}
                                            style={[styles.timeRow, { height: ITEM_HEIGHT }]}
                                        >
                                            <Text style={[
                                                styles.timeText,
                                                item === selectedTime ? styles.timeActive : styles.timeInactive
                                            ]}>
                                                {item}
                                            </Text>
                                        </View>
                                    ))}
                                </ScrollView>
                            )}
                        </View>
                    </View>

                    {/* Summary */}
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
            );
        } else if (item.type === 'empty-cart') {
            return (
                <View style={styles.emptyCart}>
                    <Ionicons name="cart-outline" size={80} color="#CCC" />
                    <Text style={styles.emptyText}>Keranjang Kosong a</Text>
                    <TouchableOpacity
                        style={styles.browseBtn}
                        onPress={() => router.push('/(tabs)')}
                    >
                        <Text style={styles.browseBtnText}>Telusuri Alat</Text>
                    </TouchableOpacity>
                </View>
            );
        }
        return null;
    };

    // DATA UNTUK MAIN FLATLIST 
    const sectionsData = useMemo(() => {
        if (cartItems.length === 0) {
            return [{ type: 'empty-cart' }];
        }
        return [
            { type: 'cart-items' },
            { type: 'booking-section' }
        ];
    }, [cartItems.length]);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#5B4DBC" />
            <CartHeader totalItems={totalItems} onClearCart={clearCart} />

            <View style={styles.bodyContainer}>
                <FlatList
                    ref={mainFlatListRef}
                    data={sectionsData}
                    renderItem={renderSection}
                    keyExtractor={(_, index) => index.toString()}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}
                    ListEmptyComponent={
                        <View style={styles.emptyCart}>
                            <Ionicons name="cart-outline" size={80} color="#CCC" />
                            <Text style={styles.emptyText}>Keranjang Kosong a</Text>
                        </View>
                    }
                />
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
    bookingSection: {
        padding: 20,
        paddingHorizontal: 16 
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
        textAlign: 'center' 
    },
    dateRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        gap: 10 
    },
    dateCard: {
        backgroundColor: 'white',
        flex: 1,
        minWidth: 0, 
        padding: 12, 
        borderRadius: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#EEE',
        elevation: 2,
        marginHorizontal: 4
    },
    dateCardActive: {
        backgroundColor: '#5B4DBC',
        borderColor: '#5B4DBC'
    },
    dateLabel: {
        fontSize: 12,
        color: '#999',
        marginBottom: 4,
        textAlign: 'center', 
        flexWrap: 'wrap',
        flexShrink: 1 
    },
    dateDay: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        flexWrap: 'wrap',
        flexShrink: 1 
    },
    dateValue: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center', 
        flexWrap: 'wrap', 
        flexShrink: 1 
    },
    textWhite: {
        color: 'white'
    },
    pickerContainer: {
        marginTop: 10
    },
    subLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
        fontWeight: '600',
        textAlign: 'center' 
    },
    wheelWrapper: {
        backgroundColor: '#1C1C1E',
        borderRadius: 25,
        height: ITEM_HEIGHT * 5,
        overflow: 'hidden',
        justifyContent: 'center',
        marginHorizontal: 5 
    },
    activeHighlight: {
        position: 'absolute',
        top: ITEM_HEIGHT * 2,
        left: 15,
        right: 15,
        height: ITEM_HEIGHT,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        zIndex: 0
    },
    timeRow: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    timeText: {
        fontSize: 20,
        fontWeight: '600'
    },
    timeActive: {
        color: 'white',
        fontSize: 26,
        fontWeight: 'bold'
    },
    timeInactive: {
        color: '#48484A',
        fontSize: 18
    },
    footerSummary: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 20,
        gap: 10 // ⬅️ TAMBAH GAP
    },
    summaryBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#EEE',
        flex: 1, 
        marginHorizontal: 5, 
        justifyContent: 'center'
    },
    summaryText: {
        fontSize: 12, 
        fontWeight: '600',
        color: '#5B4DBC',
        textAlign: 'center',
        flexShrink: 1
    },
    proceedBtn: {
        backgroundColor: '#5B4DBC',
        padding: 16,
        borderRadius: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        marginTop: 10
    },
    proceedBtnText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        marginRight: 8
    },
    emptyCart: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
        minHeight: 400,
        paddingHorizontal: 20 
    },
    emptyText: {
        fontSize: 18,
        color: '#999',
        marginTop: 10,
        marginBottom: 20,
        textAlign: 'center'
    },
    browseBtn: {
        backgroundColor: '#5B4DBC',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 25,
        minWidth: 150 
    },
    browseBtnText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center'
    }
});