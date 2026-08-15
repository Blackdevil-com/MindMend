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
    // If we have a stored backend token, verify it's still valid by fetching current user
    if (token) {
      refreshUser().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const refreshUser = async () => {
    try {
      const data = await api.get('/auth/me');
      if (data.user) {
        setUser(data.user);
        localStorage.setItem('mindmend_user', JSON.stringify(data.user));
      }
    } catch (err) {
      // If refresh fails (e.g. 401 DEVICE_LOGOUT), the api.ts interceptor
      // handles redirect to /login. Clear local state just in case.
      console.warn('Failed to refresh user auth state:', err);
      localStorage.removeItem('mindmend_token');
      localStorage.removeItem('mindmend_user');
      setToken(null);
      setUser(null);
    }
  };

  const login = async (identifier: string, password: string): Promise<User> => {
    // Always use the backend API for login so the session_token is stored in SQLite
    // and single-device session management works correctly.
    const data = await api.post('/auth/login', { identifier, password });
    localStorage.setItem('mindmend_token', data.token);
    localStorage.setItem('mindmend_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);

    // Also sign into Firebase Auth in the background for any Firebase-specific features
    // (e.g. Firestore access). Failure here is non-blocking.
    if (identifier.includes('@')) {
      signInWithEmailAndPassword(auth, identifier, password).catch(() => {});
    }

    return data.user;
  };

  const registerStudent = async (formData: any) => {
    // Register via backend API first (generates session_token in SQLite)
    const data = await api.post('/auth/register', formData);
    localStorage.setItem('mindmend_token', data.token);
    localStorage.setItem('mindmend_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);

    // Also register in Firebase in the background for any Firebase-specific features
    createUserWithEmailAndPassword(auth, formData.email, formData.password).catch(() => {});

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
        isAuthenticated: !!user && !!token,
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
