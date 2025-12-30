    //components/equipmentCard.tsx

    import React from 'react';
    import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

    interface EquipmentCardProps {
        data: any;
        onAdd: () => void; 
    }

    export default function EquipmentCard({ data, onAdd }: EquipmentCardProps) {

        console.log('🎯 EquipmentCard received:', {
            id: data.id,
            name: data.name,
            stock: data.stock,
            available: data.available,
            allFields: Object.keys(data)
        });

        const isAvailable = data.stock > 0;

        console.log(`📊 ${data.name}: stock=${data.stock}, isAvailable=${isAvailable}`);

        return (
            <View style={styles.card}>
                {/* --- BAGIAN 1: GAMBAR BARANG --- */}
                <View style={styles.imageContainer}>
                    <Image
                        source={data.image ? { uri: data.image } : { uri: 'https://via.placeholder.com/150' }}
                        style={styles.image}
                    />
                </View>

                <Text style={styles.name} numberOfLines={2}>{data.name}</Text>
            
                {/* Menampilkan sisa stok */}
                <Text style={{ fontSize: 12, color: '#888', marginBottom: 10 }}>Stock: {data.stock}</Text>

                {/* --- BAGIAN 3: TOMBOL ADD --- */}
                <TouchableOpacity

                    style={[styles.addButton, { backgroundColor: isAvailable ? '#26C6DA' : '#ccc' }]}
                    onPress={onAdd}
                    disabled={!isAvailable}
                >
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