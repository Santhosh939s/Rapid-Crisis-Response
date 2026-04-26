// Firebase configuration placeholder
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
// import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "mock-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "mock-domain",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://mock-db.firebaseio.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "mock-project",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "mock-bucket",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "mock-sender",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "mock-app-id"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getDatabase(app);

// Messaging is only supported in browser context
// let messaging;
// if (typeof window !== "undefined") {
//   messaging = getMessaging(app);
// }

export { app, auth, db };
