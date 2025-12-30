import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  getExercisesByRoutine,
  createExercise,
  updateExercise,
  deleteExercise,
} from "../services/routineExercisesService.js";

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
  const [routineName, setRoutineName] = useState(
    location.state?.routineName || "",
  );

  // Lista de ejercicios de esta rutina.
  const [exercises, setExercises] = useState([]);

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

      // Limpiar formulario.
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
    const confirmDelete = window.confirm(
      "¿Seguro que quieres eliminar este ejercicio?",
    );
    if (!confirmDelete) return;

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
      <div>
        <h2>[ROUTINES] Detalle de rutina</h2>
        <p>No hay usuario autenticado.</p>
      </div>
    );
  }

  return (
    <div>
      <h2>[ROUTINES] Ejercicios de la rutina</h2>

      {/* Enlace para volver a la lista de rutinas */}
      <p>
        <Link to="/rutinas">← Volver a mis rutinas</Link>
      </p>

      {/* Nombre de la rutina si lo tenemos disponible */}
      {routineName && <h3>{routineName}</h3>}

      {errorMessage && <p>{errorMessage}</p>}

      {/* Formulario de creación de ejercicio */}
      <section>
        <h4>Añadir ejercicio</h4>

        <form onSubmit={handleCreateExercise}>
          <div>
            <label>Nombre del ejercicio</label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ej: Sentadillas, Press banca..."
              required
            />
          </div>

          <div>
            <label>Series</label>
            <input
              type="number"
              value={sets}
              onChange={(event) => setSets(event.target.value)}
              min="0"
            />
          </div>

          <div>
            <label>Repeticiones</label>
            <input
              type="number"
              value={reps}
              onChange={(event) => setReps(event.target.value)}
              min="0"
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Guardar ejercicio"}
          </button>
        </form>
      </section>

      {/* Formulario de edición de ejercicio */}
      {editingId && (
        <section>
          <h4>Editar ejercicio</h4>

          <form onSubmit={handleUpdateExercise}>
            <div>
              <label>Nombre del ejercicio</label>
              <input
                type="text"
                value={editName}
                onChange={(event) => setEditName(event.target.value)}
                required
              />
            </div>

            <div>
              <label>Series</label>
              <input
                type="number"
                value={editSets}
                onChange={(event) => setEditSets(event.target.value)}
                min="0"
              />
            </div>

            <div>
              <label>Repeticiones</label>
              <input
                type="number"
                value={editReps}
                onChange={(event) => setEditReps(event.target.value)}
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

      {/* Listado de ejercicios */}
      <section>
        <h4>Ejercicios de esta rutina</h4>

        {loading && exercises.length === 0 && <p>Cargando ejercicios...</p>}

        {!loading && exercises.length === 0 && (
          <p>Esta rutina todavía no tiene ejercicios.</p>
        )}

        <ul>
          {exercises.map((exercise) => (
            <li key={exercise.id}>
              <strong>{exercise.name}</strong>{" "}
              {exercise.sets ? `${exercise.sets} series` : ""}{" "}
              {exercise.reps ? `x ${exercise.reps} repeticiones` : ""}
              {"  "}
              <button type="button" onClick={() => startEditExercise(exercise)}>
                Editar
              </button>
              <button
                type="button"
                onClick={() => handleDeleteExercise(exercise.id)}
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

export default RoutineDetailPage;
