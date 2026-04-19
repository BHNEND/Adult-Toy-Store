'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, cartApi } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
}

interface CartItem {
  id: string;
  product: any;
  quantity: number;
}

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  cart: CartItem[];
  cartTotal: number;
  cartLoading: boolean;
  refreshCart: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartLoading, setCartLoading] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
    }
  }, []);

  // Fetch user
  const fetchUser = async () => {
    try {
      const data = await authApi.me();
      setUser(data.user);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout();
    }
  };

  // Fetch cart
  const refreshCart = async () => {
    if (!user) {
      setCart([]);
      return;
    }

    setCartLoading(true);
    try {
      const data = await cartApi.list();
      setCart(data.items || []);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      setCart([]);
    } finally {
      setCartLoading(false);
    }
  };

  // Refresh cart when user changes
  useEffect(() => {
    refreshCart();
  }, [user]);

  // Login
  const login = async (email: string, password: string) => {
    try {
      const data = await authApi.login(email, password);
      localStorage.setItem('token', data.token);
      setUser(data.user);
    } catch (error) {
      throw error;
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setCart([]);
  };

  // Calculate cart total
  const cartTotal = cart.reduce((total, item) => {
    return total + (item.product?.price || 0) * item.quantity;
  }, 0);

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        cart,
        cartTotal,
        cartLoading,
        refreshCart,
        login,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
