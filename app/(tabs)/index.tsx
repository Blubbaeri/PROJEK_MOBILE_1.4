// app/(tabs)/index.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, StatusBar, ActivityIndicator, Text } from 'react-native';
import { useFocusEffect } from 'expo-router';
import Toast from 'react-native-toast-message';

import { useCart } from '../../context/CartContext';
import { api } from '../../lib/api';

import HomeHeader from '../../components/HomeHeader';
import EquipmentList from '../../components/EquipmentList';

type Category = {
    id: number;
    name: string;
};

export default function HomeScreen() {
    const { addToCart } = useCart()
    const [equipment, setEquipment] = useState<any[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null); // null = All
    const [searchQuery, setSearchQuery] = useState('');

    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [connectionError, setConnectionError] = useState(false);

    /* =============================
        TEST CONNECTION
    ============================== */
    const testConnection = async () => {
        try {
            await api.get('/api/category');
            setConnectionError(false);
            return true;
        } catch {
            setConnectionError(true);
            return false;
        }
    };

    /* =============================
        FETCH CATEGORIES
    ============================== */
    const fetchAllCategories = async () => {
        try {
            const res = await api.get('/api/category');
            const data = res.data?.data ?? [];

            const formatted: Category[] = data.map((cat: any) => ({
                id: cat.id,
                name: cat.name
            }));

            setCategories(formatted);
            setSelectedCategory(null); // default All
        } catch (err) {
            console.error('Gagal ambil kategori:', err);
            setCategories([]);
            setSelectedCategory(null);
        }
    };

    /* =============================
        FETCH EQUIPMENT
    ============================== */
    const fetchData = async (categoryName: string | null) => {
        try {
            let res;
            if (categoryName === null) {
                res = await api.get('/api/equipment/with-stock');
            } else {
                const cat = categories.find(c => c.name === categoryName);
                if (!cat) return;
                res = await api.get(`/api/equipment/category/${cat.id}/with-stock`);
            }

            // NORMALIZE DATA: mapping dari API response ke format yang diharapkan
            const normalizedData = (res.data?.data ?? []).map((item: any) => ({
                id: item.equipmentId,           // ← map equipmentId ke id
                name: item.equipmentName,       // ← map equipmentName ke name
                equipmentId: item.equipmentId,  // ← tetap simpan original jika perlu
                equipmentName: item.equipmentName,
                categoryId: item.categoryId,
                categoryName: item.categoryName,
                locationId: item.locationId,
                locationName: item.locationName,
                status: item.status,
                stock: item.availableStock,     // ← map availableStock ke stock
                availableStock: item.availableStock,
                totalStock: item.totalStock,
                image: item.image || null,      // default jika tidak ada
                // tambahkan field lain jika perlu
            }));

            setEquipment(normalizedData);
            setConnectionError(false);
        } catch (err) {
            console.error('Gagal ambil equipment:', err);
            setEquipment([]);
            setConnectionError(true);
        }
    };

    /* =============================
        INITIAL LOAD
    ============================== */
    const loadInitialData = async () => {
        if (!isInitialLoad) return;

        setIsLoading(true);
        const ok = await testConnection();
        if (!ok) {
            setIsLoading(false);
            return;
        }

        await fetchAllCategories();
        await fetchData(null);

        setIsInitialLoad(false);
        setIsLoading(false);
    };

    /* =============================
        LOAD BY CATEGORY
    ============================== */
    const loadDataByCategory = async () => {
        if (isInitialLoad) return;

        setIsLoading(true);
        await fetchData(selectedCategory);
        setIsLoading(false);
    };

    useFocusEffect(
        useCallback(() => {
            loadInitialData();
        }, [])
    );

    useEffect(() => {
        loadDataByCategory();
    }, [selectedCategory]);

    /* =============================
        HANDLERS
    ============================== */
    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchData(selectedCategory).finally(() => {
            setIsRefreshing(false);
        });
    };

    // HomeScreen.tsx
    const handleAddToCart = async (item: any) => {
        try {
            console.log(`🎯 Adding ${item.name} to cart`);

            // Debug: cek item structure
            console.log('📦 Item details:', {
                id: item.id,
                equipmentId: item.equipmentId,
                name: item.name,
                currentStock: item.stock,
                availableStock: item.availableStock
            });

            // 1. Get available PSA IDs
            const equipmentId = item.equipmentId || item.id;
            console.log(`🔍 Calling API: /api/equipment/${equipmentId}/available-psa`);

            const res = await api.get(`/api/equipment/${equipmentId}/available-psa`);
            const availableData = res.data?.data;

            console.log('📊 API Response:', availableData);

            if (!availableData || availableData.availableStock <= 0) {
                Toast.show({
                    type: 'error',
                    text1: 'Stok habis',
                    text2: `${item.name} tidak tersedia saat ini`
                });
                return;
            }

            // 2. Ambil PSA_ID pertama yang available
            const psaId = availableData.availablePsaIds[0];
            console.log(`✅ Using PSA_ID: ${psaId}`);

            // 3. Add to cart - PERBAIKAN DI SINI!
            addToCart({
                id: psaId,                    // PSA_ID untuk identifikasi di cart
                perId: equipmentId,           // PER_ID untuk API booking
                name: item.name,
                price: 0,
                quantity: 1,
                image: item.image,
                stock: availableData.availableStock,
                availablePsaIds: availableData.availablePsaIds
            });

            // 4. Update local state - PERBAIKAN DI SINI JUGA!
            setEquipment(prev =>
                prev.map(eq => {
                    if (eq.id === item.id) {
                        const newStock = Math.max(0, (eq.availableStock || 0) - 1);

                        console.log(`🔄 Updating ${eq.name}: ${eq.availableStock} → ${newStock}`);

                        return {
                            ...eq,
                            stock: newStock,
                            availableStock: newStock,
                            status: newStock > 0 ? 'available' : 'unavailable'  // UPDATE STATUS JUGA!
                        };
                    }
                    return eq;
                })
            );

            Toast.show({
                type: 'success',
                text1: 'Berhasil',
                text2: `${item.name} masuk keranjang`
            });

        } catch (error: any) {
            console.error('❌ FULL ERROR DETAILS:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                url: error.config?.url
            });

            Toast.show({
                type: 'error',
                text1: 'Gagal',
                text2: error.response?.data?.message || 'Gagal menambah ke keranjang'
            });
        }
    };

    /* =============================
        FILTER SEARCH
    ============================== */
    const filteredData = equipment.filter(item =>
        item.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    /* =============================
        UI
    ============================== */
    if (connectionError && !isLoading) {
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
                <View style={[styles.bodyContainer, styles.center]}>
                    <Text style={{ fontSize: 18, color: 'red' }}>❌ Koneksi Error</Text>
                    <Text>Periksa server API</Text>
                </View>
            </View>
        );
    }

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
                {isLoading && !isRefreshing ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color="#5B4DBC" />
                        <Text>Loading...</Text>
                    </View>
                ) : (
                    <EquipmentList
                        data={filteredData}
                        loading={isLoading}
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        onAddToCart={handleAddToCart}
                    />
                )}
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
        paddingTop: 10
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
});
