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
 * Crea una rutina real a partir de una plantilla.
 * - Inserta la rutina en `routines` con los campos relevantes de la plantilla.
 * - Crea los ejercicios en `routineExercises` usando la misma estructura que usa la app.
 * Retorna el objeto de la rutina creada.
 */
export async function createRoutineFromTemplate({ userId, template }) {
  const routinesRef = collection(db, "routines");

  const routineData = {
    userId,
    name: template.name || "Nueva rutina",
    description: template.description || "",
    level: template.level || null,
    focus: template.focus || null,
    estimatedDurationMinutes: template.estimatedDurationMinutes || null,
    tags: Array.isArray(template.tags) ? template.tags : [],
    createdAt: new Date(),
    templateId: template.id || null,
  };

  const docRef = await addDoc(routinesRef, routineData);
  const createdRoutine = { id: docRef.id, ...routineData };

  // Crear ejercicios asociados si vienen en la plantilla.
  if (Array.isArray(template.exercises) && template.exercises.length > 0) {
    // Importar dinámicamente para evitar ciclos de importación en tiempo de carga.
    const { createExercise } = await import("./routineExercisesService.js");

    // Mantener orden si existe.
    const exercises = template.exercises.slice().sort((a, b) => {
      const oa = typeof a.order === "number" ? a.order : 0;
      const ob = typeof b.order === "number" ? b.order : 0;
      return oa - ob;
    });

    // Crear ejercicios en paralelo.
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
