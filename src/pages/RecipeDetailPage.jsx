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
      <main className="page-container page-container--md">
        <header className="page-header">
          <h2 className="page-title">Detalle de receta</h2>
        </header>
        <p>Inicia sesión para ver tu información.</p>
      </main>
    );
  }

  if (loading && !recipe) {
    return (
      <main className="page-container page-container--md">
        <header className="page-header">
          <h2 className="page-title">Detalle de receta</h2>
        </header>
        <p>Cargando receta...</p>
      </main>
    );
  }

  if (errorMessage && !recipe) {
    return (
      <main className="page-container page-container--md">
        <header className="page-header">
          <h2 className="page-title">Detalle de receta</h2>
        </header>
        <p>{errorMessage}</p>
        <p>
          <Link to="/recetas">← Volver a la búsqueda</Link>
        </p>
      </main>
    );
  }

  if (!recipe) {
    return (
      <main className="page-container page-container--md">
        <header className="page-header">
          <h2 className="page-title">Detalle de receta</h2>
        </header>
        <p>No se ha encontrado la receta.</p>
        <p>
          <Link to="/recetas">← Volver a la búsqueda</Link>
        </p>
      </main>
    );
  }

  // Normalizamos ingredientes y pasos por si son string o array.
  const ingredients = Array.isArray(recipe.ingredients)
    ? recipe.ingredients
    : String(recipe.ingredients || "")
        .split("\n")
        .filter((line) => line.trim() !== "");

  const steps = Array.isArray(recipe.steps)
    ? recipe.steps
    : String(recipe.steps || "")
        .split("\n")
        .filter((line) => line.trim() !== "");

  return (
    <main className="page-container page-container--md">
      <header className="page-header">
        <Link to="/recetas">← Volver a la búsqueda</Link>
        <h2 className="page-title">[RECIPES] Detalle de receta</h2>
      </header>

      {/* Información principal de la receta */}
      <section className="card">
        <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 700 }}>
          {recipe.title}
        </h3>

        {recipe.mealType && (
          <p className="text-muted" style={{ margin: "6px 0 0" }}>
            Tipo de comida: {recipe.mealType}
          </p>
        )}

        {Array.isArray(recipe.tags) && recipe.tags.length > 0 && (
          <p className="text-muted" style={{ margin: "6px 0 0" }}>
            Etiquetas: {recipe.tags.join(", ")}
          </p>
        )}

        {recipe.estimatedCalories !== null &&
          recipe.estimatedCalories !== undefined && (
            <p className="text-muted" style={{ margin: "6px 0 0" }}>
              Calorías aproximadas: {recipe.estimatedCalories} kcal
            </p>
          )}
      </section>

      {/* Ingredientes */}
      <section className="card">
        <h4 style={{ margin: "0 0 8px", fontSize: "18px", fontWeight: 600 }}>
          Ingredientes
        </h4>
        {ingredients.length === 0 ? (
          <p>No se han especificado ingredientes.</p>
        ) : (
          <ul style={{ margin: 0 }}>
            {ingredients.map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ul>
        )}
      </section>

      {/* Pasos */}
      <section className="card">
        <h4 style={{ margin: "0 0 8px", fontSize: "18px", fontWeight: 600 }}>
          Pasos
        </h4>
        {steps.length === 0 ? (
          <p>No se han especificado pasos.</p>
        ) : (
          <ol style={{ margin: 0 }}>
            {steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}

export default RecipeDetailPage;
