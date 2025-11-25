//components/EquipmentCard.tsx

import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { FontAwesome } from "@expo/vector-icons";
import { Equipment, useCart } from "@/context/CartContext";
import Toast from 'react-native-toast-message';

// --- Perubahan 1: Terima prop baru ---
interface EquipmentCardProps {
  item: Equipment;
  quantityInCart: number;
}

const EquipmentCard: React.FC<EquipmentCardProps> = ({ item, quantityInCart }) => {
  const { addToCart } = useCart();
    const displayAvailable = item.stock - quantityInCart;

  const handleAddToCart = () => {
    if (displayAvailable > 0) {
      addToCart(item);
      Toast.show({
        type: 'success',
        text1: 'Ditambahkan ke Keranjang',
        text2: `${item.name} berhasil ditambahkan.`,
      });
    } else {
      Toast.show({
        type: 'error',
        text1: 'Stok Habis',
        text2: `Stok untuk ${item.name} sudah tidak tersedia.`,
      });
    }
  };

  return (
    <View style={styles.card}>
      {item.image ? (
        <Image
          source={{ uri: item.image }}
          style={styles.image}
          resizeMode="contain"
        />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <FontAwesome name="camera" size={30} color="#ccc" />
        </View>
      )}

      <Text style={styles.title} numberOfLines={2}>{item.name}</Text>
      
      <View style={styles.tag}>
        {/* --- Perubahan 3: Tampilkan sisa stok --- */}
        <Text style={styles.tagText}>Available: {displayAvailable}</Text>
      </View>

      <TouchableOpacity
        style={[styles.button, displayAvailable <= 0 && styles.buttonDisabled]}
        onPress={handleAddToCart}
        disabled={displayAvailable <= 0}
      >
        <Text style={styles.buttonText}>
          {displayAvailable > 0 ? 'Add To Cart' : 'Stok Habis'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 8,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    minHeight: 280,
    justifyContent: 'space-between',
  },
  image: {
    width: '100%',
    height: 120,
    alignSelf: 'center',
    marginBottom: 10,
  },
  imagePlaceholder: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  tag: {
    backgroundColor: '#E0F2F1',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    marginBottom: 15,
  },
  tagText: {
    color: '#00796B',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#00C896',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#A5A5A5', 
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default EquipmentCard;