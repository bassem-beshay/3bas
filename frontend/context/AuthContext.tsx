'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { ApiClient } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedToken = localStorage.getItem('noire_access_token');
        const savedUser = localStorage.getItem('noire_user');
        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
          // Validate in background
          try {
            const profile = await ApiClient.auth.getProfile();
            setUser(profile);
            localStorage.setItem('noire_user', JSON.stringify(profile));
          } catch {
            // token may be expired
          }
        }
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await ApiClient.auth.login(email, password);
    setToken(res.access);
    setUser(res.user);
    localStorage.setItem('noire_access_token', res.access);
    localStorage.setItem('noire_refresh_token', res.refresh);
    localStorage.setItem('noire_user', JSON.stringify(res.user));
    if (res.user.store?.slug) {
      localStorage.setItem('noire_active_store', res.user.store.slug);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('noire_access_token');
    localStorage.removeItem('noire_refresh_token');
    localStorage.removeItem('noire_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
