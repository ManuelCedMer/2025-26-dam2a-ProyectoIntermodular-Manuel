import { useAuth } from "../context/AuthContext.jsx";

/**
 * Pantalla de perfil y configuración [PROFILE].
 * Permite consultar los datos básicos del usuario y cerrar sesión.
 */
function ProfilePage() {
  const { user, logout } = useAuth();

  async function handleLogout() {
    try {
      await logout();
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  }

  if (!user) {
    return (
      <div>
        <h2>[PROFILE] Perfil y configuración</h2>
        <p>No hay sesión activa.</p>
      </div>
    );
  }

  return (
    <div>
      <h2>[PROFILE] Perfil y configuración</h2>
      <p>Nombre: {user.displayName || "Sin nombre"}</p>
      <p>Correo: {user.email}</p>

      <button type="button" onClick={handleLogout}>
        Cerrar sesión
      </button>
    </div>
  );
}

export default ProfilePage;
