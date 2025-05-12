import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCg1i3po5UAiEY3qGsYffIOOdhx9ZaiEw4",
  authDomain: "prepwise-23822.firebaseapp.com",
  projectId: "prepwise-23822",
  storageBucket: "prepwise-23822.firebasestorage.app",
  messagingSenderId: "692261241988",
  appId: "1:692261241988:web:06a88645c937dfb5e0aed1",
  measurementId: "G-YQKV5S8FMW"
};

const app = !getApps.length ? initializeApp(firebaseConfig) :getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);