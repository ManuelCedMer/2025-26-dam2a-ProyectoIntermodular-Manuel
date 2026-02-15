import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getRecipes } from "../services/recipesService.js";
import {
  getFavoriteRecipeIdsByUser,
  addFavoriteRecipe,
  removeFavoriteRecipe,
  getFavoriteRecipesByUser,
} from "../services/favoriteRecipesService.js";


/**
 * Pantalla de búsqueda de recetas [RECIPES].
 * En este bloque:
 *  - Permito buscar recetas por ingrediente y tipo de comida [RECIPES-01].
 *  - Muestro un listado con enlaces al detalle [RECIPES-02].
 *
 */
function RecipesPage() {
  const { user } = useAuth();

  // Filtros de búsqueda.
  const [ingredientText, setIngredientText] = useState("");
  const [mealType, setMealType] = useState("todos");

  // Resultado de recetas.
  const [recipes, setRecipes] = useState([]);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const availableMealTypes = [
    { value: "todos", label: "Todos" },
    { value: "desayuno", label: "Desayuno" },
    { value: "comida", label: "Comida" },
    { value: "cena", label: "Cena" },
    { value: "snack", label: "Snack" },
  ];
  // IDs de recetas favoritas del usuario (para marcar en el listado).
  const [favoriteIds, setFavoriteIds] = useState([]);

  // Lista de recetas favoritas (para sección "Mis favoritos").
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);

 
  /**
   * Carga inicial de recetas y favoritos al entrar en la página.
   */
  useEffect(() => {
    if (!user) return;

    async function initialLoad() {
      try {
        setLoading(true);
        setErrorMessage("");

        // 1) Cargar recetas sin filtros (o con los filtros por defecto).
        const recipesResult = await getRecipes({
          ingredientText,
          mealType,
        });
        setRecipes(recipesResult);

        // 2) Cargar favoritos del usuario.
        const ids = await getFavoriteRecipeIdsByUser(user.uid);
        setFavoriteIds(ids);

        const favRecipes = await getFavoriteRecipesByUser(user.uid);
        setFavoriteRecipes(favRecipes);
      } catch (error) {
        console.error("Error al cargar recetas o favoritos:", error);
        setErrorMessage("No se han podido cargar las recetas o favoritos.");
      } finally {
        setLoading(false);
      }
    }

    initialLoad();
    
  }, [user]);


  /**
   * Lanza la búsqueda con los filtros actuales.
   * [RECIPES-01]
   */
  async function handleSearch(event) {
    if (event) {
      event.preventDefault();
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const results = await getRecipes({
        ingredientText,
        mealType,
      });

      setRecipes(results);
    } catch (error) {
      console.error("Error al buscar recetas:", error);
      setErrorMessage("No se han podido cargar las recetas.");
    } finally {
      setLoading(false);
    }
  }
    /**
   * Marca o desmarca una receta como favorita.
   * [RECIPES-03] Guardar y quitar de favoritos.
   */
  async function handleToggleFavorite(recipe) {
    if (!user) return;

    const isFavorite = favoriteIds.includes(recipe.id);

    try {
      setLoading(true);
      setErrorMessage("");

      if (isFavorite) {
        // Quitar de favoritos.
        await removeFavoriteRecipe({
          userId: user.uid,
          recipeId: recipe.id,
        });

        // Actualizo estado local.
        setFavoriteIds((prev) =>
          prev.filter((id) => id !== recipe.id),
        );
        setFavoriteRecipes((prev) =>
          prev.filter((fav) => fav.recipeId !== recipe.id),
        );
      } else {
        // Añadir a favoritos.
        await addFavoriteRecipe({
          userId: user.uid,
          recipe,
        });

        // Actualizo estado local.
        setFavoriteIds((prev) => [...prev, recipe.id]);
        setFavoriteRecipes((prev) => [
          ...prev,
          {
            recipeId: recipe.id,
            title: recipe.title,
            mealType: recipe.mealType || null,
            estimatedCalories:
              recipe.estimatedCalories !== undefined
                ? recipe.estimatedCalories
                : null,
            tags: Array.isArray(recipe.tags) ? recipe.tags : [],
          },
        ]);
      }
    } catch (error) {
      console.error("Error al actualizar favoritos:", error);
      setErrorMessage("No se han podido actualizar las recetas favoritas.");
    } finally {
      setLoading(false);
    }
  }

    if (!user) {
    return (
      <div className="recipes-page">
        <p>Inicia sesión para ver tu información.</p>
      </div>
    );
  }

  return (
    <div className="recipes-page">
      <section className="recipes-layout">
        {/* Columna izquierda: filtros + resultados */}
        <div className="recipes-left">
          <header className="recipes-header">
            <h2>Búsqueda de recetas</h2>
            <p className="recipes-subtitle">
              Busca por ingrediente o tipo de comida y guarda tus favoritas.
            </p>
          </header>

          {/* Formulario de filtros */}
          <div className="recipes-filters">
            <h3>Filtros de búsqueda</h3>

            <form onSubmit={handleSearch}>
              <div>
                <label>Ingrediente</label>
                <input
                  type="text"
                  value={ingredientText}
                  onChange={(event) => setIngredientText(event.target.value)}
                  placeholder="Ej: pollo, arroz, avena..."
                />
              </div>

              <div>
                <label>Tipo de comida</label>
                <select
                  value={mealType}
                  onChange={(event) => setMealType(event.target.value)}
                >
                  {availableMealTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" disabled={loading}>
                {loading ? "Buscando..." : "Buscar"}
              </button>
            </form>
          </div>

          {/* Mensaje de error general */}
          {errorMessage && (
            <p className="recipes-message recipes-message--error">
              {errorMessage}
            </p>
          )}

          {/* Resultados de búsqueda */}
          <div className="recipes-list-card">
            <h3>Resultados</h3>

            {loading && recipes.length === 0 && (
              <p>Cargando recetas...</p>
            )}

            {!loading && recipes.length === 0 && (
              <p>No se han encontrado recetas con los filtros actuales.</p>
            )}

            <ul className="recipes-list">
              {recipes.map((recipe) => {
                const isFavorite = favoriteIds.includes(recipe.id);

                return (
                  <li
                    key={recipe.id}
                    className="recipes-list-item"
                  >
                    <div>
                      <strong>{recipe.title}</strong>{" "}
                      {recipe.mealType && (
                        <span>({recipe.mealType})</span>
                      )}{" "}
                      {Array.isArray(recipe.tags) &&
                        recipe.tags.length > 0 && (
                          <span> - {recipe.tags.join(", ")}</span>
                        )}
                    </div>

                    <div>
                      <Link to={`/recetas/${recipe.id}`}>
                        Ver detalle
                      </Link>{" "}
                      <button
                        type="button"
                        onClick={() => handleToggleFavorite(recipe)}
                      >
                        {isFavorite
                          ? "Quitar de favoritos"
                          : "Añadir a favoritos"}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Columna derecha: favoritos */}
        <aside className="recipes-detail-card">
          <h3>Mis recetas favoritas</h3>

          {favoriteRecipes.length === 0 ? (
            <p>
              Todavía no tienes recetas marcadas como favoritas.
            </p>
          ) : (
            <ul className="recipes-list">
              {favoriteRecipes.map((fav) => (
                <li
                  key={fav.recipeId}
                  className="recipes-list-item"
                >
                  <div>
                    <strong>{fav.title}</strong>{" "}
                    {fav.mealType && <span>({fav.mealType})</span>}{" "}
                    {Array.isArray(fav.tags) &&
                      fav.tags.length > 0 && (
                        <span> - {fav.tags.join(", ")}</span>
                      )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </section>
    </div>
  );
}

export default RecipesPage;
