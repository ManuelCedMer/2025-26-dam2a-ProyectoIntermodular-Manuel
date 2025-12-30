import { db } from "./firebase";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";

/**
 * Devuelve los IDs de ejercicios completados para una rutina
 * en una fecha concreta.
 * [ROUTINES-03] Consultar ejercicios completados por día.
 */
export async function getCompletedExerciseIds({ userId, routineId, date }) {
  const completionsRef = collection(db, "routineExerciseCompletions");

  // Solo completados de este usuario, rutina y fecha.
  const q = query(
    completionsRef,
    where("userId", "==", userId),
    where("routineId", "==", routineId),
    where("date", "==", date),
  );

  const snapshot = await getDocs(q);

  // Devuelvo solo los exerciseId para simplificar el uso en el componente.
  const ids = snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return data.exerciseId;
  });

  return ids;
}

/**
 * Marca o desmarca un ejercicio como completado en una fecha.
 * [ROUTINES-03] Marcar ejercicios como completados.
 */
export async function setExerciseCompleted({
  userId,
  routineId,
  exerciseId,
  date,
  completed,
}) {
  // ID determinista para evitar duplicados.
  const docId = `${userId}_${routineId}_${exerciseId}_${date}`;
  const completionRef = doc(db, "routineExerciseCompletions", docId);

  if (completed) {
    await setDoc(completionRef, {
      userId,
      routineId,
      exerciseId,
      date,
      completedAt: new Date(),
    });
  } else {
    // Si desmarcamos, eliminamos el documento.
    await deleteDoc(completionRef);
  }
}
