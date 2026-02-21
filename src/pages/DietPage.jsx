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
      <div className="page-container">
        <h2>Planes de alimentación</h2>
        <p>Inicia sesión para ver tu información.</p>
      </div>
    );
  }

  return (
    <main className="page-container">
      {/* Cabecera de la pantalla */}
      <header className="page-header">
        <h2 className="page-title">Planes de alimentación</h2>
        <p className="page-subtitle">
          Crea y gestiona tus planes de alimentación semanales. Más adelante,
          desde cada plan, podrás definir las comidas por día y estimar
          calorías.
        </p>

        {errorMessage && <p className="text-error">{errorMessage}</p>}
      </header>

      {/* Contenedor principal en dos columnas */}
      <div className="diet-layout">
        {/* Columna izquierda: creación y edición */}
        <div className="stack-16">
          {/* Formulario de creación de plan */}
          <section className="card">
            <h3 className="section-title">Crear nuevo plan de alimentación</h3>
            <p className="text-muted">
              Define un nombre y una breve descripción del plan (por ejemplo
              “Dieta semanal equilibrio 2000 kcal”).
            </p>

            <form onSubmit={handleCreateDiet} className="form-stack form-mt">
              <div>
                <label className="label">Nombre del plan</label>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Ej: Dieta semanal definición"
                  required
                  className="input"
                />
              </div>

              <div>
                <label className="label">Descripción (opcional)</label>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Ej: Plan de 5 comidas diarias bajo en grasas..."
                  className="textarea"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-block"
              >
                {loading ? "Guardando..." : "Guardar plan"}
              </button>
            </form>
          </section>

          {/* Formulario de edición de plan */}
          {editingId && (
            <section className="card">
              <h3 className="section-title">Editar plan de alimentación</h3>
              <p className="text-muted">
                Modifica el nombre o la descripción del plan seleccionado.
              </p>

              <form onSubmit={handleUpdateDiet} className="form-stack form-mt">
                <div>
                  <label className="label">Nombre del plan</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(event) => setEditName(event.target.value)}
                    required
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Descripción (opcional)</label>
                  <textarea
                    value={editDescription}
                    onChange={(event) => setEditDescription(event.target.value)}
                    className="textarea"
                  />
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

        {/* Columna derecha: listado de planes */}
        <div className="stack-16">
          <section className="card">
            <h3 className="section-title">Mis planes de alimentación</h3>
            <p className="text-muted">
              Desde aquí puedes editar o eliminar tus planes y acceder al
              detalle de comidas de cada uno.
            </p>

            {loading && diets.length === 0 && (
              <p className="block-mt">Cargando planes...</p>
            )}

            {!loading && diets.length === 0 && (
              <p className="block-mt">
                No tienes ningún plan de alimentación creado todavía.
              </p>
            )}

            {diets.length > 0 && (
              <ul className="list-stack block-mt">
                {diets.map((diet) => (
                  <li key={diet.id} className="list-card">
                    <div>
                      <strong>{diet.name}</strong>{" "}
                      {diet.description && (
                        <span className="text-muted"> — {diet.description}</span>
                      )}
                    </div>

                    <div className="actions-row-wrap">
                      <button
                        type="button"
                        onClick={() => startEditDiet(diet)}
                        className="btn btn-secondary btn-sm"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteDiet(diet.id)}
                        className="btn btn-danger btn-sm"
                      >
                        Eliminar
                      </button>
                      <Link
                        to={`/dietas/${diet.id}`}
                        state={{ dietName: diet.name }}
                        className="btn btn-secondary btn-sm link-btn"
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