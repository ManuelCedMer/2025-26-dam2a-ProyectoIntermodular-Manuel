import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getRecipeById } from "../services/recipesService.js";
import { Page } from "../components/ui/Page.jsx";
import LoadingState from "../components/ui/LoadingState.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";

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
      <Page>
        <p>Inicia sesión para ver tu información.</p>
      </Page>
    );
  }

  if (loading && !recipe) {
    return (
      <Page>
        <LoadingState text="Cargando receta..." />
      </Page>
    );
  }

  if (errorMessage && !recipe) {
    return (
      <Page>
        <EmptyState text={errorMessage} />
        <p style={{ marginTop: "1rem" }}>
          <Link to="/recetas" className="btn btn-secondary btn-sm">
            ← Volver a recetas
          </Link>
        </p>
      </Page>
    );
  }

  if (!recipe) {
    return (
      <Page>
        <EmptyState text="No se ha encontrado la receta." />
        <p style={{ marginTop: "1rem" }}>
          <Link to="/recetas" className="btn btn-secondary btn-sm">
            ← Volver a recetas
          </Link>
        </p>
      </Page>
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
    <Page>
      {/* Botón volver */}
      <div className="recipe-detail-header">
        <Link to="/recetas" className="btn btn-secondary btn-sm">
          ← Volver a recetas
        </Link>
      </div>

      {/* Título */}
      <h1 className="recipe-detail-title">{recipe.title}</h1>
      {/* Imagen de receta (colocada justo debajo del título) */}
      {recipe.image && (
        <div className="recipe-detail-image-container">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="recipe-detail-image"
          />
        </div>
      )}

      {/* Información meta */}
      <div className="recipe-detail-meta">
        {recipe.mealType && (
          <span className="recipe-detail-meta-item">
            <strong>Categoría:</strong> {recipe.mealType}
          </span>
        )}
        {recipe.estimatedCalories !== null &&
          recipe.estimatedCalories !== undefined && (
            <span className="recipe-detail-meta-item">
              <strong>Calorías:</strong> {recipe.estimatedCalories} kcal
            </span>
          )}
        {Array.isArray(recipe.tags) && recipe.tags.length > 0 && (
          <span className="recipe-detail-meta-item">
            <strong>Etiquetas:</strong> {recipe.tags.join(", ")}
          </span>
        )}
      </div>

      {/* Ingredientes */}
      <section className="recipe-detail-section">
        <h2 className="recipe-detail-section-title">Ingredientes</h2>
        {ingredients.length === 0 ? (
          <p className="text-muted">No se han especificado ingredientes.</p>
        ) : (
          <ul className="recipe-detail-list">
            {ingredients.map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ul>
        )}
      </section>

      {/* Pasos */}
      <section className="recipe-detail-section">
        <h2 className="recipe-detail-section-title">Pasos</h2>
        {steps.length === 0 ? (
          <p className="text-muted">No se han especificado pasos.</p>
        ) : (
          <ol className="recipe-detail-steps">
            {steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        )}
      </section>

      {/* (imagen ya renderizada más arriba, junto al título) */}
    </Page>
  );
}

export default RecipeDetailPage;
