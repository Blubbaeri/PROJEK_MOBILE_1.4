import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

// --- DEFINISI TIPE PROPS ---
// Komponen ini menerima dua hal:
// 1. data: Objek berisi detail barang (nama, gambar, stok, harga)
// 2. onAdd: Sebuah fungsi yang akan dipanggil saat tombol ditekan
interface EquipmentCardProps {
    data: any;
    onAdd: () => void; // <--- Wajib dikirim oleh Induk (EquipmentList)
}

export default function EquipmentCard({ data, onAdd }: EquipmentCardProps) {
    // --- LOGIKA SEDERHANA ---
    // Membuat variabel boolean (true/false) untuk mengecek stok.
    // Jika stok > 0, maka isAvailable = true.
    const isAvailable = data.stock > 0;

    return (
        <View style={styles.card}>
            {/* --- BAGIAN 1: GAMBAR BARANG --- */}
            <View style={styles.imageContainer}>
                {/* Logika Tampilan Bersyarat (Ternary Operator):
                    Apakah data.image ada isinya?
                    JIKA YA (?): Pakai gambar dari link tersebut.
                    JIKA TIDAK (:): Pakai gambar placeholder (abu-abu) agar tidak error.
                */}
                <Image
                    source={data.image ? { uri: data.image } : { uri: 'https://via.placeholder.com/150' }}
                    style={styles.image}
                />
            </View>

            {/* --- BAGIAN 2: INFORMASI TEXT --- */}
            {/* numberOfLines={2} membatasi teks maksimal 2 baris.
                Jika nama barang kepanjangan, nanti akan muncul titik-titik (...) */}
            <Text style={styles.name} numberOfLines={2}>{data.name}</Text>

            {/* Menampilkan sisa stok */}
            <Text style={{ fontSize: 12, color: '#888', marginBottom: 10 }}>Stock: {data.stock}</Text>

            {/* --- BAGIAN 3: TOMBOL ADD --- */}
            <TouchableOpacity
                // Style Dinamis:
                // Jika tersedia (isAvailable true), warna biru (#26C6DA).
                // Jika habis, warna abu-abu (#ccc).
                style={[styles.addButton, { backgroundColor: isAvailable ? '#26C6DA' : '#ccc' }]}

                // Aksi Klik:
                // Panggil fungsi onAdd milik induk saat tombol ditekan.
                onPress={onAdd}

                // Properti disabled:
                // Jika stok habis (!isAvailable), tombol dimatikan (tidak bisa diklik).
                disabled={!isAvailable}
            >
                {/* Teks Tombol juga berubah sesuai status stok */}
                <Text style={{ color: 'white', fontWeight: 'bold' }}>
                    {isAvailable ? 'Add to Cart' : 'Habis'}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

// --- STYLING ---
const styles = StyleSheet.create({
    card: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 10,
        margin: 5,
        alignItems: 'center',

        // elevation: Memberikan efek bayangan (shadow) khusus di Android
        elevation: 2
    },
    imageContainer: {
        width: 80,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        backgroundColor: '#f5f5f5', // Latar belakang abu muda di belakang gambar
        borderRadius: 40 // Membuat lingkaran (setengah dari width/height)
    },
    image: {
        width: 50,
        height: 50,
        resizeMode: 'contain' // Gambar dipaskan agar tidak terpotong (aspect ratio terjaga)
    },
    name: {
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 5,
        height: 40 // Tinggi dipatok tetap agar kartu sejajar walau teks pendek/panjang
    },
    addButton: {
        width: '100%',
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: 'center'
    }
});