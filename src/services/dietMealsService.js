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
 * Devuelve las comidas asociadas a una dieta concreta.
 * [DIET-01] Comidas por día dentro de un plan.
 * [DIET-03] Incluye calorías estimadas.
 */
export async function getMealsByDiet({ userId, dietId }) {
  const mealsRef = collection(db, "dietMeals");

  const q = query(
    mealsRef,
    where("userId", "==", userId),
    where("dietId", "==", dietId),
  );

  const snapshot = await getDocs(q);

  const meals = snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));

  return meals;
}

/**
 * Crea una comida dentro de un plan de alimentación.
 * [DIET-01] Crear comida asociada a un día y tipo.
 * [DIET-03] Guardar calorías estimadas.
 */
export async function createMeal({
  userId,
  dietId,
  dayOfWeek,
  mealType,
  name,
  estimatedCalories,
  recipeId,
  recipeImage,
}) {
  const mealsRef = collection(db, "dietMeals");

  const newMeal = {
    userId,
    dietId,
    dayOfWeek, // Ej: "L", "M", "X", "J", "V", "S", "D"
    mealType,  // Ej: "desayuno", "comida", "cena", "snack"
    name,
    estimatedCalories, // puede ser null si no se rellena
    recipeId: recipeId || null,
    recipeImage: recipeImage || null,
    createdAt: new Date(),
  };

  const docRef = await addDoc(mealsRef, newMeal);

  return { id: docRef.id, ...newMeal };
}

/**
 * Actualiza una comida existente.
 */
export async function updateMeal(
  id,
  { dayOfWeek, mealType, name, estimatedCalories, recipeId, recipeImage },
) {
  const mealRef = doc(db, "dietMeals", id);

  const updatedFields = {
    dayOfWeek,
    mealType,
    name,
    estimatedCalories,
    recipeId: recipeId !== undefined ? recipeId : null,
    recipeImage: recipeImage !== undefined ? recipeImage : null,
    updatedAt: new Date(),
  };

  await updateDoc(mealRef, updatedFields);

  return { id, ...updatedFields };
}

/**
 * Elimina una comida.
 */
export async function deleteMeal(id) {
  const mealRef = doc(db, "dietMeals", id);
  await deleteDoc(mealRef);
}
