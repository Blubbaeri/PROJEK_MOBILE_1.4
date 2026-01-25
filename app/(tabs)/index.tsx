// app/(tabs)/index.tsx
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';

import { useCart } from '../../context/CartContext';
import { api } from '../../lib/api';

import EquipmentList from '../../components/EquipmentList';
import HomeHeader from '../../components/HomeHeader';

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
            let equipmentData: any[] = [];

            if (categoryName === null) {
                console.log('📦 Fetching ALL equipment WITH stock...');
                const res = await api.get('/api/Equipment/GetAllEquipmentWithStock', {
                    params: {
                        PageSize: 100,  
                        PageNumber: 1,
                        CheckTime: new Date().toISOString() 
                    }
                });

                // Handle response structure
                if (res.data && res.data.data && Array.isArray(res.data.data)) {
                    equipmentData = res.data.data;
                    console.log('📦 All equipment count:', equipmentData.length);
                } else if (Array.isArray(res.data)) {
                    equipmentData = res.data;
                }
            } else {
                const cat = categories.find(c => c.name === categoryName);
                if (!cat) return;

                console.log(`📦 Fetching equipment for category ${cat.id} (${cat.name}) WITH stock...`);
                const res = await api.get(`/api/Equipment/GetByCategoryIdWithStock/${cat.id}`, {
                    params: {
                        PageSize: 100,
                        PageNumber: 1,
                        CheckTime: new Date().toISOString() 
                    }
                });

                if (Array.isArray(res.data)) {
                    equipmentData = res.data;
                    console.log('📦 Category equipment count:', equipmentData.length);
                }
            }

            // Normalize data
            const normalizedData = equipmentData.map((item: any) => {
                const availableStock = item.availableStock ?? (item.stock ?? 0);

                return {
                    id: item.id, 
                    name: item.name,
                    equipmentId: item.id,
                    equipmentName: item.name,
                    categoryId: item.categoryId,
                    categoryName: item.categoryName,
                    locationId: item.locationId,
                    locationName: item.locationName,
                    status: item.status || 'active',
                    stock: availableStock, 
                    availableStock: availableStock,
                    totalStock: item.totalStock || 0,
                    image: item.image || null,
                };
            });

            console.log('✅ Normalized equipment:', {
                count: normalizedData.length,
                sample: normalizedData.slice(0, 2)
            });

            setEquipment(normalizedData);
            setConnectionError(false);

        } catch (err: any) {
            console.error('❌ fetchData error:', {
                message: err.message,
                status: err.response?.status,
                data: err.response?.data
            });

            // FALLBACK: Coba ambil tanpa pagination
            if (err.response?.status === 400) {
                try {
                    await fetchDataWithoutPagination(categoryName);
                } catch {
                    setEquipment([]);
                    setConnectionError(true);
                }
            } else {
                setEquipment([]);
                setConnectionError(true);
            }
        }
    };

    /* FUNCTION FALLBACK TANGA PAGINATION */
    const fetchDataWithoutPagination = async (categoryName: string | null) => {
        try {
            let url = '';

            if (categoryName === null) {
                url = '/api/Equipment/GetAllEquipmentWithStock';
            } else {
                const cat = categories.find(c => c.name === categoryName);
                if (!cat) return;
                url = `/api/Equipment/GetByCategoryIdWithStock/${cat.id}`;
            }

            const res = await api.get(url);

            let equipmentData: any[] = [];
            if (res.data && res.data.data && Array.isArray(res.data.data)) {
                equipmentData = res.data.data;
            } else if (Array.isArray(res.data)) {
                equipmentData = res.data;
            }

            const normalizedData = equipmentData.map((item: any) => ({
                id: item.id,
                name: item.name,
                equipmentId: item.id,
                equipmentName: item.name,
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

            setEquipment(normalizedData);
            setConnectionError(false);

        } catch (error) {
            throw error;
        }
    };

    /* SEARCH EQUIPMENT */
    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            fetchData(selectedCategory);
            return;
        }

        try {
            console.log('🔍 Searching equipment:', searchQuery);
            const res = await api.get('/api/Equipment/SearchWithStock', {
                params: { term: searchQuery.trim() }
            });

            let searchData: any[] = [];
            if (Array.isArray(res.data)) {
                searchData = res.data;
            }

            const normalizedData = searchData.map((item: any) => ({
                id: item.id,
                name: item.name,
                equipmentId: item.id,
                equipmentName: item.name,
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

            setEquipment(normalizedData);

        } catch (err) {
            console.error('Search error:', err);
            Toast.show({
                type: 'error',
                text1: 'Search Error',
                text2: 'Gagal melakukan pencarian'
            });
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

    /* HANDLE SEARCH EFFECT */
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchQuery.trim()) {
                handleSearch();
            }
        }, 500); // Debounce 500ms

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    /* FILTER SEARCH */
    const filteredData = useMemo(() => {
        if (!equipment || equipment.length === 0) {
            return [];
        }

        // Jika ada search query, pakai hasil search, jika tidak pakai semua
        if (searchQuery.trim()) {
            return equipment;
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
            const currentStock = item.availableStock || item.stock || 0;
            console.log('🛒 Checking stock before add:', {
                itemName: item.name,
                currentStock: currentStock
            });

            if (currentStock <= 0) {
                Toast.show({
                    type: 'error',
                    text1: 'Stok habis',
                    text2: `${item.name} tidak tersedia saat ini`
                });
                return;
            }

            const equipmentId = item.id;
            console.log('🛒 Getting available PSA IDs for equipment:', equipmentId);

            const res = await api.get(`/api/Equipment/GetAvailablePsaIds/${equipmentId}`);
            const availableData = res.data;

            console.log('🛒 Available PSA IDs response:', availableData);

            if (!availableData || availableData.availableStock <= 0) {
                Toast.show({
                    type: 'error',
                    text1: 'Sedang dipesan',
                    text2: `${item.name} sedang dipesan orang lain (Total: ${availableData?.totalStock || 0})`
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

            console.log('🛒 Adding to cart:', {
                psaId: psaId,
                perId: equipmentId,
                name: item.name
            });

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

            // UPDATE LOCAL STOCK SETELAH ADD TO CART
            setEquipment(prev =>
                prev.map(eq => {
                    if (eq.id === item.id) {
                        const newStock = Math.max(0, (eq.availableStock || 0) - 1);
                        console.log('📉 Updating stock for:', eq.name, 'from', eq.availableStock, 'to', newStock);
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
            console.error('❌ Add to cart error:', {
                message: error.message,
                response: error.response?.data,
                url: error.config?.url
            });

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