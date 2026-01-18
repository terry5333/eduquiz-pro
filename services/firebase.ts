
// Fix: Re-standardizing Firebase v9+ functional API imports
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, getDoc, getDocs, onSnapshot, query, where, orderBy, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDKP-rD0yStry_OSMx1JUBXATXU-6yahoQ",
  authDomain: "test-02151.firebaseapp.com",
  projectId: "test-02151",
  storageBucket: "test-02151.firebasestorage.app",
  messagingSenderId: "8370075322",
  appId: "1:8370075322:web:a015e7ceab83e527db7483"
};

// Fix: Initialize Firebase services using the standard functional API
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc, 
  getDocs, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  setDoc 
};
