import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * Pantalla de inicio [HOME].
 *
 * Aquí muestro:
 *  - Un saludo al usuario con su nombre o parte del email.
 *  - Una tarjeta principal con un anillo de calorías "de ejemplo".
 *  - Tres accesos rápidos a las secciones más usadas:
 *      [ROUTINES], [DIET] y [RECIPES].
 *
 * Forma parte de los requisitos de interfaz [UI-01] y [UI-02]
 * (pantalla de inicio y navegación clara entre secciones).
 */
function HomePage() {
  const { user } = useAuth();

  // Intento sacar un nombre "amigable" para el saludo.
  // 1) displayName si lo hay
  // 2) parte del email antes de la @
  // 3) "usuario" como último recurso
  const friendlyName =
    user?.displayName ||
    (user?.email ? user.email.split("@")[0] : "usuario");

  return (
    <div className="home-page">
      {/* Tarjeta principal de resumen */}
      <section className="home-main-card">

        <h1 className="home-greeting">Hola, {friendlyName}</h1>

        {/* Anillo de calorías "maqueta".
            Más adelante se podría conectar con datos reales. */}
        <div className="home-calories-ring">
          <div className="home-calories-inner">
            <p className="home-calories-label">CALORÍAS</p>
            <p className="home-calories-percentage">70%</p>
            <p className="home-calories-detail">(1400 / 2000)</p>
          </div>
        </div>

        <p className="home-feedback">
          Vas bien encaminado hacia tu objetivo.
        </p>

        {/* Accesos rápidos en formato tarjeta */}
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
