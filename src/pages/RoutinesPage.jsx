import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import {
  getRoutinesByUser,
  createRoutine,
  updateRoutine,
  deleteRoutine,
} from "../services/routinesService";

import { LinkButton, Button } from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import {
  Page,
  PageHeader,
  PageTitle,
  PageSubtitle,
} from "../components/ui/Page.jsx";
import { FormStack, Field, Input } from "../components/ui/Form.jsx";

import Alert from "../components/ui/Alert.jsx";
import CardHeader from "../components/ui/CardHeader.jsx";
import ChipSelector from "../components/ui/ChipSelector.jsx";
import LoadingState from "../components/ui/LoadingState.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import EntityListItem from "../components/ui/EntityListItem.jsx";

import { confirmDelete } from "../utils/confirm.js";

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
   * o desmarca un checkbox (en este caso, chips).
   */
  function handleDayChange(day) {
    if (daysOfWeek.includes(day)) {
      setDaysOfWeek(daysOfWeek.filter((d) => d !== day));
    } else {
      setDaysOfWeek([...daysOfWeek, day]);
    }
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
    const ok = confirmDelete("¿Seguro que quieres eliminar esta rutina?");
    if (!ok) return;

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
      <Page>
        <PageTitle>Gestión de rutinas</PageTitle>
        <p>Inicia sesión para ver tu información.</p>
      </Page>
    );
  }

  return (
    <Page>
      {/* Cabecera */}
      <PageHeader>
        <PageTitle>Gestión de rutinas</PageTitle>
        <PageSubtitle>
          Crea tus rutinas de entrenamiento, asigna los días de la semana y
          accede al detalle para gestionar los ejercicios de cada una.
        </PageSubtitle>

        <Alert variant="error">{errorMessage}</Alert>
      </PageHeader>

      {/* Contenedor principal en dos columnas */}
      <div className="routines-layout">
        {/* Columna izquierda: creación y edición */}
        <div className="stack-16">
          {/* Creación */}
          <Card>
            <CardHeader
              title="Crear nueva rutina"
              subtitle="Define un nombre y selecciona los días en los que vas a realizar esta rutina."
            />

            <form onSubmit={handleCreateRoutine}>
              <FormStack>
                <Field label="Nombre de la rutina">
                  <Input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Ej: Fuerza torso 3 días"
                    required
                  />
                </Field>

                <ChipSelector
                  label="Días de la semana"
                  options={availableDays}
                  value={daysOfWeek}
                  onToggle={handleDayChange}
                  getLabel={(day) => dayLabels[day] || day}
                />

                <Button type="submit" disabled={loading} block>
                  {loading ? "Guardando..." : "Guardar rutina"}
                </Button>
              </FormStack>
            </form>
          </Card>

          {/* Edición */}
          {editingId && (
            <Card>
              <CardHeader
                title="Editar rutina"
                subtitle="Modifica el nombre o los días de la rutina seleccionada."
              />

              <form onSubmit={handleUpdateRoutine}>
                <FormStack>
                  <Field label="Nombre de la rutina">
                    <Input
                      type="text"
                      value={editName}
                      onChange={(event) => setEditName(event.target.value)}
                      required
                    />
                  </Field>

                  <ChipSelector
                    label="Días de la semana"
                    options={availableDays}
                    value={editDaysOfWeek}
                    onToggle={handleEditDayChange}
                    getLabel={(day) => dayLabels[day] || day}
                  />

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

        {/* Columna derecha: listado de rutinas */}
        <div className="stack-16">
          <Card>
            <CardHeader
              title="Mis rutinas"
              subtitle="Desde aquí puedes editar o eliminar tus rutinas y acceder a sus ejercicios."
            />

            {loading && routines.length === 0 && (
              <LoadingState className="block-mt" text="Cargando rutinas..." />
            )}

            {!loading && routines.length === 0 && (
              <EmptyState
                className="block-mt"
                text="No tienes ninguna rutina creada todavía."
              />
            )}

            {routines.length > 0 && (
              <ul className="list-stack block-mt">
                {routines.map((routine) => (
                  <EntityListItem
                    key={routine.id}
                    title={routine.name}
                    meta={
                      Array.isArray(routine.daysOfWeek) &&
                      routine.daysOfWeek.length > 0 ? (
                        <div className="text-muted">
                          {routine.daysOfWeek
                            .map((d) => dayLabels[d] || d)
                            .join(" · ")}
                        </div>
                      ) : null
                    }
                    actions={
                      <>
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => startEditRoutine(routine)}
                        >
                          Editar
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          variant="danger"
                          onClick={() => handleDeleteRoutine(routine.id)}
                        >
                          Eliminar
                        </Button>

                        <LinkButton
                          to={`/rutinas/${routine.id}`}
                          state={{ routineName: routine.name }}
                          size="sm"
                          variant="secondary"
                        >
                          Ver ejercicios
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

export default RoutinesPage;
