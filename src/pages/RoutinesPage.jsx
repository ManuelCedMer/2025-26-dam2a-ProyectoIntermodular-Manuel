import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import {
  getRoutinesByUser,
  createRoutine,
  updateRoutine,
  deleteRoutine,
  createRoutineFromTemplate,
} from "../services/routinesService";
import { getRoutineTemplates } from "../services/routineTemplatesService";

import { LinkButton, Button } from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import {
  Page,
  PageHeader,
  PageTitle,
  PageSubtitle,
} from "../components/ui/Page.jsx";
import { FormStack, Input } from "../components/ui/Form.jsx";

import Alert from "../components/ui/Alert.jsx";
import CardHeader from "../components/ui/CardHeader.jsx";
import ChipSelector from "../components/ui/ChipSelector.jsx";
import LoadingState from "../components/ui/LoadingState.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";

import { confirmDelete } from "../utils/confirm.js";

const MUSCLE_IMAGES = {
  pierna: "/muscles/pierna.jpg",
  pecho: "/muscles/pecho.jpg",
  espalda: "/muscles/espalda.jpg",
  hombro: "/muscles/hombro.jpg",
  brazo: "/muscles/brazo.jpg",
  core: "/muscles/core.jpeg",
  fullbody: "/muscles/fullbody.jpg",
};

