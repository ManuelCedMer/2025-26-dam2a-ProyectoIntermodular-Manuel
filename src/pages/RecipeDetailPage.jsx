import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getRecipeById } from "../services/recipesService.js";

/**
 * Pantalla de detalle de una receta [RECIPES-02].
 * Muestra ingredientes, pasos y calorías aproximadas.
 */
function RecipeDetailPage() {
  const { recipeId } = useParams();
  const { user } = useAuth();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  /**
   * Carga la receta desde Firestore al entrar en la página.
   * [RECIPES-02]
   */
  useEffect(() => {
    if (!user) return;

    async function loadRecipe() {
      try {
        setLoading(true);
        setErrorMessage("");

        const recipeFromDb = await getRecipeById(recipeId);

        if (!recipeFromDb) {
          setErrorMessage("No se ha encontrado la receta.");
        } else {
          setRecipe(recipeFromDb);
        }
      } catch (error) {
        console.error("Error al cargar la receta:", error);
        setErrorMessage("No se ha podido cargar la receta.");
      } finally {
        setLoading(false);
      }
    }

    loadRecipe();
  }, [user, recipeId]);

  if (!user) {
    return (
      <div>
        <h2>[RECIPES] Detalle de receta</h2>
        <p>No hay usuario autenticado.</p>
      </div>
    );
  }

  if (loading && !recipe) {
    return (
      <div>
        <h2>[RECIPES] Detalle de receta</h2>
        <p>Cargando receta...</p>
      </div>
    );
  }

  if (errorMessage && !recipe) {
    return (
      <div>
        <h2>[RECIPES] Detalle de receta</h2>
        <p>{errorMessage}</p>
        <p>
          <Link to="/recetas">← Volver a la búsqueda</Link>
        </p>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div>
        <h2>[RECIPES] Detalle de receta</h2>
        <p>No se ha encontrado la receta.</p>
        <p>
          <Link to="/recetas">← Volver a la búsqueda</Link>
        </p>
      </div>
    );
  }

  // Normalizamos ingredientes y pasos por si son string o array.
  const ingredients = Array.isArray(recipe.ingredients)
    ? recipe.ingredients
    : String(recipe.ingredients || "").split("\n").filter((line) => line.trim() !== "");

  const steps = Array.isArray(recipe.steps)
    ? recipe.steps
    : String(recipe.steps || "").split("\n").filter((line) => line.trim() !== "");

  return (
    <div>
      <h2>[RECIPES] Detalle de receta</h2>

      <p>
        <Link to="/recetas">← Volver a la búsqueda</Link>
      </p>

      <h3>{recipe.title}</h3>

      {recipe.mealType && <p>Tipo de comida: {recipe.mealType}</p>}

      {Array.isArray(recipe.tags) && recipe.tags.length > 0 && (
        <p>Etiquetas: {recipe.tags.join(", ")}</p>
      )}

      {recipe.estimatedCalories !== null &&
        recipe.estimatedCalories !== undefined && (
          <p>Calorías aproximadas: {recipe.estimatedCalories} kcal</p>
        )}

      <section>
        <h4>Ingredientes</h4>
        {ingredients.length === 0 ? (
          <p>No se han especificado ingredientes.</p>
        ) : (
          <ul>
            {ingredients.map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h4>Pasos</h4>
        {steps.length === 0 ? (
          <p>No se han especificado pasos.</p>
        ) : (
          <ol>
            {steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

export default RecipeDetailPage;
