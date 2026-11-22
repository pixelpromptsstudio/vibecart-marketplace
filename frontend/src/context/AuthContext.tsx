'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, cartApi, wishlistApi } from '@/lib/api';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'SELLER' | 'CUSTOMER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  addresses?: any[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  cartCount: number;
  wishlistCount: number;
  wishlistedIds: string[];
  isWishlisted: (productId: string) => boolean;
  toggleWishlistItem: (productId: string) => Promise<boolean>;
  login: (email: string, pass: string) => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => void;
  updateUser: (updated: Partial<User>) => void;
  quickSwitchRole: (role: UserRole) => Promise<void>;
  refreshCartCount: () => Promise<void>;
  refreshWishlistCount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [wishlistedIds, setWishlistedIds] = useState<string[]>([]);

  const refreshCartCount = useCallback(async () => {
    try {
      if (!localStorage.getItem('vibecart_token')) {
        setCartCount(0);
        return;
      }
      const data = await cartApi.getCart();
      if (data && data.cart) {
        setCartCount(data.cart.itemCount || 0);
      }
    } catch {
      // Ignore
    }
  }, []);

  const refreshWishlistCount = useCallback(async () => {
    try {
      if (!localStorage.getItem('vibecart_token')) {
        setWishlistCount(0);
        setWishlistedIds([]);
        return;
      }
      const data = await wishlistApi.getWishlist();
      if (data && Array.isArray(data.wishlist)) {
        const ids = data.wishlist
          .map((item: any) => String(item?._id || item?.id || item))
          .filter(Boolean);
        setWishlistedIds(ids);
        setWishlistCount(ids.length);
      }
    } catch {
      // Ignore
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('vibecart_token');
      if (storedToken) {
        setToken(storedToken);
        try {
          const res = await authApi.getMe();
          if (res && res.user) {
            setUser({
              id: res.user._id || res.user.id,
              name: res.user.name,
              email: res.user.email,
              role: res.user.role,
              avatar: res.user.avatar,
              phone: res.user.phone,
              addresses: res.user.addresses,
            });
            await Promise.all([refreshCartCount(), refreshWishlistCount()]);
          }
        } catch {
          localStorage.removeItem('vibecart_token');
          setToken(null);
          setUser(null);
        }
      } else if (process.env.NEXT_PUBLIC_DEMO_AUTOLOGIN === 'true') {
        try {
          const res = await authApi.login({ email: 'dhruv@vibecart.com', password: 'Customer@123' });
          if (res && res.token) {
            localStorage.setItem('vibecart_token', res.token);
            setToken(res.token);
            setUser({
              id: res.user.id,
              name: res.user.name,
              email: res.user.email,
              role: res.user.role,
              avatar: res.user.avatar,
              addresses: res.user.addresses,
            });
            await Promise.all([refreshCartCount(), refreshWishlistCount()]);
          }
        } catch {
          // Proceed in guest mode
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [refreshCartCount, refreshWishlistCount]);

  const login = async (email: string, pass: string) => {
    const res = await authApi.login({ email, password: pass });
    if (res && res.token) {
      localStorage.setItem('vibecart_token', res.token);
      setToken(res.token);
      setUser({
        id: res.user.id,
        name: res.user.name,
        email: res.user.email,
        role: res.user.role,
        avatar: res.user.avatar,
        addresses: res.user.addresses,
      });
      await Promise.all([refreshCartCount(), refreshWishlistCount()]);
    }
  };

  const register = async (payload: any) => {
    const res = await authApi.register(payload);
    if (res && res.token) {
      localStorage.setItem('vibecart_token', res.token);
      setToken(res.token);
      setUser({
        id: res.user.id,
        name: res.user.name,
        email: res.user.email,
        role: res.user.role,
        avatar: res.user.avatar,
        addresses: res.user.addresses,
      });
      await Promise.all([refreshCartCount(), refreshWishlistCount()]);
    }
  };

  const logout = () => {
    localStorage.removeItem('vibecart_token');
    setToken(null);
    setUser(null);
    setCartCount(0);
    setWishlistCount(0);
    setWishlistedIds([]);
  };

  const isWishlisted = useCallback(
    (productId: string) => wishlistedIds.includes(productId),
    [wishlistedIds]
  );

  const toggleWishlistItem = useCallback(
    async (productId: string): Promise<boolean> => {
      const currentlyIn = wishlistedIds.includes(productId);
      setWishlistedIds((prev) =>
        currentlyIn ? prev.filter((id) => id !== productId) : [...prev, productId]
      );
      setWishlistCount((prev) => Math.max(0, prev + (currentlyIn ? -1 : 1)));

      try {
        if (currentlyIn) {
          await wishlistApi.remove(productId);
        } else {
          await wishlistApi.add(productId);
        }
        return !currentlyIn;
      } catch (err) {
        setWishlistedIds((prev) =>
          currentlyIn ? [...prev, productId] : prev.filter((id) => id !== productId)
        );
        setWishlistCount((prev) => Math.max(0, prev + (currentlyIn ? 1 : -1)));
        throw err;
      }
    },
    [wishlistedIds]
  );

  const updateUser = (updated: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updated });
    }
  };

  const quickSwitchRole = async (role: UserRole) => {
    const creds: Record<UserRole, { email: string; pass: string }> = {
      SUPER_ADMIN: { email: 'superadmin@vibecart.com', pass: 'Admin@123' },
      ADMIN: { email: 'admin@vibecart.com', pass: 'Admin@123' },
      MANAGER: { email: 'manager@vibecart.com', pass: 'Admin@123' },
      SELLER: { email: 'seller@vibecart.com', pass: 'Seller@123' },
      CUSTOMER: { email: 'dhruv@vibecart.com', pass: 'Customer@123' },
    };

    const target = creds[role];
    if (target) {
      await login(target.email, target.pass);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        cartCount,
        wishlistCount,
        wishlistedIds,
        isWishlisted,
        toggleWishlistItem,
        login,
        register,
        logout,
        updateUser,
        quickSwitchRole,
        refreshCartCount,
        refreshWishlistCount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
