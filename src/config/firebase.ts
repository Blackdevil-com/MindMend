import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAa1VilPPpz9SI4rdJ9BXjfjFKcKpmTln8",
  authDomain: "mindmend-2005.firebaseapp.com",
  projectId: "mindmend-2005",
  storageBucket: "mindmend-2005.firebasestorage.app",
  messagingSenderId: "1060185489373",
  appId: "1:1060185489373:web:5d3a2a3ba2ab78de2ac034",
  measurementId: "G-J0K000S537"
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
