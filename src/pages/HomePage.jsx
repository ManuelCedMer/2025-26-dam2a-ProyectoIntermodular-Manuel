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

  // Objetivo diario de calorías (si no existe en perfil, usamos 2000).
  const [goalCalories, setGoalCalories] = useState(2000);

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

        const profileGoal = toValidPositiveNumber(profile?.dailyCaloriesGoal);

        setGoalCalories(profileGoal || 2000);
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

  // Datos del día (si no hay registro, asumimos 0).
  const caloriesIn =
    todayEntry?.caloriesIn !== null && todayEntry?.caloriesIn !== undefined
      ? Number(todayEntry.caloriesIn) || 0
      : 0;

  const caloriesOut =
    todayEntry?.caloriesOut !== null && todayEntry?.caloriesOut !== undefined
      ? Number(todayEntry.caloriesOut) || 0
      : 0;

  // Opción 3: restantes = objetivo - consumidas + gastadas
  const remainingRaw = goalCalories - caloriesIn + caloriesOut;

  const remainingRounded = Math.round(remainingRaw);
  const exceeded = remainingRounded < 0 ? Math.abs(remainingRounded) : 0;
  const displayRemaining = remainingRounded > 0 ? remainingRounded : 0;

  // Para el anillo: progreso "usado" respecto al objetivo (basado en netas).
  // used = objetivo - restantes
  const used = goalCalories - remainingRaw;
  const ratio = goalCalories > 0 ? used / goalCalories : 0;

  // Clamp a [0..1] para el anillo.
  const clamped = Math.max(0, Math.min(1, ratio));
  const percent = Math.round(clamped * 100);

  const percentConsumed = Math.round(
    Math.max(
      0,
      Math.min(100, goalCalories > 0 ? (caloriesIn / goalCalories) * 100 : 0),
    ),
  );
  const percentBurned = Math.round(
    Math.max(
      0,
      Math.min(100, goalCalories > 0 ? (caloriesOut / goalCalories) * 100 : 0),
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
  const hasAnyData = todayEntry !== null;

  if (loading) {
    feedbackText = "Cargando tu progreso de hoy...";
  } else if (viewMode === "consumed") {
    if (!hasAnyData) {
      feedbackText =
        "Aún no has registrado tu progreso de hoy. Añádelo en Progreso para ver el cálculo.";
    } else if (exceeded > 0) {
      feedbackText = `Has superado el objetivo en ${exceeded} kcal.`;
    } else if (displayRemaining === 0) {
      feedbackText = "Objetivo cumplido. Te quedan 0 kcal.";
    } else if (displayRemaining <= 150) {
      feedbackText = `Casi listo: te quedan ${displayRemaining} kcal para tu objetivo.`;
    } else {
      feedbackText = `Te quedan ${displayRemaining} kcal para alcanzar tu objetivo.`;
    }
  } else {
    // viewMode === 'burned' — feedback centrado en calorías gastadas
    if (!hasAnyData) {
      feedbackText =
        "Aún no has registrado actividad hoy. Añade ejercicio en Progreso para contabilizar calorías gastadas.";
    } else if (caloriesOut <= 200) {
      feedbackText = `Has gastado ${caloriesOut} kcal — actividad baja hoy. Un paseo breve ayuda.`;
    } else if (caloriesOut <= 600) {
      feedbackText = `Buen aporte: has gastado ${caloriesOut} kcal hoy.`;
    } else {
      feedbackText = `Excelente: has gastado ${caloriesOut} kcal hoy. Sigue así.`;
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
