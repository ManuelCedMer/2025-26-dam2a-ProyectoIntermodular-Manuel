import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getRecipes } from "../services/recipesService.js";
import {
  getFavoriteRecipeIdsByUser,
  addFavoriteRecipe,
  removeFavoriteRecipe,
  getFavoriteRecipesByUser,
} from "../services/favoriteRecipesService.js";

import Alert from "../components/ui/Alert.jsx";
import RecipeCard from "../components/ui/RecipeCard.jsx";
import Card from "../components/ui/Card.jsx";
import {
  Page,
  PageHeader,
  PageTitle,
  PageSubtitle,
} from "../components/ui/Page.jsx";
import { Input } from "../components/ui/Form.jsx";
import { Button } from "../components/ui/Button.jsx";
import LoadingState from "../components/ui/LoadingState.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";

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

  // Ref para scroll a favoritos
  const favoritesRef = useRef(null);

  /**
   * Scroll a la sección de favoritos
   */
  const scrollToFavorites = () => {
    favoritesRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

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
        setFavoriteIds((prev) => prev.filter((id) => id !== recipe.id));
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
      <Page>
        <PageTitle>Recetas</PageTitle>
        <p>Inicia sesión para ver tu información.</p>
      </Page>
    );
  }

  return (
    <Page>
      {/* Header tipo dashboard */}
      <PageHeader>
        <div className="dashboard-header">
          <div className="dashboard-header-titles">
            <PageTitle>Recetas</PageTitle>
            <PageSubtitle>
              Busca recetas por ingrediente o tipo de comida y guarda tus
              favoritas.
            </PageSubtitle>
          </div>
          <div className="dashboard-header-actions">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={scrollToFavorites}
            >
              ⭐ Mis favoritos
            </Button>
          </div>
        </div>
      </PageHeader>

      {/* Filtros de búsqueda */}
      <Card className="recipes-filters-card">
        <h3 className="section-title-sm">Filtros de búsqueda</h3>
        <form onSubmit={handleSearch} className="recipes-filters-form">
          <div className="recipes-filter-row">
            <div className="recipes-filter-field">
              <label className="label">Ingrediente</label>
              <Input
                type="text"
                value={ingredientText}
                onChange={(event) => setIngredientText(event.target.value)}
                placeholder="Ej: pollo, arroz, avena..."
              />
            </div>

            <div className="recipes-filter-field">
              <label className="label">Tipo de comida</label>
              <select
                className="input"
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

            <div className="recipes-filter-button">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Buscando..." : "Buscar"}
              </button>
            </div>
          </div>
        </form>
        {errorMessage && <Alert variant="error">{errorMessage}</Alert>}
      </Card>
      {/* Resultados de búsqueda */}
      <Card className="dashboard-tile recipes-results-card">
        <h3 className="section-title">Resultados</h3>

        {loading && recipes.length === 0 && (
          <LoadingState text="Cargando recetas..." />
        )}
        {!loading && recipes.length === 0 && (
          <EmptyState text="No se han encontrado recetas con los filtros actuales." />
        )}
        {recipes.length > 0 && (
          <div className="recipes-grid">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                isFavorite={favoriteIds.includes(recipe.id)}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}
      </Card>

      {/* Favoritos */}
      <Card className="dashboard-tile recipes-favorites-card">
        <h3 ref={favoritesRef} className="section-title">
          Mis recetas favoritas
        </h3>

        {favoriteRecipes.length === 0 ? (
          <EmptyState text="Todavía no tienes recetas marcadas como favoritas." />
        ) : (
          <ul className="list-stack">
            {favoriteRecipes.map((fav) => (
              <li key={fav.recipeId} className="recipes-favorite-item">
                <div className="recipes-favorite-info">
                  <span className="recipes-favorite-title">{fav.title}</span>
                  {fav.mealType && (
                    <span className="text-muted"> · {fav.mealType}</span>
                  )}
                  {Array.isArray(fav.tags) && fav.tags.length > 0 && (
                    <span className="text-muted"> · {fav.tags.join(", ")}</span>
                  )}
                </div>
                <Link
                  to={`/recetas/${fav.recipeId}`}
                  className="btn btn-sm btn-secondary"
                >
                  Ver
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </Page>
  );
}

export default RecipesPage;
