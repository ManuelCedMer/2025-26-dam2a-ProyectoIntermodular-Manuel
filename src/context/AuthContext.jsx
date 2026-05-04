import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../services/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import { db } from "../services/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

/**
 * Contexto de autenticación.
 * Gestiona el usuario actual y las operaciones de [LOGIN-01], [LOGIN-02].
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState("light");

  // Escucha cambios de sesión (login, logout, recarga de página)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser || null);

      if (firebaseUser) {
        try {
          const userRef = doc(db, "users", firebaseUser.uid);
          const snapshot = await getDoc(userRef);
          const profile = snapshot.data();
          setTheme(profile?.theme || "light");
        } catch (error) {
          console.error("Error al cargar tema del usuario:", error);
          setTheme("light");
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Aplica clase al body cuando cambia el tema
  useEffect(() => {
    document.body.classList.remove("theme-light", "theme-dark");
    document.body.classList.add(`theme-${theme}`);
  }, [theme]);

  /**
   * Registra un nuevo usuario [LOGIN-01].
   */
  async function register({ name, email, password }) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    if (name) {
      await updateProfile(cred.user, { displayName: name });
    }

    const userRef = doc(db, "users", cred.user.uid);

    await setDoc(userRef, {
      displayName: name || "",
      email: cred.user.email,
      age: null,
      goal: "mantener",
      theme: "light",
      createdAt: new Date(),
    });

    return cred.user;
  }

  /**
   * Inicia sesión con email y contraseña [LOGIN-02].
   */
  function login({ email, password }) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  /**
   * Cierra la sesión actual [LOGIN-02].
   */
  function logout() {
    return signOut(auth);
  }

  /**
   * Envía correo de recuperación de contraseña [LOGIN-RECOVER].
   */
  function recoverPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  const value = {
    user,
    loading,
    theme,
    setTheme,
    register,
    login,
    logout,
    recoverPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

/**
 * Acceso rápido al contexto de autenticación.
 */
export function useAuth() {
  return useContext(AuthContext);
}
