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

  /* =========================
     Estilos UI-02 (tarjetas)
     ========================= */
  const pageStyles = {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "24px 16px 40px",
  };

  const cardStyles = {
    backgroundColor: "var(--card, #ffffff)",
    color: "var(--card-text, #111827)",
    borderRadius: "16px",
    padding: "16px 18px",
    boxShadow: "var(--shadow-md, 0 10px 30px rgba(15, 23, 42, 0.08))",
    border: "1px solid var(--card-border, rgba(148, 163, 184, 0.3))",
    marginBottom: "16px",
  };

  const sectionTitleStyles = {
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "8px",
    color: "var(--card-text, #111827)",
  };

  const smallTextStyles = {
    fontSize: "14px",
    color: "var(--muted, #374151)",
  };

  if (!user) {
    return (
      <div style={pageStyles}>
        <h2>Detalle de receta</h2>
        <p>Inicia sesión para ver tu información.</p>
      </div>
    );
  }

  if (loading && !recipe) {
    return (
      <div style={pageStyles}>
        <h2>Detalle de receta</h2>
        <p>Cargando receta...</p>
      </div>
    );
  }

  if (errorMessage && !recipe) {
    return (
      <div style={pageStyles}>
        <h2>Detalle de receta</h2>
        <p>{errorMessage}</p>
        <p>
          <Link to="/recetas">← Volver a la búsqueda</Link>
        </p>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div style={pageStyles}>
        <h2>Detalle de receta</h2>
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
    : String(recipe.ingredients || "")
        .split("\n")
        .filter((line) => line.trim() !== "");

  const steps = Array.isArray(recipe.steps)
    ? recipe.steps
    : String(recipe.steps || "")
        .split("\n")
        .filter((line) => line.trim() !== "");

  return (
    <main style={pageStyles}>
      <header style={{ marginBottom: "20px" }}>
        <Link to="/recetas">← Volver a la búsqueda</Link>
        <h2 style={{ fontSize: "24px", fontWeight: "700" }}>
          [RECIPES] Detalle de receta
        </h2>
      </header>

      {/* Información principal de la receta */}
      <section style={cardStyles}>
        <h3 style={{ fontSize: "20px", fontWeight: "700" }}>{recipe.title}</h3>

        {recipe.mealType && (
          <p style={smallTextStyles}>Tipo de comida: {recipe.mealType}</p>
        )}

        {Array.isArray(recipe.tags) && recipe.tags.length > 0 && (
          <p style={smallTextStyles}>Etiquetas: {recipe.tags.join(", ")}</p>
        )}

        {recipe.estimatedCalories !== null &&
          recipe.estimatedCalories !== undefined && (
            <p style={smallTextStyles}>
              Calorías aproximadas: {recipe.estimatedCalories} kcal
            </p>
          )}
      </section>

      {/* Ingredientes */}
      <section style={cardStyles}>
        <h4 style={sectionTitleStyles}>Ingredientes</h4>
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

      {/* Pasos */}
      <section style={cardStyles}>
        <h4 style={sectionTitleStyles}>Pasos</h4>
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
    </main>
  );
}

export default RecipeDetailPage;
