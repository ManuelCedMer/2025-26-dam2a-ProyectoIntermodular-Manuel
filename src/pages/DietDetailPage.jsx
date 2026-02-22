import { useEffect, useState } from "react";
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
import { FormStack, Field, Input } from "../components/ui/Form.jsx";

import Alert from "../components/ui/Alert.jsx";
import CardHeader from "../components/ui/CardHeader.jsx";
import LoadingState from "../components/ui/LoadingState.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import EntityListItem from "../components/ui/EntityListItem.jsx";
import { confirmDelete } from "../utils/confirm.js";

/**
 * Pantalla de detalle de un plan de alimentación.
 * Permite gestionar las comidas asociadas a ese plan.
 * [DIET-01] Comidas por día.
 * [DIET-03] Calorías estimadas por comida.
 *
 * Refactor UI (Bloque 1):
 *  - Se reemplazan estilos inline por componentes UI reutilizables.
 *  - Se estandariza header, cards, estados vacío/carga y confirmación de borrado.
 *  - NO se modifica la lógica de negocio.
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
    const ok = confirmDelete("¿Seguro que quieres eliminar esta comida?");
    if (!ok) return;

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

  // Ordeno las comidas por día de la semana y tipo de comida
  const dayOrder = ["L", "M", "X", "J", "V", "S", "D"];
  const mealTypeOrder = ["desayuno", "comida", "cena", "snack"];

  const sortedMeals = [...meals].sort((a, b) => {
    const dayDiff =
      dayOrder.indexOf(a.dayOfWeek) - dayOrder.indexOf(b.dayOfWeek);
    if (dayDiff !== 0) return dayDiff;

    const typeDiff =
      mealTypeOrder.indexOf(a.mealType) - mealTypeOrder.indexOf(b.mealType);
    if (typeDiff !== 0) return typeDiff;

    return a.name.localeCompare(b.name);
  });

  return (
    <Page>
      {/* Cabecera de la pantalla */}
      <PageHeader>
        <div className="row-between">
          <div>
            <PageTitle>Comidas del plan</PageTitle>
            {dietName && (
              <PageSubtitle>
                Plan seleccionado: <strong>{dietName}</strong>
              </PageSubtitle>
            )}
          </div>

          <LinkButton to="/dietas" variant="secondary" size="sm">
            ← Volver a mis planes
          </LinkButton>
        </div>

        {errorMessage && <Alert variant="error">{errorMessage}</Alert>}
      </PageHeader>

      {/* Contenedor principal en dos columnas */}
      <div className="diet-layout">
        {/* Columna izquierda: creación y edición */}
        <div className="stack-16">
          {/* Formulario de creación de comida */}
          <Card>
            <CardHeader
              title="Añadir comida"
              subtitle="Elige el día, el tipo de comida y una descripción breve. Puedes añadir también las calorías estimadas para utilizar esta dieta como referencia en tu progreso."
            />

            <form onSubmit={handleCreateMeal}>
              <FormStack>
                <Field label="Día de la semana">
                  <select
                    className="select"
                    value={dayOfWeek}
                    onChange={(event) => setDayOfWeek(event.target.value)}
                  >
                    {availableDays.map((day) => (
                      <option key={day} value={day}>
                        {dayLabels[day] || day}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Tipo de comida">
                  <select
                    className="select"
                    value={mealType}
                    onChange={(event) => setMealType(event.target.value)}
                  >
                    {availableMealTypes.map((type) => (
                      <option key={type} value={type}>
                        {mealTypeLabels[type] || type}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Nombre de la comida">
                  <Input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Ej: Avena con fruta, pasta con pollo..."
                    required
                  />
                </Field>

                <Field label="Calorías estimadas (opcional)">
                  <Input
                    type="number"
                    value={estimatedCalories}
                    onChange={(event) =>
                      setEstimatedCalories(event.target.value)
                    }
                    min="0"
                  />
                </Field>

                <Button type="submit" disabled={loading} block>
                  {loading ? "Guardando..." : "Guardar comida"}
                </Button>
              </FormStack>
            </form>
          </Card>

          {/* Formulario de edición de comida */}
          {editingId && (
            <Card>
              <CardHeader
                title="Editar comida"
                subtitle="Modifica el día, el tipo de comida, el nombre o las calorías estimadas de la comida seleccionada."
              />

              <form onSubmit={handleUpdateMeal}>
                <FormStack>
                  <Field label="Día de la semana">
                    <select
                      className="select"
                      value={editDayOfWeek}
                      onChange={(event) => setEditDayOfWeek(event.target.value)}
                    >
                      {availableDays.map((day) => (
                        <option key={day} value={day}>
                          {dayLabels[day] || day}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Tipo de comida">
                    <select
                      className="select"
                      value={editMealType}
                      onChange={(event) => setEditMealType(event.target.value)}
                    >
                      {availableMealTypes.map((type) => (
                        <option key={type} value={type}>
                          {mealTypeLabels[type] || type}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Nombre de la comida">
                    <Input
                      type="text"
                      value={editName}
                      onChange={(event) => setEditName(event.target.value)}
                      required
                    />
                  </Field>

                  <Field label="Calorías estimadas (opcional)">
                    <Input
                      type="number"
                      value={editEstimatedCalories}
                      onChange={(event) =>
                        setEditEstimatedCalories(event.target.value)
                      }
                      min="0"
                    />
                  </Field>

                  <div className="actions-row">
                    <Button type="submit" disabled={loading}>
                      {loading ? "Guardando..." : "Guardar cambios"}
                    </Button>

                    <Button
                      type="button"
                      onClick={cancelEdit}
                      variant="secondary"
                    >
                      Cancelar
                    </Button>
                  </div>
                </FormStack>
              </form>
            </Card>
          )}
        </div>

        {/* Columna derecha: listado de comidas */}
        <div className="stack-16">
          <Card>
            <CardHeader
              title="Comidas de este plan"
              subtitle="Las comidas se muestran ordenadas por día de la semana y tipo de comida para que puedas revisar rápidamente todo tu plan semanal."
            />

            {loading && meals.length === 0 && (
              <LoadingState className="block-mt" text="Cargando comidas..." />
            )}

            {!loading && sortedMeals.length === 0 && (
              <EmptyState
                className="block-mt"
                text="Este plan todavía no tiene comidas definidas."
              />
            )}

            {sortedMeals.length > 0 && (
              <ul className="list-stack block-mt">
                {sortedMeals.map((meal) => (
                  <EntityListItem
                    key={meal.id}
                    title={`${dayLabels[meal.dayOfWeek] || meal.dayOfWeek} · ${
                      mealTypeLabels[meal.mealType] || meal.mealType
                    }`}
                    meta={<div className="page-subtitle">{meal.name}</div>}
                    badge={
                      meal.estimatedCalories !== null &&
                      meal.estimatedCalories !== undefined
                        ? `${meal.estimatedCalories} kcal`
                        : null
                    }
                    actions={
                      <>
                        <Button
                          type="button"
                          onClick={() => startEditMeal(meal)}
                          variant="secondary"
                          size="sm"
                        >
                          Editar
                        </Button>
                        <Button
                          type="button"
                          onClick={() => handleDeleteMeal(meal.id)}
                          variant="danger"
                          size="sm"
                        >
                          Eliminar
                        </Button>
                      </>
                    }
                  />
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </Page>
  );
}

export default DietDetailPage;
