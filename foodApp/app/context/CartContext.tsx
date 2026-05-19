import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

type MenuItem = {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
};

type CartItem = MenuItem & {
  quantity: number;
};

type ShippingInfo = {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  instructions?: string;
};

type PaymentInfo = {
  method: 'card' | 'cod';
  cardNumber?: string;
  cardName?: string;
  cardExpiry?: string;
  cardCVC?: string;
};

type Order = {
  orderId: string;
  status: string;
  total: number;
  createdAt: string;
  items: CartItem[];
  paymentReference?: string;
};

type OfflineOrder = {
  id: string;
  orderPayload: {
    cart: CartItem[];
    total: number;
    shippingInfo: ShippingInfo;
    paymentInfo: PaymentInfo;
    userId: string;
  };
  attempts: number;
  createdAt: string;
};

type User = {
  id: string;
  email: string;
  token: string;
};

type CartContextValue = {
  cart: CartItem[];
  addToCart: (item: MenuItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  cartCount: number;
  total: number;
  shippingInfo: ShippingInfo | null;
  setShippingInfo: (info: ShippingInfo) => void;
  paymentInfo: PaymentInfo | null;
  setPaymentInfo: (info: PaymentInfo) => void;
  orderHistory: Order[];
  addOrderToHistory: (order: Order) => void;
  offlineQueue: OfflineOrder[];
  addToOfflineQueue: (payload: OfflineOrder['orderPayload']) => void;
  user: User | null;
  loginUser: (user: User) => void;
  logoutUser: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

const addItem = (cart: CartItem[], item: MenuItem): CartItem[] => {
  const existing = cart.find((c) => c.id === item.id);
  if (existing) {
    return cart.map((c) => (c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
  }
  return [...cart, { ...item, quantity: 1 }];
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [offlineQueue, setOfflineQueue] = useState<OfflineOrder[]>([]);

  useEffect(() => {
    // Simple in-memory state initialization
    // In a real app, this would use AsyncStorage
  }, []);

  // Simple in-memory persistence
  // (AsyncStorage persistence would be added with proper installation)

  const processOfflineQueue = async () => {
    const pending = [...offlineQueue];
    const remaining: OfflineOrder[] = [];

    for (const pendingOrder of pending) {
      try {
        const response = await fetch('http://10.0.2.2:8082/api/order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cart: pendingOrder.orderPayload.cart,
            total: pendingOrder.orderPayload.total,
            shippingInfo: pendingOrder.orderPayload.shippingInfo,
            paymentInfo: pendingOrder.orderPayload.paymentInfo,
            userId: pendingOrder.orderPayload.userId,
            offline: true,
          }),
        });
        if (!response.ok) throw new Error('Offline order failed');
        const result = await response.json();
        const order: Order = {
          orderId: result.orderId ?? pendingOrder.id,
          status: result.status ?? 'pending',
          total: pendingOrder.orderPayload.total,
          createdAt: new Date().toISOString(),
          items: pendingOrder.orderPayload.cart,
          paymentReference: result.transactionId ?? pendingOrder.id,
        };
        addOrderToHistory(order);
      } catch (err) {
        if (pendingOrder.attempts < 5) {
          remaining.push({ ...pendingOrder, attempts: pendingOrder.attempts + 1 });
        }
      }
    }

    setOfflineQueue(remaining);
  };

  useEffect(() => {
    const interval = setInterval(processOfflineQueue, 30000);
    return () => clearInterval(interval);
  }, [offlineQueue]);

  const addToOfflineQueue = (payload: OfflineOrder['orderPayload']) => {
    setOfflineQueue((prev) => [
      ...prev,
      {
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        orderPayload: payload,
        attempts: 0,
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  const addToCart = (item: MenuItem) => {
    setCart((prev) => addItem(prev, item));
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, qty: number) => {
    setCart((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, quantity: Math.max(0, qty) } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const addOrderToHistory = (order: Order) => {
    setOrderHistory((prev) => [order, ...prev]);
  };

  const loginUser = (nextUser: User) => {
    setUser(nextUser);
  };

  const logoutUser = () => {
    setUser(null);
    clearCart();
    setShippingInfo(null);
    setPaymentInfo(null);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        total,
        shippingInfo,
        setShippingInfo,
        paymentInfo,
        setPaymentInfo,
        orderHistory,
        addOrderToHistory,
        offlineQueue,
        addToOfflineQueue,
        user,
        loginUser,
        logoutUser,
      }}>
      {children}
    </CartContext.Provider>
  );
}
