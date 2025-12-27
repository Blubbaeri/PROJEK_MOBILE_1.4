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
    const { addToCart } = useCart();

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
                // ALL
                res = await api.get('/api/equipment/with-stock');
            } else {
                const cat = categories.find(c => c.name === categoryName);
                if (!cat) return;

                res = await api.get(`/api/equipment/category/${cat.id}/with-stock`);
            }

            setEquipment(res.data?.data ?? []);
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

    const handleAddToCart = (item: any) => {
        if (item.stock <= 0) {
            Toast.show({ type: 'error', text1: 'Stok habis' });
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

        setEquipment(prev =>
            prev.map(eq =>
                eq.id === item.id ? { ...eq, stock: eq.stock - 1 } : eq
            )
        );

        Toast.show({
            type: 'success',
            text1: 'Berhasil',
            text2: `${item.name} masuk keranjang`
        });
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
