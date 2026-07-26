import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDM3dqVUpq9oy3kZIIRRi6RXThLgNR2VH8",
  authDomain: "restaurant-390f3.firebaseapp.com",
  projectId: "restaurant-390f3",
  storageBucket: "restaurant-390f3.firebasestorage.app",
  messagingSenderId: "293140253027",
  appId: "1:293140253027:web:093707e33d60fb5da5ab56",
  measurementId: "G-171T51QF0G"
};


export const app = initializeApp(firebaseConfig);