import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";

/**
 * Devuelve las rutinas de un usuario ordenadas por fecha de creación.
 * [ROUTINES-04] Listar rutinas del usuario.
 */
export async function getRoutinesByUser(userId) {
  const routinesRef = collection(db, "routines");

  // Solo rutinas del usuario actual.
  const q = query(
    routinesRef,
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
  );

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