function RoutinesPage() {
  const { user } = useAuth();

  const [routines, setRoutines] = useState([]);
  const [name, setName] = useState("");
  const [daysOfWeek, setDaysOfWeek] = useState([]);
  const [muscleGroup, setMuscleGroup] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDaysOfWeek, setEditDaysOfWeek] = useState([]);

  const [loading, setLoading] = useState(false);
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Templates panel
  const [showTemplatesPanel, setShowTemplatesPanel] = useState(false);
  const [routineTemplates, setRoutineTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [templatesError, setTemplatesError] = useState("");
  const [templatesSuccess, setTemplatesSuccess] = useState("");
  const [creatingFromTemplateId, setCreatingFromTemplateId] = useState(null);

  const dayLabels = {
    L: "Lunes",
    M: "Martes",
    X: "Miércoles",
    J: "Jueves",
    V: "Viernes",
    S: "Sábado",
    D: "Domingo",
  };

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

  async function loadTemplates() {
    try {
      setTemplatesLoading(true);
      setTemplatesError("");
      const templatesFromDb = await getRoutineTemplates();
      setRoutineTemplates(templatesFromDb);
    } catch (error) {
      console.error("Error al cargar plantillas:", error);
      setTemplatesError("No se han podido cargar las plantillas.");
    } finally {
      setTemplatesLoading(false);
    }
  }

  function handleToggleTemplates() {
    const opening = !showTemplatesPanel;
    setShowTemplatesPanel(opening);
    if (opening && routineTemplates.length === 0 && !templatesLoading) {
      loadTemplates();
    }
  }

  function startEditRoutine(routine) {
    setEditingId(routine.id);
    setEditName(routine.name || "");
    setEditDaysOfWeek(routine.daysOfWeek || []);
    setErrorMessage("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditDaysOfWeek([]);
  }

  function resetCreatePanel() {
    setName("");
    setDaysOfWeek([]);
    setMuscleGroup("");
    setErrorMessage("");
  }

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

      const imageUrl = muscleGroup ? MUSCLE_IMAGES[muscleGroup] || null : null;

      const newRoutine = await createRoutine({
        userId: user.uid,
        name: name.trim(),
        daysOfWeek,
        muscleGroup: muscleGroup || null,
        imageUrl,
      });

      setRoutines((prev) => [newRoutine, ...prev]);
      resetCreatePanel();
      setShowCreatePanel(false);
    } catch (error) {
      console.error("Error al crear rutina:", error);
      setErrorMessage("No se ha podido crear la rutina.");
    } finally {
      setLoading(false);
    }
  }

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

  async function handleDeleteRoutine(id) {
    const ok = confirmDelete("¿Seguro que quieres eliminar esta rutina?");
    if (!ok) return;

    try {
      setLoading(true);
      setErrorMessage("");
      await deleteRoutine(id);
      setRoutines((prev) => prev.filter((routine) => routine.id !== id));
      if (editingId === id) cancelEdit();
    } catch (error) {
      console.error("Error al eliminar rutina:", error);
      setErrorMessage("No se ha podido eliminar la rutina.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Page>
      <PageHeader>
        <div className="dashboard-header">
          <div className="dashboard-header-titles">
            <PageTitle>Mis rutinas</PageTitle>
            <PageSubtitle>Historial {routines.length}</PageSubtitle>
          </div>
          <div className="dashboard-header-actions">
            <Button variant="secondary" onClick={handleToggleTemplates}>
              Plantillas
            </Button>
            <Button
              onClick={() => {
                setShowCreatePanel((v) => !v);
                if (showCreatePanel) {
                  resetCreatePanel();
                }
              }}
            >
              + Nueva
            </Button>
          </div>
        </div>
      </PageHeader>

      {showTemplatesPanel && (
        <Card className="dashboard-panel card-relative">
          <div className="cardheader-x-row">
            <CardHeader title="Plantillas de rutinas" />
            <button
              type="button"
              className="close-panel-btn"
              aria-label="Cerrar"
              onClick={() => setShowTemplatesPanel(false)}
            >
              ×
            </button>
          </div>

          {templatesLoading && <LoadingState text="Cargando plantillas..." />}
          {!templatesLoading && templatesError && (
            <Alert variant="error">{templatesError}</Alert>
          )}
          {!templatesLoading && templatesSuccess && (
            <Alert variant="success">{templatesSuccess}</Alert>
          )}
          {!templatesLoading &&
            !templatesError &&
            routineTemplates.length === 0 && (
              <EmptyState text="No hay plantillas disponibles." />
            )}

          {!templatesLoading && routineTemplates.length > 0 && (
            <div className="templates-list">
              {routineTemplates.map((t) => (
                <Card
                  key={t.id}
                  className="template-card template-card--summary"
                >
                  <div className="template-card-inner">
                    <div className="template-card-header">
                      <h4 className="template-title">{t.name}</h4>
                    </div>

                    <div className="template-card-meta">
                      <div className="meta-item">
                        <strong>Duración:</strong>{" "}
                        {t.estimatedDurationMinutes
                          ? `${t.estimatedDurationMinutes} min`
                          : "—"}
                      </div>
                      <div className="meta-item">
                        <strong>Ejercicios:</strong>{" "}
                        {Array.isArray(t.exercises) ? t.exercises.length : 0}
                      </div>
                    </div>

                    <div className="template-card-actions">
                      <LinkButton
                        to={`/rutinas/plantillas/${t.id}`}
                        size="sm"
                        variant="secondary"
                      >
                        Ver detalle
                      </LinkButton>

                      <Button
                        size="sm"
                        disabled={
                          creatingFromTemplateId &&
                          creatingFromTemplateId !== t.id
                        }
                        onClick={async () => {
                          if (!user) {
                            setTemplatesError(
                              "Inicia sesión para usar una plantilla.",
                            );
                            return;
                          }

                          try {
                            setTemplatesError("");
                            setTemplatesSuccess("");
                            setCreatingFromTemplateId(t.id);

                            const newRoutine = await createRoutineFromTemplate({
                              userId: user.uid,
                              template: t,
                            });

                            setRoutines((prev) => [newRoutine, ...prev]);
                            setTemplatesSuccess("Rutina creada correctamente.");
                          } catch (err) {
                            console.error(
                              "Error creando rutina desde plantilla:",
                              err,
                            );
                            setTemplatesError(
                              "No se pudo crear la rutina desde la plantilla.",
                            );
                          } finally {
                            setCreatingFromTemplateId(null);
                          }
                        }}
                      >
                        {creatingFromTemplateId === t.id
                          ? "Creando..."
                          : "Usar plantilla"}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      )}

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
                resetCreatePanel();
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

              <div className="recipes-filter-field routine-muscle-field">
                <label className="label">Grupo muscular</label>
                <select
                  className="input"
                  value={muscleGroup}
                  onChange={(e) => setMuscleGroup(e.target.value)}
                >
                  <option value="">Selecciona un grupo muscular</option>
                  <option value="pierna">Pierna</option>
                  <option value="pecho">Pecho</option>
                  <option value="espalda">Espalda</option>
                  <option value="hombro">Hombro</option>
                  <option value="brazo">Brazo</option>
                  <option value="core">Core</option>
                </select>
              </div>

              <ChipSelector
                label="Días"
                options={Object.keys(dayLabels)}
                value={daysOfWeek}
                onToggle={(opt) =>
                  setDaysOfWeek((prev) =>
                    prev.includes(opt)
                      ? prev.filter((d) => d !== opt)
                      : [...prev, opt],
                  )
                }
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
                    onToggle={(opt) =>
                      setEditDaysOfWeek((prev) =>
                        prev.includes(opt)
                          ? prev.filter((d) => d !== opt)
                          : [...prev, opt],
                      )
                    }
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
                <div className="rutina-media-row">
                  {routine.imageUrl && (
                    <img
                      src={routine.imageUrl}
                      alt={routine.name}
                      className="rutina-thumb"
                    />
                  )}

                  <div>
                    <h3 className="dashboard-tile-title">{routine.name}</h3>
                    <div className="dashboard-tile-meta">
                      {routine.daysOfWeek && routine.daysOfWeek.length > 0
                        ? routine.daysOfWeek.map((d) => dayLabels[d]).join(", ")
                        : "Sin días"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="dashboard-tile-actions rutina-actions-bottom">
                <LinkButton
                  to={`/rutinas/${routine.id}`}
                  state={{ routineName: routine.name }}
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
