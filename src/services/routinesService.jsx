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
 * Devuelve las rutinas de un usuario ordenadas por fecha de creación.
 * [ROUTINES-04] Listar rutinas del usuario.
 */
export async function getRoutinesByUser(userId) {
  const routinesRef = collection(db, "routines");

  // Solo rutinas del usuario actual.
  const q = query(routinesRef, where("userId", "==", userId));

  const snapshot = await getDocs(q);

  // Transformo los documentos de Firestore a objetos JS con id.
  const routines = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return routines;
}

/**
 * Crea una rutina nueva para un usuario.
 * [ROUTINES-01] Crear rutina con nombre y días de la semana.
 */
export async function createRoutine({ userId, name, daysOfWeek }) {
  const routinesRef = collection(db, "routines");

  const newRoutine = {
    userId,
    name,
    daysOfWeek,
    createdAt: new Date(), 
  };

  const docRef = await addDoc(routinesRef, newRoutine);

  // Devuelvo el objeto con el id asignado por Firestore.
  return { id: docRef.id, ...newRoutine };
}

/**
 * Actualiza una rutina existente.
 * [ROUTINES-02] Editar rutina.
 */
export async function updateRoutine(id, { name, daysOfWeek }) {
  const routineRef = doc(db, "routines", id);

  const updatedFields = {
    name,
    daysOfWeek,
    updatedAt: new Date(),
  };

  await updateDoc(routineRef, updatedFields);

  return { id, ...updatedFields };
}

/**
 * Elimina una rutina por id.
 * [ROUTINES-02] Eliminar rutina.
 */
export async function deleteRoutine(id) {
  const routineRef = doc(db, "routines", id);
  await deleteDoc(routineRef);
}
