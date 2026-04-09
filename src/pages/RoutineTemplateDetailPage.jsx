import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getRoutineTemplateById } from "../services/routineTemplatesService";
import { createRoutineFromTemplate } from "../services/routinesService";

import { LinkButton, Button } from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import {
  Page,
  PageHeader,
  PageTitle,
  PageSubtitle,
} from "../components/ui/Page.jsx";
import LoadingState from "../components/ui/LoadingState.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import Alert from "../components/ui/Alert.jsx";

function RoutineTemplateDetailPage() {
  const { templateId } = useParams();
  const { user } = useAuth();

  const [template, setTemplate] = useState(null);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [templateError, setTemplateError] = useState("");
  const [creating, setCreating] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!templateId) return;

    async function load() {
      try {
        setTemplateLoading(true);
        setTemplateError("");
        const t = await getRoutineTemplateById(templateId);
        if (!t) {
          setTemplateError("Plantilla no encontrada.");
          setTemplate(null);
          return;
        }
        setTemplate(t);
      } catch (err) {
        console.error("Error cargando plantilla:", err);
        setTemplateError("No se pudo cargar la plantilla.");
      } finally {
        setTemplateLoading(false);
      }
    }

    load();
  }, [templateId]);

  async function handleUseTemplate() {
    if (!user) {
      setTemplateError("Inicia sesión para usar esta plantilla.");
      return;
    }
    if (!template) return;

    try {
      setCreating(true);
      setTemplateError("");
      setSuccessMessage("");
      const newRoutine = await createRoutineFromTemplate({
        userId: user.uid,
        template,
      });
      setSuccessMessage("Rutina creada correctamente.");
    } catch (err) {
      console.error("Error usando plantilla:", err);
      setTemplateError("No se pudo crear la rutina desde la plantilla.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <Page>
      <PageHeader>
        <div className="dashboard-header">
          <div className="dashboard-header-titles">
            <LinkButton to="/rutinas" variant="secondary" size="sm">
              ← Volver a rutinas
            </LinkButton>
            <PageTitle>
              {template ? template.name : "Detalle de plantilla"}
            </PageTitle>
            {template && (
              <PageSubtitle strong>{template.level || "—"}</PageSubtitle>
            )}
          </div>
          <div className="dashboard-header-actions">
            <Button
              onClick={handleUseTemplate}
              disabled={creating}
              variant="primary"
            >
              {creating ? "Creando..." : "Usar plantilla"}
            </Button>
          </div>
        </div>
      </PageHeader>

      <Card className="dashboard-tile">
        {templateLoading && <LoadingState text="Cargando plantilla..." />}
        {!templateLoading && templateError && (
          <Alert variant="error">{templateError}</Alert>
        )}
        {!templateLoading && !template && !templateError && (
          <EmptyState text="Plantilla no disponible." />
        )}

        {!templateLoading && template && (
          <div className="template-detail">
            {successMessage && (
              <Alert variant="success">{successMessage}</Alert>
            )}

            <h3 className="template-detail-title">{template.name}</h3>

            {template.imageUrl && (
              <div className="detail-image-wrapper">
                <img
                  src={template.imageUrl}
                  alt={template.name}
                  className="detail-image"
                />
              </div>
            )}

            {template.description && (
              <p className="template-detail-desc">{template.description}</p>
            )}

            <div className="template-meta-grid">
              <div className="meta-item">
                <strong>Nivel:</strong> {template.level || "—"}
              </div>
              <div className="meta-item">
                <strong>Foco:</strong> {template.focus || "—"}
              </div>
              <div className="meta-item">
                <strong>Duración:</strong>{" "}
                {template.estimatedDurationMinutes
                  ? `${template.estimatedDurationMinutes} min`
                  : "—"}
              </div>
              <div className="meta-item">
                <strong>Ejercicios:</strong>{" "}
                {Array.isArray(template.exercises)
                  ? template.exercises.length
                  : 0}
              </div>
            </div>

            {Array.isArray(template.tags) && template.tags.length > 0 && (
              <div className="template-tags" style={{ marginTop: "0.6rem" }}>
                {template.tags.slice(0, 6).map((tag) => (
                  <span key={tag} className="template-tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <hr style={{ margin: "1rem 0" }} />

            <h4>Ejercicios</h4>
            <ul className="template-detail-exercises">
              {Array.isArray(template.exercises) &&
              template.exercises.length > 0 ? (
                template.exercises
                  .slice()
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((ex, idx) => (
                    <li key={idx} className="template-exercise-row">
                      <div className="exercise-name">{ex.name}</div>

                      {ex.imageUrl && (
                        <div className="exercise-card-media">
                          <img
                            src={ex.imageUrl}
                            alt={ex.name}
                            className="exercise-card-image"
                          />
                        </div>
                      )}

                      <div className="exercise-meta">
                        <div>{ex.sets ? `${ex.sets} series` : "—"}</div>
                        <div>{ex.reps ? `${ex.reps} rep` : "—"}</div>
                        {ex.restSeconds != null && (
                          <div>Descanso: {ex.restSeconds}s</div>
                        )}
                      </div>
                      {ex.notes && (
                        <div className="exercise-notes">{ex.notes}</div>
                      )}
                    </li>
                  ))
              ) : (
                <li className="no-exercises">
                  No hay ejercicios en esta plantilla.
                </li>
              )}
            </ul>
          </div>
        )}
      </Card>
    </Page>
  );
}

export default RoutineTemplateDetailPage;
