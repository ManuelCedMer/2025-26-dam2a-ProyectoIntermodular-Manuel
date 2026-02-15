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

  // Estilos básicos en línea con HOME / DIET / PROGRESS.
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

  const dayChipStyles = (selected) => ({
    padding: "4px 10px",
    borderRadius: "999px",
    border: selected ? "1px solid transparent" : "1px solid var(--card-border, #e5e7eb)",
    backgroundColor: selected ? "var(--primary, #2563eb)" : "var(--card-2, #f9fafb)",
    color: selected ? "#ffffff" : "var(--card-text, #374151)",
    fontSize: "13px",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
  });

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
      <div style={pageStyles}>
        <h2>Gestión de rutinas</h2>
        <p>Inicia sesión para ver tu información.</p>
      </div>
    );
  }

  return (
    <main style={pageStyles}>
      {/* Cabecera */}
      <header style={{ marginBottom: "20px" }}>
        <h2
          style={{
            fontSize: "24px",
            fontWeight: "700",
            marginBottom: "4px",
            color: "var(--text, #111827)",
          }}
        >
          Gestión de rutinas
        </h2>
        <p style={smallTextStyles}>
          Crea tus rutinas de entrenamiento, asigna los días de la semana y
          accede al detalle para gestionar los ejercicios de cada una.
        </p>

        {errorMessage && (
          <p style={{ marginTop: "8px", color: "#b91c1c" }}>{errorMessage}</p>
        )}
      </header>

      {/* Contenedor principal en dos columnas */}
      <div className="routines-layout">
        {/* Columna izquierda: creación y edición */}
        <div style={columnStyle}>
          {/* Creación */}
          <section style={cardStyles}>
            <h3 style={sectionTitleStyles}>Crear nueva rutina</h3>
            <p style={smallTextStyles}>
              Define un nombre y selecciona los días en los que vas a realizar
              esta rutina.
            </p>

            <form
              onSubmit={handleCreateRoutine}
              style={{
                marginTop: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div>
                <label style={labelStyles}>Nombre de la rutina</label>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Ej: Fuerza torso 3 días"
                  required
                  style={inputStyles}
                />
              </div>

              <div>
                <label style={labelStyles}>Días de la semana</label>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    marginTop: "4px",
                  }}
                >
                  {availableDays.map((day) => {
                    const selected = daysOfWeek.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleDayChange(day)}
                        style={dayChipStyles(selected)}
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
                style={primaryButtonStyles}
              >
                {loading ? "Guardando..." : "Guardar rutina"}
              </button>
            </form>
          </section>

          {/* Edición */}
          {editingId && (
            <section style={cardStyles}>
              <h3 style={sectionTitleStyles}>Editar rutina</h3>
              <p style={smallTextStyles}>
                Modifica el nombre o los días de la rutina seleccionada.
              </p>

              <form
                onSubmit={handleUpdateRoutine}
                style={{
                  marginTop: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div>
                  <label style={labelStyles}>Nombre de la rutina</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(event) => setEditName(event.target.value)}
                    required
                    style={inputStyles}
                  />
                </div>

                <div>
                  <label style={labelStyles}>Días de la semana</label>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                      marginTop: "4px",
                    }}
                  >
                    {availableDays.map((day) => {
                      const selected = editDaysOfWeek.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => handleEditDayChange(day)}
                          style={dayChipStyles(selected)}
                        >
                          <span>{dayLabels[day] || day}</span>
                        </button>
                      );
                    })}
                  </div>
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

        {/* Columna derecha: listado de rutinas */}
        <div style={columnStyle}>
          <section style={cardStyles}>
            <h3 style={sectionTitleStyles}>Mis rutinas</h3>
            <p style={smallTextStyles}>
              Desde aquí puedes editar o eliminar tus rutinas y acceder a sus
              ejercicios.
            </p>

            {loading && routines.length === 0 && (
              <p style={{ marginTop: "12px" }}>Cargando rutinas...</p>
            )}

            {!loading && routines.length === 0 && (
              <p style={{ marginTop: "12px" }}>
                No tienes ninguna rutina creada todavía.
              </p>
            )}

            {routines.length > 0 && (
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
                {routines.map((routine) => (
                  <li
                    key={routine.id}
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
                        <strong>{routine.name}</strong>
                        {Array.isArray(routine.daysOfWeek) &&
                          routine.daysOfWeek.length > 0 && (
                            <div style={smallTextStyles}>
                              {routine.daysOfWeek
                                .map((d) => dayLabels[d] || d)
                                .join(" · ")}
                            </div>
                          )}
                      </div>
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
                        onClick={() => startEditRoutine(routine)}
                        style={ghostButtonStyles}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteRoutine(routine.id)}
                        style={dangerButtonStyles}
                      >
                        Eliminar
                      </button>
                      <Link
                        to={`/rutinas/${routine.id}`}
                        state={{ routineName: routine.name }}
                        style={{
                          ...ghostButtonStyles,
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
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
