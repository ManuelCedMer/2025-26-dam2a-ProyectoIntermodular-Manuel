import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import {
  getDietsByUser,
  createDiet,
  updateDiet,
  deleteDiet,
} from "../services/dietService.js";
import { Link } from "react-router-dom";

/**
 * Pantalla de gestión de planes de alimentación [DIET].
 *
 * En esta versión con [UI-02]:
 *  - Se organiza el contenido en una cuadrícula responsive.
 *  - Los formularios se muestran en tarjetas a la izquierda.
 *  - El listado de planes aparece en una tarjeta a la derecha en escritorio
 *    y debajo en móvil.
 */
function DietPage() {
  const { user } = useAuth();

  // Lista de planes de alimentación del usuario.
  const [diets, setDiets] = useState([]);

  // Formulario de creación.
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Formulario de edición.
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  /**
   * Estilos inline básicos para maquetar la página.
   * Se sigue el mismo enfoque que en HOME, RECIPES y PROGRESS.
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

  const textareaStyles = {
    width: "100%",
    padding: "8px 10px",
    minHeight: "80px",
    borderRadius: "8px",
    border: "1px solid var(--input-border, #d1d5db)",
    fontSize: "14px",
    resize: "vertical",
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
   * Carga los planes de alimentación del usuario al entrar en la página.
   * [DIET-01] Listar planes de alimentación.
   */
  useEffect(() => {
    if (!user) return;

    async function loadDiets() {
      try {
        setLoading(true);
        setErrorMessage("");

        const dietsFromDb = await getDietsByUser(user.uid);
        setDiets(dietsFromDb);
      } catch (error) {
        console.error("Error al cargar dietas:", error);
        setErrorMessage("No se han podido cargar los planes de alimentación.");
      } finally {
        setLoading(false);
      }
    }

    loadDiets();
  }, [user]);

  /**
   * Maneja el envío del formulario de creación de plan.
   * [DIET-01] Crear plan de alimentación.
   */
  async function handleCreateDiet(event) {
    event.preventDefault();

    if (!name.trim()) {
      setErrorMessage("El nombre del plan de alimentación es obligatorio.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const newDiet = await createDiet({
        userId: user.uid,
        name: name.trim(),
        description: description.trim(),
      });

      // Actualizamos la lista local añadiendo el nuevo plan.
      setDiets((prev) => [newDiet, ...prev]);

      // Limpiamos el formulario.
      setName("");
      setDescription("");
    } catch (error) {
      console.error("Error al crear plan:", error);
      setErrorMessage("No se ha podido crear el plan de alimentación.");
    } finally {
      setLoading(false);
    }
  }

  /**
   * Inicia la edición de un plan asignando sus datos al formulario de edición.
   */
  function startEditDiet(diet) {
    setEditingId(diet.id);
    setEditName(diet.name || "");
    setEditDescription(diet.description || "");
    setErrorMessage("");
  }

  /**
   * Cancela el modo de edición y limpia los campos de edición.
   */
  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditDescription("");
  }

  /**
   * Maneja el envío del formulario de edición de un plan.
   * [DIET-02] Editar plan de alimentación.
   */
  async function handleUpdateDiet(event) {
    event.preventDefault();

    if (!editName.trim()) {
      setErrorMessage("El nombre del plan de alimentación es obligatorio.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      await updateDiet(editingId, {
        name: editName.trim(),
        description: editDescription.trim(),
      });

      // Actualizamos el plan en el estado local.
      setDiets((prev) =>
        prev.map((diet) =>
          diet.id === editingId
            ? {
                ...diet,
                name: editName.trim(),
                description: editDescription.trim(),
              }
            : diet,
        ),
      );

      cancelEdit();
    } catch (error) {
      console.error("Error al actualizar plan:", error);
      setErrorMessage("No se ha podido actualizar el plan de alimentación.");
    } finally {
      setLoading(false);
    }
  }

  /**
   * Elimina un plan de alimentación después de confirmarlo.
   * [DIET-02] Eliminar plan de alimentación.
   */
  async function handleDeleteDiet(id) {
    const confirmDelete = window.confirm(
      "¿Seguro que quieres eliminar este plan de alimentación?",
    );
    if (!confirmDelete) return;

    try {
      setLoading(true);
      setErrorMessage("");

      await deleteDiet(id);

      // Quitamos el plan de la lista local.
      setDiets((prev) => prev.filter((diet) => diet.id !== id));

      // Si estábamos editando este plan, salimos del modo edición.
      if (editingId === id) {
        cancelEdit();
      }
    } catch (error) {
      console.error("Error al eliminar plan:", error);
      setErrorMessage("No se ha podido eliminar el plan de alimentación.");
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <div style={pageStyles}>
        <h2>[DIET] Planes de alimentación</h2>
        <p>No hay usuario autenticado.</p>
      </div>
    );
  }

  return (
    <main style={pageStyles}>
      {/* Cabecera de la pantalla */}
      <header style={{ marginBottom: "20px" }}>
        <h2
          style={{
            fontSize: "24px",
            fontWeight: "700",
            marginBottom: "4px",
            color: "var(--text, #111827)",
          }}
        >
          [DIET] Planes de alimentación
        </h2>
        <p style={smallTextStyles}>
          Crea y gestiona tus planes de alimentación semanales. Más adelante,
          desde cada plan, podrás definir las comidas por día y estimar
          calorías.
        </p>

        {errorMessage && (
          <p style={{ marginTop: "8px", color: "#b91c1c" }}>{errorMessage}</p>
        )}
      </header>

      {/* Contenedor principal en dos columnas */}
      <div className="diet-layout">
        {/* Columna izquierda: creación y edición */}
        <div style={columnStyle}>
          {/* Formulario de creación de plan */}
          <section style={cardStyles}>
            <h3 style={sectionTitleStyles}>Crear nuevo plan de alimentación</h3>
            <p style={smallTextStyles}>
              Define un nombre y una breve descripción del plan (por ejemplo
              “Dieta semanal equilibrio 2000 kcal”).
            </p>

            <form
              onSubmit={handleCreateDiet}
              style={{
                marginTop: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div>
                <label style={labelStyles}>Nombre del plan</label>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Ej: Dieta semanal definición"
                  required
                  style={inputStyles}
                />
              </div>

              <div>
                <label style={labelStyles}>Descripción (opcional)</label>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Ej: Plan de 5 comidas diarias bajo en grasas..."
                  style={textareaStyles}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={primaryButtonStyles}
              >
                {loading ? "Guardando..." : "Guardar plan"}
              </button>
            </form>
          </section>

          {/* Formulario de edición de plan */}
          {editingId && (
            <section style={cardStyles}>
              <h3 style={sectionTitleStyles}>Editar plan de alimentación</h3>
              <p style={smallTextStyles}>
                Modifica el nombre o la descripción del plan seleccionado.
              </p>

              <form
                onSubmit={handleUpdateDiet}
                style={{
                  marginTop: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div>
                  <label style={labelStyles}>Nombre del plan</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(event) => setEditName(event.target.value)}
                    required
                    style={inputStyles}
                  />
                </div>

                <div>
                  <label style={labelStyles}>Descripción (opcional)</label>
                  <textarea
                    value={editDescription}
                    onChange={(event) =>
                      setEditDescription(event.target.value)
                    }
                    style={textareaStyles}
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

        {/* Columna derecha: listado de planes */}
        <div style={columnStyle}>
          <section style={cardStyles}>
            <h3 style={sectionTitleStyles}>Mis planes de alimentación</h3>
            <p style={smallTextStyles}>
              Desde aquí puedes editar o eliminar tus planes y acceder al
              detalle de comidas de cada uno.
            </p>

            {loading && diets.length === 0 && (
              <p style={{ marginTop: "12px" }}>Cargando planes...</p>
            )}

            {!loading && diets.length === 0 && (
              <p style={{ marginTop: "12px" }}>
                No tienes ningún plan de alimentación creado todavía.
              </p>
            )}

            {diets.length > 0 && (
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
                {diets.map((diet) => (
                  <li
                    key={diet.id}
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
                    <div>
                      <strong>{diet.name}</strong>{" "}
                      {diet.description && (
                        <span style={smallTextStyles}> — {diet.description}</span>
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
                        onClick={() => startEditDiet(diet)}
                        style={ghostButtonStyles}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteDiet(diet.id)}
                        style={dangerButtonStyles}
                      >
                        Eliminar
                      </button>
                      <Link
                        to={`/dietas/${diet.id}`}
                        state={{ dietName: diet.name }}
                        style={{
                          ...ghostButtonStyles,
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        Ver comidas
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

export default DietPage;
