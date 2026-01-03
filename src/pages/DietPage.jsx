import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import {
  getDietsByUser,
  createDiet,
  updateDiet,
  deleteDiet,
} from "../services/dietService.js";

/**
 * Pantalla de gestión de planes de alimentación [DIET].
 * En este bloque:
 *  - Listo los planes del usuario [DIET-01].
 *  - Permito crear nuevos planes con nombre y descripción [DIET-01].
 *  - Permito editar y eliminar planes [DIET-02].
 *
 * Más adelante, en otro bloque, añadiremos:
 *  - Comidas por día (desglose detallado).
 *  - Estimación de calorías [DIET-03].
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
      <div>
        <h2>[DIET] Planes de alimentación</h2>
        <p>No hay usuario autenticado.</p>
      </div>
    );
  }

  return (
    <div>
      <h2>[DIET] Planes de alimentación</h2>

      {errorMessage && <p>{errorMessage}</p>}

      {/* Formulario de creación de plan */}
      <section>
        <h3>Crear nuevo plan de alimentación</h3>

        <form onSubmit={handleCreateDiet}>
          <div>
            <label>Nombre del plan</label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ej: Dieta semanal definición"
              required
            />
          </div>

          <div>
            <label>Descripción (opcional)</label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Ej: Plan de 5 comidas diarias bajo en grasas..."
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Guardar plan"}
          </button>
        </form>
      </section>

      {/* Formulario de edición de plan */}
      {editingId && (
        <section>
          <h3>Editar plan de alimentación</h3>

          <form onSubmit={handleUpdateDiet}>
            <div>
              <label>Nombre del plan</label>
              <input
                type="text"
                value={editName}
                onChange={(event) => setEditName(event.target.value)}
                required
              />
            </div>

            <div>
              <label>Descripción (opcional)</label>
              <textarea
                value={editDescription}
                onChange={(event) => setEditDescription(event.target.value)}
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

      {/* Listado de planes de alimentación del usuario */}
      <section>
        <h3>Mis planes de alimentación</h3>

        {loading && diets.length === 0 && <p>Cargando planes...</p>}

        {!loading && diets.length === 0 && (
          <p>No tienes ningún plan de alimentación creado todavía.</p>
        )}

        <ul>
          {diets.map((diet) => (
            <li key={diet.id}>
              <strong>{diet.name}</strong>{" "}
              {diet.description && (
                <span> - {diet.description}</span>
              )}{" "}
              <button type="button" onClick={() => startEditDiet(diet)}>
                Editar
              </button>
              <button
                type="button"
                onClick={() => handleDeleteDiet(diet.id)}
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

export default DietPage;
