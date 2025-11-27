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
    View,
    StatusBar
} from 'react-native';
import { api } from "@/lib/api";

// --- TYPES ---
type Category = {
    id: number;
    name: string;
    description?: string;
};

type ListHeaderProps = {
    searchQuery: string;
    setSearchQuery: (text: string) => void;
    categories: Category[];
    selectedCategory: string | null;
    setSelectedCategory: (name: string | null) => void;
};

// --- HEADER COMPONENT (UI BARU) ---
const ListHeader: React.FC<ListHeaderProps> = ({
    searchQuery, setSearchQuery,
    categories, selectedCategory, setSelectedCategory
}) => (
    <View style={styles.headerContainer}>
        {/* Title Section */}
        <View style={styles.titleRow}>
            <View style={styles.iconBox}>
                <FontAwesome name="flask" size={24} color="#5B4DBC" />
            </View>
            <View>
                <Text style={styles.appTitle}>Lab Equipment</Text>
                <Text style={styles.appSubtitle}>Student Portal</Text>
            </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
            <FontAwesome name="search" size={18} color="#888" style={styles.searchIcon} />
            <TextInput
                placeholder="Search equipment..."
                style={styles.searchInput}
                placeholderTextColor="#888"
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
        </View>

        {/* Categories */}
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScrollView}
        >
            <TouchableOpacity
                style={[styles.categoryButton, selectedCategory === null && styles.categoryButtonActive]}
                onPress={() => setSelectedCategory(null)}
            >
                <Text style={[styles.categoryText, selectedCategory === null && styles.categoryTextActive]}>All</Text>
            </TouchableOpacity>

            {categories.map((cat) => (
                <TouchableOpacity
                    key={cat.id}
                    style={[styles.categoryButton, selectedCategory === cat.name && styles.categoryButtonActive]}
                    onPress={() => setSelectedCategory(cat.name)}
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
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const { cart } = useCart();

    // === GET EQUIPMENT (LOGIKA LAMA) ===
    const fetchEquipments = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get(`/api/equipment`);

            let equipmentData = [];
            if (response.data && Array.isArray(response.data.data)) {
                equipmentData = response.data.data;
            }

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

    // === FILTER DATA (LOGIKA LAMA) ===
    useEffect(() => {
        if (!Array.isArray(allEquipments)) {
            setEquipments([]);
            return;
        }

        let filtered = [...allEquipments];

        if (searchQuery) {
            filtered = filtered.filter((item: Equipment) =>
                item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        if (selectedCategory) {
            const selectedCat = categories.find(cat => cat.name === selectedCategory);
            if (selectedCat) {
                filtered = filtered.filter((item: Equipment) => item.categoryId === selectedCat.id);
            }
        }

        filtered.sort((a: Equipment, b: Equipment) => {
            if (a.stock === 0 && b.stock > 0) return 1;
            if (a.stock > 0 && b.stock === 0) return -1;
            return 0;
        });

        setEquipments(filtered);
    }, [searchQuery, selectedCategory, allEquipments, categories]);

    // === GET CATEGORY (LOGIKA LAMA) ===
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get(`/api/category`);
                let categoriesData = [];

                if (Array.isArray(response.data)) {
                    categoriesData = response.data;
                } else if (response.data && Array.isArray(response.data.data)) {
                    categoriesData = response.data.data;
                } else {
                    categoriesData = [];
                }

                setCategories(categoriesData);
            } catch (err) {
                console.error("Gagal mengambil kategori:", err);
                setCategories([
                    { id: 1, name: "Drill" },
                    { id: 2, name: "Micrometer" },
                    { id: 3, name: "Caliper" }
                ]);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchEquipments();
    }, [fetchEquipments]);

    return (
        <View style={styles.mainContainer}>
            <StatusBar barStyle="light-content" backgroundColor="#5B4DBC" />
            <SafeAreaView style={{ flex: 1 }}>
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
                    contentContainerStyle={{ paddingBottom: 20 }}
                    renderItem={({ item }) => {
                        const itemInCart = cart.find((c) => c.id === item.id);
                        const quantityInCart = itemInCart ? itemInCart.quantity : 0;
                        return <EquipmentCard item={item} quantityInCart={quantityInCart} />;
                    }}
                    ListEmptyComponent={() =>
                        loading ? (
                            <ActivityIndicator style={{ marginTop: 50 }} size="large" color="#5B4DBC" />
                        ) : (
                            <Text style={styles.centerText}>No equipment found.</Text>
                        )
                    }
                />
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: '#F5F5F7' },

    // Header Styles
    headerContainer: {
        paddingTop: 20,
        paddingBottom: 25,
        backgroundColor: '#5B4DBC', // Ungu Utama
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        marginBottom: 10,
        paddingHorizontal: 20,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    iconBox: {
        width: 50, height: 50,
        backgroundColor: 'white',
        borderRadius: 12,
        justifyContent: 'center', alignItems: 'center',
        marginRight: 15
    },
    appTitle: { fontSize: 22, fontWeight: 'bold', color: 'white' },
    appSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },

    // Search Styles
    searchContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    searchIcon: { marginRight: 10 },
    searchInput: { flex: 1, height: 50, fontSize: 16, color: '#333' },

    // Category Styles
    categoryScrollView: {
        paddingVertical: 5
    },
    categoryButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(255,255,255,0.15)', // Transparan Putih
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    categoryButtonActive: {
        backgroundColor: '#fff',
        borderColor: '#fff'
    },
    categoryText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14
    },
    categoryTextActive: {
        color: '#5B4DBC' // Text jadi ungu saat aktif
    },

    centerText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#666' },
});