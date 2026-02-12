import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

/**
 * Obtiene el perfil de un usuario desde la colección "users".
 * [LOGIN-03] Consultar datos básicos de perfil.
 */
export async function getUserProfile(userId) {
  const userRef = doc(db, "users", userId);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    // Si no existe, devolvemos un perfil mínimo para evitar fallos.
    return {
      displayName: "",
      email: "",
      age: null,
      goal: "mantener",
      theme:"light",
    };
  }

  return snapshot.data();
}

/**
 * Guarda el perfil de un usuario en la colección "users".
 * [LOGIN-03] Editar datos básicos de perfil.
 */
export async function saveUserProfile(userId, { displayName, age, goal ,theme}) {
  const userRef = doc(db, "users", userId);

  const data = {
    displayName,
    age,
    goal,
    theme,
    updatedAt: new Date(),
  };

  // setDoc con { merge: true } respeta otros campos que ya existan.
  await setDoc(userRef, data, { merge: true });
}
