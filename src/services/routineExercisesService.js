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
 * Devuelve los ejercicios asociados a una rutina concreta.
 * [ROUTINES-01] Lista de ejercicios de una rutina.
 */
export async function getExercisesByRoutine({ routineId, userId }) {
  const exercisesRef = collection(db, "routineExercises");

  // Solo ejercicios del usuario actual y de la rutina indicada.
  const q = query(
    exercisesRef,
    where("userId", "==", userId),
    where("routineId", "==", routineId),
  );

  const snapshot = await getDocs(q);

  const exercises = snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));

  return exercises;
}

/**
 * Crea un ejercicio nuevo dentro de una rutina.
 * [ROUTINES-01] Añadir ejercicio a la rutina.
 */
export async function createExercise({
  userId,
  routineId,
  name,
  sets,
  reps,
}) {
  const exercisesRef = collection(db, "routineExercises");

  const newExercise = {
    userId,
    routineId,
    name,
    sets,
    reps,
    // Campos opcionales adicionales que pueden venir desde una plantilla.
    order: arguments[0].order ?? null,
    restSeconds: arguments[0].restSeconds ?? null,
    equipment: arguments[0].equipment ?? null,
    primaryMuscle: arguments[0].primaryMuscle ?? null,
    secondaryMuscles: arguments[0].secondaryMuscles ?? null,
    notes: arguments[0].notes ?? null,
    imageUrl: arguments[0].imageUrl ?? null,
    createdAt: new Date(),
  };

  const docRef = await addDoc(exercisesRef, newExercise);

  return { id: docRef.id, ...newExercise };
}

/**
 * Actualiza un ejercicio existente.
 */
export async function updateExercise(id, { name, sets, reps }) {
  const exerciseRef = doc(db, "routineExercises", id);

  const updatedFields = {
    name,
    sets,
    reps,
    updatedAt: new Date(),
  };

  await updateDoc(exerciseRef, updatedFields);

  return { id, ...updatedFields };
}

/**
 * Elimina un ejercicio por id.
 */
export async function deleteExercise(id) {
  const exerciseRef = doc(db, "routineExercises", id);
  await deleteDoc(exerciseRef);
}
