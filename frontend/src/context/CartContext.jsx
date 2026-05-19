import { useEffect, useState } from "react";
import { api } from "../api";
import { CartContext } from "./cart-context";
import { useAuth } from "./useAuth";

/* =========================
   📦 CONTEXT
========================= */
export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* =========================
     📥 FETCH CART
  ========================= */
  const fetchCart = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const data = await api.cart.getCart();
      setCartItems(data?.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     ➕ ADD ITEM
  ========================= */
  const addToCart = async (item) => {
    try {
      setLoading(true);

      await api.cart.addItem(item);

      // Optimistic update
      setCartItems((prev) => {
        const exists = prev.find((i) => i.id === item.id);
        if (exists) {
          return prev.map((i) =>
            i.id === item.id
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          );
        }
        return [...prev, { ...item }];
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     ➖ REMOVE ITEM
  ========================= */
  const removeFromCart = async (itemId) => {
    try {
      setLoading(true);

      await api.cart.removeItem(itemId);

      setCartItems((prev) => prev.filter((i) => i.id !== itemId));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     🔄 UPDATE QUANTITY
  ========================= */
  const updateQuantity = async (itemId, quantity) => {
    if (quantity <= 0) {
      return removeFromCart(itemId);
    }

    try {
      setLoading(true);

      await api.cart.addItem({ id: itemId, quantity }); // reuse API

      setCartItems((prev) =>
        prev.map((i) =>
          i.id === itemId ? { ...i, quantity } : i
        )
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     🗑️ CLEAR CART
  ========================= */
  const clearCart = async () => {
    try {
      setLoading(true);

      await api.cart.clearCart();

      setCartItems([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     💰 TOTAL CALCULATION
  ========================= */
  const totalAmount = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const totalItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  /* =========================
     🔄 AUTO LOAD CART
  ========================= */
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCartItems([]);
    }
  }, [isAuthenticated]);

  /* =========================
     📤 VALUE
  ========================= */
  const value = {
    cartItems,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    fetchCart,
    totalAmount,
    totalItems,
    isEmpty: cartItems.length === 0,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}
