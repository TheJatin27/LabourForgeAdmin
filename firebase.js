import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // 👈 ADD THIS

const firebaseConfig = {
  apiKey: "AIzaSyB-PutnD9Y9U0H569xiqDi8dGHFgrJ1CS8",
  authDomain: "laborforge-e4b22.firebaseapp.com",
  projectId: "laborforge-e4b22",
  storageBucket: "laborforge-e4b22.appspot.com",
  messagingSenderId: "572089167912",
  appId: "1:572089167912:web:6a919fd174accad14fc51d",
};

const app =
  getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApp();

export const db = getFirestore(app);
export const auth = getAuth(app); // 👈 THIS IS REQUIRED