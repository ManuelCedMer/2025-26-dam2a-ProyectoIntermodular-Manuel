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

const MUSCLE_IMAGES = {
  pierna: "/muscles/pierna.jpg",
  pecho: "/muscles/pecho.jpg",
  espalda: "/muscles/espalda.jpg",
  hombro: "/muscles/hombro.jpg",
  brazo: "/muscles/brazo.jpg",
  core: "/muscles/core.jpeg",
  fullbody: "/muscles/fullbody.jpg",
};

function getMuscleImageUrl(muscleGroup) {
  if (!muscleGroup) return null;
  return MUSCLE_IMAGES[muscleGroup] || null;
}

/**
 * Devuelve las rutinas de un usuario ordenadas por fecha de creación.
 * [ROUTINES-04] Listar rutinas del usuario.
 */
export async function getRoutinesByUser(userId) {
  const routinesRef = collection(db, "routines");
  const q = query(routinesRef, where("userId", "==", userId));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
}

/**
 * Crea una rutina nueva para un usuario.
 * [ROUTINES-01] Crear rutina con nombre y días de la semana.
 */
export async function createRoutine({
  userId,
  name,
  daysOfWeek,
  muscleGroup = null,
  imageUrl = null,
}) {
  const routinesRef = collection(db, "routines");

  const resolvedImageUrl = imageUrl || getMuscleImageUrl(muscleGroup);

  const newRoutine = {
    userId,
    name,
    daysOfWeek,
    muscleGroup: muscleGroup || null,
    imageUrl: resolvedImageUrl || null,
    createdAt: new Date(),
  };

  const docRef = await addDoc(routinesRef, newRoutine);
  return { id: docRef.id, ...newRoutine };
}

/**
 * Crea una rutina real a partir de una plantilla.
 * - Inserta la rutina en `routines` con los campos relevantes de la plantilla.
 * - Crea los ejercicios en `routineExercises` usando la misma estructura que usa la app.
 * Retorna el objeto de la rutina creada.
 */
export async function createRoutineFromTemplate({ userId, template }) {
  const routinesRef = collection(db, "routines");

  const resolvedImageUrl =
    template.imageUrl || getMuscleImageUrl(template.muscleGroup);

  const routineData = {
    userId,
    name: template.name || "Nueva rutina",
    description: template.description || "",
    level: template.level || null,
    focus: template.focus || null,
    estimatedDurationMinutes: template.estimatedDurationMinutes || null,
    tags: Array.isArray(template.tags) ? template.tags : [],
    muscleGroup: template.muscleGroup || null,
    imageUrl: resolvedImageUrl || null,
    createdAt: new Date(),
    templateId: template.id || null,
  };

  const docRef = await addDoc(routinesRef, routineData);
  const createdRoutine = { id: docRef.id, ...routineData };

  if (Array.isArray(template.exercises) && template.exercises.length > 0) {
    const { createExercise } = await import("./routineExercisesService.js");

    const exercises = template.exercises.slice().sort((a, b) => {
      const oa = typeof a.order === "number" ? a.order : 0;
      const ob = typeof b.order === "number" ? b.order : 0;
      return oa - ob;
    });

    await Promise.all(
      exercises.map((ex) =>
        createExercise({
          userId,
          routineId: createdRoutine.id,
          name: ex.name || "Ejercicio",
          sets: ex.sets ?? null,
          reps: ex.reps ?? null,
          order: ex.order ?? null,
          restSeconds: ex.restSeconds ?? null,
          equipment: ex.equipment ?? null,
          primaryMuscle: ex.primaryMuscle ?? null,
          secondaryMuscles: ex.secondaryMuscles ?? null,
          notes: ex.notes ?? null,
          imageUrl: ex.imageUrl ?? null,
        }),
      ),
    );
  }

  return createdRoutine;
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
