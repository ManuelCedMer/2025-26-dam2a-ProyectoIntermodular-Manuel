import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getRecipes } from "../services/recipesService.js";

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

  /**
   * Carga inicial de recetas al entrar en la página.
   * Podemos cargar sin filtros o con un filtro por defecto.
   */
  useEffect(() => {
   
    if (!user) return;

    handleSearch();
  }, []);

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

  if (!user) {
    return (
      <div>
        <h2>[RECIPES] Búsqueda de recetas</h2>
        <p>No hay usuario autenticado.</p>
      </div>
    );
  }

  return (
    <div>
      <h2>[RECIPES] Búsqueda de recetas</h2>

      {/* Formulario de filtros */}
      <section>
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
      </section>

      {errorMessage && <p>{errorMessage}</p>}

      {/* Resultados de búsqueda */}
      <section>
        <h3>Resultados</h3>

        {loading && recipes.length === 0 && <p>Cargando recetas...</p>}

        {!loading && recipes.length === 0 && (
          <p>No se han encontrado recetas con los filtros actuales.</p>
        )}

        <ul>
          {recipes.map((recipe) => (
            <li key={recipe.id}>
              <strong>{recipe.title}</strong>{" "}
              {recipe.mealType && <span>({recipe.mealType})</span>}{" "}
              {Array.isArray(recipe.tags) && recipe.tags.length > 0 && (
                <span>
                  {" "}
                  - {recipe.tags.join(", ")}
                </span>
              )}{" "}
              <Link to={`/recetas/${recipe.id}`}>Ver detalle</Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default RecipesPage;
