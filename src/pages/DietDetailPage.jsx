import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  getMealsByDiet,
  createMeal,
  updateMeal,
  deleteMeal,
} from "../services/dietMealsService.js";
import { getRecipes } from "../services/recipesService.js";
import { LinkButton, Button } from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import {
  Page,
  PageHeader,
  PageTitle,
  PageSubtitle,
} from "../components/ui/Page.jsx";
import { FormStack, Input } from "../components/ui/Form.jsx";
import Alert from "../components/ui/Alert.jsx";
import LoadingState from "../components/ui/LoadingState.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";

const dayLabels = {
  L: "Lunes",
  M: "Martes",
  X: "Miércoles",
  J: "Jueves",
  V: "Viernes",
  S: "Sábado",
  D: "Domingo",
};

const mealTypeLabels = {
  desayuno: "Desayuno",
  comida: "Comida",
  cena: "Cena",
  snack: "Snack",
};

function DietDetailPage() {
  const { dietId } = useParams();
  const location = useLocation();
  const { user } = useAuth();

  const [dietName] = useState(location.state?.dietName || "");

  // Estado para mostrar/ocultar panel de creación
  const [showCreatePanel, setShowCreatePanel] = useState(false);

  // Lista de comidas
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);

  // Formulario de creación
  const [dayOfWeek, setDayOfWeek] = useState("");
  const [mealType, setMealType] = useState("");
  const [name, setName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState("");

  // Edición
  const [editingId, setEditingId] = useState(null);
  const [editDayOfWeek, setEditDayOfWeek] = useState("");
  const [editMealType, setEditMealType] = useState("");
  const [editName, setEditName] = useState("");
  const [editErrorMessage, setEditErrorMessage] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editRecipes, setEditRecipes] = useState([]);
  const [editSelectedRecipeId, setEditSelectedRecipeId] = useState("");

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    // getMealsByDiet expects an object with userId and dietId
    getMealsByDiet({ userId: user.uid, dietId })
      .then(setMeals)
      .finally(() => setLoading(false));
  }, [user, dietId]);

  // Fetch recipes when creating and a mealType is selected
  useEffect(() => {
    if (!showCreatePanel || !mealType) {
      setRecipes([]);
      setSelectedRecipeId("");
      return;
    }

    let active = true;
    getRecipes({ mealType })
      .then((list) => {
        if (!active) return;
        setRecipes(list);
      })
      .catch(() => setRecipes([]));

    return () => {
      active = false;
    };
  }, [showCreatePanel, mealType]);

  // Fetch recipes for edit panel when meal type changes
  useEffect(() => {
    if (!editingId || !editMealType) {
      setEditRecipes([]);
      setEditSelectedRecipeId("");
      return;
    }

    let active = true;
    getRecipes({ mealType: editMealType })
      .then((list) => {
        if (!active) return;
        setEditRecipes(list);
      })
      .catch(() => setEditRecipes([]));

    return () => {
      active = false;
    };
  }, [editingId, editMealType]);

  // Lógica de creación/edición igual que antes
  const handleCreateMeal = async (e) => {
    e.preventDefault();
    // If recipes are available for the selected mealType, require a recipe selection.
    if (!dayOfWeek || !mealType) {
      setErrorMessage("Todos los campos son obligatorios.");
      return;
    }

    if (recipes.length > 0 && !selectedRecipeId) {
      setErrorMessage("Selecciona una receta para este tipo de comida.");
      return;
    }

    if (recipes.length === 0 && !name.trim()) {
      setErrorMessage("Introduce un nombre para la comida.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    try {
      // Determine values depending on whether a recipe was selected
      let recipeId = null;
      let recipeImage = null;
      let kcal = null;
      let finalName = name.trim();

      if (selectedRecipeId) {
        const r = recipes.find((it) => it.id === selectedRecipeId);
        if (r) {
          recipeId = r.id;
          recipeImage = r.image || null;
          kcal = r.estimatedCalories || null;
          finalName = r.title || r.name || finalName;
        }
      }

      const newMeal = await createMeal({
        userId: user.uid,
        dietId,
        dayOfWeek,
        mealType,
        name: finalName,
        estimatedCalories: kcal,
        recipeId,
        recipeImage,
      });
      setMeals((prev) => [newMeal, ...prev]);
      setShowCreatePanel(false);
      setDayOfWeek("");
      setMealType("");
      setName("");
      setSelectedRecipeId("");
    } catch {
      setErrorMessage("No se pudo crear la comida.");
    } finally {
      setLoading(false);
    }
  };

  const startEditMeal = (meal) => {
    setEditingId(meal.id);
    setEditDayOfWeek(meal.dayOfWeek);
    setEditMealType(meal.mealType);
    setEditName(meal.name);
    // remove estimated calories state (now derived from recipe)
    setEditSelectedRecipeId(meal.recipeId || "");
    setEditErrorMessage("");
  };

  const handleUpdateMeal = async (e) => {
    e.preventDefault();
    if (!editDayOfWeek || !editMealType) {
      setEditErrorMessage("Todos los campos son obligatorios.");
      return;
    }

    if (editRecipes.length > 0 && !editSelectedRecipeId) {
      setEditErrorMessage("Selecciona una receta para este tipo de comida.");
      return;
    }

    if (editRecipes.length === 0 && !editName.trim()) {
      setEditErrorMessage("Introduce un nombre para la comida.");
      return;
    }
    setEditLoading(true);
    setEditErrorMessage("");
    try {
      let recipeId = null;
      let recipeImage = null;
      let kcal = null;
      let finalName = editName.trim();
      if (editSelectedRecipeId) {
        const r = editRecipes.find((it) => it.id === editSelectedRecipeId);
        if (r) {
          recipeId = r.id;
          recipeImage = r.image || null;
          kcal = r.estimatedCalories || null;
          finalName = r.title || r.name || finalName;
        }
      }

      const updated = await updateMeal(editingId, {
        dayOfWeek: editDayOfWeek,
        mealType: editMealType,
        name: finalName,
        estimatedCalories: kcal,
        recipeId,
        recipeImage,
      });
      setMeals((prev) =>
        prev.map((m) => (m.id === editingId ? { ...m, ...updated } : m)),
      );
      setEditingId(null);
      setEditDayOfWeek("");
      setEditMealType("");
      setEditName("");
      setEditSelectedRecipeId("");
    } catch {
      setEditErrorMessage("No se pudo actualizar la comida.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteMeal = async (id) => {
    if (!window.confirm("¿Eliminar esta comida?")) return;
    setLoading(true);
    try {
      await deleteMeal(id);
      setMeals((prev) => prev.filter((m) => m.id !== id));
    } catch {
      // error handling opcional
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDayOfWeek("");
    setEditMealType("");
    setEditName("");
    setEditSelectedRecipeId("");
    setEditErrorMessage("");
  };

  // Ordenar comidas por día y tipo
  const sortedMeals = [...meals].sort((a, b) => {
    const dayOrder = "LMXJVSD";
    const mealOrder = ["desayuno", "comida", "cena", "snack"];
    const dayDiff =
      dayOrder.indexOf(a.dayOfWeek) - dayOrder.indexOf(b.dayOfWeek);
    if (dayDiff !== 0) return dayDiff;
    return mealOrder.indexOf(a.mealType) - mealOrder.indexOf(b.mealType);
  });

  if (!user) {
    return (
      <Page>
        <PageTitle>Comidas del plan</PageTitle>
        <p>Inicia sesión para ver tu información.</p>
      </Page>
    );
  }

  return (
    <Page>
      {/* Toolbar tipo dashboard */}
      <PageHeader>
        <div className="dashboard-header">
          <div className="dashboard-header-titles">
            <LinkButton
              to="/dietas"
              variant="secondary"
              size="sm"
              className="dashboard-back-btn"
            >
              ← Volver a mis planes
            </LinkButton>
            <PageTitle>Comidas del plan</PageTitle>
            {dietName && <PageSubtitle strong>{dietName}</PageSubtitle>}
          </div>
          <div className="dashboard-header-actions">
            <Button
              type="button"
              variant="primary"
              onClick={() => {
                setShowCreatePanel((v) => !v);
                setDayOfWeek("");
                setMealType("");
                setName("");
                setErrorMessage("");
              }}
            >
              + Añadir comida
            </Button>
          </div>
        </div>
      </PageHeader>

      {/* Panel colapsable de creación */}
      {showCreatePanel && (
        <Card className="dashboard-panel card-relative">
          <div className="cardheader-x-row">
            <h3 className="section-title">Añadir comida</h3>
            <button
              type="button"
              className="close-panel-btn"
              aria-label="Cerrar"
              onClick={() => {
                setShowCreatePanel(false);
                setDayOfWeek("");
                setMealType("");
                setName("");
                setErrorMessage("");
              }}
            >
              ×
            </button>
          </div>
          <form onSubmit={handleCreateMeal}>
            <FormStack>
              <select
                className="input"
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value)}
                required
              >
                <option value="">Día de la semana</option>
                {Object.keys(dayLabels).map((d) => (
                  <option key={d} value={d}>
                    {dayLabels[d]}
                  </option>
                ))}
              </select>
              <select
                className="input"
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
                required
              >
                <option value="">Tipo de comida</option>
                {Object.keys(mealTypeLabels).map((t) => (
                  <option key={t} value={t}>
                    {mealTypeLabels[t]}
                  </option>
                ))}
              </select>
              {/* Receta: siempre select, deshabilitado hasta seleccionar tipo */}
              <select
                className="input"
                value={selectedRecipeId}
                onChange={(e) => setSelectedRecipeId(e.target.value)}
                disabled={!mealType}
                required={recipes.length > 0}
              >
                {!mealType ? (
                  <option value="">Selecciona antes el tipo de comida</option>
                ) : recipes.length === 0 ? (
                  <option value="">
                    No hay recetas disponibles para este tipo
                  </option>
                ) : (
                  <>
                    <option value="">Selecciona una receta</option>
                    {recipes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.title}
                      </option>
                    ))}
                  </>
                )}
              </select>

              {/* Vista previa simple */}
              {selectedRecipeId &&
                (() => {
                  const sel = recipes.find((it) => it.id === selectedRecipeId);
                  return sel ? (
                    <div className="recipe-preview">
                      {sel.image ? (
                        <img
                          src={sel.image}
                          alt={sel.title}
                          className="recipe-preview-image"
                        />
                      ) : (
                        <div className="recipe-preview-placeholder">🍽️</div>
                      )}
                      <div className="recipe-preview-meta">
                        <strong>{sel.title}</strong>
                        {sel.estimatedCalories && (
                          <div className="muted">
                            {sel.estimatedCalories} kcal
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null;
                })()}
              {errorMessage && <Alert variant="error">{errorMessage}</Alert>}
              <Button type="submit" disabled={loading}>
                {loading ? "Guardando..." : "Añadir comida"}
              </Button>
            </FormStack>
          </form>
        </Card>
      )}

      {/* Panel colapsable de edición */}
      {editingId && (
        <Card className="dashboard-panel card-relative">
          <div className="cardheader-x-row">
            <h3 className="section-title">Editar comida</h3>
            <button
              type="button"
              className="close-panel-btn"
              aria-label="Cerrar"
              onClick={cancelEdit}
            >
              ×
            </button>
          </div>
          <form onSubmit={handleUpdateMeal}>
            <FormStack>
              <select
                className="input"
                value={editDayOfWeek}
                onChange={(e) => setEditDayOfWeek(e.target.value)}
                required
              >
                <option value="">Día de la semana</option>
                {Object.keys(dayLabels).map((d) => (
                  <option key={d} value={d}>
                    {dayLabels[d]}
                  </option>
                ))}
              </select>
              <select
                className="input"
                value={editMealType}
                onChange={(e) => setEditMealType(e.target.value)}
                required
              >
                <option value="">Tipo de comida</option>
                {Object.keys(mealTypeLabels).map((t) => (
                  <option key={t} value={t}>
                    {mealTypeLabels[t]}
                  </option>
                ))}
              </select>

              <select
                className="input"
                value={editSelectedRecipeId}
                onChange={(e) => setEditSelectedRecipeId(e.target.value)}
                disabled={!editMealType}
                required={editRecipes.length > 0}
              >
                {!editMealType ? (
                  <option value="">Selecciona antes el tipo de comida</option>
                ) : editRecipes.length === 0 ? (
                  <option value="">
                    No hay recetas disponibles para este tipo
                  </option>
                ) : (
                  <>
                    <option value="">Selecciona una receta</option>
                    {editRecipes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.title}
                      </option>
                    ))}
                  </>
                )}
              </select>

              {editSelectedRecipeId &&
                (() => {
                  const sel = editRecipes.find(
                    (it) => it.id === editSelectedRecipeId,
                  );
                  return sel ? (
                    <div className="recipe-preview">
                      {sel.image ? (
                        <img
                          src={sel.image}
                          alt={sel.title}
                          className="recipe-preview-image"
                        />
                      ) : (
                        <div className="recipe-preview-placeholder">🍽️</div>
                      )}
                      <div className="recipe-preview-meta">
                        <strong>{sel.title}</strong>
                        {sel.estimatedCalories && (
                          <div className="muted">
                            {sel.estimatedCalories} kcal
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null;
                })()}
              {editErrorMessage && (
                <Alert variant="error">{editErrorMessage}</Alert>
              )}
              <div className="actions-row">
                <Button type="submit" disabled={editLoading}>
                  {editLoading ? "Guardando..." : "Guardar cambios"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={cancelEdit}
                  disabled={editLoading}
                >
                  Cancelar
                </Button>
              </div>
            </FormStack>
          </form>
        </Card>
      )}

      {/* Card principal con listado de comidas */}
      <Card className="dashboard-tile dietmeals-list-card">
        {loading && <LoadingState text="Cargando comidas..." />}
        {!loading && sortedMeals.length === 0 && (
          <EmptyState text="Este plan todavía no tiene comidas definidas." />
        )}
        {!loading && sortedMeals.length > 0 && (
          <ul className="list-stack block-mt">
            {sortedMeals.map((meal) => (
              <li key={meal.id} className="dietmeal-row">
                {meal.recipeImage ? (
                  <img
                    src={meal.recipeImage}
                    alt={meal.name}
                    className="dietmeal-thumb"
                  />
                ) : null}
                <div className="dietmeal-info">
                  <span className="dietmeal-title">
                    {dayLabels[meal.dayOfWeek]} ·{" "}
                    {mealTypeLabels[meal.mealType]}
                  </span>
                  <span className="dietmeal-name">{meal.name}</span>
                </div>
                <div className="dietmeal-actions">
                  {meal.estimatedCalories && (
                    <span className="badge-pill kcal-badge">
                      {meal.estimatedCalories} kcal
                    </span>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => startEditMeal(meal)}
                  >
                    Editar
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    onClick={() => handleDeleteMeal(meal.id)}
                  >
                    Eliminar
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </Page>
  );
}

export default DietDetailPage;
