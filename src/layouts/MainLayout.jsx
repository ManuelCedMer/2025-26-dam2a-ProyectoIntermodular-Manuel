import { Link, Outlet } from "react-router-dom";

function MainLayout() {
  return (
    <div>
      <header>
        <nav>
          <ul>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/rutinas">Rutinas</Link></li>
            <li><Link to="/dietas">Dietas</Link></li>
            <li><Link to="/recetas">Recetas</Link></li>
            <li><Link to="/progreso">Progreso</Link></li>
            <li><Link to="/perfil">Perfil</Link></li>
          </ul>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
