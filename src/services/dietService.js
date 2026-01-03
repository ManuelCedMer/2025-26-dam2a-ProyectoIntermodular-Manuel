import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./firebase";

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
export async function createDiet({ userId, name, description }) {
  const dietsRef = collection(db, "diets");

  const newDiet = {
    userId,
    name,
    description,
    createdAt: new Date(),
  };

  const docRef = await addDoc(dietsRef, newDiet);

  return { id: docRef.id, ...newDiet };
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
