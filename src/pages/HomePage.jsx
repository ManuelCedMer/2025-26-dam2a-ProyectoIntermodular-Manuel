import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getDailyProgressByDate } from "../services/progressService.js";
import { getUserProfile } from "../services/userProfileService.js";

/**
 * Devuelve la fecha de hoy en formato "YYYY-MM-DD".
 */
function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

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
 *
 * Opción 3:
 *  - "Te quedan X kcal" (objetivo - consumidas + gastadas)
 *  - Anillo basado en el progreso neto del día
 */
function HomePage() {
  const { user } = useAuth();

  // Intento sacar un nombre "amigable" para el saludo.
  const friendlyName =
    user?.displayName || (user?.email ? user.email.split("@")[0] : "usuario");

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

        const profileGoal =
          toValidPositiveNumber(profile?.dailyCaloriesGoal);

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

  const ringStyle = {
    background: `conic-gradient(#fb923c 0 ${percent}%, #e5e7eb ${percent}% 100%)`,
  };

  // Texto debajo: funcional y claro
  let feedbackText = "";
  const hasAnyData = todayEntry !== null;

  if (loading) {
    feedbackText = "Cargando tu progreso de hoy...";
  } else if (!hasAnyData) {
    feedbackText =
      "Aún no has registrado tu progreso de hoy. Añádelo en PROGRESS para ver el cálculo.";
  } else if (exceeded > 0) {
    feedbackText = `Objetivo superado en ${exceeded} kcal.`;
  } else if (displayRemaining === 0) {
    feedbackText = "Objetivo cumplido. Te quedan 0 kcal.";
  } else if (displayRemaining <= 150) {
    feedbackText = `Casi listo: te quedan ${displayRemaining} kcal.`;
  } else {
    feedbackText = `Te quedan ${displayRemaining} kcal para tu objetivo.`;
  }

  return (
    <div className="home-page">
      {/* Tarjeta principal de resumen */}
      <section className="home-main-card">
        <h1 className="home-greeting">Hola, {friendlyName}</h1>

        {/* Anillo de calorías*/}
        <div className="home-calories-ring" style={ringStyle}>
          <div className="home-calories-inner">
            <p className="home-calories-label">RESTANTES</p>
            <p className="home-calories-percentage">{displayRemaining}</p>
            <p className="home-calories-detail">
              ({caloriesIn} / {goalCalories} + {caloriesOut})
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
