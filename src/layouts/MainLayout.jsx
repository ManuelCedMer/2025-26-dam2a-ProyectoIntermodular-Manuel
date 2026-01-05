import { NavLink, Outlet } from "react-router-dom";

/**
 * Layout principal de la aplicación.
 * Aquí defino:
 *  - Cabecera con el nombre del proyecto.
 *  - Barra de navegación [UI-01] con enlaces a las páginas principales.
 *  - Contenedor <main> donde se dibuja cada pantalla con <Outlet />.
 */
function MainLayout() {
  return (
    <div className="app-layout">
      <header className="app-header">
        {/* Bloque con el "logo" o nombre de la aplicación */}
        <div className="app-logo">
          <span>NutriFit</span>
        </div>

        {/* Barra de navegación principal [UI-01] */}
        <nav className="app-nav">
          {/* NavLink me permite resaltar el enlace activo */}
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              "app-nav-link" + (isActive ? " app-nav-link--active" : "")
            }
          >
            [HOME]
          </NavLink>

          <NavLink
            to="/rutinas"
            className={({ isActive }) =>
              "app-nav-link" + (isActive ? " app-nav-link--active" : "")
            }
          >
            [ROUTINES]
          </NavLink>

          <NavLink
            to="/dietas"
            className={({ isActive }) =>
              "app-nav-link" + (isActive ? " app-nav-link--active" : "")
            }
          >
            [DIET]
          </NavLink>

          <NavLink
            to="/recetas"
            className={({ isActive }) =>
              "app-nav-link" + (isActive ? " app-nav-link--active" : "")
            }
          >
            [RECIPES]
          </NavLink>

          <NavLink
            to="/progreso"
            className={({ isActive }) =>
              "app-nav-link" + (isActive ? " app-nav-link--active" : "")
            }
          >
            [PROGRESS]
          </NavLink>

          <NavLink
            to="/perfil"
            className={({ isActive }) =>
              "app-nav-link" + (isActive ? " app-nav-link--active" : "")
            }
          >
            [PROFILE]
          </NavLink>
        </nav>
      </header>

      {/* Contenido principal de cada página */}
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
