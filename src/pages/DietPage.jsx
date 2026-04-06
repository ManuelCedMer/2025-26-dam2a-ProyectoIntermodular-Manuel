import { useState, useEffect } from "react";
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
import { FormStack, Input } from "../components/ui/Form.jsx";
import Alert from "../components/ui/Alert.jsx";
import LoadingState from "../components/ui/LoadingState.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import EntityListItem from "../components/ui/EntityListItem.jsx";

function DietPage() {
  const { user } = useAuth();

  // Estado para mostrar/ocultar panel de creación
  const [showCreatePanel, setShowCreatePanel] = useState(false);

  // Lista de planes
  const [diets, setDiets] = useState([]);

  // Ejemplo estático (solo visual): se muestra cuando no hay planes
  const examplePlan = {
    name: "Semana equilibrada",
    description: "Plan ejemplo: 3 comidas + 2 tentempiés diarios, orientativo.",
    meals: [
      { day: "Lun", type: "Desayuno", name: "Avena con fruta" },
      { day: "Lun", type: "Almuerzo", name: "Ensalada + pollo" },
      { day: "Lun", type: "Cena", name: "Salmón y verduras" },
      { day: "Mar", type: "Almuerzo", name: "Quinoa con tofu" },
      { day: "Mié", type: "Cena", name: "Pasta integral y salsa ligera" },
    ],
  };

  // Formulario de creación
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Edición
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editErrorMessage, setEditErrorMessage] = useState("");

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getDietsByUser(user.uid)
      .then(setDiets)
      .finally(() => setLoading(false));
  }, [user]);

  // Handlers de creación y edición (idénticos a los actuales)
  const handleCreateDiet = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage("El nombre es obligatorio.");
      return;
    }
    setLoading(true);
    setErrorMessage("");
    try {
      const newDiet = await createDiet({
        userId: user.uid,
        name: name.trim(),
        description: description.trim(),
      });
      setDiets((prev) => [newDiet, ...prev]);
      setShowCreatePanel(false);
      setName("");
      setDescription("");
    } catch (err) {
      setErrorMessage("No se pudo crear el plan.");
    } finally {
      setLoading(false);
    }
  };

  const startEditDiet = (diet) => {
    setEditingId(diet.id);
    setEditName(diet.name);
    setEditDescription(diet.description || "");
    setEditErrorMessage("");
  };

  const handleUpdateDiet = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      setEditErrorMessage("El nombre es obligatorio.");
      return;
    }
    setEditLoading(true);
    setEditErrorMessage("");
    try {
      const updated = await updateDiet(editingId, {
        name: editName.trim(),
        description: editDescription.trim(),
      });
      setDiets((prev) =>
        prev.map((d) => (d.id === editingId ? { ...d, ...updated } : d)),
      );
      setEditingId(null);
      setEditName("");
      setEditDescription("");
    } catch (err) {
      setEditErrorMessage("No se pudo actualizar el plan.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteDiet = async (id) => {
    if (!window.confirm("¿Eliminar este plan?")) return;
    setLoading(true);
    try {
      await deleteDiet(id);
      setDiets((prev) => prev.filter((d) => d.id !== id));
    } catch {
      // error handling opcional
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditDescription("");
    setEditErrorMessage("");
  };

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
      {/* Toolbar tipo dashboard */}
      <PageHeader>
        <div className="dashboard-header">
          <div className="dashboard-header-titles">
            <PageTitle>Planes de alimentación</PageTitle>
            <PageSubtitle>
              Gestiona tus planes y accede a sus comidas.
            </PageSubtitle>
          </div>
          <div className="dashboard-header-actions">
            <Button
              type="button"
              variant="primary"
              onClick={() => {
                setShowCreatePanel((v) => !v);
                setName("");
                setDescription("");
                setErrorMessage("");
              }}
            >
              + Nuevo
            </Button>
          </div>
        </div>
      </PageHeader>

      {/* Panel colapsable de creación */}
      {showCreatePanel && (
        <Card className="dashboard-panel card-relative">
          <div className="cardheader-x-row">
            <h3 className="section-title">Crear nuevo plan</h3>
            <button
              type="button"
              className="close-panel-btn"
              aria-label="Cerrar"
              onClick={() => {
                setShowCreatePanel(false);
                setName("");
                setDescription("");
                setErrorMessage("");
              }}
            >
              ×
            </button>
          </div>
          <form onSubmit={handleCreateDiet}>
            <FormStack>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre del plan"
                required
              />
              <Input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripción (opcional)"
              />
              {errorMessage && <Alert variant="error">{errorMessage}</Alert>}
              <Button type="submit" disabled={loading}>
                {loading ? "Guardando..." : "Crear plan"}
              </Button>
            </FormStack>
          </form>
        </Card>
      )}

      {/* Panel colapsable de edición */}
      {editingId && (
        <Card className="dashboard-panel card-relative">
          <div className="cardheader-x-row">
            <h3 className="section-title">Editar plan</h3>
            <button
              type="button"
              className="close-panel-btn"
              aria-label="Cerrar"
              onClick={cancelEdit}
            >
              ×
            </button>
          </div>
          <form onSubmit={handleUpdateDiet}>
            <FormStack>
              <Input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
              <Input
                type="text"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Descripción (opcional)"
              />
              {editErrorMessage && (
                <Alert variant="error">{editErrorMessage}</Alert>
              )}
              <div className="actions-row">
                <Button type="submit" disabled={editLoading}>
                  {editLoading ? "Guardando..." : "Guardar cambios"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={cancelEdit}
                  disabled={editLoading}
                >
                  Cancelar
                </Button>
              </div>
            </FormStack>
          </form>
        </Card>
      )}

      {/* Listado principal */}
      <Card className="dashboard-tile diet-list-card">
        {loading && <LoadingState text="Cargando planes..." />}
        {!loading && diets.length === 0 && (
          <>
            <EmptyState text="No tienes ningún plan de alimentación creado todavía." />

            {/* Bloque visual orientativo: ejemplo de plan (no persistente) */}
            <Card className="example-diet-card" aria-hidden>
              <div className="example-diet-header">
                <strong>{examplePlan.name}</strong>
                <div className="text-muted">{examplePlan.description}</div>
              </div>

              <ul className="example-diet-meals">
                {examplePlan.meals.map((m, idx) => (
                  <li key={idx} className="example-diet-meal">
                    <span className="example-diet-day">{m.day}</span>
                    <span className="example-diet-type">{m.type}</span>
                    <span className="example-diet-name">{m.name}</span>
                  </li>
                ))}
              </ul>

              <div className="example-diet-note text-muted">
                Este es solo un ejemplo visual. Crea tu propio plan con "+
                Nuevo" y después añade comidas dentro del plan.
              </div>
            </Card>
          </>
        )}
        {!loading && diets.length > 0 && (
          <ul className="list-stack block-mt">
            {diets.map((diet) => (
              <li key={diet.id} className="dietplan-row">
                <div className="dietplan-main">
                  <div className="dietplan-info">
                    <span className="dietplan-title">{diet.name}</span>
                    {diet.description && (
                      <span className="text-muted">— {diet.description}</span>
                    )}
                    <div className="dietplan-link-row">
                      <LinkButton
                        size="sm"
                        variant="primary"
                        to={`/dietas/${diet.id}`}
                        state={{ dietName: diet.name }}
                      >
                        Ver comidas
                      </LinkButton>
                    </div>
                  </div>
                  <div className="dietplan-actions">
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
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </Page>
  );
}

export default DietPage;
