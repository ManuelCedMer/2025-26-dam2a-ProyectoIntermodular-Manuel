import { Link } from "react-router-dom";
import Card from "./Card.jsx";

/**
 * Tarjeta visual para representar una receta.
 *
 * @param {Object} recipe - Objeto receta con id, title, image, etc.
 * @param {boolean} isFavorite - Si la receta está marcada como favorita
 * @param {Function} onToggleFavorite - Handler para toggle de favorito
 */
function RecipeCard({ recipe, isFavorite, onToggleFavorite }) {
  const handleFavoriteClick = (e) => {
    e.preventDefault(); // Evita navegación al hacer click en corazón
    e.stopPropagation();
    onToggleFavorite(recipe);
  };

  return (
    <Link to={`/recetas/${recipe.id}`} className="recipe-card-link">
      <Card className="recipe-card">
        <div className="recipe-card-image-container">
          {recipe.image ? (
            <img
              src={recipe.image}
              alt={recipe.title}
              className="recipe-card-image"
            />
          ) : (
            <div className="recipe-card-image-placeholder">
              <span className="recipe-card-placeholder-icon">🍽️</span>
            </div>
          )}
          <button
            type="button"
            className={`recipe-card-favorite-btn ${isFavorite ? "is-favorite" : ""}`}
            onClick={handleFavoriteClick}
            aria-label={
              isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"
            }
          >
            {isFavorite ? "❤️" : "🤍"}
          </button>
        </div>
        <div className="recipe-card-content">
          <h3 className="recipe-card-title">{recipe.title}</h3>
          {recipe.estimatedCalories !== undefined &&
            recipe.estimatedCalories !== null && (
              <div className="recipe-card-kcal">
                {recipe.estimatedCalories} kcal
              </div>
            )}
        </div>
      </Card>
    </Link>
  );
}

export default RecipeCard;
