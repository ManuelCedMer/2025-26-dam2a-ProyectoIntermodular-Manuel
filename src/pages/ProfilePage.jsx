import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import {
  getUserProfile,
  saveUserProfile,
} from "../services/userProfileService.js";


/**
 * Pantalla de perfil y configuración [PROFILE].
 * Permite:
 *  - Ver los datos básicos del usuario.
 *  - Editar nombre, edad y objetivo principal [LOGIN-03].
 *  - Cerrar sesión [LOGIN-02].
 */
function ProfilePage() {
  const { user, logout } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [age, setAge] = useState("");
  const [goal, setGoal] = useState("mantener");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Cargar perfil desde Firestore al entrar en la página.
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function loadProfile() {
      try {
        setLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        const profile = await getUserProfile(user.uid);

        setDisplayName(profile.displayName || user.displayName || "");
        setAge(profile.age !== null && profile.age !== undefined ? String(profile.age) : "");
        setGoal(profile.goal || "mantener");
      } catch (error) {
        console.error("Error al cargar perfil:", error);
        setErrorMessage("No se han podido cargar los datos de perfil.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user]);

  async function handleSaveProfile(event) {
    event.preventDefault();

    if (!displayName.trim()) {
      setErrorMessage("El nombre es obligatorio.");
      setSuccessMessage("");
      return;
    }

    // Convertir edad a número o null.
    const parsedAge = age.trim() === "" ? null : Number(age);

    if (parsedAge !== null && Number.isNaN(parsedAge)) {
      setErrorMessage("La edad debe ser un número.");
      setSuccessMessage("");
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      await saveUserProfile(user.uid, {
        displayName: displayName.trim(),
        age: parsedAge,
        goal,
      });

      setSuccessMessage("Perfil guardado correctamente.");
    } catch (error) {
      console.error("Error al guardar perfil:", error);
      setErrorMessage("No se han podido guardar los datos de perfil.");
      setSuccessMessage("");
    } finally {
      setSaving(false);
    }
  }
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
       {errorMessage && <p>{errorMessage}</p>}
      {successMessage && <p>{successMessage}</p>}

      <form onSubmit={handleSaveProfile}>
        <div>
          <label>Nombre</label>
          <input
            type="text"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            required
          />
        </div>

        <div>
          <label>Correo</label>
          {/* El correo no se edita aquí, solo se muestra. */}
          <input type="email" value={user.email} disabled />
        </div>

        <div>
          <label>Edad</label>
          <input
            type="number"
            value={age}
            onChange={(event) => setAge(event.target.value)}
            min="0"
          />
        </div>

        <div>
          <label>Objetivo principal</label>
          <select
            value={goal}
            onChange={(event) => setGoal(event.target.value)}
          >
            <option value="adelgazar">Adelgazar</option>
            <option value="mantener">Mantener</option>
            <option value="ganar_masa">Ganar masa muscular</option>
          </select>
        </div>

        <button type="submit" disabled={saving}>
          {saving ? "Guardando..." : "Guardar perfil"}
        </button>
      </form>

      <hr />

      <button type="button" onClick={handleLogout}>
        Cerrar sesión
      </button>
    </div>
  );
}

export default ProfilePage;