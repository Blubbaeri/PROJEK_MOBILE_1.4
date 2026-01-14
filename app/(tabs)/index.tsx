// app/(tabs)/index.tsx
import React, { useState, useCallback, useEffect, useMemo } from 'react';
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
    const { addToCart } = useCart();
    const [equipment, setEquipment] = useState<any[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [connectionError, setConnectionError] = useState(false);

    /* FETCH CATEGORIES */
    const fetchAllCategories = async () => {
        try {
            const res = await api.get('/api/Category/GetAllKategori');
            const data = res.data?.data || [];

            const formatted: Category[] = data.map((cat: any) => ({
                id: cat.id,
                name: cat.name
            }));

            setCategories(formatted);
            setSelectedCategory(null);
        } catch (err: any) {
            console.error('Failed to fetch categories:', err.message);
            setCategories([]);
            setSelectedCategory(null);
        }
    };

    /* FETCH EQUIPMENT */
    const fetchData = async (categoryName: string | null) => {
        try {
            let res;
            if (categoryName === null) {
                console.log('📦 Fetching ALL equipment (WITHOUT stock filter)...');
                // PAKAI YANG TANPA FILTER STOCK
                res = await api.get('/api/Equipment/GetAllEquipment');
            } else {
                const cat = categories.find(c => c.name === categoryName);
                if (!cat) return;

                console.log(`📦 Fetching equipment for category ${cat.id} (${cat.name})...`);
                // PAKAI YANG TANPA FILTER STOCK
                res = await api.get(`/api/Equipment/GetByCategoryId/${cat.id}`);
            }

            console.log('📦 Equipment API Response:', {
                status: res.status,
                dataType: typeof res.data,
                isArray: Array.isArray(res.data),
                dataKeys: Object.keys(res.data || {})
            });

            // DEBUG: Tampilkan sample data
            if (res.data && res.data.data) {
                console.log('📦 Sample items (first 2):', res.data.data.slice(0, 2));
            } else if (Array.isArray(res.data)) {
                console.log('📦 Sample items (first 2):', res.data.slice(0, 2));
            }

            // Handle response structure
            let equipmentData: any[] = [];

            if (Array.isArray(res.data)) {
                // Case 1: Response langsung array
                equipmentData = res.data;
                console.log('📦 Direct array response');
            } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
                // Case 2: Response { data: [...], totalData: X }
                equipmentData = res.data.data;
                console.log('📦 Object with data property');
            } else if (res.data && typeof res.data === 'object') {
                // Case 3: Mungkin object lain
                console.log('📦 Other object structure:', Object.keys(res.data));
                equipmentData = Object.values(res.data).filter(item => typeof item === 'object');
            }

            console.log('📦 Equipment data extracted:', equipmentData.length, 'items');

            // Normalize data
            const normalizedData = equipmentData.map((item: any) => {
                // Cek field yang tersedia
                console.log('🔍 Item fields:', Object.keys(item));

                return {
                    id: item.id || item.equipmentId,
                    name: item.name || item.equipmentName,
                    equipmentId: item.id || item.equipmentId,
                    equipmentName: item.name || item.equipmentName,
                    categoryId: item.categoryId,
                    categoryName: item.categoryName,
                    locationId: item.locationId,
                    locationName: item.locationName,
                    status: item.status || 'active',
                    // PERHATIAN: Endpoint tanpa stock mungkin tidak punya availableStock!
                    // Coba ambil dari field yang ada
                    stock: item.availableStock || item.stock || 0,
                    availableStock: item.availableStock || item.stock || 0,
                    totalStock: item.totalStock || 0,
                    image: item.image || null,
                };
            });

            console.log('✅ Normalized equipment:', {
                count: normalizedData.length,
                firstItem: normalizedData[0]
            });

            setEquipment(normalizedData);
            setConnectionError(false);

        } catch (err: any) {
            console.error('❌ fetchData error:', {
                message: err.message,
                status: err.response?.status,
                data: err.response?.data,
                url: err.config?.url
            });

            // Fallback: Coba pakai endpoint withStock jika yang tanpa stock error
            console.log('🔄 Trying fallback to WithStock endpoint...');
            try {
                let fallbackRes;
                if (categoryName === null) {
                    fallbackRes = await api.get('/api/Equipment/GetAllEquipmentWithStock');
                } else {
                    const cat = categories.find(c => c.name === categoryName);
                    if (cat) {
                        fallbackRes = await api.get(`/api/Equipment/GetByCategoryIdWithStock/${cat.id}`);
                    }
                }

                if (fallbackRes) {
                    console.log('✅ Fallback successful');
                    // Process fallback data
                    let fallbackData: any[] = [];

                    if (Array.isArray(fallbackRes.data)) {
                        fallbackData = fallbackRes.data;
                    } else if (fallbackRes.data && fallbackRes.data.data && Array.isArray(fallbackRes.data.data)) {
                        fallbackData = fallbackRes.data.data;
                    }

                    const normalized = fallbackData.map((item: any) => ({
                        id: item.id || item.equipmentId,
                        name: item.name || item.equipmentName,
                        equipmentId: item.id || item.equipmentId,
                        equipmentName: item.name || item.equipmentName,
                        categoryId: item.categoryId,
                        categoryName: item.categoryName,
                        locationId: item.locationId,
                        locationName: item.locationName,
                        status: item.status || 'active',
                        stock: item.availableStock || 0,
                        availableStock: item.availableStock || 0,
                        totalStock: item.totalStock || 0,
                        image: item.image || null,
                    }));

                    setEquipment(normalized);
                    setConnectionError(false);
                    return;
                }
            } catch (fallbackErr) {
                console.error('❌ Fallback also failed:', (fallbackErr as Error).message);
            }

            setEquipment([]);
            setConnectionError(true);
        }
    };

    /* INITIAL LOAD */
    const loadInitialData = async () => {
        if (!isInitialLoad) return;

        setIsLoading(true);

        try {
            await fetchAllCategories();
            await fetchData(null);
            setIsInitialLoad(false);
        } catch (error) {
            console.error('loadInitialData failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    /* LOAD BY CATEGORY */
    const loadDataByCategory = async () => {
        if (isInitialLoad) return;

        setIsLoading(true);
        await fetchData(selectedCategory);
        setIsLoading(false);
    };

    /* USE EFFECTS */
    useFocusEffect(
        useCallback(() => {
            loadInitialData();
        }, [])
    );

    useEffect(() => {
        loadDataByCategory();
    }, [selectedCategory]);

    /* FILTER SEARCH */
    const filteredData = useMemo(() => {
        if (!equipment || equipment.length === 0) {
            return [];
        }

        return equipment.filter(item => {
            const itemName = item.name || '';
            return itemName.toLowerCase().includes(searchQuery.toLowerCase());
        });
    }, [equipment, searchQuery]);

    /* HANDLERS */
    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchData(selectedCategory).finally(() => {
            setIsRefreshing(false);
        });
    };

    const handleAddToCart = async (item: any) => {
        try {
            const equipmentId = item.equipmentId || item.id;
            const res = await api.get(`/api/Equipment/GetAvailablePsaIds/${equipmentId}`);
            const availableData = res.data;

            if (!availableData || availableData.availableStock <= 0) {
                Toast.show({
                    type: 'error',
                    text1: 'Stok habis',
                    text2: `${item.name} tidak tersedia saat ini`
                });
                return;
            }

            const psaId = availableData.availablePsaIds?.[0];
            if (!psaId) {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Tidak ada PSA ID yang tersedia'
                });
                return;
            }

            addToCart({
                id: psaId,
                perId: equipmentId,
                name: item.name,
                price: 0,
                quantity: 1,
                image: item.image,
                stock: availableData.availableStock,
                availablePsaIds: availableData.availablePsaIds
            });

            // Update local stock
            setEquipment(prev =>
                prev.map(eq => {
                    if (eq.id === item.id) {
                        const newStock = Math.max(0, (eq.availableStock || 0) - 1);
                        return {
                            ...eq,
                            stock: newStock,
                            availableStock: newStock,
                            status: newStock > 0 ? 'available' : 'unavailable'
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
            console.error('Add to cart error:', error.message);
            Toast.show({
                type: 'error',
                text1: 'Gagal',
                text2: error.response?.data?.message || 'Gagal menambah ke keranjang'
            });
        }
    };

    /* UI */
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
                        <Text>Loading equipment...</Text>
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
    mainContainer: {
        flex: 1,
        backgroundColor: '#5B4DBC'
    },
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