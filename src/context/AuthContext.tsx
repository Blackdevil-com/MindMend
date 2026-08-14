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
    // Listen for Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            setUser(userData);
            localStorage.setItem('mindmend_user', JSON.stringify(userData));
          }
        } catch (e) {
          console.warn('Firestore user doc load error:', e);
        }
      }
      setIsLoading(false);
    });

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
    // 1. Try Firebase Auth first if identifier is email format
    if (identifier.includes('@')) {
      try {
        const userCred = await signInWithEmailAndPassword(auth, identifier, password);
        const fbUser = userCred.user;
        
        // Fetch or create user record in Firestore
        let userProfile: User;
        const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
        if (userDoc.exists()) {
          userProfile = userDoc.data() as User;
        } else {
          userProfile = {
            id: Date.now(),
            email: fbUser.email || identifier,
            full_name: fbUser.displayName || identifier.split('@')[0],
            role: identifier.includes('admin') ? 'admin' : identifier.includes('staff') ? 'staff' : 'student',
            student_id: `STU-2026-${Math.floor(Math.random() * 90 + 10)}`,
          } as User;
          await setDoc(doc(db, 'users', fbUser.uid), userProfile);
        }

        const fakeToken = await fbUser.getIdToken();
        localStorage.setItem('mindmend_token', fakeToken);
        localStorage.setItem('mindmend_user', JSON.stringify(userProfile));
        setToken(fakeToken);
        setUser(userProfile);
        return userProfile;
      } catch (firebaseErr: any) {
        console.warn('Firebase Auth sign in failed, falling back to API:', firebaseErr.message);
      }
    }

    // 2. Fallback to API / Database Login
    const data = await api.post('/auth/login', { identifier, password });
    localStorage.setItem('mindmend_token', data.token);
    localStorage.setItem('mindmend_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const registerStudent = async (formData: any) => {
    // Register in Firebase Auth & Firestore first
    try {
      const userCred = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const fbUser = userCred.user;
      
      const newStudentUser: User = {
        id: Date.now(),
        email: formData.email,
        full_name: formData.full_name,
        role: 'student',
        student_id: `STU-2026-${Math.floor(Math.random() * 90 + 10)}`,
      } as User;

      await setDoc(doc(db, 'users', fbUser.uid), newStudentUser);
      await setDoc(doc(db, 'students', fbUser.uid), {
        ...formData,
        uid: fbUser.uid,
        created_at: new Date().toISOString(),
      });

      const fakeToken = await fbUser.getIdToken();
      localStorage.setItem('mindmend_token', fakeToken);
      localStorage.setItem('mindmend_user', JSON.stringify(newStudentUser));
      setToken(fakeToken);
      setUser(newStudentUser);
      return { token: fakeToken, user: newStudentUser };
    } catch (e) {
      console.warn('Firebase signup fallback to API:', e);
    }

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
