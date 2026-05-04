import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import {
  getUserProfile,
  saveUserProfile,
} from "../services/userProfileService.js";
import { uploadProfilePhoto } from "../services/profilePhotoService.js";

import Alert from "../components/ui/Alert.jsx";

/**
 * Pantalla de perfil de usuario [PROFILE].
 *
 * Permite:
 *  - Ver el correo del usuario.
 *  - Editar nombre visible, edad y objetivo principal [LOGIN-03].
 *  - Editar las metas diarias de ingesta y gasto calórico.
 *  - Cambiar el tema visual de la aplicación.
 *  - Subir una foto de perfil.
 *  - Cerrar sesión [LOGIN-02].
 *
 * Forma parte de [UI-02]: tarjeta centrada, adaptable en móvil y escritorio.
 */
function ProfilePage() {
  const { user, logout, theme, setTheme } = useAuth();

  // Datos principales del perfil.
  const [displayName, setDisplayName] = useState("");
  const [age, setAge] = useState("");
  const [goal, setGoal] = useState("mantener");

  // Metas calóricas diarias.
  const [dailyCaloriesGoal, setDailyCaloriesGoal] = useState("");
  const [dailyCaloriesBurnGoal, setDailyCaloriesBurnGoal] = useState("");

  // Estado de la foto de perfil.
  const [photoURL, setPhotoURL] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  // Tema seleccionado en el formulario antes de guardarlo.
  const [draftTheme, setDraftTheme] = useState(theme || "light");

  // Estados de carga y mensajes del formulario.
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  /**
   * Carga los datos de perfil desde Firestore al entrar en la página.
   */
  useEffect(() => {
    if (!user) return;

    async function loadProfile() {
      try {
        setLoadingProfile(true);
        setErrorMessage("");
        setMessage("");

        const profile = await getUserProfile(user.uid);

        // Si algún campo no existe todavía, se usan valores por defecto.
        setDisplayName(profile.displayName || "");
        setAge(
          profile.age !== null && profile.age !== undefined
            ? String(profile.age)
            : "",
        );
        const rawGoal = (profile.goal || "mantener").toLowerCase().trim();
        setGoal(
          ["adelgazar", "mantener", "ganar"].includes(rawGoal)
            ? rawGoal
            : "mantener",
        );

        // Meta de ingesta calórica diaria.
        setDailyCaloriesGoal(
          profile.dailyCaloriesGoal !== null &&
            profile.dailyCaloriesGoal !== undefined
            ? String(profile.dailyCaloriesGoal)
            : "",
        );

        // Meta de gasto calórico diario.
        setDailyCaloriesBurnGoal(
          profile.dailyCaloriesBurnGoal !== null &&
            profile.dailyCaloriesBurnGoal !== undefined
            ? String(profile.dailyCaloriesBurnGoal)
            : "",
        );

        const loadedTheme = profile.theme || "light";
        setDraftTheme(loadedTheme);
        setPhotoURL(profile.photoURL || "");
      } catch (error) {
        console.error("Error al cargar perfil:", error);
        setErrorMessage("No se ha podido cargar el perfil.");
      } finally {
        setLoadingProfile(false);
      }
    }

    loadProfile();
  }, [user]);

  /**
   * Guarda los cambios de perfil en Firestore.
   */
  async function handleSubmit(event) {
    event.preventDefault();

    if (!displayName.trim()) {
      setErrorMessage("El nombre es obligatorio.");
      setMessage("");
      return;
    }

    // Validación de edad.
    let parsedAge = null;
    if (age.trim() !== "") {
      const n = Number(age);
      if (Number.isNaN(n) || n < 0 || n > 120) {
        setErrorMessage("La edad debe ser un número válido.");
        setMessage("");
        return;
      }
      parsedAge = n;
    }

    // Validación de la meta diaria de ingesta calórica.
    let parsedDailyCaloriesGoal = null;
    if (dailyCaloriesGoal.trim() !== "") {
      const n = Number(dailyCaloriesGoal);
      if (Number.isNaN(n) || n < 800 || n > 6000) {
        setErrorMessage("La meta calórica debe estar entre 800 y 6000 kcal.");
        setMessage("");
        return;
      }
      parsedDailyCaloriesGoal = Math.round(n);
    }

    // Validación de la meta diaria de gasto calórico.
    let parsedDailyCaloriesBurnGoal = null;
    if (dailyCaloriesBurnGoal.trim() !== "") {
      const n2 = Number(dailyCaloriesBurnGoal);
      if (Number.isNaN(n2) || n2 < 1 || n2 > 20000) {
        setErrorMessage(
          "La meta de gasto calórico debe ser un número válido entre 1 y 20000 kcal.",
        );
        setMessage("");
        return;
      }
      parsedDailyCaloriesBurnGoal = Math.round(n2);
    }

    try {
      setSavingProfile(true);
      setErrorMessage("");
      setMessage("");

      await saveUserProfile(user.uid, {
        displayName: displayName.trim(),
        age: parsedAge,
        goal,
        dailyCaloriesGoal: parsedDailyCaloriesGoal,
        dailyCaloriesBurnGoal: parsedDailyCaloriesBurnGoal,
        theme: draftTheme,
      });

      setTheme(draftTheme);

      setMessage("Perfil actualizado correctamente.");
    } catch (error) {
      console.error("Error al guardar perfil:", error);
      setErrorMessage("No se ha podido guardar el perfil.");
    } finally {
      setSavingProfile(false);
    }
  }

  /**
   * Cierra la sesión actual del usuario.
   */
  async function handleLogout() {
    try {
      await logout();
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  }

  /**
   * Gestiona la selección y subida de una nueva foto de perfil.
   */
  async function handleFileChange(event) {
    const file = event.target.files && event.target.files[0];

    // Reinicia el input para permitir seleccionar de nuevo el mismo archivo.
    event.target.value = "";

    if (!file) return;

    if (!file.type || !file.type.startsWith("image/")) {
      setErrorMessage("Solo se permiten archivos de imagen.");
      return;
    }

    try {
      setUploadingPhoto(true);
      setUploadProgress(0);
      setErrorMessage("");
      setMessage("");

      const url = await uploadProfilePhoto(user.uid, file, setUploadProgress);

      // Guarda la URL de la imagen en el perfil del usuario.
      await saveUserProfile(user.uid, { photoURL: url });

      setPhotoURL(url);
      setMessage("Foto de perfil actualizada.");
    } catch (error) {
      console.error("Error subiendo foto de perfil:", error);
      setErrorMessage("No se ha podido subir la foto de perfil.");
    } finally {
      setUploadingPhoto(false);
      setUploadProgress(0);
    }
  }

  if (!user) {
    return (
      <div className="profile-page">
        <p>No hay sesión activa.</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <section className="profile-card card">
        {/* Cabecera con avatar y correo del usuario */}
        <div className="profile-header">
          <div
            className="profile-avatar"
            onClick={() => fileInputRef.current?.click()}
            role="button"
            aria-label="Cambiar foto de perfil"
            style={{ cursor: "pointer" }}
          >
            {photoURL ? (
              <img
                src={photoURL}
                alt="Avatar"
                className="profile-avatar-image"
              />
            ) : (
              <span className="profile-avatar-initial">
                {(displayName || user.email || "?")
                  .trim()
                  .charAt(0)
                  .toUpperCase()}
              </span>
            )}

            {uploadingPhoto && (
              <div className="profile-avatar-progress">
                Subiendo... {uploadProgress}%
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
              disabled={loadingProfile || uploadingPhoto}
            />
          </div>

          <div className="profile-header-text">
            <h2>Perfil y configuración</h2>
            <p className="profile-email">{user.email}</p>
          </div>
        </div>

        {/* Formulario de edición de perfil */}
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="profile-form-row">
            <label>Nombre visible</label>
            <input
              className="input"
              type="text"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Ej: Carlos Rodríguez"
              disabled={loadingProfile}
            />
          </div>

          <div className="profile-form-row">
            <label>Edad</label>
            <input
              className="input"
              type="number"
              value={age}
              onChange={(event) => setAge(event.target.value)}
              min="0"
              max="120"
              placeholder="Ej: 28"
              disabled={loadingProfile}
            />
          </div>

          <div className="profile-form-row">
            <label>Objetivo principal</label>
            <select
              className="select"
              value={goal}
              onChange={(event) => setGoal(event.target.value)}
              disabled={loadingProfile}
            >
              <option value="adelgazar">Adelgazar</option>
              <option value="mantener">Mantener</option>
              <option value="ganar">Ganar masa muscular</option>
            </select>
          </div>

          <div className="profile-form-row">
            <label>Meta diaria de ingesta calórica (kcal)</label>
            <input
              className="input"
              type="number"
              value={dailyCaloriesGoal}
              onChange={(event) => setDailyCaloriesGoal(event.target.value)}
              min="800"
              max="6000"
              placeholder="Ej: 2600"
              disabled={loadingProfile}
            />
          </div>

          <div className="profile-form-row">
            <label>Meta diaria de gasto calórico (kcal)</label>
            <input
              className="input"
              type="number"
              value={dailyCaloriesBurnGoal}
              onChange={(event) => setDailyCaloriesBurnGoal(event.target.value)}
              min="1"
              max="20000"
              placeholder="Ej: 500"
              disabled={loadingProfile}
            />
          </div>

          <div className="profile-form-row">
            <label>Tema visual</label>
            <select
              className="select"
              value={draftTheme}
              onChange={(event) => setDraftTheme(event.target.value)}
              disabled={loadingProfile}
            >
              <option value="light">Claro</option>
              <option value="dark">Oscuro</option>
            </select>
          </div>

          {/* Mensajes de estado del formulario */}
          <Alert
            variant="error"
            className="profile-message profile-message--error"
          >
            {errorMessage}
          </Alert>

          <Alert
            variant="success"
            className="profile-message profile-message--success"
          >
            {message}
          </Alert>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={savingProfile || loadingProfile}
          >
            {savingProfile ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>

        <hr className="profile-divider" />

        {/* Bloque de cierre de sesión */}
        <div className="profile-logout">
          <p className="profile-logout-text">
            Si quieres salir de tu cuenta actual, puedes cerrar sesión aquí.
          </p>
          <button
            type="button"
            onClick={handleLogout}
            className="btn btn-secondary"
          >
            Cerrar sesión
          </button>
        </div>
      </section>
    </div>
  );
}

export default ProfilePage;
