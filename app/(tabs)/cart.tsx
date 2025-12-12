import React, { useState } from 'react';
import { View, StyleSheet, StatusBar, Alert } from 'react-native';
import { useRouter } from 'expo-router'; // Hook untuk navigasi pindah halaman

// --- IMPORT CONTEXT ---
// Kita mengimpor custom hook 'useCart' untuk mengakses data keranjang belanja
// yang tersimpan secara Global (bisa diakses dari mana saja).
import { useCart } from '../../context/CartContext';

// --- IMPORT KOMPONEN TAMPILAN ---
// Memisahkan Header dan List agar kodingan utama tetap bersih
import CartHeader from '../../components/CartHeader';
import CartList from '../../components/CartList';

export default function CartScreen() {
    // Inisialisasi router untuk bisa pindah halaman
    const router = useRouter();

    // --- 1. MENGAMBIL DATA DARI GLOBAL STATE (CONTEXT) ---
    // Di sini kita tidak pakai 'useState' lokal untuk list barang,
    // tapi mengambilnya dari Context. Jadi kalau di Home nambah barang, di sini otomatis muncul.
    const {
        cartItems,        // Array daftar barang yang dipilih
        totalItems,       // Jumlah total item (misal: 5)
        removeFromCart,   // Fungsi hapus barang
        increaseQuantity, // Fungsi tambah jumlah
        decreaseQuantity, // Fungsi kurang jumlah
        clearCart         // Fungsi kosongkan keranjang
    } = useCart();

    // State lokal hanya untuk loading saat proses checkout
    const [isBooking, setIsBooking] = useState(false);

    // --- 2. LOGIKA NAVIGASI ---

    // Fungsi untuk kembali ke halaman Home (Tabs) jika user ingin belanja lagi
    const handleBrowse = () => router.push('/(tabs)');

    // Fungsi saat tombol Checkout ditekan
    const handleCheckout = () => {
        // Tampilkan peringatan (Alert) konfirmasi sebelum memproses
        Alert.alert(
            "Konfirmasi Checkout", // Judul Alert
            `Pinjam ${totalItems} alat ini sekarang?`, // Pesan
            [
                { text: "Nanti Dulu", style: "cancel" }, // Tombol Batal
                { text: "Gas, Pinjam!", onPress: processCheckout } // Tombol Lanjut -> Panggil processCheckout
            ]
        );
    };

    // Fungsi Inti Pemrosesan Booking
    const processCheckout = () => {
        setIsBooking(true); // Nyalakan loading spinner

        // setTimeout digunakan untuk mensimulasikan jeda request ke server (1 detik)
        // Nanti aslinya di sini diganti dengan 'axios.post(...)' ke backend.
        setTimeout(() => {

            // Membuat data dummy booking untuk dikirim ke halaman QR Code
            const bookingData = {
                id: "BOOK-" + Math.floor(Math.random() * 9999), // ID Booking Acak
                studentId: "MHS-USER",
                qrCode: "QR-" + Date.now(), // Generate kode unik berdasarkan waktu
                status: "pending",
                // Mapping data cart agar strukturnya sesuai kebutuhan backend/halaman selanjutnya
                items: cartItems.map(item => ({
                    equipmentId: item.id,
                    equipmentName: item.name,
                    quantity: item.quantity,
                    image: item.image
                })),
                timestamp: new Date().toISOString()
            };

            setIsBooking(false); // Matikan loading

            clearCart(); // Kosongkan keranjang belanja karena transaksi sudah diproses

            // Pindah ke halaman 'booking-qr' sambil membawa data 'bookingData'
            // Data dikirim lewat 'params' agar bisa dibaca di halaman tujuan.
            router.push({
                pathname: '/(tabs)/booking-qr',
                params: { data: JSON.stringify(bookingData) } // Data objek diubah jadi String dulu
            });
        }, 1000);
    };

    // --- 3. TAMPILAN UI ---
    return (
        <View style={styles.container}>
            {/* Status Bar disesuaikan warnanya dengan background header */}
            <StatusBar barStyle="light-content" backgroundColor="#5B4DBC" />

            {/* HEADER: Menampilkan Judul dan Tombol Hapus Semua */}
            <CartHeader
                totalItems={totalItems}
                onClearCart={clearCart} // Mengirim fungsi clearCart ke tombol tong sampah di header
            />

            {/* BODY: Menampilkan Daftar Barang */}
            <View style={styles.bodyContainer}>
                <CartList
                    cart={cartItems}         // Data barang
                    totalItems={totalItems}  // Info jumlah total
                    isBooking={isBooking}    // Info status loading checkout

                    // Mengirim fungsi-fungsi interaksi ke komponen anak (CartList)
                    // agar tombol tambah/kurang di setiap kartu barang bisa berfungsi
                    onRemove={removeFromCart}
                    onIncrease={increaseQuantity}
                    onDecrease={decreaseQuantity}
                    onCheckout={handleCheckout}
                    onBrowse={handleBrowse}
                />
            </View>
        </View>
    );
}

// --- STYLING ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#5B4DBC' }, // Background Ungu (Header)
    bodyContainer: {
        flex: 1,
        backgroundColor: '#F5F5F7', // Background Abu-abu muda (List)
        borderTopLeftRadius: 30,    // Membuat lengkungan di pojok kiri atas
        borderTopRightRadius: 30,   // Membuat lengkungan di pojok kanan atas
        overflow: 'hidden'          // Memastikan isi list tidak menembus lengkungan
    }
});