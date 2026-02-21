import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  getExercisesByRoutine,
  createExercise,
  updateExercise,
  deleteExercise,
} from "../services/routineExercisesService.js";
import {
  getCompletedExerciseIds,
  setExerciseCompleted,
} from "../services/routineExerciseCompletionsService.js";

import { LinkButton, Button } from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import {
  Page,
  PageHeader,
  PageTitle,
  PageSubtitle,
} from "../components/ui/Page.jsx";
import { FormStack, Field, Input } from "../components/ui/Form.jsx";

import CardHeader from "../components/ui/CardHeader.jsx";
import LoadingState from "../components/ui/LoadingState.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";

import { confirmDelete } from "../utils/confirm.js";
import { getTodayDateString } from "../utils/dates.js";

/**
 * Pantalla de detalle de una rutina.
 * Permite gestionar la lista de ejercicios asociados a esa rutina.
 * [ROUTINES-01] Lista de ejercicios de la rutina.
 */
function RoutineDetailPage() {
  const { routineId } = useParams();
  const location = useLocation();
  const { user } = useAuth();

  // Nombre de la rutina (lo recibimos vía state desde la lista de rutinas).
  const [routineName] = useState(location.state?.routineName || "");

  // Lista de ejercicios de esta rutina.
  const [exercises, setExercises] = useState([]);

  // Fecha seleccionada para marcar completados.
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());

  // IDs de ejercicios completados para la rutina y fecha seleccionadas.
  const [completedIds, setCompletedIds] = useState([]);

  // Formulario de creación.
  const [name, setName] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");

  // Formulario de edición.
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editSets, setEditSets] = useState("");
  const [editReps, setEditReps] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  /**
   * Carga los ejercicios de la rutina al entrar en la página.
   */
  useEffect(() => {
    if (!user) return;

    async function loadExercises() {
      try {
        setLoading(true);
        setErrorMessage("");

        const exercisesFromDb = await getExercisesByRoutine({
          routineId,
          userId: user.uid,
        });

        setExercises(exercisesFromDb);
      } catch (error) {
        console.error("Error al cargar ejercicios:", error);
        setErrorMessage("No se han podido cargar los ejercicios.");
      } finally {
        setLoading(false);
      }
    }

    loadExercises();
  }, [user, routineId]);

  /**
   * Carga qué ejercicios están completados para la rutina y fecha actuales.
   * [ROUTINES-03] Consultar ejercicios completados por fecha.
   */
  useEffect(() => {
    if (!user) return;

    async function loadCompleted() {
      try {
        const ids = await getCompletedExerciseIds({
          userId: user.uid,
          routineId,
          date: selectedDate,
        });
        setCompletedIds(ids);
      } catch (error) {
        console.error("Error al cargar ejercicios completados:", error);
      }
    }

    loadCompleted();
  }, [user, routineId, selectedDate]);

  /**
   * Marca o desmarca un ejercicio como completado para la fecha seleccionada.
   * [ROUTINES-03]
   */
  async function handleToggleCompleted(exerciseId, isCompleted) {
    try {
      await setExerciseCompleted({
        userId: user.uid,
        routineId,
        exerciseId,
        date: selectedDate,
        completed: isCompleted,
      });

      setCompletedIds((prev) =>
        isCompleted
          ? [...new Set([...prev, exerciseId])]
          : prev.filter((id) => id !== exerciseId),
      );
    } catch (error) {
      console.error("Error al actualizar completado:", error);
    }
  }

  /**
   * Maneja el envío del formulario de creación de ejercicio.
   */
  async function handleCreateExercise(event) {
    event.preventDefault();

    if (!name.trim()) {
      setErrorMessage("El nombre del ejercicio es obligatorio.");
      return;
    }

    const parsedSets = sets.trim() === "" ? null : Number(sets);
    const parsedReps = reps.trim() === "" ? null : Number(reps);

    if (parsedSets !== null && Number.isNaN(parsedSets)) {
      setErrorMessage("Las series deben ser un número.");
      return;
    }

    if (parsedReps !== null && Number.isNaN(parsedReps)) {
      setErrorMessage("Las repeticiones deben ser un número.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const newExercise = await createExercise({
        userId: user.uid,
        routineId,
        name: name.trim(),
        sets: parsedSets,
        reps: parsedReps,
      });

      setExercises((prev) => [newExercise, ...prev]);

      setName("");
      setSets("");
      setReps("");
    } catch (error) {
      console.error("Error al crear ejercicio:", error);
      setErrorMessage("No se ha podido crear el ejercicio.");
    } finally {
      setLoading(false);
    }
  }

  /**
   * Inicia la edición de un ejercicio concreto.
   */
  function startEditExercise(exercise) {
    setEditingId(exercise.id);
    setEditName(exercise.name || "");
    setEditSets(
      exercise.sets !== null && exercise.sets !== undefined
        ? String(exercise.sets)
        : "",
    );
    setEditReps(
      exercise.reps !== null && exercise.reps !== undefined
        ? String(exercise.reps)
        : "",
    );
    setErrorMessage("");
  }

  /**
   * Cancela la edición.
   */
  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditSets("");
    setEditReps("");
  }

  /**
   * Maneja el envío del formulario de edición de ejercicio.
   */
  async function handleUpdateExercise(event) {
    event.preventDefault();

    if (!editName.trim()) {
      setErrorMessage("El nombre del ejercicio es obligatorio.");
      return;
    }

    const parsedSets = editSets.trim() === "" ? null : Number(editSets);
    const parsedReps = editReps.trim() === "" ? null : Number(editReps);

    if (parsedSets !== null && Number.isNaN(parsedSets)) {
      setErrorMessage("Las series deben ser un número.");
      return;
    }

    if (parsedReps !== null && Number.isNaN(parsedReps)) {
      setErrorMessage("Las repeticiones deben ser un número.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      await updateExercise(editingId, {
        name: editName.trim(),
        sets: parsedSets,
        reps: parsedReps,
      });

      setExercises((prev) =>
        prev.map((exercise) =>
          exercise.id === editingId
            ? {
                ...exercise,
                name: editName.trim(),
                sets: parsedSets,
                reps: parsedReps,
              }
            : exercise,
        ),
      );

      cancelEdit();
    } catch (error) {
      console.error("Error al actualizar ejercicio:", error);
      setErrorMessage("No se ha podido actualizar el ejercicio.");
    } finally {
      setLoading(false);
    }
  }

  /**
   * Elimina un ejercicio después de confirmar.
   */
  async function handleDeleteExercise(id) {
    const ok = confirmDelete("¿Seguro que quieres eliminar este ejercicio?");
    if (!ok) return;

    try {
      setLoading(true);
      setErrorMessage("");

      await deleteExercise(id);

      setExercises((prev) => prev.filter((exercise) => exercise.id !== id));

      if (editingId === id) {
        cancelEdit();
      }
    } catch (error) {
      console.error("Error al eliminar ejercicio:", error);
      setErrorMessage("No se ha podido eliminar el ejercicio.");
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <Page>
        <PageTitle>Detalle de rutina</PageTitle>
        <p>Inicia sesión para ver tu información.</p>
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader>
        <LinkButton to="/rutinas" variant="secondary" size="sm">
          ← Volver a mis rutinas
        </LinkButton>

        <PageTitle>Ejercicios de la rutina</PageTitle>
        {routineName && <PageSubtitle strong>{routineName}</PageSubtitle>}

        {errorMessage && <p className="text-error">{errorMessage}</p>}
      </PageHeader>

      {/* Layout en dos columnas [UI-02] */}
      <div className="routine-detail-layout">
        {/* Columna izquierda */}
        <div className="stack-16">
          <Card>
            <Field label="Fecha de la sesión">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </Field>
          </Card>

          <Card>
            <CardHeader title="Añadir ejercicio" size="sm" />
            <form onSubmit={handleCreateExercise}>
              <FormStack compact>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Sentadillas"
                  required
                />
                <Input
                  type="number"
                  value={sets}
                  onChange={(e) => setSets(e.target.value)}
                  placeholder="Series"
                />
                <Input
                  type="number"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  placeholder="Repeticiones"
                />
                <Button type="submit" disabled={loading} block>
                  {loading ? "Guardando..." : "Guardar ejercicio"}
                </Button>
              </FormStack>
            </form>
          </Card>

          {/* Formulario de edición de ejercicio */}
          {editingId && (
            <Card>
              <CardHeader title="Editar ejercicio" size="sm" />
              <form onSubmit={handleUpdateExercise}>
                <FormStack compact>
                  <Input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                  <Input
                    type="number"
                    value={editSets}
                    onChange={(e) => setEditSets(e.target.value)}
                    placeholder="Series"
                  />
                  <Input
                    type="number"
                    value={editReps}
                    onChange={(e) => setEditReps(e.target.value)}
                    placeholder="Repeticiones"
                  />

                  <div className="actions-row-tight">
                    <Button type="submit" disabled={loading}>
                      {loading ? "Guardando..." : "Guardar cambios"}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={cancelEdit}
                    >
                      Cancelar
                    </Button>
                  </div>
                </FormStack>
              </form>
            </Card>
          )}
        </div>

        {/* Columna derecha */}
        <div className="stack-16">
          <Card>
            <CardHeader title="Ejercicios de esta rutina" size="sm" />

            {loading && exercises.length === 0 && (
              <LoadingState text="Cargando ejercicios..." />
            )}

            {!loading && exercises.length === 0 && (
              <EmptyState text="Esta rutina todavía no tiene ejercicios." />
            )}

            <ul className="list-clean">
              {exercises.map((exercise) => {
                const isCompleted = completedIds.includes(exercise.id);

                return (
                  <li key={exercise.id} className="exercise-row">
                    <label className="exercise-check">
                      <input
                        type="checkbox"
                        checked={isCompleted}
                        onChange={(e) =>
                          handleToggleCompleted(exercise.id, e.target.checked)
                        }
                      />
                      <span>
                        <strong>{exercise.name}</strong>{" "}
                        {exercise.sets ? `${exercise.sets} series` : ""}{" "}
                        {exercise.reps ? `x ${exercise.reps}` : ""}
                      </span>
                    </label>

                    <div className="actions-row-tight">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => startEditExercise(exercise)}
                      >
                        Editar
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="danger"
                        onClick={() => handleDeleteExercise(exercise.id)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>
      </div>
    </Page>
  );
}

export default RoutineDetailPage;
