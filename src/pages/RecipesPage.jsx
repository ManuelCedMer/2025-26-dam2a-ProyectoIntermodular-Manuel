import { useEffect, useState, useRef } from "react";
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
 * Permite buscar recetas por ingrediente y tipo de comida [RECIPES-01],
 * acceder al detalle de cada receta [RECIPES-02]
 * y gestionar recetas favoritas [RECIPES-03].
 */
function RecipesPage() {
  const { user } = useAuth();

  // Filtros de búsqueda de recetas.
  const [ingredientText, setIngredientText] = useState("");
  const [mealType, setMealType] = useState("todos");

  // Resultado de recetas obtenido desde Firestore.
  const [recipes, setRecipes] = useState([]);

  // Estados de carga y error.
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Tipos de comida disponibles para el filtro.
  const availableMealTypes = [
    { value: "todos", label: "Todos" },
    { value: "desayuno", label: "Desayuno" },
    { value: "comida", label: "Comida" },
    { value: "cena", label: "Cena" },
    { value: "snack", label: "Snack" },
  ];

  // Identificadores de recetas favoritas del usuario.
  const [favoriteIds, setFavoriteIds] = useState([]);

  // Recetas favoritas mostradas en la sección correspondiente.
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);

  // Referencia usada para hacer scroll hasta la sección de favoritos.
  const favoritesRef = useRef(null);

  /**
   * Desplaza la vista hasta la sección de recetas favoritas.
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

        // Carga recetas con los filtros iniciales.
        const recipesResult = await getRecipes({
          ingredientText,
          mealType,
        });
        setRecipes(recipesResult);

        // Carga los favoritos del usuario.
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
   * Ejecuta la búsqueda de recetas con los filtros actuales.
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
   * [RECIPES-03]
   */
  async function handleToggleFavorite(recipe) {
    if (!user) return;

    const isFavorite = favoriteIds.includes(recipe.id);

    try {
      setLoading(true);
      setErrorMessage("");

      if (isFavorite) {
        // Elimina la receta de favoritos en Firestore.
        await removeFavoriteRecipe({
          userId: user.uid,
          recipeId: recipe.id,
        });

        // Actualiza el estado local tras quitar la receta.
        setFavoriteIds((prev) => prev.filter((id) => id !== recipe.id));
        setFavoriteRecipes((prev) =>
          prev.filter((fav) => fav.recipeId !== recipe.id),
        );
      } else {
        // Añade la receta a favoritos en Firestore.
        await addFavoriteRecipe({
          userId: user.uid,
          recipe,
        });

        // Actualiza el estado local tras añadir la receta.
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

      {/* Panel de filtros de búsqueda */}
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

      {/* Card principal con resultados de búsqueda */}
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

      {/* Card con recetas favoritas del usuario */}
      <Card className="dashboard-tile recipes-favorites-card">
        <h3 ref={favoritesRef} className="section-title">
          Mis recetas favoritas
        </h3>

        {favoriteRecipes.length === 0 ? (
          <EmptyState text="Todavía no tienes recetas marcadas como favoritas." />
        ) : (
          <div className="recipes-grid">
            {favoriteRecipes.map((fav) => {
              // Recupera la receta completa si está disponible en los resultados actuales.
              const recipe = recipes.find((r) => r.id === fav.recipeId) || {
                id: fav.recipeId,
                title: fav.title,
              };

              return (
                <RecipeCard
                  key={fav.recipeId}
                  recipe={recipe}
                  isFavorite={true}
                  onToggleFavorite={handleToggleFavorite}
                />
              );
            })}
          </div>
        )}
      </Card>
    </Page>
  );
}

export default RecipesPage;
