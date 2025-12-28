import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../services/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";

/**
 * Contexto de autenticación.
 * Gestiona el usuario actual y las operaciones de [LOGIN-01], [LOGIN-02].
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Escucha cambios de sesión (login, logout, recarga de página)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser || null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Registra un nuevo usuario [LOGIN-01].
   */
  async function register({ name, email, password }) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (name) {
      await updateProfile(cred.user, { displayName: name });
    }
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

  const value = {
    user,
    loading,
    register,
    login,
    logout,
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
