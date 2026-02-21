import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import {
  getProgressEntriesByUser,
  saveDailyProgress,
} from "../services/progressService.js";
import { getUserProfile } from "../services/userProfileService.js";

import { getTodayDateString, parseDateFromString } from "../utils/dates.js";

// Componentes de Recharts para los gráficos.
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

/**
 * Normaliza el objetivo a una forma interna manejable.
 */
function normalizeGoal(goal) {
  if (!goal) return null;
  const g = goal.toLowerCase();

  if (g.includes("adelgaz") || g.includes("bajar")) {
    return "adelgazar";
  }
  if (g.includes("mantener")) {
    return "mantener";
  }
  if (g.includes("masa") || g.includes("muscular") || g.includes("ganar")) {
    return "ganar";
  }

  return null;
}

/**
 * Filtra las entradas según el rango seleccionado.
 */
function filterEntriesByRange(entries, range) {
  if (range === "all") {
    return entries;
  }

  const now = new Date();
  let daysBack = 0;

  switch (range) {
    case "7d":
      daysBack = 7;
      break;
    case "30d":
      daysBack = 30;
      break;
    case "180d":
      daysBack = 180;
      break;
    case "365d":
      daysBack = 365;
      break;
    default:
      daysBack = 0;
  }

  if (daysBack === 0) {
    return entries;
  }

  const limitDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - daysBack,
  );

  return entries.filter((entry) => {
    const entryDate = parseDateFromString(entry.date);
    if (!entryDate) return false;
    return entryDate >= limitDate;
  });
}

/**
 * Calcula un mensaje de feedback en base al objetivo y
 * al balance calórico medio de los últimos días.
 */
function calculateFeedback(goalNormalizado, entries) {
  if (!goalNormalizado || entries.length === 0) {
    return "";
  }

  const recentEntries = entries.slice(0, 7);

  const diffs = recentEntries
    .map((entry) => {
      if (
        entry.caloriesIn === null ||
        entry.caloriesIn === undefined ||
        entry.caloriesOut === null ||
        entry.caloriesOut === undefined
      ) {
        return null;
      }
      return entry.caloriesIn - entry.caloriesOut;
    })
    .filter((diff) => diff !== null);

  if (diffs.length === 0) {
    return "";
  }

  const sum = diffs.reduce((acc, value) => acc + value, 0);
  const avgDiff = sum / diffs.length;
  const avgRounded = Math.round(avgDiff);

  let baseMessage = `En los últimos ${diffs.length} días tu balance calórico medio ha sido de ${avgRounded} kcal/día. `;
  let extraMessage = "";

  if (goalNormalizado === "adelgazar") {
    if (avgRounded <= -300) {
      extraMessage =
        "Este déficit calórico es coherente con un objetivo de pérdida de peso (siempre que sea sostenible y saludable para ti).";
    } else if (avgRounded < 100) {
      extraMessage =
        "Estás muy cerca de un balance neutro. Si quieres perder algo más, podrías plantearte un ligero déficit adicional (por ejemplo 200–300 kcal/día).";
    } else {
      extraMessage =
        "Ahora mismo estás en superávit calórico, lo que suele dificultar la pérdida de peso. Si tu objetivo es adelgazar, revisa tu ingesta y/o el gasto energético.";
    }
  } else if (goalNormalizado === "mantener") {
    if (Math.abs(avgRounded) <= 200) {
      extraMessage =
        "Tu balance está bastante cerca del mantenimiento, lo que es coherente con mantener el peso actual.";
    } else if (avgRounded > 200) {
      extraMessage =
        "Tienes un superávit calórico apreciable. Si notas que subes de peso y no es tu objetivo, podrías reducir ligeramente la ingesta.";
    } else {
      extraMessage =
        "Tienes un déficit calórico apreciable. Si notas que bajas de peso y no es tu objetivo, podrías aumentar un poco la ingesta.";
    }
  } else if (goalNormalizado === "ganar") {
    if (avgRounded >= 200 && avgRounded <= 500) {
      extraMessage =
        "Este superávit calórico moderado suele ser adecuado para favorecer la ganancia de masa muscular, siempre que vaya acompañado de entrenamiento de fuerza.";
    } else if (avgRounded > 500) {
      extraMessage =
        "El superávit es bastante alto. Puede ayudarte a ganar peso rápido, pero también aumentar la ganancia de grasa. Quizás un superávit algo más moderado sea más interesante.";
    } else {
      extraMessage =
        "Tu balance está cerca del mantenimiento o en ligero déficit. Si te cuesta ganar masa muscular, podrías aumentar un poco las calorías diarias.";
    }
  }

  return baseMessage + extraMessage;
}

