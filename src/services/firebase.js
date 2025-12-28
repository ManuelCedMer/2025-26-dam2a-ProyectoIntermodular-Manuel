import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";



// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDfVsQLvYUkwiASh_ivIgPcRyDDBebwPBk",
  authDomain: "nutrifit-5a037.firebaseapp.com",
  projectId: "nutrifit-5a037",
  storageBucket: "nutrifit-5a037.firebasestorage.app",
  messagingSenderId: "1908666388",
  appId: "1:1908666388:web:bab2659edb8f1a7f9ab701"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
