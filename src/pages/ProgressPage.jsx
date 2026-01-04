import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import {
  getProgressEntriesByUser,
  saveDailyProgress,
} from "../services/progressService.js";

// Importamos los componentes de Recharts para los gráficos.
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
 * Devuelve la fecha de hoy en formato "YYYY-MM-DD"
 * para usarla en <input type="date" />.
 */
function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Convierte una fecha "YYYY-MM-DD" en un objeto Date.
 * Si hay algún problema con el formato, devuelve null.
 */
function parseDateFromString(dateString) {
  if (!dateString) return null;
  const [year, month, day] = dateString.split("-");
  if (!year || !month || !day) return null;
  return new Date(Number(year), Number(month) - 1, Number(day));
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
 * Pantalla de progreso [PROGRESS].
 *
 * Bloque 1:
 *  - Registro diario de calorías consumidas y gastadas [PROGRESS-01].
 *  - Registro de peso y notas [PROGRESS-02].
 *  - Listado de historial en forma de tabla.
 *
 * Bloque 2 :
 *  - Gráficos de calorías y peso según rango de fechas [PROGRESS-03].
 */
function ProgressPage() {
  const { user } = useAuth();

  // Fecha seleccionada para el formulario.
  const [date, setDate] = useState(getTodayDateString());

  // Campos del formulario.
  const [caloriesIn, setCaloriesIn] = useState("");
  const [caloriesOut, setCaloriesOut] = useState("");
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");

  // Historial completo de entradas de progreso.
  const [entries, setEntries] = useState([]);

  // Rango de fechas seleccionado para los gráficos.
  const [range, setRange] = useState("30d");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  /**
   * Carga el historial de progreso del usuario al entrar en la página.
   */
  useEffect(() => {
    if (!user) return;

    async function loadProgress() {
      try {
        setLoading(true);
        setErrorMessage("");

        const entriesFromDb = await getProgressEntriesByUser(user.uid);

        setEntries(entriesFromDb);
      } catch (error) {
        console.error("Error al cargar el progreso:", error);
        setErrorMessage("No se ha podido cargar el historial de progreso.");
      } finally {
        setLoading(false);
      }
    }

    loadProgress();
  }, [user]);

  /**
   * Convierte los valores de los inputs a números o null.
   * Si el campo está vacío o no es un número, devolvemos null.
   */
  function parseNumberOrNull(value) {
    const trimmed = value.trim();
    if (trimmed === "") {
      return null;
    }
    const num = Number(trimmed);
    return Number.isNaN(num) ? null : num;
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

    const parsedCaloriesIn = parseNumberOrNull(caloriesIn);
    const parsedCaloriesOut = parseNumberOrNull(caloriesOut);
    const parsedWeight = parseNumberOrNull(weight);

    // No obligamos a rellenar todo, pero al menos una cosa.
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
      setLoading(true);
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

      // Actualizamos el historial en memoria:
      // - Si ya existía entrada para esa fecha, la sustituimos.
      // - Si no existía, la añadimos y reordenamos (fecha descendente).
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
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <div>
        <h2>[PROGRESS] Registro y seguimiento de progreso</h2>
        <p>No hay usuario autenticado.</p>
      </div>
    );
  }

  // Aplicamos el filtro de rango sobre las entradas.
  const filteredEntries = filterEntriesByRange(entries, range);

  // Preparamos los datos para los gráficos, ordenados por fecha ascendente
  // para que el eje X vaya de más antiguo a más reciente.
  const chartData = [...filteredEntries].sort((a, b) =>
    a.date > b.date ? 1 : -1,
  );

  return (
    <div>
      <h2>[PROGRESS] Registro diario de calorías y peso</h2>

      {/* Formulario de registro diario */}
      <section>
        <h3>Registrar progreso del día</h3>

        <form onSubmit={handleSubmit}>
          <div>
            <label>Fecha</label>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </div>

          <div>
            <label>Calorías consumidas (kcal)</label>
            <input
              type="number"
              value={caloriesIn}
              onChange={(event) => setCaloriesIn(event.target.value)}
              min="0"
              placeholder="Ej: 2200"
            />
          </div>

          <div>
            <label>Calorías gastadas (kcal)</label>
            <input
              type="number"
              value={caloriesOut}
              onChange={(event) => setCaloriesOut(event.target.value)}
              min="0"
              placeholder="Ej: 500"
            />
          </div>

          <div>
            <label>Peso (kg)</label>
            <input
              type="number"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
              min="0"
              step="0.1"
              placeholder="Ej: 72.5"
            />
          </div>

          <div>
            <label>Notas (opcional)</label>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Por ejemplo: día de descanso, entrenamiento fuerte..."
            />
          </div>

          {errorMessage && <p>{errorMessage}</p>}
          {successMessage && <p>{successMessage}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Guardar progreso del día"}
          </button>
        </form>
      </section>

      {/* Selector de rango para los gráficos */}
      <section>
        <h3>Rango de fechas para los gráficos</h3>
        <div>
          <label>Rango</label>
          <select
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
      </section>

      {/* Gráfico de calorías */}
      <section>
        <h3>Gráfico de calorías</h3>

        {chartData.length === 0 ? (
          <p>No hay datos suficientes para mostrar el gráfico.</p>
        ) : (
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                {/* Línea de calorías consumidas */}
                <Line
                  type="monotone"
                  dataKey="caloriesIn"
                  name="Calorías consumidas"
                  stroke="#8884d8"
                  dot={false}
                  connectNulls
                />
                {/* Línea de calorías gastadas */}
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
          </div>
        )}
      </section>

      {/* Gráfico de peso */}
      <section>
        <h3>Gráfico de peso</h3>

        {chartData.every(
          (entry) =>
            entry.weight === null || entry.weight === undefined,
        ) ? (
          <p>No hay datos de peso suficientes para mostrar el gráfico.</p>
        ) : (
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
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
          </div>
        )}
      </section>

      {/* Historial de progreso en tabla */}
      <section>
        <h3>Historial de progreso</h3>

        {loading && entries.length === 0 && (
          <p>Cargando historial de progreso...</p>
        )}

        {!loading && entries.length === 0 && (
          <p>Todavía no has registrado ningún día.</p>
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
                      {entry.weight !== null &&
                      entry.weight !== undefined
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
      </section>
    </div>
  );
}

export default ProgressPage;
