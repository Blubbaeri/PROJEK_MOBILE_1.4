import React, { createContext, useContext, useState, ReactNode } from 'react';

// Definisi Tipe Data
export interface CartItem {
    id: number | string;
    perId?: number;
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
    removeFromCart: (id: number | string) => void;
    increaseQuantity: (id: number | string) => void;
    decreaseQuantity: (id: number | string) => void;
    clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    // Hitung total semua barang di keranjang
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const addToCart = (newItem: CartItem) => {
        console.log("Menambahkan ke Cart:", newItem); // Debugging

        setCartItems((prevItems) => {
            // Cek apakah barang udah ada (Pakai String biar aman ID-nya)
            const existingItem = prevItems.find((item) => String(item.id) === String(newItem.id));

            if (existingItem) {
                // Kalau udah ada, tambah qty + 1
                return prevItems.map((item) =>
                    String(item.id) === String(newItem.id)
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                // Kalau belum ada, masukin baru
                return [...prevItems, { ...newItem, quantity: 1 }];
            }
        });
    };

    const removeFromCart = (id: number | string) => {
        setCartItems((prev) => prev.filter((item) => String(item.id) !== String(id)));
    };

    const increaseQuantity = (id: number | string) => {
        setCartItems((prev) => prev.map((item) =>
            String(item.id) === String(id) ? { ...item, quantity: item.quantity + 1 } : item
        ));
    };

    const decreaseQuantity = (id: number | string) => {
        setCartItems((prev) => prev.map((item) => {
            if (String(item.id) === String(id) && item.quantity > 1) {
                return { ...item, quantity: item.quantity - 1 };
            }
            return item;
        }));
    };

    const clearCart = () => setCartItems([]);

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