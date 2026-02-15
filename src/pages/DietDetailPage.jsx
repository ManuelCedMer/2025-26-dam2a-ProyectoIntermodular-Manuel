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
 *
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

  // Etiquetas más legibles para mostrar en la interfaz.
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

  /**
   * Estilos inline básicos, en línea con HOME / RECIPES / DIET.
   */
  const pageStyles = {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "24px 16px 40px",
  };

  const columnStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  };

  const cardStyles = {
    backgroundColor: "var(--card, #ffffff)",
    color: "var(--card-text, #111827)",
    borderRadius: "16px",
    padding: "16px 18px",
    boxShadow: "var(--shadow-md, 0 10px 30px rgba(15, 23, 42, 0.08))",
    border: "1px solid var(--card-border, rgba(148, 163, 184, 0.3))",
  };

  const sectionTitleStyles = {
    marginBottom: "8px",
    fontSize: "18px",
    fontWeight: "600",
    color: "var(--card-text, #111827)",
  };

  const labelStyles = {
    display: "block",
    marginBottom: "4px",
    fontSize: "14px",
    fontWeight: "500",
    color: "var(--muted, #374151)",
  };

  const inputStyles = {
    width: "100%",
    padding: "8px 10px",
    borderRadius: "8px",
    border: "1px solid var(--input-border, #d1d5db)",
    fontSize: "14px",
    backgroundColor: "var(--input-bg, #ffffff)",
    color: "var(--input-text, #111827)",
  };

  const selectStyles = {
    width: "100%",
    padding: "8px 10px",
    borderRadius: "8px",
    border: "1px solid var(--input-border, #d1d5db)",
    fontSize: "14px",
    backgroundColor: "var(--input-bg, #ffffff)",
    color: "var(--input-text, #111827)",
  };

  const primaryButtonStyles = {
    padding: "8px 14px",
    borderRadius: "999px",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    background:
      "linear-gradient(135deg, rgba(56,189,248,0.95), rgba(37,99,235,0.95))",
    color: "#ffffff",
  };

  const ghostButtonStyles = {
    padding: "6px 10px",
    borderRadius: "999px",
    border: "1px solid var(--card-border, #d1d5db)",
    cursor: "pointer",
    fontSize: "13px",
    backgroundColor: "var(--card-2, #f9fafb)",
    color: "var(--card-text, #374151)",
  };

  const dangerButtonStyles = {
    padding: "6px 10px",
    borderRadius: "999px",
    border: "none",
    cursor: "pointer",
    fontSize: "13px",
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
  };

  const smallTextStyles = {
    fontSize: "13px",
    color: "var(--muted, #6b7280)",
  };

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
      estimatedCalories.trim() === "" ? null : Number(estimatedCalories);

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
      meal.estimatedCalories !== null && meal.estimatedCalories !== undefined
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
      editEstimatedCalories.trim() === "" ? null : Number(editEstimatedCalories);

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
      <div style={pageStyles}>
        <h2>Detalle de plan de alimentación</h2>
        <p>Inicia sesión para ver tu información.</p>
      </div>
    );
  }

  // Ordeno las comidas por día de la semana y tipo de comida
  const dayOrder = ["L", "M", "X", "J", "V", "S", "D"];
  const mealTypeOrder = ["desayuno", "comida", "cena", "snack"];

  const sortedMeals = [...meals].sort((a, b) => {
    const dayDiff = dayOrder.indexOf(a.dayOfWeek) - dayOrder.indexOf(b.dayOfWeek);
    if (dayDiff !== 0) return dayDiff;

    const typeDiff = mealTypeOrder.indexOf(a.mealType) - mealTypeOrder.indexOf(b.mealType);
    if (typeDiff !== 0) return typeDiff;

    return a.name.localeCompare(b.name);
  });

  return (
    <main style={pageStyles}>
      {/* Cabecera de la pantalla */}
      <header style={{ marginBottom: "20px" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "baseline",
            gap: "8px",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: "700",
                marginBottom: "4px",
                color: "var(--text, #111827)",
              }}
            >
              Comidas del plan
            </h2>
            {dietName && (
              <p style={{ ...smallTextStyles, fontSize: "14px" }}>
                Plan seleccionado: <strong>{dietName}</strong>
              </p>
            )}
          </div>

          <Link
            to="/dietas"
            style={{
              ...ghostButtonStyles,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ← Volver a mis planes
          </Link>
        </div>

        {errorMessage && (
          <p style={{ marginTop: "8px", color: "#b91c1c" }}>{errorMessage}</p>
        )}
      </header>

      {/* Contenedor principal en dos columnas */}
      <div className="diet-layout">
        {/* Columna izquierda: creación y edición */}
        <div style={columnStyle}>
          {/* Formulario de creación de comida */}
          <section style={cardStyles}>
            <h3 style={sectionTitleStyles}>Añadir comida</h3>
            <p style={smallTextStyles}>
              Elige el día, el tipo de comida y una descripción breve. Puedes
              añadir también las calorías estimadas para utilizar esta dieta
              como referencia en tu progreso.
            </p>

            <form
              onSubmit={handleCreateMeal}
              style={{
                marginTop: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div>
                <label style={labelStyles}>Día de la semana</label>
                <select
                  value={dayOfWeek}
                  onChange={(event) => setDayOfWeek(event.target.value)}
                  style={selectStyles}
                >
                  {availableDays.map((day) => (
                    <option key={day} value={day}>
                      {dayLabels[day] || day}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyles}>Tipo de comida</label>
                <select
                  value={mealType}
                  onChange={(event) => setMealType(event.target.value)}
                  style={selectStyles}
                >
                  {availableMealTypes.map((type) => (
                    <option key={type} value={type}>
                      {mealTypeLabels[type] || type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyles}>Nombre de la comida</label>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Ej: Avena con fruta, pasta con pollo..."
                  required
                  style={inputStyles}
                />
              </div>

              <div>
                <label style={labelStyles}>Calorías estimadas (opcional)</label>
                <input
                  type="number"
                  value={estimatedCalories}
                  onChange={(event) => setEstimatedCalories(event.target.value)}
                  min="0"
                  style={inputStyles}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={primaryButtonStyles}
              >
                {loading ? "Guardando..." : "Guardar comida"}
              </button>
            </form>
          </section>

          {/* Formulario de edición de comida */}
          {editingId && (
            <section style={cardStyles}>
              <h3 style={sectionTitleStyles}>Editar comida</h3>
              <p style={smallTextStyles}>
                Modifica el día, el tipo de comida, el nombre o las calorías
                estimadas de la comida seleccionada.
              </p>

              <form
                onSubmit={handleUpdateMeal}
                style={{
                  marginTop: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div>
                  <label style={labelStyles}>Día de la semana</label>
                  <select
                    value={editDayOfWeek}
                    onChange={(event) => setEditDayOfWeek(event.target.value)}
                    style={selectStyles}
                  >
                    {availableDays.map((day) => (
                      <option key={day} value={day}>
                        {dayLabels[day] || day}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyles}>Tipo de comida</label>
                  <select
                    value={editMealType}
                    onChange={(event) => setEditMealType(event.target.value)}
                    style={selectStyles}
                  >
                    {availableMealTypes.map((type) => (
                      <option key={type} value={type}>
                        {mealTypeLabels[type] || type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyles}>Nombre de la comida</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(event) => setEditName(event.target.value)}
                    required
                    style={inputStyles}
                  />
                </div>

                <div>
                  <label style={labelStyles}>Calorías estimadas (opcional)</label>
                  <input
                    type="number"
                    value={editEstimatedCalories}
                    onChange={(event) =>
                      setEditEstimatedCalories(event.target.value)
                    }
                    min="0"
                    style={inputStyles}
                  />
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="submit"
                    disabled={loading}
                    style={primaryButtonStyles}
                  >
                    {loading ? "Guardando..." : "Guardar cambios"}
                  </button>

                  <button
                    type="button"
                    onClick={cancelEdit}
                    style={ghostButtonStyles}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </section>
          )}
        </div>

        {/* Columna derecha: listado de comidas */}
        <div style={columnStyle}>
          <section style={cardStyles}>
            <h3 style={sectionTitleStyles}>Comidas de este plan</h3>
            <p style={smallTextStyles}>
              Las comidas se muestran ordenadas por día de la semana y tipo de
              comida para que puedas revisar rápidamente todo tu plan semanal.
            </p>

            {loading && meals.length === 0 && (
              <p style={{ marginTop: "12px" }}>Cargando comidas...</p>
            )}

            {!loading && sortedMeals.length === 0 && (
              <p style={{ marginTop: "12px" }}>
                Este plan todavía no tiene comidas definidas.
              </p>
            )}

            {sortedMeals.length > 0 && (
              <ul
                style={{
                  marginTop: "12px",
                  listStyle: "none",
                  padding: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                {sortedMeals.map((meal) => (
                  <li
                    key={meal.id}
                    style={{
                      padding: "10px 12px",
                      borderRadius: "12px",
                      border: "1px solid var(--card-border, #e5e7eb)",
                      backgroundColor: "var(--card-2, #f9fafb)",
                      color: "var(--card-text, #111827)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        gap: "8px",
                        flexWrap: "wrap",
                      }}
                    >
                      <div>
                        <strong>
                          {dayLabels[meal.dayOfWeek] || meal.dayOfWeek} ·{" "}
                          {mealTypeLabels[meal.mealType] || meal.mealType}
                        </strong>
                        <div style={smallTextStyles}>{meal.name}</div>
                      </div>

                      {meal.estimatedCalories !== null &&
                        meal.estimatedCalories !== undefined && (
                          <span
                            style={{
                              fontSize: "13px",
                              fontWeight: "600",
                              color: "var(--card-text, #111827)",
                              backgroundColor: "var(--primary-soft, #e0f2fe)",
                              border: "1px solid var(--card-border, #e5e7eb)",
                              borderRadius: "999px",
                              padding: "4px 8px",
                            }}
                          >
                            {meal.estimatedCalories} kcal
                          </span>
                        )}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        flexWrap: "wrap",
                        marginTop: "4px",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => startEditMeal(meal)}
                        style={ghostButtonStyles}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteMeal(meal.id)}
                        style={dangerButtonStyles}
                      >
                        Eliminar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

export default DietDetailPage;
