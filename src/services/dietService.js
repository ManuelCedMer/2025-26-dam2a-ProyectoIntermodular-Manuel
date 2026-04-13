import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
  runTransaction,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { doc as docRef } from "firebase/firestore";

/**
 * Devuelve los planes de alimentación de un usuario.
 * [DIET-01] Listar planes de alimentación del usuario.
 */
export async function getDietsByUser(userId) {
  const dietsRef = collection(db, "diets");

  // Solo dietas del usuario actual.
  const q = query(dietsRef, where("userId", "==", userId));

  const snapshot = await getDocs(q);

  const diets = snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));

  return diets;
}

/**
 * Crea un plan de alimentación nuevo para un usuario.
 * [DIET-01] Crear plan de alimentación.
 */
export async function createDiet({ userId, name, description, isDefault = false, defaultKey = null }) {
  const dietsRef = collection(db, "diets");

  const newDiet = {
    userId,
    name,
    description,
    isDefault: !!isDefault,
    defaultKey: defaultKey || null,
    createdAt: new Date(),
  };

  const docRef = await addDoc(dietsRef, newDiet);

  return { id: docRef.id, ...newDiet };
}

/**
 * Crea una dieta por defecto de forma transaccional si el perfil del usuario
 * no tiene `defaultDietSeeded: true`. Esto evita duplicados en modo StrictMode
 * y asegura que la bandera se guarda una sola vez.
 * Devuelve el objeto de la dieta creada o null si ya estaba seedado.
 */
export async function createDefaultDietIfNotSeeded({ userId, name, description, defaultKey }) {
  const usersRef = doc(db, "users", userId);
  const dietsColl = collection(db, "diets");

  return await runTransaction(db, async (transaction) => {
    const userSnap = await transaction.get(usersRef);
    const userData = userSnap.exists() ? userSnap.data() : {};

    if (userData.defaultDietSeeded) {
      // Already seeded for this user
      return null;
    }

    // No additional checks here: transaction is serializable and will
    // prevent concurrent creations by re-running if the user doc changes.

    // Create the diet doc within the transaction
    const newDietRef = docRef(dietsColl);
    const newDiet = {
      userId,
      name,
      description,
      isDefault: true,
      defaultKey: defaultKey || null,
      createdAt: new Date(),
    };
    transaction.set(newDietRef, newDiet);

    // Mark user as seeded
    transaction.set(usersRef, { defaultDietSeeded: true, updatedAt: new Date() }, { merge: true });

    return { id: newDietRef.id, ...newDiet };
  });
}

/**
 * Actualiza un plan de alimentación existente.
 * [DIET-02] Editar plan de alimentación.
 */
export async function updateDiet(id, { name, description }) {
  const dietRef = doc(db, "diets", id);

  const updatedFields = {
    name,
    description,
    updatedAt: new Date(),
  };

  await updateDoc(dietRef, updatedFields);

  return { id, ...updatedFields };
}

/**
 * Elimina un plan de alimentación por id.
 * [DIET-02] Eliminar plan de alimentación.
 */
export async function deleteDiet(id) {
  const dietRef = doc(db, "diets", id);
  await deleteDoc(dietRef);
}
