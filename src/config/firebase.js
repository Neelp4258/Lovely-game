import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBL74fv7U7Rphf0r4RZ6ujzXkKWYjBHlBE",
  authDomain: "vendor-f9973.firebaseapp.com",
  projectId: "vendor-f9973",
  storageBucket: "vendor-f9973.firebasestorage.app",
  messagingSenderId: "98870514991",
  appId: "1:98870514991:web:60674120f74d273eedfdda",
  measurementId: "G-Z5X1T863FE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export { app, auth, db, analytics, GoogleAuthProvider, signInWithPopup, signInAnonymously };
