import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
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

// Devuelve la fecha de hoy en formato YYYY-MM-DD para usar en <input type="date" />.
function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

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

  /* =========================
     Estilos UI-02 (tarjetas)
     ========================= */
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
      <div style={pageStyles}>
        <h2>Detalle de rutina</h2>
        <p>Inicia sesión para ver tu información.</p>
      </div>
    );
  }

  return (
    <main style={pageStyles}>
      <header style={{ marginBottom: "20px" }}>
        <Link to="/rutinas">← Volver a mis rutinas</Link>
        <h2>Ejercicios de la rutina</h2>
        {routineName && <h3>{routineName}</h3>}
        {errorMessage && <p style={{ color: "#b91c1c" }}>{errorMessage}</p>}
      </header>

      {/* Layout en dos columnas [UI-02] */}
      <div className="routine-detail-layout">
        {/* Columna izquierda */}
        <div style={columnStyle}>
          <section style={cardStyles}>
            <label style={labelStyles}>Fecha de la sesión</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={inputStyles}
            />
          </section>

          <section style={cardStyles}>
            <h4>Añadir ejercicio</h4>
            <form
              onSubmit={handleCreateExercise}
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Sentadillas"
                required
                style={inputStyles}
              />
              <input
                type="number"
                value={sets}
                onChange={(e) => setSets(e.target.value)}
                placeholder="Series"
                style={inputStyles}
              />
              <input
                type="number"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                placeholder="Repeticiones"
                style={inputStyles}
              />
              <button
                type="submit"
                disabled={loading}
                style={primaryButtonStyles}
              >
                {loading ? "Guardando..." : "Guardar ejercicio"}
              </button>
            </form>
          </section>

          {/* Formulario de edición de ejercicio */}
          {editingId && (
            <section style={cardStyles}>
              <h4>Editar ejercicio</h4>
              <form
                onSubmit={handleUpdateExercise}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  style={inputStyles}
                />
                <input
                  type="number"
                  value={editSets}
                  onChange={(e) => setEditSets(e.target.value)}
                  placeholder="Series"
                  style={inputStyles}
                />
                <input
                  type="number"
                  value={editReps}
                  onChange={(e) => setEditReps(e.target.value)}
                  placeholder="Repeticiones"
                  style={inputStyles}
                />

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

        {/* Columna derecha */}
        <div style={columnStyle}>
          <section style={cardStyles}>
            <h4>Ejercicios de esta rutina</h4>

            {loading && exercises.length === 0 && <p>Cargando ejercicios...</p>}

            {!loading && exercises.length === 0 && (
              <p>Esta rutina todavía no tiene ejercicios.</p>
            )}

            <ul style={{ listStyle: "none", padding: 0 }}>
              {exercises.map((exercise) => {
                const isCompleted = completedIds.includes(exercise.id);

                return (
                  <li
                    key={exercise.id}
                    style={{
                      padding: "8px 0",
                      borderBottom: "1px solid var(--card-border, #e5e7eb)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <label>
                      <input
                        type="checkbox"
                        checked={isCompleted}
                        onChange={(e) =>
                          handleToggleCompleted(exercise.id, e.target.checked)
                        }
                      />{" "}
                      <strong>{exercise.name}</strong>{" "}
                      {exercise.sets ? `${exercise.sets} series` : ""}{" "}
                      {exercise.reps ? `x ${exercise.reps}` : ""}
                    </label>

                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        type="button"
                        onClick={() => startEditExercise(exercise)}
                        style={ghostButtonStyles}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteExercise(exercise.id)}
                        style={dangerButtonStyles}
                      >
                        Eliminar
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}

export default RoutineDetailPage;
