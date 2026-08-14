import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types/index';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  loading: boolean;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<User>;
  registerStudent: (data: any) => Promise<{ token: string; user: User }>;
  logout: () => void;
  quickDemoLogin: (roleKey: 'admin' | 'staff1' | 'staff2' | 'staff3' | 'student1') => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('mindmend_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('mindmend_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (token) {
      refreshUser().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const refreshUser = async () => {
    try {
      const data = await api.get('/auth/me');
      if (data.user) {
        setUser(data.user);
        localStorage.setItem('mindmend_user', JSON.stringify(data.user));
      }
    } catch (err) {
      console.warn('Failed to refresh user auth state:', err);
    }
  };

  const login = async (identifier: string, password: string): Promise<User> => {
    const data = await api.post('/auth/login', { identifier, password });
    localStorage.setItem('mindmend_token', data.token);
    localStorage.setItem('mindmend_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const registerStudent = async (formData: any) => {
    const data = await api.post('/auth/register', formData);
    localStorage.setItem('mindmend_token', data.token);
    localStorage.setItem('mindmend_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('mindmend_token');
    localStorage.removeItem('mindmend_user');
    setToken(null);
    setUser(null);
  };

  const quickDemoLogin = async (roleKey: 'admin' | 'staff1' | 'staff2' | 'staff3' | 'student1') => {
    let identifier = '';
    let password = '';

    if (roleKey === 'admin') {
      identifier = 'admin@mindmend.edu';
      password = 'Admin@123';
    } else if (roleKey === 'staff1') {
      identifier = 'STF20260001';
      password = 'Staff@123';
    } else if (roleKey === 'staff2') {
      identifier = 'STF20260002';
      password = 'Staff@123';
    } else if (roleKey === 'staff3') {
      identifier = 'STF20260003';
      password = 'Staff@123';
    } else if (roleKey === 'student1') {
      identifier = 'STU20260001';
      password = 'Student@123';
    }

    await login(identifier, password);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        loading: isLoading,
        isAuthenticated: !!user,
        login,
        registerStudent,
        logout,
        quickDemoLogin,
        refreshUser,
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
