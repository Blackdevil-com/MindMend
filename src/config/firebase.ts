import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDdN8ZtPBOgvKcAaIsfxFm0ZcxSkpenzaM",
  authDomain: "mindmend-b5193.firebaseapp.com",
  projectId: "mindmend-b5193",
  storageBucket: "mindmend-b5193.firebasestorage.app",
  messagingSenderId: "614554955345",
  appId: "1:614554955345:web:5a67ac2397757dd09dd270",
  measurementId: "G-QZZ6RK99YP"
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
