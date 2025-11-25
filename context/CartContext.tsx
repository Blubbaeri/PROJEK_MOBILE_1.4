// context/CartContext.tsx
import React, { createContext, useContext, useState } from "react";
import Toast from "react-native-toast-message";
import { Snackbar } from "react-native-paper";

export type Equipment = {
    id: number;
    name: string;
    categoryId: number;       
    locationId: number;      
    stock: number;
    condition: string;
    status: string;
    isAvailable: boolean;
    description?: string;
    image?: string;
    quantity: number;
};

type CartContextType = {
    cart: Equipment[];
    addToCart: (item: Equipment) => void;
    removeFromCart: (itemId: number) => void;
    increaseQuantity: (itemId: number) => void;
    decreaseQuantity: (itemId: number) => void;
    clearCart: () => void;
    totalItems: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used inside CartProvider");
    return context;
};

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
    const [cart, setCart] = useState<Equipment[]>([]);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMsg, setSnackbarMsg] = useState("");

    const showSnackbar = (msg: string) => {
        setSnackbarMsg(msg);
        setSnackbarVisible(true);
    };

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    // -----------------------------
    // ADD TO CART
    // -----------------------------
    const addToCart = (item: Equipment) => {
        if (item.stock <= 0) {
            Toast.show({
                type: "error",
                text1: "Stok Habis",
                text2: `${item.name} tidak tersedia.`,
            });
            return;
        }

        if (totalItems >= 10) {
            showSnackbar("Anda sudah mencapai batas kuantitas maksimal.");
            return;
        }

        setCart((prevCart) => {
            const exist = prevCart.find((i) => i.id === item.id);
            if (exist) {
                if (exist.quantity >= item.stock) {
                    Toast.show({ type: "error", text1: "Stok Tidak Cukup" });
                    return prevCart;
                }
                return prevCart.map((i) =>
                    i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                );
            }

            return [...prevCart, { ...item, quantity: 1 }];
        });
    };

    // -----------------------------
    // REMOVE FROM CART
    // -----------------------------
    const removeFromCart = (itemId: number) => {
        setCart((prev) => prev.filter((item) => item.id !== itemId));
    };

    // -----------------------------
    // INCREASE QUANTITY
    // -----------------------------
    const increaseQuantity = (itemId: number) => {
        const itemData = cart.find((item) => item.id === itemId);
        if (!itemData) return;

        if (itemData.quantity >= itemData.stock) {
            Toast.show({
                type: "error",
                text1: "Stok Tidak Cukup",
                text2: `Stok untuk ${itemData.name} sudah maksimal.`,
            });
            return;
        }

        if (totalItems >= 10) {
            showSnackbar("Anda sudah mencapai batas kuantitas maksimal.");
            return;
        }

        setCart((prevCart) =>
            prevCart.map((item) =>
                item.id === itemId
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            )
        );
    };

    // -----------------------------
    // DECREASE QUANTITY
    // -----------------------------
    const decreaseQuantity = (itemId: number) => {
        setCart((prevCart) =>
            prevCart
                .map((item) =>
                    item.id === itemId
                        ? { ...item, quantity: item.quantity - 1 }
                        : item
                )
                .filter((item) => item.quantity > 0)
        );
    };

    // Clear cart
    const clearCart = () => {
        setCart([]);
    };

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                increaseQuantity,
                decreaseQuantity,
                totalItems,
                clearCart,
            }}
        >
            {children}

            <Snackbar
                visible={snackbarVisible}
                duration={2000}
                onDismiss={() => setSnackbarVisible(false)}
            >
                {snackbarMsg}
            </Snackbar>
        </CartContext.Provider>
    );
};