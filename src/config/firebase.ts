import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAlILn6CG6m3fTr9Nf-yg_kzEHjmCrHeGY",
  authDomain: "mindmend-53d0a.firebaseapp.com",
  projectId: "mindmend-53d0a",
  storageBucket: "mindmend-53d0a.firebasestorage.app",
  messagingSenderId: "815161017988",
  appId: "1:815161017988:web:a5927e13a22b9cbeaa24d1",
  measurementId: "G-KFRV4BGPRY"
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Analytics safely for SSR / Browser
export const initAnalytics = async () => {
  if (typeof window !== 'undefined' && await isSupported()) {
    return getAnalytics(app);
  }
  return null;
};
