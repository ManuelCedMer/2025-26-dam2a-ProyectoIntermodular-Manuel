import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


/**
 * Configuración de Firebase para la aplicación NutriFit.
 * Inicializa la app y expone los servicios de Authentication, Firestore y Storage.
 */
const firebaseConfig = {
  apiKey: "AIzaSyDfVsQLvYUkwiASh_ivIgPcRyDDBebwPBk",
  authDomain: "nutrifit-5a037.firebaseapp.com",
  projectId: "nutrifit-5a037",
  storageBucket: "nutrifit-5a037.firebasestorage.app",
  messagingSenderId: "1908666388",
  appId: "1:1908666388:web:bab2659edb8f1a7f9ab701"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
