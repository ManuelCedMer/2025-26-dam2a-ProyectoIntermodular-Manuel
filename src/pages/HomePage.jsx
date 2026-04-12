import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getDailyProgressByDate } from "../services/progressService.js";
import { getUserProfile } from "../services/userProfileService.js";

import { getTodayDateString } from "../utils/dates.js";

/**
 * Convierte a número válido o null (si no existe o no es número).
 */
function toValidPositiveNumber(value) {
  if (value === null || value === undefined) return null;
  const num = Number(value);
  if (Number.isNaN(num) || num <= 0) return null;
  return num;
}

/**
 * Pantalla de inicio [HOME].
 */
function HomePage() {
  const { user } = useAuth();

  // Intento sacar un nombre "amigable" para el saludo.
  const friendlyName =
    user?.displayName || (user?.email ? user.email.split("@")[0] : "usuario");

  const [viewMode, setViewMode] = useState("consumed"); // 'consumed' or 'burned'

  const [loading, setLoading] = useState(false);

  // Progreso de hoy (Firestore: progress).
  const [todayEntry, setTodayEntry] = useState(null);

  // Objetivo diario de calorías (puede ser null si no definido en perfil).
  const [goalCalories, setGoalCalories] = useState(null);
  // Objetivo diario de gasto calórico (kcal) — usado para la vista 'burned'
  const [burnGoalCalories, setBurnGoalCalories] = useState(null);
  // Flags para saber si el usuario definió metas en su perfil
  const [hasProfileConsumedGoal, setHasProfileConsumedGoal] = useState(false);
  const [hasProfileBurnGoal, setHasProfileBurnGoal] = useState(false);

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

        // Guardamos las metas tal cual (null si no definidas). No usar fallback silencioso.
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

  // Datos del día (si no hay registro, asumimos 0 para cálculos numéricos pero
  // usamos flags específicas para decidir si hay datos reales de calorías).
  const caloriesIn =
    todayEntry?.caloriesIn !== null && todayEntry?.caloriesIn !== undefined
      ? Number(todayEntry.caloriesIn) || 0
      : 0;

  const caloriesOut =
    todayEntry?.caloriesOut !== null && todayEntry?.caloriesOut !== undefined
      ? Number(todayEntry.caloriesOut) || 0
      : 0;

  const hasCaloriesInData =
    todayEntry?.caloriesIn !== null && todayEntry?.caloriesIn !== undefined;
  const hasCaloriesOutData =
    todayEntry?.caloriesOut !== null && todayEntry?.caloriesOut !== undefined;
  const hasAnyData = hasCaloriesInData || hasCaloriesOutData;

  // Opción 3: restantes = objetivo - consumidas + gastadas
  const numericGoal = goalCalories || 0;
  const numericBurnGoal = burnGoalCalories || 0;

  // Consumidas: métricas directas entre ingesta y meta (no netas)
  const consumedRemainingRaw = numericGoal - caloriesIn;
  const consumedRemainingRounded = Math.round(consumedRemainingRaw);
  const consumedExceeded =
    consumedRemainingRounded < 0 ? Math.abs(consumedRemainingRounded) : 0;
  const consumedDisplayRemaining =
    consumedRemainingRounded > 0 ? consumedRemainingRounded : 0;

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

  const ringStyle = {
    background:
      viewMode === "consumed"
        ? `conic-gradient(#fb923c 0 ${percentConsumed}%, var(--ring-bg, #d1d5db) ${percentConsumed}% 100%)`
        : `conic-gradient(var(--primary) 0 ${percentBurned}%, var(--ring-bg, #d1d5db) ${percentBurned}% 100%)`,
  };

  // Texto debajo: depende de la vista activa (consumed / burned)
  let feedbackText = "";
  // removed: hasAnyData defined above based on calories fields

  if (loading) {
    feedbackText = "Cargando tu progreso de hoy...";
  } else if (viewMode === "consumed") {
    // Feedback de consumidas alineado con la estructura de 'gastadas'
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
    // viewMode === 'burned' — feedback centrado en calorías gastadas
    if (!hasProfileBurnGoal) {
      feedbackText =
        "No has definido tu meta diaria de gasto calórico. Ve a Perfil para establecerla y recibir feedback sobre tu actividad.";
    } else if (!hasCaloriesOutData) {
      feedbackText =
        "Aún no has registrado actividad hoy. Añade ejercicio en Progreso para contabilizar calorías gastadas.";
    } else {
      // Feedback de gastadas basado únicamente en la meta personalizada y caloriesOut
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
      {/* Tarjeta principal de resumen */}
      <section className="home-main-card">
        <h1 className="home-greeting">Hola, {friendlyName}</h1>

        {/* Toggle para cambiar vista del anillo */}
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

        {/* Anillo de calorías*/}
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

        {/* Accesos rápidos */}
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
