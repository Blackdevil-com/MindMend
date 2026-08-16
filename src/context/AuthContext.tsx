import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types/index';
import { api } from '../services/api';
import { auth, db } from '../config/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  loading: boolean;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<User>;
  registerStudent: (data: any) => Promise<{ token: string; user: User }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  quickDemoLogin: (roleKey: 'admin' | 'staff1' | 'staff2' | 'staff3' | 'student1') => Promise<User>;
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
    const unsubscribe = () => {};
    setIsLoading(false);

    if (token && !user) {
      refreshUser().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }

    return () => unsubscribe();
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
    // Local SQLite API / Database Login
    const data = await api.post('/auth/login', { identifier, password });
    localStorage.setItem('mindmend_token', data.token);
    localStorage.setItem('mindmend_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const registerStudent = async (formData: any) => {
    // Local SQLite API / Database Registration
    const data = await api.post('/auth/register', formData);
    localStorage.setItem('mindmend_token', data.token);
    localStorage.setItem('mindmend_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    signOut(auth).catch(() => {});
    localStorage.removeItem('mindmend_token');
    localStorage.removeItem('mindmend_user');
    setToken(null);
    setUser(null);
  };

  const quickDemoLogin = async (roleKey: 'admin' | 'staff1' | 'staff2' | 'staff3' | 'student1'): Promise<User> => {
    const credentials = {
      admin: { email: 'admin@mindmend.edu', password: 'Admin@123' },
      staff1: { email: 'rahul.sharma@mindmend.edu', password: 'Staff@123' },
      staff2: { email: 'priya.v@mindmend.edu', password: 'Staff@123' },
      staff3: { email: 'arun.kumar@mindmend.edu', password: 'Staff@123' },
      student1: { email: 'aakash.patel@gmail.com', password: 'Student@123' },
    }[roleKey];

    return login(credentials.email, credentials.password);
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
        refreshUser,
        quickDemoLogin,
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
