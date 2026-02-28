import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  getMealsByDiet,
  createMeal,
  updateMeal,
  deleteMeal,
} from "../services/dietMealsService.js";
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
  const [estimatedCalories, setEstimatedCalories] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Edición
  const [editingId, setEditingId] = useState(null);
  const [editDayOfWeek, setEditDayOfWeek] = useState("");
  const [editMealType, setEditMealType] = useState("");
  const [editName, setEditName] = useState("");
  const [editEstimatedCalories, setEditEstimatedCalories] = useState("");
  const [editErrorMessage, setEditErrorMessage] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getMealsByDiet(dietId, user.uid)
      .then(setMeals)
      .finally(() => setLoading(false));
  }, [user, dietId]);

  // Lógica de creación/edición igual que antes
  const handleCreateMeal = async (e) => {
    e.preventDefault();
    if (!dayOfWeek || !mealType || !name.trim()) {
      setErrorMessage("Todos los campos son obligatorios.");
      return;
    }
    setLoading(true);
    setErrorMessage("");
    try {
      const newMeal = await createMeal({
        userId: user.uid,
        dietId,
        dayOfWeek,
        mealType,
        name: name.trim(),
        estimatedCalories: estimatedCalories ? Number(estimatedCalories) : null,
      });
      setMeals((prev) => [newMeal, ...prev]);
      setShowCreatePanel(false);
      setDayOfWeek("");
      setMealType("");
      setName("");
      setEstimatedCalories("");
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
    setEditEstimatedCalories(meal.estimatedCalories || "");
    setEditErrorMessage("");
  };

  const handleUpdateMeal = async (e) => {
    e.preventDefault();
    if (!editDayOfWeek || !editMealType || !editName.trim()) {
      setEditErrorMessage("Todos los campos son obligatorios.");
      return;
    }
    setEditLoading(true);
    setEditErrorMessage("");
    try {
      const updated = await updateMeal(editingId, {
        dayOfWeek: editDayOfWeek,
        mealType: editMealType,
        name: editName.trim(),
        estimatedCalories: editEstimatedCalories
          ? Number(editEstimatedCalories)
          : null,
      });
      setMeals((prev) =>
        prev.map((m) => (m.id === editingId ? { ...m, ...updated } : m)),
      );
      setEditingId(null);
      setEditDayOfWeek("");
      setEditMealType("");
      setEditName("");
      setEditEstimatedCalories("");
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
    setEditEstimatedCalories("");
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
                setEstimatedCalories("");
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
                setEstimatedCalories("");
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
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre de la comida"
                required
              />
              <Input
                type="number"
                value={estimatedCalories}
                onChange={(e) => setEstimatedCalories(e.target.value)}
                placeholder="Kcal estimadas"
                min={0}
              />
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
              <Input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
              <Input
                type="number"
                value={editEstimatedCalories}
                onChange={(e) => setEditEstimatedCalories(e.target.value)}
                placeholder="Kcal estimadas"
                min={0}
              />
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
