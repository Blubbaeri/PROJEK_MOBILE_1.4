//app/(tabs)/index.tsx

import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import axios from 'axios';
import { useFocusEffect } from 'expo-router';
import { useCart } from '../../context/CartContext';
import Toast from 'react-native-toast-message';
    
import HomeHeader from '../../components/HomeHeader';
import EquipmentList from '../../components/EquipmentList';

//const IP_ADDRESS = "192.168.100.4";
const IP_ADDRESS = "10.1.6.125";
const PORT = "5234";
const API_URL = `http://${IP_ADDRESS}:${PORT}/api/equipment`;

export default function HomeScreen() {
    const { addToCart } = useCart();

    const [equipment, setEquipment] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true); // Flag untuk pertama kali load

    // Ambil SEMUA kategori dari semua data
    const fetchAllCategories = async () => {
        try {
            const response = await axios.get(API_URL);
            const responseData = response.data;
            const allData = responseData?.data || responseData || [];

            // Extract semua kategori unik
            const categoryMap = new Map();

            // Ambil kategori dari semua data
            allData.forEach((item: any) => {
                if (item.categoryName && !categoryMap.has(item.categoryName)) {
                    categoryMap.set(item.categoryName, {
                        id: item.categoryId || categoryMap.size,
                        name: item.categoryName
                    });
                }
            });

            // Konversi ke array
            const allCategories = Array.from(categoryMap.values());
            setCategories(allCategories);

            return allData; // Return data untuk digunakan di fetchData jika perlu

        } catch (error) {
            console.error("Gagal mengambil kategori:", error);
            setCategories([{ id: 0, name: 'All' }]);
            return [];
        }
    };

    // Ambil data dengan filter
    const fetchData = async (categoryName: string | null) => {
        try {
            let url = API_URL;

            if (categoryName && categoryName !== 'All') {
                const encodedName = encodeURIComponent(categoryName);
                url = `${API_URL}/category/${encodedName}`;
            }

            const response = await axios.get(url);
            const responseData = response.data;
            const data = responseData?.data || responseData || [];

            setEquipment(data);

        } catch (error) {
            console.error("Gagal mengambil data:", error);
            setEquipment([]);
        }
    };

    // Load data awal saat pertama kali masuk
    const loadInitialData = async () => {
        if (!isInitialLoad) return;

        setIsLoading(true);
        try {
            // Ambil semua kategori SEKALI SAJA di awal
            await fetchAllCategories();

            // Ambil data sesuai kategori yang dipilih (default All)
            await fetchData(selectedCategory);

            setIsInitialLoad(false);
        } catch (error) {
            console.error("Gagal load data awal:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Load data saat kategori berubah
    const loadDataByCategory = async () => {
        if (isInitialLoad) return; // Skip jika masih load awal

        setIsLoading(true);
        try {
            await fetchData(selectedCategory);
        } catch (error) {
            console.error("Gagal load data by category:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Trigger saat screen focus
    useFocusEffect(
        useCallback(() => {
            loadInitialData();
        }, []) // Empty dependency - hanya sekali
    );

    // Trigger saat selectedCategory berubah
    useEffect(() => {
        if (!isInitialLoad) {
            loadDataByCategory();
        }
    }, [selectedCategory]);

    // Refresh data (pull to refresh)
    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchData(selectedCategory).finally(() => {
            setIsRefreshing(false);
        });
    };

    // Tambah ke keranjang
    const handleAddToCart = (item: any) => {
        if (item.stock <= 0) {
            Toast.show({ type: 'error', text1: 'Stok Habis!', text2: 'Barang tidak tersedia.' });
            return;
        }

        addToCart({
            id: item.id,
            name: item.name,
            price: 0,
            quantity: 1,
            image: item.image,
            stock: item.stock
        });

        setEquipment(currentData =>
            currentData.map(eq => {
                if (eq.id === item.id) {
                    return { ...eq, stock: eq.stock - 1 };
                }
                return eq;
            })
        );

        Toast.show({ type: 'success', text1: 'Berhasil', text2: `${item.name} masuk keranjang` });
    };

    // Filter data berdasarkan search
    const filteredData = equipment.filter(item =>
        item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <View style={styles.mainContainer}>
            <StatusBar barStyle="light-content" backgroundColor="#5B4DBC" />

            <HomeHeader
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                categories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
            />

            <View style={styles.bodyContainer}>
                <EquipmentList
                    data={filteredData}
                    loading={isLoading}
                    refreshing={isRefreshing}
                    onRefresh={handleRefresh}
                    onAddToCart={handleAddToCart}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: '#5B4DBC' },
    bodyContainer: {
        flex: 1,
        backgroundColor: '#F5F5F7',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        overflow: 'hidden',
        paddingTop: 10
    }
});