/**
 * Validaciones mínimas para inputs numéricos.
 * Devuelve string vacío si está OK.
 */
function validateNonNegativeNumber(value, label, { max = null } = {}) {
  const trimmed = value.trim();
  if (trimmed === "") return "";

  const num = Number(trimmed);
  if (Number.isNaN(num)) return `${label} debe ser un número válido.`;
  if (num < 0) return `${label} no puede ser negativo.`;
  if (max !== null && num > max) return `${label} parece demasiado alto.`;
  return "";
}

/**
 * Pantalla de progreso [PROGRESS].
 */
function ProgressPage() {
  const { user } = useAuth();

  // Fecha del formulario.
  const [date, setDate] = useState(getTodayDateString());

  // Campos del formulario.
  const [caloriesIn, setCaloriesIn] = useState("");
  const [caloriesOut, setCaloriesOut] = useState("");
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");

  // Historial completo de progreso.
  const [entries, setEntries] = useState([]);

  // Perfil del usuario (para leer el objetivo).
  const [goalRaw, setGoalRaw] = useState(null);
  const [normalizedGoal, setNormalizedGoal] = useState(null);

  // Meta diaria (para aviso si falta).
  const [dailyCaloriesGoal, setDailyCaloriesGoal] = useState(null);

  // Rango de fechas para los gráficos.
  const [range, setRange] = useState("30d");

  // Mensaje de feedback calculado.
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Errores por campo (UI).
  const caloriesInError = validateNonNegativeNumber(
    caloriesIn,
    "Calorías consumidas",
    { max: 20000 },
  );
  const caloriesOutError = validateNonNegativeNumber(
    caloriesOut,
    "Calorías gastadas",
    { max: 20000 },
  );
  const weightError = validateNonNegativeNumber(weight, "Peso", { max: 500 });

  const hasFieldErrors = Boolean(
    caloriesInError || caloriesOutError || weightError,
  );
  const hasAnyData =
    caloriesIn.trim() !== "" ||
    caloriesOut.trim() !== "" ||
    weight.trim() !== "" ||
    notes.trim() !== "";

  /**
   * Carga el historial de progreso y el perfil del usuario al entrar en la página.
   */
  useEffect(() => {
    if (!user) return;

    async function loadData() {
      try {
        setIsLoadingData(true);
        setErrorMessage("");

        const [entriesFromDb, profile] = await Promise.all([
          getProgressEntriesByUser(user.uid),
          getUserProfile(user.uid),
        ]);

        setEntries(entriesFromDb);

        if (profile) {
          if (profile.goal) {
            setGoalRaw(profile.goal);
            setNormalizedGoal(normalizeGoal(profile.goal));
          } else {
            setGoalRaw(null);
            setNormalizedGoal(null);
          }

          if (
            profile.dailyCaloriesGoal !== undefined &&
            profile.dailyCaloriesGoal !== null
          ) {
            setDailyCaloriesGoal(profile.dailyCaloriesGoal);
          } else {
            setDailyCaloriesGoal(null);
          }
        } else {
          setGoalRaw(null);
          setNormalizedGoal(null);
          setDailyCaloriesGoal(null);
        }
      } catch (error) {
        console.error("Error al cargar progreso o perfil:", error);
        setErrorMessage(
          "No se ha podido cargar el historial de progreso o el perfil de usuario.",
        );
      } finally {
        setIsLoadingData(false);
      }
    }

    loadData();
  }, [user]);

  /**
   * Cada vez que cambian el historial o el objetivo normalizado,
   * recalculamos el mensaje de feedback.
   */
  useEffect(() => {
    const message = calculateFeedback(normalizedGoal, entries);
    setFeedbackMessage(message);
  }, [normalizedGoal, entries]);

  /**
   * Convierte los valores de los inputs a números o null.
   */
  function parseNumberOrNull(value) {
    const trimmed = value.trim();
    if (trimmed === "") {
      return null;
    }
    const num = Number(trimmed);
    return Number.isNaN(num) ? null : num;
  }

  function handleSetToday() {
    setDate(getTodayDateString());
    setErrorMessage("");
    setSuccessMessage("");
  }

  /**
   * Maneja el envío del formulario para guardar el progreso diario.
   * [PROGRESS-01][PROGRESS-02]
   */
  async function handleSubmit(event) {
    event.preventDefault();

    if (!user) {
      setErrorMessage("No hay usuario autenticado.");
      return;
    }

    if (!date) {
      setErrorMessage("Selecciona una fecha válida.");
      setSuccessMessage("");
      return;
    }

    if (hasFieldErrors) {
      setErrorMessage("Revisa los campos marcados antes de guardar.");
      setSuccessMessage("");
      return;
    }

    const parsedCaloriesIn = parseNumberOrNull(caloriesIn);
    const parsedCaloriesOut = parseNumberOrNull(caloriesOut);
    const parsedWeight = parseNumberOrNull(weight);

    if (
      parsedCaloriesIn === null &&
      parsedCaloriesOut === null &&
      parsedWeight === null &&
      notes.trim() === ""
    ) {
      setErrorMessage(
        "Introduce al menos calorías, peso o alguna nota para este día.",
      );
      setSuccessMessage("");
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      const savedEntry = await saveDailyProgress({
        userId: user.uid,
        date,
        caloriesIn: parsedCaloriesIn,
        caloriesOut: parsedCaloriesOut,
        weight: parsedWeight,
        notes: notes.trim(),
      });

      setEntries((prev) => {
        const existingIndex = prev.findIndex(
          (entry) => entry.date === savedEntry.date,
        );

        if (existingIndex !== -1) {
          const newList = [...prev];
          newList[existingIndex] = savedEntry;
          return newList.sort((a, b) => (a.date < b.date ? 1 : -1));
        } else {
          return [...prev, savedEntry].sort((a, b) =>
            a.date < b.date ? 1 : -1,
          );
        }
      });

      setSuccessMessage("Progreso guardado correctamente.");
    } catch (error) {
      console.error("Error al guardar el progreso:", error);
      setErrorMessage("No se ha podido guardar el progreso.");
      setSuccessMessage("");
    } finally {
      setIsSaving(false);
    }
  }

  if (!user) {
    return (
      <div className="progress-page">
        <div className="progress-card">
          <h2>Registro y seguimiento de progreso</h2>
          <p>No hay usuario autenticado.</p>
        </div>
      </div>
    );
  }

  // Aplicamos filtro de rango para los gráficos.
  const filteredEntries = filterEntriesByRange(entries, range);

  // Datos para los gráficos, ordenados de más antiguo a más reciente.
  const chartData = [...filteredEntries].sort((a, b) =>
    a.date > b.date ? 1 : -1,
  );

  const hasWeightData = !chartData.every(
    (entry) => entry.weight === null || entry.weight === undefined,
  );

  const showDailyGoalInfo = dailyCaloriesGoal === null;

  const canSubmit = !isSaving && !hasFieldErrors && hasAnyData;

  return (
    <div className="progress-page">
      <section className="progress-layout">
        {/* Columna izquierda: encabezado, mensajes, formulario y tabla */}
        <div className="progress-left">
          <div className="progress-card">
            <h2>Registro diario de calorías y peso</h2>
            <p className="progress-subtitle">
              Registra tus calorías, peso y notas del día para poder visualizar
              la evolución a lo largo del tiempo.
            </p>
          </div>

          {showDailyGoalInfo && (
            <div className="progress-card progress-message progress-message--info">
              Aún no tienes configurada la meta calórica diaria en tu perfil.
              Puedes configurarla para que la pantalla de inicio muestre un
              resumen más completo.
            </div>
          )}

          {errorMessage && (
            <div className="progress-card progress-message progress-message--error">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="progress-card progress-message progress-message--ok">
              {successMessage}
            </div>
          )}

          {/* Formulario de registro */}
          <div className="progress-card">
            <h3>Registrar progreso del día</h3>

            <form onSubmit={handleSubmit} className="progress-form">
              <div className="progress-field">
                <label>Fecha</label>
                <div className="progress-inline">
                  <input
                    className="input"
                    type="date"
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                  />
                  <button
                    type="button"
                    className="progress-secondary-button"
                    onClick={handleSetToday}
                    disabled={isSaving}
                  >
                    Hoy
                  </button>
                </div>
              </div>

              <div className="progress-field">
                <label>Calorías consumidas (kcal)</label>
                <input
                  className="input"
                  type="number"
                  value={caloriesIn}
                  onChange={(event) => setCaloriesIn(event.target.value)}
                  min="0"
                  placeholder="Ej: 2200"
                />
                {caloriesInError && (
                  <div className="progress-field-error">{caloriesInError}</div>
                )}
              </div>

              <div className="progress-field">
                <label>Calorías gastadas (kcal)</label>
                <input
                  className="input"
                  type="number"
                  value={caloriesOut}
                  onChange={(event) => setCaloriesOut(event.target.value)}
                  min="0"
                  placeholder="Ej: 500"
                />
                {caloriesOutError && (
                  <div className="progress-field-error">{caloriesOutError}</div>
                )}
              </div>

              <div className="progress-field">
                <label>Peso (kg)</label>
                <input
                  className="input"
                  type="number"
                  value={weight}
                  onChange={(event) => setWeight(event.target.value)}
                  min="0"
                  step="0.1"
                  placeholder="Ej: 72.5"
                />
                {weightError && (
                  <div className="progress-field-error">{weightError}</div>
                )}
              </div>

              <div className="progress-field">
                <label>Notas (opcional)</label>
                <textarea
                  className="textarea"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Por ejemplo: día de descanso, entrenamiento fuerte..."
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={!canSubmit}
              >
                {isSaving ? "Guardando..." : "Guardar progreso del día"}
              </button>
            </form>
          </div>

          {/* Historial en tabla */}
          <div className="progress-card">
            <h3>Historial de progreso</h3>

            {isLoadingData && entries.length === 0 && (
              <p>Cargando historial de progreso...</p>
            )}

            {!isLoadingData && entries.length === 0 && (
              <div className="progress-empty">
                <p>Todavía no has registrado ningún día.</p>
                <button
                  type="button"
                  className="progress-secondary-button"
                  onClick={handleSetToday}
                  disabled={isSaving}
                >
                  Registrar hoy
                </button>
              </div>
            )}

            {entries.length > 0 && (
              <table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Calorías consumidas</th>
                    <th>Calorías gastadas</th>
                    <th>Diferencia</th>
                    <th>Peso (kg)</th>
                    <th>Notas</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => {
                    const diff =
                      (entry.caloriesIn || 0) - (entry.caloriesOut || 0);

                    return (
                      <tr key={entry.id}>
                        <td>{entry.date}</td>
                        <td>
                          {entry.caloriesIn !== null &&
                          entry.caloriesIn !== undefined
                            ? entry.caloriesIn
                            : "-"}
                        </td>
                        <td>
                          {entry.caloriesOut !== null &&
                          entry.caloriesOut !== undefined
                            ? entry.caloriesOut
                            : "-"}
                        </td>
                        <td>{diff !== 0 ? diff : "-"}</td>
                        <td>
                          {entry.weight !== null && entry.weight !== undefined
                            ? entry.weight
                            : "-"}
                        </td>
                        <td>{entry.notes || "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Columna derecha: rango, gráficos y feedback */}
        <div className="progress-right">
          <div className="progress-card">
            <h3>Rango de fechas para los gráficos</h3>
            <div>
              <label>Rango</label>
              <select
                className="select"
                value={range}
                onChange={(event) => setRange(event.target.value)}
              >
                <option value="7d">Últimos 7 días</option>
                <option value="30d">Últimos 30 días</option>
                <option value="180d">Últimos 6 meses</option>
                <option value="365d">Último año</option>
                <option value="all">Todo el historial</option>
              </select>
            </div>
          </div>

          {/* Gráfico de calorías */}
          <div className="progress-card progress-chart-card">
            <h3>Gráfico de calorías</h3>

            {isLoadingData ? (
              <p>Cargando datos...</p>
            ) : chartData.length === 0 ? (
              <p>No hay datos suficientes para mostrar el gráfico.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="caloriesIn"
                    name="Calorías consumidas"
                    stroke="#8884d8"
                    dot={false}
                    connectNulls
                  />
                  <Line
                    type="monotone"
                    dataKey="caloriesOut"
                    name="Calorías gastadas"
                    stroke="#82ca9d"
                    dot={false}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Gráfico de peso */}
          <div className="progress-card progress-chart-card">
            <h3>Gráfico de peso</h3>

            {isLoadingData ? (
              <p>Cargando datos...</p>
            ) : !hasWeightData ? (
              <p>No hay datos de peso suficientes para mostrar el gráfico.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    name="Peso (kg)"
                    stroke="#ff7300"
                    dot={false}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Feedback según objetivo */}
          <div className="progress-card">
            <h3>Mensaje de feedback según tu objetivo</h3>

            {goalRaw ? (
              <p>
                Objetivo actual en tu perfil: <strong>{goalRaw}</strong>
              </p>
            ) : (
              <p>
                No se ha encontrado un objetivo configurado en tu perfil. Puedes
                editarlo en la pantalla de perfil para obtener mensajes más
                personalizados.
              </p>
            )}

            {feedbackMessage && <p>{feedbackMessage}</p>}

            {!feedbackMessage && goalRaw && (
              <p>
                Registra varios días con calorías consumidas y gastadas para
                poder generar un mensaje de feedback más preciso.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default ProgressPage;
