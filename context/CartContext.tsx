import React, { createContext, useContext, useState, ReactNode } from 'react';

// Definisi Tipe Data
export interface CartItem {
    id: number;            // PSA_ID (untuk identifikasi di cart)
    perId: number;         // PER_ID (WAJIB ada untuk dikirim ke API)
    name: string;
    image?: any;
    quantity: number;
    stock?: number;
    price?: number;
    availablePsaIds?: number[];
}

interface CartContextType {
    cartItems: CartItem[];
    totalItems: number;
    addToCart: (item: CartItem) => void;
    removeFromCart: (id: number) => void;
    increaseQuantity: (id: number) => void;
    decreaseQuantity: (id: number) => void;
    clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    // Hitung total semua barang di keranjang
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const addToCart = (newItem: CartItem) => {
        console.log("Menambahkan ke Cart:", newItem);

        // VALIDASI: Pastikan perId ada
        if (!newItem.perId) {
            console.error("ERROR: perId harus ada!");
            return;
        }

        setCartItems((prevItems) => {
            // Cek apakah barang udah ada berdasarkan PSA_ID (id)
            const existingItem = prevItems.find((item) => item.id === newItem.id);

            if (existingItem) {
                // Kalau udah ada, tambah qty + 1
                return prevItems.map((item) =>
                    item.id === newItem.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                // Kalau belum ada, masukin baru
                return [...prevItems, { ...newItem, quantity: 1 }];
            }
        });
    };

    const removeFromCart = (id: number) => {
        setCartItems((prev) => prev.filter((item) => item.id !== id));
    };

    const increaseQuantity = (id: number) => {
        setCartItems((prev) => prev.map((item) =>
            item.id === id ? { ...item, quantity: item.quantity + 1 } : item
        ));
    };

    const decreaseQuantity = (id: number) => {
        setCartItems((prev) => prev.map((item) => {
            if (item.id === id && item.quantity > 1) {
                return { ...item, quantity: item.quantity - 1 };
            }
            return item;
        }));
    };

    const clearCart = () => {
        console.log("🧹 Clearing cart...");
        setCartItems([]);
    };

    return (
        <CartContext.Provider value={{
            cartItems,
            totalItems,
            addToCart,
            removeFromCart,
            increaseQuantity,
            decreaseQuantity,
            clearCart
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used within a CartProvider");
    return context;
};