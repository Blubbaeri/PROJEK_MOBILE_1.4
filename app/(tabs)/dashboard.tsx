    // file: app/index.tsx

    import EquipmentCard from '@/components/EquipmentCard';
    import { Equipment, useCart } from '@/context/CartContext';
    import { FontAwesome } from '@expo/vector-icons';
    import React, { useCallback, useEffect, useState } from 'react';
    import {
        ActivityIndicator,
        FlatList,
        SafeAreaView,
        ScrollView,
        StyleSheet,
        Text,
        TextInput,
        TouchableOpacity,
        View
    } from 'react-native';
    import { api } from "@/lib/api";

    type Category = {
        id: number;
        name: string;
    };

    type ListHeaderProps = {
        searchQuery: string;
        setSearchQuery: (text: string) => void;
        categories: Category[];
        selectedCategory: string | null; // ✅ UBAH KE string
        setSelectedCategory: (name: string | null) => void; // ✅ UBAH KE string
    };

    const ListHeader: React.FC<ListHeaderProps> = ({
        searchQuery, setSearchQuery,
        categories, selectedCategory, setSelectedCategory
    }) => (
        <View style={styles.headerContainer}>
            <View style={styles.searchContainer}>
                <FontAwesome name="search" size={20} color="#888" style={styles.searchIcon} />
                <TextInput
                    placeholder="Search equipment..."
                    style={styles.searchInput}
                    placeholderTextColor="#888"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScrollView}>
                <TouchableOpacity
                    style={[styles.categoryButton, selectedCategory === null && styles.categoryButtonActive]}
                    onPress={() => setSelectedCategory(null)}
                >
                    <Text style={[styles.categoryText, selectedCategory === null && styles.categoryTextActive]}>All</Text>
                </TouchableOpacity>

                {categories.map((cat) => (
                    <TouchableOpacity
                        key={cat.id}
                        style={[styles.categoryButton, selectedCategory === cat.name && styles.categoryButtonActive]} // ✅ COMPARE DENGAN cat.name
                        onPress={() => setSelectedCategory(cat.name)} // ✅ SET cat.name
                    >
                        <Text style={[styles.categoryText, selectedCategory === cat.name && styles.categoryTextActive]}>
                            {cat.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );

    export default function HomeScreen() {
        const [equipments, setEquipments] = useState<Equipment[]>([]);
        const [allEquipments, setAllEquipments] = useState<Equipment[]>([]);
        const [categories, setCategories] = useState<Category[]>([]);
        const [loading, setLoading] = useState(true);
        const [searchQuery, setSearchQuery] = useState('');
        const [selectedCategory, setSelectedCategory] = useState<string | null>(null); // ✅ UBAH KE string

        const { cart } = useCart();

        // === GET EQUIPMENT ===
        const fetchEquipments = useCallback(async () => {
            setLoading(true);
            try {
                const response = await api.get(`/api/equipment`);

                // ✅ FIX: Ambil data dari response.data.data
                let equipmentData = [];
                if (response.data && Array.isArray(response.data.data)) {
                    equipmentData = response.data.data;
                }

                // ✅ FIX: Tambahkan type 'any' untuk item
                equipmentData = equipmentData.map((item: any) => ({
                    ...item,
                    isAvailable: item.stock > 0 && item.status === 'active'
                }));

                setAllEquipments(equipmentData);
                setEquipments(equipmentData);

            } catch (err: any) {
                console.error("Gagal mengambil data alat:", err.message);
                setAllEquipments([]);
                setEquipments([]);
            } finally {
                setLoading(false);
            }
        }, []);

        // === FILTER DATA DI FRONTEND ===
        useEffect(() => {
            if (!Array.isArray(allEquipments)) {
                setEquipments([]);
                return;
            }

            let filtered = [...allEquipments];

            // Filter by search query
            if (searchQuery) {
                filtered = filtered.filter((item: Equipment) =>
                    item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
                );
            }

            // ✅ FIX: Filter by categoryId
            if (selectedCategory) {
                const selectedCat = categories.find(cat => cat.name === selectedCategory);
                if (selectedCat) {
                    filtered = filtered.filter((item: Equipment) => item.categoryId === selectedCat.id);
                }
            }

            // Sort by stock
            filtered.sort((a: Equipment, b: Equipment) => {
                if (a.stock === 0 && b.stock > 0) return 1;
                if (a.stock > 0 && b.stock === 0) return -1;
                return 0;
            });

            setEquipments(filtered);
        }, [searchQuery, selectedCategory, allEquipments, categories]);

        // === GET CATEGORY ===
        useEffect(() => {
            const fetchCategories = async () => {
                try {
                    const response = await api.get(`/api/category`);
                    console.log("Categories API Response:", response.data);

                    // ✅ FIX: Handle kemungkinan response structure
                    let categoriesData = [];

                    if (Array.isArray(response.data)) {
                        categoriesData = response.data;
                    } else if (response.data && Array.isArray(response.data.data)) {
                        categoriesData = response.data.data;
                    } else {
                        console.log("Unexpected categories structure, using fallback");
                        categoriesData = [];
                    }

                    console.log("Processed categories:", categoriesData);
                    setCategories(categoriesData);

                } catch (err) {
                    console.error("Gagal mengambil kategori:", err);
                    // Fallback categories
                    setCategories([
                        { id: 1, name: "Drill" },
                        { id: 2, name: "Micrometer" },
                        { id: 3, name: "Caliper" }
                    ]);
                }
            };
            fetchCategories();
        }, []);

        // Load equipment sekali saat component mount
        useEffect(() => {
            fetchEquipments();
        }, [fetchEquipments]);

        return (
            <SafeAreaView style={styles.container}>
                <FlatList
                    ListHeaderComponent={
                        <ListHeader
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            categories={categories}
                            selectedCategory={selectedCategory}
                            setSelectedCategory={setSelectedCategory}
                        />
                    }
                    data={equipments}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    renderItem={({ item }) => {
                        const itemInCart = cart.find((c) => c.id === item.id);
                        const quantityInCart = itemInCart ? itemInCart.quantity : 0;

                        return <EquipmentCard item={item} quantityInCart={quantityInCart} />;
                    }}
                    ListEmptyComponent={() =>
                        loading ? (
                            <ActivityIndicator style={{ marginTop: 50 }} size="large" color="#6A5AE0" />
                        ) : (
                            <Text style={styles.centerText}>No equipment found.</Text>
                        )
                    }
                />
            </SafeAreaView>
        );
    }

    // Styles tetap sama
    const styles = StyleSheet.create({
        container: { flex: 1, backgroundColor: '#F4F6F8' },
        headerContainer: { paddingTop: 40, paddingBottom: 10, backgroundColor: '#6A5AE0', marginBottom: 10 },
        searchContainer: {
            backgroundColor: 'white',
            width: '90%',
            alignSelf: 'center',
            borderRadius: 12,
            paddingHorizontal: 15,
            flexDirection: 'row',
            alignItems: 'center',
            elevation: 5,
            marginBottom: 20,
        },
        searchIcon: { marginRight: 10 },
        searchInput: { flex: 1, height: 50, fontSize: 16, color: '#333' },
        categoryScrollView: { paddingHorizontal: 20, paddingVertical: 10 },
        categoryButton: {
            paddingVertical: 8,
            paddingHorizontal: 16,
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: 20,
            marginRight: 10,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.5)',
        },
        categoryButtonActive: { backgroundColor: '#fff', borderColor: '#fff' },
        categoryText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
        categoryTextActive: { color: '#6A5AE0' },
        centerText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#666' },
    });