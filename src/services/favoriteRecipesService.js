import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./firebase";

/**
 * Devuelve las recetas favoritas de un usuario.
 * [RECIPES-03] Consultar la sección de favoritos del usuario.
 */
export async function getFavoriteRecipesByUser(userId) {
  const favoritesRef = collection(db, "favoriteRecipes");

  const q = query(favoritesRef, where("userId", "==", userId));

  const snapshot = await getDocs(q);

  const favorites = snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));

  return favorites;
}

/**
 * Devuelve solo los IDs de recetas favoritas del usuario.
 * Esto nos sirve para marcar las recetas como favoritas en el listado.
 */
export async function getFavoriteRecipeIdsByUser(userId) {
  const favorites = await getFavoriteRecipesByUser(userId);
  return favorites.map((fav) => fav.recipeId);
}

/**
 * Marca una receta como favorita para un usuario.
 * Guardamos algunos datos de la receta para listar rápido.
 * [RECIPES-03] Guardar en favoritos.
 */
export async function addFavoriteRecipe({ userId, recipe }) {
  const favoritesRef = collection(db, "favoriteRecipes");

  const favoriteDoc = {
    userId,
    recipeId: recipe.id,
    title: recipe.title,
    mealType: recipe.mealType || null,
    estimatedCalories:
      recipe.estimatedCalories !== undefined
        ? recipe.estimatedCalories
        : null,
    tags: Array.isArray(recipe.tags) ? recipe.tags : [],
    createdAt: new Date(),
  };

  await addDoc(favoritesRef, favoriteDoc);
}

/**
 * Quita una receta de favoritos.
 * Buscamos el documento por userId + recipeId y lo borramos.
 * [RECIPES-03] Quitar de favoritos.
 */
export async function removeFavoriteRecipe({ userId, recipeId }) {
  const favoritesRef = collection(db, "favoriteRecipes");

  const q = query(
    favoritesRef,
    where("userId", "==", userId),
    where("recipeId", "==", recipeId),
  );

  const snapshot = await getDocs(q);

  const batchDeletes = snapshot.docs.map((docSnap) =>
    deleteDoc(doc(db, "favoriteRecipes", docSnap.id)),
  );

  await Promise.all(batchDeletes);
}
