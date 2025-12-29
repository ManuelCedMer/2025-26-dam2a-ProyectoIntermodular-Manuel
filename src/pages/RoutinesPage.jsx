import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import {
  getRoutinesByUser,
  createRoutine,
  updateRoutine,
  deleteRoutine,
} from "../services/routinesService";

/**
 * Pantalla de gestión de rutinas [ROUTINES].
 * En este bloque:
 *  - Listo las rutinas del usuario [ROUTINES-04].
 *  - Permito crear rutinas nuevas con nombre y días [ROUTINES-01].
 * - Permito editar y eliminar rutinas [ROUTINES-02].
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

  /**
   * Carga las rutinas del usuario actual al entrar en la página
   * o cuando cambie el usuario.
   */
  useEffect(() => {
    // Si aún no tenemos usuario (por algún motivo), no hago nada.
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
      // Si el día ya estaba seleccionado, lo quito.
      setDaysOfWeek(daysOfWeek.filter((d) => d !== day));
    } else {
      // Si no estaba, lo añado.
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

      // Actualizo la lista en memoria añadiendo la nueva rutina.
      setRoutines((prev) => [newRoutine, ...prev]);

      // Reseteo el formulario.
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
   * Rellena el formulario de edición con los datos actuales.
   */
  function startEditRoutine(routine) {
    setEditingId(routine.id);
    setEditName(routine.name || "");
    setEditDaysOfWeek(routine.daysOfWeek || []);
    setErrorMessage("");
  }

  /**
   * Cancela la edición y limpia el formulario de edición.
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
   * [ROUTINES-02] Editar rutina.
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

      // Actualizamos la rutina en el estado local.
      setRoutines((prev) =>
        prev.map((routine) =>
          routine.id === editingId
            ? { ...routine, name: editName.trim(), daysOfWeek: editDaysOfWeek }
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
   * [ROUTINES-02] Eliminar rutina.
   */
  async function handleDeleteRoutine(id) {
    const confirmDelete = window.confirm(
      "¿Seguro que quieres eliminar esta rutina?",
    );
    if (!confirmDelete) {
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      await deleteRoutine(id);

      // Quitamos la rutina de la lista local.
      setRoutines((prev) => prev.filter((routine) => routine.id !== id));

      // Si estábamos editando esta rutina, salimos del modo edición.
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
      <div>
        <h2>[ROUTINES] Gestión de rutinas</h2>
        <p>No hay usuario autenticado.</p>
      </div>
    );
  }


  return (
    <div>
      <h2>[ROUTINES] Gestión de rutinas</h2>

      {/* Formulario de creación de rutina */}
      <section>
        <h3>Crear nueva rutina</h3>

        <form onSubmit={handleCreateRoutine}>
          <div>
            <label>Nombre de la rutina</label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ej: Rutina fuerza 3 días"
              required
            />
          </div>

          <div>
            <p>Días de la semana</p>
            {availableDays.map((day) => (
              <label key={day} style={{ marginRight: "8px" }}>
                <input
                  type="checkbox"
                  checked={daysOfWeek.includes(day)}
                  onChange={() => handleDayChange(day)}
                />
                {day}
              </label>
            ))}
          </div>

          {errorMessage && <p>{errorMessage}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Guardar rutina"}
          </button>
        </form>
      </section>

      {/* Formulario de edición de rutina */}
      {editingId && (
        <section>
          <h3>Editar rutina</h3>

          <form onSubmit={handleUpdateRoutine}>
            <div>
              <label>Nombre de la rutina</label>
              <input
                type="text"
                value={editName}
                onChange={(event) => setEditName(event.target.value)}
                required
              />
            </div>

            <div>
              <p>Días de la semana</p>
              {availableDays.map((day) => (
                <label key={day} style={{ marginRight: "8px" }}>
                  <input
                    type="checkbox"
                    checked={editDaysOfWeek.includes(day)}
                    onChange={() => handleEditDayChange(day)}
                  />
                  {day}
                </label>
              ))}
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

      {/* Listado de rutinas del usuario */}
      <section>
        <h3>Mis rutinas</h3>

        {loading && routines.length === 0 && <p>Cargando rutinas...</p>}

        {!loading && routines.length === 0 && (
          <p>No tienes ninguna rutina creada todavía.</p>
        )}

        <ul>
          {routines.map((routine) => (
            <li key={routine.id}>
              <strong>{routine.name}</strong>{" "}
              <span>
                ({routine.daysOfWeek && routine.daysOfWeek.join(", ")})
              </span>{" "}
              <button type="button" onClick={() => startEditRoutine(routine)}>
                Editar
              </button>
              <button
                type="button"
                onClick={() => handleDeleteRoutine(routine.id)}
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

export default RoutinesPage;
