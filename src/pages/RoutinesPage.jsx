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
  // Controla la visibilidad del panel de nueva rutina
  const [showCreatePanel, setShowCreatePanel] = useState(false);
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
        <div className="dashboard-header">
          <div className="dashboard-header-titles">
            <PageTitle>Mis rutinas</PageTitle>
            <PageSubtitle>Historial {routines.length}</PageSubtitle>
          </div>
          <div className="dashboard-header-actions">
            <Button
              variant="secondary"
              onClick={() =>
                alert("Funcionalidad de plantillas no implementada")
              }
            >
              Plantillas
            </Button>
            <Button onClick={() => setShowCreatePanel((v) => !v)}>
              + Nueva
            </Button>
          </div>
        </div>
      </PageHeader>

      {showCreatePanel && (
        <Card className="dashboard-panel card-relative">
          <div className="cardheader-x-row">
            <CardHeader title="Nueva rutina" />
            <button
              type="button"
              className="close-panel-btn"
              aria-label="Cerrar"
              onClick={() => {
                setShowCreatePanel(false);
                setName("");
                setDaysOfWeek([]);
                setErrorMessage("");
              }}
            >
              ×
            </button>
          </div>
          <form onSubmit={handleCreateRoutine}>
            <FormStack>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre de la rutina"
                required
              />
              <ChipSelector
                label="Días"
                options={Object.keys(dayLabels)}
                value={daysOfWeek}
                onToggle={(opt) => {
                  setDaysOfWeek((prev) =>
                    prev.includes(opt)
                      ? prev.filter((d) => d !== opt)
                      : [...prev, opt],
                  );
                }}
                getLabel={(opt) => dayLabels[opt]}
                multiple
              />
              {errorMessage && <Alert variant="error">{errorMessage}</Alert>}
              <Button type="submit" disabled={loading}>
                {loading ? "Guardando..." : "Crear rutina"}
              </Button>
            </FormStack>
          </form>
        </Card>
      )}

      <div className="dashboard-list">
        {loading && <LoadingState text="Cargando rutinas..." />}
        {!loading && routines.length === 0 && (
          <EmptyState text="No tienes rutinas aún." />
        )}
        {routines.map((routine) =>
          editingId === routine.id ? (
            <Card key={routine.id} className="dashboard-tile editing">
              <CardHeader title="Editar rutina" />
              <form onSubmit={handleUpdateRoutine}>
                <FormStack>
                  <Input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                  <ChipSelector
                    label="Días"
                    options={Object.keys(dayLabels)}
                    value={editDaysOfWeek}
                    onToggle={(opt) => {
                      setEditDaysOfWeek((prev) =>
                        prev.includes(opt)
                          ? prev.filter((d) => d !== opt)
                          : [...prev, opt],
                      );
                    }}
                    getLabel={(opt) => dayLabels[opt]}
                    multiple
                  />
                  {errorMessage && (
                    <Alert variant="error">{errorMessage}</Alert>
                  )}
                  <div className="dashboard-tile-actions">
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
          ) : (
            <Card key={routine.id} className="dashboard-tile rutina-card">
              <Button
                type="button"
                size="sm"
                variant="danger"
                className="rutina-delete-btn"
                onClick={() => handleDeleteRoutine(routine.id)}
              >
                Eliminar
              </Button>
              <div className="dashboard-tile-main">
                <div>
                  <h3 className="dashboard-tile-title">{routine.name}</h3>
                  <div className="dashboard-tile-meta">
                    {routine.daysOfWeek && routine.daysOfWeek.length > 0
                      ? routine.daysOfWeek.map((d) => dayLabels[d]).join(", ")
                      : "Sin días"}
                  </div>
                </div>
              </div>
              <div className="dashboard-tile-actions rutina-actions-bottom">
                <LinkButton
                  to={`/rutinas/${routine.id}`}
                  size="sm"
                  variant="primary"
                >
                  Ver ejercicios
                </LinkButton>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => startEditRoutine(routine)}
                >
                  Editar
                </Button>
              </div>
            </Card>
          ),
        )}
      </div>
    </Page>
  );
}

export default RoutinesPage;
