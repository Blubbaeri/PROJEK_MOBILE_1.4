// app/(tabs)/index.tsx
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
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
    const [connectionError, setConnectionError] = useState(false);

    // Gunakan ref untuk melacak pencarian agar polling tidak ganggu user ngetik
    const searchRef = useRef(searchQuery);
    useEffect(() => { searchRef.current = searchQuery; }, [searchQuery]);

    const mapEquipmentData = (data: any[]) => {
        return data.map((item: any) => {
            const currentStock = item.availableStock ?? item.totalStock ?? item.stock ?? 0;
            return {
                ...item,
                id: item.id,
                name: item.name,
                stock: currentStock,
                availableStock: currentStock,
                totalStock: item.totalStock ?? currentStock,
                status: item.status || (currentStock > 0 ? 'active' : 'inactive'),
            };
        });
    };

    const fetchData = async (categoryName: string | null, silent = false) => {
        if (!silent) setIsLoading(true);
        try {
            let res;
            if (categoryName === null) {
                res = await api.get('/api/Equipment/GetAllEquipmentWithStock', {
                    params: { PageSize: 100, PageNumber: 1, _t: Date.now() } // Tambah timestamp biar gak kena cache disk
                });
            } else {
                const cat = categories.find(c => c.name === categoryName);
                if (!cat) return;
                res = await api.get(`/api/Equipment/GetByCategoryIdWithStock/${cat.id}`, { params: { _t: Date.now() } });
            }

            const rawData = res.data?.data || (Array.isArray(res.data) ? res.data : []);
            setEquipment(mapEquipmentData(rawData));
            setConnectionError(false);
        } catch (err: any) {
            console.error('❌ Fetch Error:', err.message);
            setConnectionError(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async (silent = false) => {
        if (!searchRef.current.trim()) return;
        try {
            const res = await api.get('/api/Equipment/SearchWithStock', {
                params: { term: searchRef.current.trim(), _t: Date.now() }
            });
            const rawSearchData = res.data?.data || (Array.isArray(res.data) ? res.data : []);
            setEquipment(mapEquipmentData(rawSearchData));
        } catch (err) {
            console.error('Search error:', err);
        }
    };

    // 1. REFRESH SETIAP KALI TAB DIBUKA (Focus Effect)
    useFocusEffect(
        useCallback(() => {
            // Tarik data kategori sekali saja jika kosong
            if (categories.length === 0) {
                api.get('/api/Category/GetAllKategori').then(res => {
                    const data = res.data?.data || [];
                    setCategories(data.map((cat: any) => ({ id: cat.id, name: cat.name })));
                });
            }

            // Tarik data equipment terbaru
            if (searchRef.current.trim()) {
                handleSearch();
            } else {
                fetchData(selectedCategory);
            }
        }, [selectedCategory])
    );

    // 2. POLLING SYSTEM (Cek data setiap 10 detik secara background)
    useEffect(() => {
        const interval = setInterval(() => {
            if (searchRef.current.trim()) {
                handleSearch(true); // update pencarian secara diam-diam
            } else {
                fetchData(selectedCategory, true); // update list secara diam-diam
            }
        }, 10000); // 10 detik

        return () => clearInterval(interval);
    }, [selectedCategory]);

    // Debounce Search Effect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchQuery.trim()) handleSearch();
            else fetchData(selectedCategory);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        if (searchQuery.trim()) {
            handleSearch().finally(() => setIsRefreshing(false));
        } else {
            fetchData(selectedCategory).finally(() => setIsRefreshing(false));
        }
    };

    const handleAddToCart = async (item: any) => {
        try {
            // Cek stok terbaru ke server sebelum masukkan ke keranjang
            const resPsa = await api.get(`/api/Equipment/GetAvailablePsaIds/${item.id}`);
            const availableData = resPsa.data;

            if (!availableData || availableData.availableStock <= 0) {
                Toast.show({ type: 'error', text1: 'Maaf', text2: 'Stok baru saja habis dipesan orang lain' });
                // Refresh data agar UI terupdate ke 0
                fetchData(selectedCategory);
                return;
            }

            addToCart({
                id: availableData.availablePsaIds[0],
                perId: item.id,
                name: item.name,
                price: 0,
                quantity: 1,
                image: item.image,
                stock: availableData.availableStock,
            });

            // Langsung kurangi di UI lokal biar berasa cepet
            setEquipment(prev => prev.map(eq => eq.id === item.id
                ? { ...eq, stock: eq.stock - 1, availableStock: eq.availableStock - 1 }
                : eq
            ));

            Toast.show({ type: 'success', text1: 'Berhasil', text2: `${item.name} masuk keranjang` });
        } catch (error) {
            console.error('Add to cart error:', error);
        }
    };

    return (
        <View style={styles.mainContainer}>
            <StatusBar barStyle="light-content" backgroundColor="#5B4DBC" />
            <HomeHeader
                searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                categories={categories} selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
            />
            <View style={styles.bodyContainer}>
                {isLoading && !isRefreshing ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color="#5B4DBC" />
                    </View>
                ) : (
                    <EquipmentList
                        data={equipment}
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
    bodyContainer: { flex: 1, backgroundColor: '#F5F5F7', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingTop: 10 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});