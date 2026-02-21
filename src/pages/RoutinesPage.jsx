import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { Link } from "react-router-dom";
import {
  getRoutinesByUser,
  createRoutine,
  updateRoutine,
  deleteRoutine,
} from "../services/routinesService";

/**
 * Pantalla de gestión de rutinas [ROUTINES].
 * - Listar rutinas del usuario [ROUTINES-04].
 * - Crear rutinas nuevas con nombre y días [ROUTINES-01].
 * - Editar y eliminar rutinas [ROUTINES-02].
 */
function RoutinesPage() {
  const { user } = useAuth();

  // Lista de rutinas cargadas desde Firestore.
  const [routines, setRoutines] = useState([]);

  // Campos del formulario de creación.
  const [name, setName] = useState("");
  const [daysOfWeek, setDaysOfWeek] = useState([]);

  // Formulario de edición.
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDaysOfWeek, setEditDaysOfWeek] = useState([]);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Días disponibles para seleccionar en el formulario.
  const availableDays = ["L", "M", "X", "J", "V", "S", "D"];

  // Etiquetas legibles para mostrar en pantalla.
  const dayLabels = {
    L: "Lunes",
    M: "Martes",
    X: "Miércoles",
    J: "Jueves",
    V: "Viernes",
    S: "Sábado",
    D: "Domingo",
  };

  /**
   * Carga las rutinas del usuario actual al entrar en la página
   * o cuando cambie el usuario.
   */
  useEffect(() => {
    if (!user) return;

    async function loadRoutines() {
      try {
        setLoading(true);
        setErrorMessage("");
        const routinesFromDb = await getRoutinesByUser(user.uid);
        setRoutines(routinesFromDb);
      } catch (error) {
        console.error("Error al cargar rutinas:", error);
        setErrorMessage("No se han podido cargar las rutinas.");
      } finally {
        setLoading(false);
      }
    }

    loadRoutines();
  }, [user]);

  /**
   * Actualiza el array de días seleccionados cuando el usuario marca
   * o desmarca un checkbox.
   */
  function handleDayChange(day) {
    if (daysOfWeek.includes(day)) {
      setDaysOfWeek(daysOfWeek.filter((d) => d !== day));
    } else {
      setDaysOfWeek([...daysOfWeek, day]);
    }
  }

  /**
   * Maneja el envío del formulario de creación de rutina.
   * [ROUTINES-01]
   */
  async function handleCreateRoutine(event) {
    event.preventDefault();

    if (!name.trim()) {
      setErrorMessage("El nombre de la rutina es obligatorio.");
      return;
    }

    if (daysOfWeek.length === 0) {
      setErrorMessage("Selecciona al menos un día de la semana.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const newRoutine = await createRoutine({
        userId: user.uid,
        name: name.trim(),
        daysOfWeek,
      });

      setRoutines((prev) => [newRoutine, ...prev]);

      setName("");
      setDaysOfWeek([]);
    } catch (error) {
      console.error("Error al crear rutina:", error);
      setErrorMessage("No se ha podido crear la rutina.");
    } finally {
      setLoading(false);
    }
  }

  /**
   * Inicia la edición de una rutina.
   */
  function startEditRoutine(routine) {
    setEditingId(routine.id);
    setEditName(routine.name || "");
    setEditDaysOfWeek(routine.daysOfWeek || []);
    setErrorMessage("");
  }

  /**
   * Cancela la edición.
   */
  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditDaysOfWeek([]);
  }

  /**
   * Actualiza los días seleccionados en el formulario de edición.
   */
  function handleEditDayChange(day) {
    if (editDaysOfWeek.includes(day)) {
      setEditDaysOfWeek(editDaysOfWeek.filter((d) => d !== day));
    } else {
      setEditDaysOfWeek([...editDaysOfWeek, day]);
    }
  }

  /**
   * Maneja el envío del formulario de edición de rutina.
   * [ROUTINES-02]
   */
  async function handleUpdateRoutine(event) {
    event.preventDefault();

    if (!editName.trim()) {
      setErrorMessage("El nombre de la rutina es obligatorio.");
      return;
    }

    if (editDaysOfWeek.length === 0) {
      setErrorMessage("Selecciona al menos un día de la semana.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      await updateRoutine(editingId, {
        name: editName.trim(),
        daysOfWeek: editDaysOfWeek,
      });

      setRoutines((prev) =>
        prev.map((routine) =>
          routine.id === editingId
            ? {
                ...routine,
                name: editName.trim(),
                daysOfWeek: editDaysOfWeek,
              }
            : routine,
        ),
      );

      cancelEdit();
    } catch (error) {
      console.error("Error al actualizar rutina:", error);
      setErrorMessage("No se ha podido actualizar la rutina.");
    } finally {
      setLoading(false);
    }
  }

  /**
   * Elimina una rutina después de confirmarlo.
   * [ROUTINES-02]
   */
  async function handleDeleteRoutine(id) {
    const confirmDelete = window.confirm(
      "¿Seguro que quieres eliminar esta rutina?",
    );
    if (!confirmDelete) return;

    try {
      setLoading(true);
      setErrorMessage("");

      await deleteRoutine(id);

      setRoutines((prev) => prev.filter((routine) => routine.id !== id));

      if (editingId === id) {
        cancelEdit();
      }
    } catch (error) {
      console.error("Error al eliminar rutina:", error);
      setErrorMessage("No se ha podido eliminar la rutina.");
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="page-container">
        <h2>Gestión de rutinas</h2>
        <p>Inicia sesión para ver tu información.</p>
      </div>
    );
  }

  return (
    <main className="page-container">
      {/* Cabecera */}
      <header className="page-header">
        <h2 className="page-title">Gestión de rutinas</h2>
        <p className="page-subtitle">
          Crea tus rutinas de entrenamiento, asigna los días de la semana y
          accede al detalle para gestionar los ejercicios de cada una.
        </p>

        {errorMessage && <p className="text-error">{errorMessage}</p>}
      </header>

      {/* Contenedor principal en dos columnas */}
      <div className="routines-layout">
        {/* Columna izquierda: creación y edición */}
        <div className="stack-16">
          {/* Creación */}
          <section className="card">
            <h3 className="section-title">Crear nueva rutina</h3>
            <p className="text-muted">
              Define un nombre y selecciona los días en los que vas a realizar
              esta rutina.
            </p>

            <form onSubmit={handleCreateRoutine} className="form-stack form-mt">
              <div>
                <label className="label">Nombre de la rutina</label>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Ej: Fuerza torso 3 días"
                  required
                  className="input"
                />
              </div>

              <div>
                <label className="label">Días de la semana</label>
                <div className="chip-row">
                  {availableDays.map((day) => {
                    const selected = daysOfWeek.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleDayChange(day)}
                        className={"chip" + (selected ? " chip--active" : "")}
                      >
                        <span>{dayLabels[day] || day}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-block"
              >
                {loading ? "Guardando..." : "Guardar rutina"}
              </button>
            </form>
          </section>

          {/* Edición */}
          {editingId && (
            <section className="card">
              <h3 className="section-title">Editar rutina</h3>
              <p className="text-muted">
                Modifica el nombre o los días de la rutina seleccionada.
              </p>

              <form onSubmit={handleUpdateRoutine} className="form-stack form-mt">
                <div>
                  <label className="label">Nombre de la rutina</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(event) => setEditName(event.target.value)}
                    required
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Días de la semana</label>
                  <div className="chip-row">
                    {availableDays.map((day) => {
                      const selected = editDaysOfWeek.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => handleEditDayChange(day)}
                          className={"chip" + (selected ? " chip--active" : "")}
                        >
                          <span>{dayLabels[day] || day}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="actions-row">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary btn-block"
                  >
                    {loading ? "Guardando..." : "Guardar cambios"}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="btn btn-secondary"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </section>
          )}
        </div>

        {/* Columna derecha: listado de rutinas */}
        <div className="stack-16">
          <section className="card">
            <h3 className="section-title">Mis rutinas</h3>
            <p className="text-muted">
              Desde aquí puedes editar o eliminar tus rutinas y acceder a sus
              ejercicios.
            </p>

            {loading && routines.length === 0 && (
              <p className="block-mt">Cargando rutinas...</p>
            )}

            {!loading && routines.length === 0 && (
              <p className="block-mt">No tienes ninguna rutina creada todavía.</p>
            )}

            {routines.length > 0 && (
              <ul className="list-stack block-mt">
                {routines.map((routine) => (
                  <li key={routine.id} className="list-card">
                    <div className="list-card-head">
                      <div>
                        <strong>{routine.name}</strong>
                        {Array.isArray(routine.daysOfWeek) &&
                          routine.daysOfWeek.length > 0 && (
                            <div className="text-muted">
                              {routine.daysOfWeek
                                .map((d) => dayLabels[d] || d)
                                .join(" · ")}
                            </div>
                          )}
                      </div>
                    </div>

                    <div className="actions-row-wrap">
                      <button
                        type="button"
                        onClick={() => startEditRoutine(routine)}
                        className="btn btn-secondary btn-sm"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteRoutine(routine.id)}
                        className="btn btn-danger btn-sm"
                      >
                        Eliminar
                      </button>
                      <Link
                        to={`/rutinas/${routine.id}`}
                        state={{ routineName: routine.name }}
                        className="btn btn-secondary btn-sm link-btn"
                      >
                        Ver ejercicios
                      </Link>
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

export default RoutinesPage;