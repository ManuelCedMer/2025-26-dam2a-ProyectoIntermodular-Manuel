import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getDailyProgressByDate } from "../services/progressService.js";
import { getUserProfile } from "../services/userProfileService.js";

import { getTodayDateString } from "../utils/dates.js";

/**
 * Convierte un valor a número positivo válido.
 * Si el valor no existe, no es numérico o es menor o igual que cero, devuelve null.
 */
function toValidPositiveNumber(value) {
  if (value === null || value === undefined) return null;
  const num = Number(value);
  if (Number.isNaN(num) || num <= 0) return null;
  return num;
}

/**
 * Pantalla de inicio de la aplicación.
 * Muestra un resumen del progreso diario, el anillo de calorías,
 * feedback personalizado y accesos rápidos a las secciones principales.
 * [HOME-01] [HOME-02] [HOME-03] [HOME-04]
 */
function HomePage() {
  const { user } = useAuth();

  // Nombre mostrado en el saludo principal.
  const friendlyName =
    user?.displayName || (user?.email ? user.email.split("@")[0] : "usuario");

  // Modo activo del anillo: calorías consumidas o gastadas.
  const [viewMode, setViewMode] = useState("consumed");

  const [loading, setLoading] = useState(false);

  // Registro de progreso del día actual.
  const [todayEntry, setTodayEntry] = useState(null);

  // Meta diaria de ingesta calórica definida en el perfil.
  const [goalCalories, setGoalCalories] = useState(null);

  // Meta diaria de gasto calórico definida en el perfil.
  const [burnGoalCalories, setBurnGoalCalories] = useState(null);

  // Indican si el usuario ha definido metas personalizadas en su perfil.
  const [hasProfileConsumedGoal, setHasProfileConsumedGoal] = useState(false);
  const [hasProfileBurnGoal, setHasProfileBurnGoal] = useState(false);

  /**
   * Carga el progreso del día actual y las metas guardadas en el perfil.
   */
  useEffect(() => {
    if (!user) return;

    async function loadHomeData() {
      try {
        setLoading(true);

        const today = getTodayDateString();

        const [entry, profile] = await Promise.all([
          getDailyProgressByDate({ userId: user.uid, date: today }),
          getUserProfile(user.uid),
        ]);

        setTodayEntry(entry);

        const profileConsumedGoal = toValidPositiveNumber(
          profile?.dailyCaloriesGoal,
        );
        const profileBurnGoal = toValidPositiveNumber(
          profile?.dailyCaloriesBurnGoal,
        );

        setHasProfileConsumedGoal(profileConsumedGoal !== null);
        setHasProfileBurnGoal(profileBurnGoal !== null);

        // Se guardan las metas como null si no están definidas, evitando valores por defecto silenciosos.
        setGoalCalories(profileConsumedGoal);
        setBurnGoalCalories(profileBurnGoal);
      } catch (error) {
        console.error("Error al cargar datos de Home:", error);
        setTodayEntry(null);
        setGoalCalories(2000);
      } finally {
        setLoading(false);
      }
    }

    loadHomeData();
  }, [user]);

  // Calorías consumidas registradas hoy.
  const caloriesIn =
    todayEntry?.caloriesIn !== null && todayEntry?.caloriesIn !== undefined
      ? Number(todayEntry.caloriesIn) || 0
      : 0;

  // Calorías gastadas registradas hoy.
  const caloriesOut =
    todayEntry?.caloriesOut !== null && todayEntry?.caloriesOut !== undefined
      ? Number(todayEntry.caloriesOut) || 0
      : 0;

  // Indican si existen datos reales de ingesta o gasto en el registro diario.
  const hasCaloriesInData =
    todayEntry?.caloriesIn !== null && todayEntry?.caloriesIn !== undefined;
  const hasCaloriesOutData =
    todayEntry?.caloriesOut !== null && todayEntry?.caloriesOut !== undefined;

  // Valores numéricos usados para los cálculos del anillo.
  const numericGoal = goalCalories || 0;
  const numericBurnGoal = burnGoalCalories || 0;

  // Porcentajes usados para representar visualmente el progreso del anillo.
  const percentConsumed = Math.round(
    Math.max(
      0,
      Math.min(100, numericGoal > 0 ? (caloriesIn / numericGoal) * 100 : 0),
    ),
  );
  const percentBurned = Math.round(
    Math.max(
      0,
      Math.min(
        100,
        numericBurnGoal > 0 ? (caloriesOut / numericBurnGoal) * 100 : 0,
      ),
    ),
  );

  // Estilo dinámico del anillo según la vista seleccionada.
  const ringStyle = {
    background:
      viewMode === "consumed"
        ? `conic-gradient(#fb923c 0 ${percentConsumed}%, var(--ring-bg, #d1d5db) ${percentConsumed}% 100%)`
        : `conic-gradient(var(--primary) 0 ${percentBurned}%, var(--ring-bg, #d1d5db) ${percentBurned}% 100%)`,
  };

  // Texto de feedback mostrado debajo del anillo.
  let feedbackText = "";

  if (loading) {
    feedbackText = "Cargando tu progreso de hoy...";
  } else if (viewMode === "consumed") {
    // Feedback de calorías consumidas según la meta de ingesta.
    if (!hasProfileConsumedGoal) {
      feedbackText =
        "No has definido tu meta diaria de ingesta. Ve a Perfil para establecerla y recibir feedback personalizado.";
    } else if (!hasCaloriesInData) {
      feedbackText =
        "Aún no has registrado tu ingesta de hoy. Añádelo en Progreso para ver el cálculo.";
    } else {
      const diff = Math.round(goalCalories - caloriesIn);
      if (diff > 0) {
        feedbackText = `Te faltan ${diff} kcal por consumir para alcanzar tu objetivo diario.`;
      } else if (diff === 0) {
        feedbackText = `Has alcanzado tu objetivo diario de ingesta.`;
      } else {
        feedbackText = `Has superado tu objetivo en ${Math.abs(diff)} kcal.`;
      }
    }
  } else {
    // Feedback de calorías gastadas según la meta de gasto.
    if (!hasProfileBurnGoal) {
      feedbackText =
        "No has definido tu meta diaria de gasto calórico. Ve a Perfil para establecerla y recibir feedback sobre tu actividad.";
    } else if (!hasCaloriesOutData) {
      feedbackText =
        "Aún no has registrado actividad hoy. Añade ejercicio en Progreso para contabilizar calorías gastadas.";
    } else {
      if (hasProfileBurnGoal && burnGoalCalories !== null) {
        const diff = Math.round(burnGoalCalories - caloriesOut);
        if (diff > 0) {
          feedbackText = `Te faltan ${diff} kcal por gastar para alcanzar tu objetivo diario.`;
        } else if (diff === 0) {
          feedbackText = `Has alcanzado tu objetivo de gasto calórico diario.`;
        } else {
          feedbackText = `Has superado tu objetivo en ${Math.abs(diff)} kcal.`;
        }
      } else {
        feedbackText =
          "Aún no has registrado actividad hoy. Añade ejercicio en Progreso para contabilizar calorías gastadas.";
      }
    }
  }

  return (
    <div className="home-page">
      {/* Tarjeta principal de resumen diario */}
      <section className="home-main-card">
        <h1 className="home-greeting">Hola, {friendlyName}</h1>

        {/* Selector para alternar entre calorías consumidas y gastadas */}
        <div className="view-toggle" role="tablist" aria-label="Ver">
          <button
            type="button"
            className={`btn btn-ghost ${viewMode === "consumed" ? "active" : ""}`}
            onClick={() => setViewMode("consumed")}
            aria-pressed={viewMode === "consumed"}
          >
            Consumidas
          </button>
          <button
            type="button"
            className={`btn btn-ghost ${viewMode === "burned" ? "active" : ""}`}
            onClick={() => setViewMode("burned")}
            aria-pressed={viewMode === "burned"}
          >
            Gastadas
          </button>
        </div>

        {/* Anillo visual de calorías */}
        <div className="home-calories-ring" style={ringStyle}>
          <div className="home-calories-inner">
            <p className="home-calories-percentage">
              {viewMode === "consumed"
                ? `${caloriesIn} kcal`
                : `${caloriesOut} kcal`}
            </p>
          </div>
        </div>

        <p className="home-feedback">{feedbackText}</p>

        {/* Accesos rápidos a las secciones principales */}
        <div className="home-actions">
          <Link to="/rutinas" className="home-action-card">
            <span className="home-action-icon">🏃</span>
            <span className="home-action-text">Rutina de hoy</span>
          </Link>

          <Link to="/dietas" className="home-action-card">
            <span className="home-action-icon">🍽️</span>
            <span className="home-action-text">Comidas de hoy</span>
          </Link>

          <Link to="/recetas" className="home-action-card">
            <span className="home-action-icon">🔍</span>
            <span className="home-action-text">Buscar recetas</span>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
