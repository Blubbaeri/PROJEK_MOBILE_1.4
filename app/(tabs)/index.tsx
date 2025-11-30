// file: app/(tabs)/index.tsx

import React, { useCallback, useEffect, useState } from 'react';
import { View, StatusBar, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';

// --- IMPORTS COMPONENTS (YANG BARU DIBUAT) ---
import HomeHeader from '@/components/HomeHeader';
import EquipmentList from '@/components/EquipmentList';

import { Equipment, useCart } from '@/context/CartContext';
import { api } from "@/lib/api";

type Category = {
    id: number;
    name: string;
    description?: string;
};

export default function HomeScreen() {
    // --- STATE MANAGEMENT ---
    const [equipments, setEquipments] = useState<Equipment[]>([]);
    const [allEquipments, setAllEquipments] = useState<Equipment[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const { cart } = useCart();

    // --- LOGIC: FETCH DATA ---
    const fetchEquipments = useCallback(async () => {
        if (!refreshing) setLoading(true);
        try {
            const response = await api.get(`/api/equipment`);
            let equipmentData = [];

            // Handle response format
            if (response.data && Array.isArray(response.data.data)) {
                equipmentData = response.data.data;
            } else if (Array.isArray(response.data)) {
                equipmentData = response.data;
            }

            // Map status active
            equipmentData = equipmentData.map((item: any) => ({
                ...item,
                isAvailable: item.stock > 0 && item.status === 'active'
            }));

            setAllEquipments(equipmentData);
            setEquipments(equipmentData);
        } catch (err: any) {
            console.error("Error fetching data:", err.message);
            setAllEquipments([]);
            setEquipments([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [refreshing]);

    // --- LOGIC: FETCH CATEGORIES ---
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get(`/api/category`);
                let categoriesData = [];
                if (response.data && Array.isArray(response.data.data)) {
                    categoriesData = response.data.data;
                } else if (Array.isArray(response.data)) {
                    categoriesData = response.data;
                }
                setCategories(categoriesData);
            } catch (err) {
                // Dummy fallback if API fails
                setCategories([{ id: 1, name: "Drill" }, { id: 2, name: "Micrometer" }]);
            }
        };
        fetchCategories();
    }, []);

    // --- LOGIC: FILTERING ---
    useEffect(() => {
        if (!Array.isArray(allEquipments)) return;
        let filtered = [...allEquipments];

        // 1. Filter Search
        if (searchQuery) {
            filtered = filtered.filter((item) =>
                item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        // 2. Filter Category
        if (selectedCategory) {
            const catObj = categories.find(c => c.name === selectedCategory);
            if (catObj) {
                filtered = filtered.filter((item) => item.categoryId === catObj.id);
            }
        }

        // 3. Sort (Stock First)
        filtered.sort((a, b) => {
            if (a.stock === 0 && b.stock > 0) return 1;
            if (a.stock > 0 && b.stock === 0) return -1;
            return 0;
        });

        setEquipments(filtered);
    }, [searchQuery, selectedCategory, allEquipments, categories]);

    // --- REFRESH HANDLER ---
    useFocusEffect(
        useCallback(() => {
            fetchEquipments();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchEquipments();
    };

    // --- RENDER UTAMA (BERSIH & RAPI) ---
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#5B4DBC" />

            {/* Komponen Header Ungu */}
            <HomeHeader
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                categories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
            />

            {/* Komponen Daftar Alat */}
            <EquipmentList
                data={equipments}
                loading={loading}
                refreshing={refreshing}
                onRefresh={onRefresh}
                cart={cart}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#5B4DBC' },
});