import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import {
  getDietsByUser,
  createDiet,
  updateDiet,
  deleteDiet,
} from "../services/dietService.js";

import { LinkButton, Button } from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import {
  Page,
  PageHeader,
  PageTitle,
  PageSubtitle,
} from "../components/ui/Page.jsx";
import { FormStack, Field, Input, Textarea } from "../components/ui/Form.jsx";

import Alert from "../components/ui/Alert.jsx";
import CardHeader from "../components/ui/CardHeader.jsx";
import LoadingState from "../components/ui/LoadingState.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import EntityListItem from "../components/ui/EntityListItem.jsx";

import { confirmDelete } from "../utils/confirm.js";

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
    const ok = confirmDelete(
      "¿Seguro que quieres eliminar este plan de alimentación?",
    );
    if (!ok) return;

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
      <Page>
        <PageTitle>Planes de alimentación</PageTitle>
        <p>Inicia sesión para ver tu información.</p>
      </Page>
    );
  }

  return (
    <Page>
      {/* Cabecera de la pantalla */}
      <PageHeader>
        <PageTitle>Planes de alimentación</PageTitle>
        <PageSubtitle>
          Crea y gestiona tus planes de alimentación semanales. Más adelante,
          desde cada plan, podrás definir las comidas por día y estimar
          calorías.
        </PageSubtitle>

        <Alert variant="error">{errorMessage}</Alert>
      </PageHeader>

      {/* Contenedor principal en dos columnas */}
      <div className="diet-layout">
        {/* Columna izquierda: creación y edición */}
        <div className="stack-16">
          {/* Formulario de creación de plan */}
          <Card>
            <CardHeader
              title="Crear nuevo plan de alimentación"
              subtitle="Define un nombre y una breve descripción del plan (por ejemplo “Dieta semanal equilibrio 2000 kcal”)."
            />

            <form onSubmit={handleCreateDiet}>
              <FormStack>
                <Field label="Nombre del plan">
                  <Input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Ej: Dieta semanal definición"
                    required
                  />
                </Field>

                <Field label="Descripción (opcional)">
                  <Textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Ej: Plan de 5 comidas diarias bajo en grasas..."
                  />
                </Field>

                <Button type="submit" disabled={loading} block>
                  {loading ? "Guardando..." : "Guardar plan"}
                </Button>
              </FormStack>
            </form>
          </Card>

          {/* Formulario de edición de plan */}
          {editingId && (
            <Card>
              <CardHeader
                title="Editar plan de alimentación"
                subtitle="Modifica el nombre o la descripción del plan seleccionado."
              />

              <form onSubmit={handleUpdateDiet}>
                <FormStack>
                  <Field label="Nombre del plan">
                    <Input
                      type="text"
                      value={editName}
                      onChange={(event) => setEditName(event.target.value)}
                      required
                    />
                  </Field>

                  <Field label="Descripción (opcional)">
                    <Textarea
                      value={editDescription}
                      onChange={(event) =>
                        setEditDescription(event.target.value)
                      }
                    />
                  </Field>

                  <div className="actions-row">
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

        {/* Columna derecha: listado de planes */}
        <div className="stack-16">
          <Card>
            <CardHeader
              title="Mis planes de alimentación"
              subtitle="Desde aquí puedes editar o eliminar tus planes y acceder al detalle de comidas de cada uno."
            />

            {loading && diets.length === 0 && (
              <LoadingState className="block-mt" text="Cargando planes..." />
            )}

            {!loading && diets.length === 0 && (
              <EmptyState
                className="block-mt"
                text="No tienes ningún plan de alimentación creado todavía."
              />
            )}

            {diets.length > 0 && (
              <ul className="list-stack block-mt">
                {diets.map((diet) => (
                  <EntityListItem
                    key={diet.id}
                    title={diet.name}
                    meta={
                      diet.description ? (
                        <span className="text-muted">
                          {" "}
                          — {diet.description}
                        </span>
                      ) : null
                    }
                    actions={
                      <>
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => startEditDiet(diet)}
                        >
                          Editar
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          variant="danger"
                          onClick={() => handleDeleteDiet(diet.id)}
                        >
                          Eliminar
                        </Button>

                        <LinkButton
                          size="sm"
                          variant="secondary"
                          to={`/dietas/${diet.id}`}
                          state={{ dietName: diet.name }}
                        >
                          Ver comidas
                        </LinkButton>
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

export default DietPage;
