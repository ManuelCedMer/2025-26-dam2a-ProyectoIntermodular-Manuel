import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  getMealsByDiet,
  createMeal,
  updateMeal,
  deleteMeal,
} from "../services/dietMealsService.js";

/**
 * Pantalla de detalle de un plan de alimentación.
 * Permite gestionar las comidas asociadas a ese plan.
 * [DIET-01] Comidas por día.
 * [DIET-03] Calorías estimadas por comida.
 */
function DietDetailPage() {
  const { dietId } = useParams();
  const location = useLocation();
  const { user } = useAuth();

  // Nombre del plan (lo recibimos desde la lista de dietas).
  const [dietName] = useState(location.state?.dietName || "");

  // Lista de comidas de este plan.
  const [meals, setMeals] = useState([]);

  // Formulario de creación.
  const [dayOfWeek, setDayOfWeek] = useState("L");
  const [mealType, setMealType] = useState("desayuno");
  const [name, setName] = useState("");
  const [estimatedCalories, setEstimatedCalories] = useState("");

  // Formulario de edición.
  const [editingId, setEditingId] = useState(null);
  const [editDayOfWeek, setEditDayOfWeek] = useState("L");
  const [editMealType, setEditMealType] = useState("desayuno");
  const [editName, setEditName] = useState("");
  const [editEstimatedCalories, setEditEstimatedCalories] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const availableDays = ["L", "M", "X", "J", "V", "S", "D"];
  const availableMealTypes = ["desayuno", "comida", "cena", "snack"];

  /**
   * Carga las comidas del plan de alimentación al entrar en la página.
   */
  useEffect(() => {
    if (!user) return;

    async function loadMeals() {
      try {
        setLoading(true);
        setErrorMessage("");

        const mealsFromDb = await getMealsByDiet({
          userId: user.uid,
          dietId,
        });

        setMeals(mealsFromDb);
      } catch (error) {
        console.error("Error al cargar comidas:", error);
        setErrorMessage("No se han podido cargar las comidas del plan.");
      } finally {
        setLoading(false);
      }
    }

    loadMeals();
  }, [user, dietId]);

  /**
   * Maneja el envío del formulario de creación de comida.
   * [DIET-01][DIET-03]
   */
  async function handleCreateMeal(event) {
    event.preventDefault();

    if (!name.trim()) {
      setErrorMessage("El nombre de la comida es obligatorio.");
      return;
    }

    const parsedCalories =
      estimatedCalories.trim() === ""
        ? null
        : Number(estimatedCalories);

    if (parsedCalories !== null && Number.isNaN(parsedCalories)) {
      setErrorMessage("Las calorías deben ser un número.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const newMeal = await createMeal({
        userId: user.uid,
        dietId,
        dayOfWeek,
        mealType,
        name: name.trim(),
        estimatedCalories: parsedCalories,
      });

      setMeals((prev) => [newMeal, ...prev]);

      // Limpiar formulario.
      setName("");
      setEstimatedCalories("");
      setDayOfWeek("L");
      setMealType("desayuno");
    } catch (error) {
      console.error("Error al crear comida:", error);
      setErrorMessage("No se ha podido crear la comida.");
    } finally {
      setLoading(false);
    }
  }

  /**
   * Inicia la edición de una comida concreta.
   */
  function startEditMeal(meal) {
    setEditingId(meal.id);
    setEditDayOfWeek(meal.dayOfWeek || "L");
    setEditMealType(meal.mealType || "desayuno");
    setEditName(meal.name || "");
    setEditEstimatedCalories(
      meal.estimatedCalories !== null &&
      meal.estimatedCalories !== undefined
        ? String(meal.estimatedCalories)
        : "",
    );
    setErrorMessage("");
  }

  /**
   * Cancela la edición.
   */
  function cancelEdit() {
    setEditingId(null);
    setEditDayOfWeek("L");
    setEditMealType("desayuno");
    setEditName("");
    setEditEstimatedCalories("");
  }

  /**
   * Maneja el envío del formulario de edición.
   */
  async function handleUpdateMeal(event) {
    event.preventDefault();

    if (!editName.trim()) {
      setErrorMessage("El nombre de la comida es obligatorio.");
      return;
    }

    const parsedCalories =
      editEstimatedCalories.trim() === ""
        ? null
        : Number(editEstimatedCalories);

    if (parsedCalories !== null && Number.isNaN(parsedCalories)) {
      setErrorMessage("Las calorías deben ser un número.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      await updateMeal(editingId, {
        dayOfWeek: editDayOfWeek,
        mealType: editMealType,
        name: editName.trim(),
        estimatedCalories: parsedCalories,
      });

      setMeals((prev) =>
        prev.map((meal) =>
          meal.id === editingId
            ? {
                ...meal,
                dayOfWeek: editDayOfWeek,
                mealType: editMealType,
                name: editName.trim(),
                estimatedCalories: parsedCalories,
              }
            : meal,
        ),
      );

      cancelEdit();
    } catch (error) {
      console.error("Error al actualizar comida:", error);
      setErrorMessage("No se ha podido actualizar la comida.");
    } finally {
      setLoading(false);
    }
  }

  /**
   * Elimina una comida tras confirmarlo.
   */
  async function handleDeleteMeal(id) {
    const confirmDelete = window.confirm(
      "¿Seguro que quieres eliminar esta comida?",
    );
    if (!confirmDelete) return;

    try {
      setLoading(true);
      setErrorMessage("");

      await deleteMeal(id);

      setMeals((prev) => prev.filter((meal) => meal.id !== id));

      if (editingId === id) {
        cancelEdit();
      }
    } catch (error) {
      console.error("Error al eliminar comida:", error);
      setErrorMessage("No se ha podido eliminar la comida.");
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <div>
        <h2>[DIET] Detalle de plan de alimentación</h2>
        <p>No hay usuario autenticado.</p>
      </div>
    );
  }

  return (
    <div>
      <h2>[DIET] Comidas del plan de alimentación</h2>

      <p>
        <Link to="/dietas">← Volver a mis planes</Link>
      </p>

      {dietName && <h3>{dietName}</h3>}

      {errorMessage && <p>{errorMessage}</p>}

      {/* Formulario de creación de comida */}
      <section>
        <h4>Añadir comida</h4>

        <form onSubmit={handleCreateMeal}>
          <div>
            <label>Día de la semana</label>
            <select
              value={dayOfWeek}
              onChange={(event) => setDayOfWeek(event.target.value)}
            >
              {availableDays.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Tipo de comida</label>
            <select
              value={mealType}
              onChange={(event) => setMealType(event.target.value)}
            >
              {availableMealTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Nombre de la comida</label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ej: Avena con fruta, pasta con pollo..."
              required
            />
          </div>

          <div>
            <label>Calorías estimadas (opcional)</label>
            <input
              type="number"
              value={estimatedCalories}
              onChange={(event) => setEstimatedCalories(event.target.value)}
              min="0"
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Guardar comida"}
          </button>
        </form>
      </section>

      {/* Formulario de edición de comida */}
      {editingId && (
        <section>
          <h4>Editar comida</h4>

          <form onSubmit={handleUpdateMeal}>
            <div>
              <label>Día de la semana</label>
              <select
                value={editDayOfWeek}
                onChange={(event) =>
                  setEditDayOfWeek(event.target.value)
                }
              >
                {availableDays.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Tipo de comida</label>
              <select
                value={editMealType}
                onChange={(event) =>
                  setEditMealType(event.target.value)
                }
              >
                {availableMealTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Nombre de la comida</label>
              <input
                type="text"
                value={editName}
                onChange={(event) => setEditName(event.target.value)}
                required
              />
            </div>

            <div>
              <label>Calorías estimadas (opcional)</label>
              <input
                type="number"
                value={editEstimatedCalories}
                onChange={(event) =>
                  setEditEstimatedCalories(event.target.value)
                }
                min="0"
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar cambios"}
            </button>

            <button type="button" onClick={cancelEdit}>
              Cancelar
            </button>
          </form>
        </section>
      )}

      {/* Listado de comidas */}
      <section>
        <h4>Comidas de este plan</h4>

        {loading && meals.length === 0 && <p>Cargando comidas...</p>}

        {!loading && meals.length === 0 && (
          <p>Este plan todavía no tiene comidas definidas.</p>
        )}

        <ul>
          {meals.map((meal) => (
            <li key={meal.id}>
              <strong>
                {meal.dayOfWeek} - {meal.mealType}
              </strong>
              : {meal.name}{" "}
              {meal.estimatedCalories !== null &&
                meal.estimatedCalories !== undefined && (
                  <span>({meal.estimatedCalories} kcal)</span>
                )}{" "}
              <button type="button" onClick={() => startEditMeal(meal)}>
                Editar
              </button>
              <button
                type="button"
                onClick={() => handleDeleteMeal(meal.id)}
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default DietDetailPage;
