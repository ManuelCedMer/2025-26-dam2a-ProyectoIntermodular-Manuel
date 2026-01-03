import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "./firebase";

/**
 * Busca recetas aplicando filtros por tipo de comida y por ingrediente.
 * [RECIPES-01] Búsqueda de recetas.
 *
 * Nota: el filtro por ingrediente se hace en el cliente
 * usando includes sobre el array de ingredientes.
 */
export async function getRecipes({ ingredientText, mealType }) {
  const recipesRef = collection(db, "recipes");

  let q;

  // Si se ha elegido tipo de comida, filtramos por mealType en Firestore.
  if (mealType && mealType !== "todos") {
    q = query(recipesRef, where("mealType", "==", mealType));
  } else {
    // Sin filtro de tipo, obtenemos todas.
    q = query(recipesRef);
  }

  const snapshot = await getDocs(q);

  let recipes = snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));

  // Filtro por ingrediente en el cliente.
  if (ingredientText && ingredientText.trim() !== "") {
    const text = ingredientText.trim().toLowerCase();

    recipes = recipes.filter((recipe) => {
      const ingredientsText = Array.isArray(recipe.ingredients)
        ? recipe.ingredients.join(" ").toLowerCase()
        : String(recipe.ingredients || "").toLowerCase();

      return ingredientsText.includes(text);
    });
  }

  return recipes;
}

/**
 * Devuelve una receta concreta por id.
 * [RECIPES-02] Ver detalle de la receta.
 */
export async function getRecipeById(recipeId) {
  const recipeRef = doc(db, "recipes", recipeId);
  const snapshot = await getDoc(recipeRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}
