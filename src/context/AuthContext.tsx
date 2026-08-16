import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/index';
import { api } from '../services/api';
import { auth, db } from '../config/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile as updateFirebaseProfile } from 'firebase/auth';
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
    // Check & sync user state on initial load
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

        if (auth.currentUser && data.user.full_name) {
          updateFirebaseProfile(auth.currentUser, { displayName: data.user.full_name }).catch(() => {});
          setDoc(doc(db, 'users', auth.currentUser.uid), data.user, { merge: true }).catch(() => {});
        }
      }
    } catch (err) {
      // Do not erase saved local user state on network/API failure so users stay logged in
      console.warn('Backend refresh warning:', err);
    }
  };

  const login = async (identifier: string, password: string): Promise<User> => {
    // 1. Try Backend API login first
    try {
      const data = await api.post('/auth/login', { identifier, password });
      localStorage.setItem('mindmend_token', data.token);
      localStorage.setItem('mindmend_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);

      if (identifier.includes('@')) {
        signInWithEmailAndPassword(auth, identifier, password).catch(() => {});
      }

      return data.user;
    } catch (apiErr: any) {
      console.warn('API login failed, trying Firebase Auth fallback:', apiErr.message);

      // 2. Fallback to Firebase Auth if API login failed or is unreachable
      if (identifier.includes('@')) {
        try {
          const userCred = await signInWithEmailAndPassword(auth, identifier, password);
          const fbUser = userCred.user;

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

          const fbToken = await fbUser.getIdToken();
          localStorage.setItem('mindmend_token', fbToken);
          localStorage.setItem('mindmend_user', JSON.stringify(userProfile));
          setToken(fbToken);
          setUser(userProfile);
          return userProfile;
        } catch (fbErr: any) {
          throw new Error(apiErr.message || fbErr.message || 'Login failed. Please verify credentials.');
        }
      }
      throw apiErr;
    }
  };

  const registerStudent = async (formData: any) => {
    try {
      const data = await api.post('/auth/register', formData);
      localStorage.setItem('mindmend_token', data.token);
      localStorage.setItem('mindmend_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);

      createUserWithEmailAndPassword(auth, formData.email, formData.password).catch(() => {});
      return data;
    } catch (apiErr: any) {
      // Fallback to Firebase registration if API fails
      try {
        const userCred = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const fbUser = userCred.user;

        const newStudentUser: User = {
          id: Date.now(),
          email: formData.email,
          full_name: formData.full_name,
          role: 'student',
          student_id: `STU-2026-${Math.floor(Math.random() * 90 + 10)}`,
          mobile: formData.mobile,
          college_name: formData.college_name,
          degree: formData.degree,
          department: formData.department,
          year_of_study: formData.year_of_study,
          profile: {
            full_name: formData.full_name,
            email: formData.email,
            mobile: formData.mobile,
            college_name: formData.college_name,
            degree: formData.degree,
            department: formData.department,
            year_of_study: formData.year_of_study,
          },
        } as User;

        await setDoc(doc(db, 'users', fbUser.uid), newStudentUser);
        const fbToken = await fbUser.getIdToken();

        localStorage.setItem('mindmend_token', fbToken);
        localStorage.setItem('mindmend_user', JSON.stringify(newStudentUser));
        setToken(fbToken);
        setUser(newStudentUser);
        return { token: fbToken, user: newStudentUser };
      } catch (fbErr: any) {
        throw new Error(apiErr.message || fbErr.message || 'Registration failed.');
      }
    }
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
