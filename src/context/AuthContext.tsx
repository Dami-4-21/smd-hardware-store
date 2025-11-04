import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  companyName?: string;
  customerType?: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email?: string; username?: string; password: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedToken = localStorage.getItem('customer_token');
        const storedUser = localStorage.getItem('customer_user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // Verify token is still valid
          await refreshUser(storedToken);
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        // Clear invalid data
        localStorage.removeItem('customer_token');
        localStorage.removeItem('customer_user');
        localStorage.removeItem('customer_refresh_token');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (credentials: { email?: string; username?: string; password: string }) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Login failed');
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        const { user: userData, token: authToken, refreshToken } = data.data;
        
        // Only allow CUSTOMER role to login on frontend
        if (userData.role !== 'CUSTOMER') {
          throw new Error('Access denied. Please use the admin dashboard.');
        }

        setUser(userData);
        setToken(authToken);

        // Store in localStorage
        localStorage.setItem('customer_token', authToken);
        localStorage.setItem('customer_user', JSON.stringify(userData));
        localStorage.setItem('customer_refresh_token', refreshToken);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('customer_refresh_token');
      
      if (token && refreshToken) {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear state and localStorage
      setUser(null);
      setToken(null);
      localStorage.removeItem('customer_token');
      localStorage.removeItem('customer_user');
      localStorage.removeItem('customer_refresh_token');
    }
  };

  const refreshUser = async (authToken?: string) => {
    try {
      const tokenToUse = authToken || token;
      
      if (!tokenToUse) {
        throw new Error('No token available');
      }

      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${tokenToUse}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to refresh user');
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        setUser(data.data);
        localStorage.setItem('customer_user', JSON.stringify(data.data));
      }
    } catch (error) {
      console.error('Refresh user error:', error);
      // If refresh fails, clear auth state
      setUser(null);
      setToken(null);
      localStorage.removeItem('customer_token');
      localStorage.removeItem('customer_user');
      localStorage.removeItem('customer_refresh_token');
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
