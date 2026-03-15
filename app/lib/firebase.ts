import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDbZdQapbIFFTy-V757J5eet-kNRkU1k8U",
  authDomain: "food-9ebb5.firebaseapp.com",
  projectId: "food-9ebb5",
  storageBucket: "food-9ebb5.firebasestorage.app",
  messagingSenderId: "551652901312",
  appId: "1:551652901312:web:c8b1b83307e7c6d28f8825",
  measurementId: "G-9SC0YK6LW6"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;